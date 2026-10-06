import type { Page } from "@playwright/test";
import axe from "axe-core";
import { type AssertOptions, failingResult, failureMessage } from "./assert";
import { axeLocale } from "./axe-locale";
import { checkKeyboard } from "./keyboard";
import { checkLayout } from "./layout";
import { toPageResult } from "./normalize";
import { axeRunOptions } from "./run";
import type { CheckOptions, PageResult } from "./types";

export interface PageCheckOptions extends CheckOptions {
  /** Only check inside these selectors. */
  include?: string[];
  /** Skip these selectors, e.g. third-party widgets you do not control. */
  exclude?: string[];
  /** Also press Tab through the page to find focus traps and missing focus indicators. */
  keyboard?: boolean;
  /** Also check reflow at 320 px (1.4.10) and text spacing (1.4.12). Changes the viewport temporarily. */
  layout?: boolean;
}

export { checkKeyboard, type KeyboardCheckOptions } from "./keyboard";
export { checkLayout, type LayoutCheckOptions } from "./layout";
export { captureEvidence, type ScreenshotOptions } from "./screenshots";

/** Runs axe-core in the page's main frame and returns normalized results. */
export async function checkPage(page: Page, options: PageCheckOptions = {}): Promise<PageResult> {
  await page.evaluate(axe.source);
  const context =
    options.include || options.exclude
      ? { include: options.include ?? ["html"], exclude: options.exclude ?? [] }
      : undefined;
  const results = await page.evaluate(
    async ({ runOptions, locale, context }) => {
      // biome-ignore lint/suspicious/noExplicitAny: axe is injected into the page as a global.
      const injected = (window as any).axe;
      injected.reset();
      if (locale) injected.configure({ locale });
      return injected.run(context ?? document, runOptions);
    },
    { runOptions: axeRunOptions(options), locale: axeLocale(options.locale), context },
  );
  const result = toPageResult(results, await page.title());
  if (options.keyboard) {
    result.findings.push(
      ...(await checkKeyboard(page, {
        ...(options.exclude && { exclude: options.exclude }),
        ...(options.locale && { locale: options.locale }),
      })),
    );
  }
  if (options.layout) {
    result.findings.push(
      ...(await checkLayout(page, {
        ...(options.exclude && { exclude: options.exclude }),
        ...(options.locale && { locale: options.locale }),
      })),
    );
  }
  return result;
}

/**
 * Fails the test when the page has accessibility issues (after baseline and threshold).
 *
 * @example
 * test("home is accessible", async ({ page }) => {
 *   await page.goto("/");
 *   await expectAccessible(page, { failOn: "serious" });
 * });
 */
export async function expectAccessible(
  page: Page,
  options: PageCheckOptions & AssertOptions = {},
): Promise<PageResult> {
  const result = await checkPage(page, options);
  const failing = failingResult(result, options);
  if (failing.findings.length > 0) throw new Error(failureMessage(failing, options));
  return result;
}
