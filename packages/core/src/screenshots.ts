import { mkdirSync } from "node:fs";
import { join } from "node:path";
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
      try {
        const locator = page.locator(node.target).first();
        if ((await locator.count()) === 0) continue;
        await locator.scrollIntoViewIfNeeded({ timeout: 2000 });
        const box = await locator.boundingBox();
        if (!box || box.width < 1 || box.height < 1) continue;
        const x = Math.max(0, Math.floor(box.x - MARGIN));
        const y = Math.max(0, Math.floor(box.y - MARGIN));
        const file = join(options.dir, `${options.pageIndex + 1}-${finding.rule}-${n + 1}.png`);
        await page.screenshot({
          path: file,
          fullPage: true,
          clip: {
            x,
            y,
            width: Math.min(900, Math.ceil(box.width + 2 * MARGIN)),
            height: Math.min(500, Math.ceil(box.height + 2 * MARGIN)),
          },
          timeout: 5000,
        });
        node.screenshot = file;
        n++;
        remaining--;
        taken++;
      } catch {
        // Not every element can be captured, e.g. when the selector is not plain CSS.
      }
    }
  }
  return taken;
}
