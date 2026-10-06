import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Page } from "@playwright/test";
import type { PageResult } from "./types";

export interface ScreenshotOptions {
  /** Folder for the PNG files. */
  dir: string;
  /** Number of the page in the run, keeps file names apart. */
  pageIndex: number;
  /** Per finding. Default: 5. */
  perFinding?: number;
  /** Per page. Default: 40. */
  perPage?: number;
}

const MARGIN = 12;

/** Screenshots one element with a little context. Returns false when it cannot be captured. */
export async function shootElement(page: Page, target: string, file: string): Promise<boolean> {
  try {
    const locator = page.locator(target).first();
    if ((await locator.count()) === 0) return false;
    await locator.scrollIntoViewIfNeeded({ timeout: 2000 });
    const box = await locator.boundingBox();
    if (!box || box.width < 1 || box.height < 1) return false;
    mkdirSync(dirname(file), { recursive: true });
    await page.screenshot({
      path: file,
      fullPage: true,
      clip: {
        x: Math.max(0, Math.floor(box.x - MARGIN)),
        y: Math.max(0, Math.floor(box.y - MARGIN)),
        width: Math.min(900, Math.ceil(box.width + 2 * MARGIN)),
        height: Math.min(500, Math.ceil(box.height + 2 * MARGIN)),
      },
      timeout: 5000,
    });
    return true;
  } catch {
    // Not every element can be captured, e.g. when the selector is not plain CSS.
    return false;
  }
}

/**
 * Takes a screenshot of every affected element (with a little context) and stores the path in
 * `node.screenshot`, as evidence for reports. Elements that cannot be found with a plain CSS
 * selector (inside iframes or shadow DOM) or are invisible are skipped.
 */
export async function captureEvidence(
  page: Page,
  result: PageResult,
  options: ScreenshotOptions,
): Promise<number> {
  mkdirSync(options.dir, { recursive: true });
  const perFinding = options.perFinding ?? 5;
  let remaining = options.perPage ?? 40;
  let taken = 0;
  for (const finding of result.findings) {
    let n = 0;
    for (const node of finding.nodes) {
      if (n >= perFinding || remaining <= 0) break;
      const file = join(options.dir, `${options.pageIndex + 1}-${finding.rule}-${n + 1}.png`);
      if (await shootElement(page, node.target, file)) {
        node.screenshot = file;
        n++;
        remaining--;
        taken++;
      }
    }
  }
  return taken;
}
