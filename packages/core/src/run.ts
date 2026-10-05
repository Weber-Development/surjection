import axe from "axe-core";
import { axeLocale } from "./axe-locale";
import { toPageResult } from "./normalize";
import type { CheckOptions, PageResult } from "./types";
import { standardTags } from "./wcag";

/** Builds the axe-core run options for a check. Shared by the DOM runner and the Playwright helper. */
export function axeRunOptions(options: CheckOptions = {}): axe.RunOptions {
  const tags = standardTags(options.standard ?? "wcag22aa");
  if (options.bestPractice) tags.push("best-practice");
  const rules: Record<string, { enabled: boolean }> = {};
  for (const rule of options.disableRules ?? []) rules[rule] = { enabled: false };
  return {
    runOnly: { type: "tag", values: tags },
    rules,
    resultTypes: ["violations", "incomplete"],
  };
}

/**
 * Runs the check in the current document (browser, jsdom, happy-dom).
 * Use `@sweberdev/surjection/playwright` for full pages in a real browser.
 */
export async function checkDocument(
  context: axe.ElementContext = document,
  options: CheckOptions = {},
): Promise<PageResult> {
  const locale = axeLocale(options.locale);
  axe.reset();
  if (locale) axe.configure({ locale });
  const results = await axe.run(context, axeRunOptions(options));
  return toPageResult(results, typeof document === "undefined" ? undefined : document.title);
}
