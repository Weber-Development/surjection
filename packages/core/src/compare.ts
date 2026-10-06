import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import type { Page } from "@playwright/test";
import { pathOf } from "./baseline";
import { shootElement } from "./screenshots";
import type { FixedItem, PageResult, ResultsFile } from "./types";

/** Per page path: what the previous run found. */
export type PreviousRun = Map<string, PreviousEntry[]>;

interface PreviousEntry {
  key: string;
  rule: string;
  help: string;
  target: string;
  /** Copy of the previous screenshot, kept before the new run overwrites it. */
  before?: string;
}

const MAX_PER_PAGE = 10;

/**
 * Reads the results of an earlier run. Its screenshots are copied to `<screenshots>/before`
 * right away, because the new run writes files with the same names.
 */
export function loadPreviousRun(file: string, screenshotsDir: string | undefined): PreviousRun {
  if (!existsSync(file)) throw new Error(`Results to compare with not found: ${file}`);
  const previous = JSON.parse(readFileSync(file, "utf8")) as ResultsFile;
  const map: PreviousRun = new Map();
  let n = 0;
  for (const page of previous.pages) {
    const path = pathOf(page.url);
    const entries = map.get(path) ?? [];
    for (const finding of page.findings) {
      for (const node of finding.nodes) {
        const entry: PreviousEntry = {
          key: `${finding.rule}|${node.target}`,
          rule: finding.rule,
          help: finding.help,
          target: node.target,
        };
        const source =
          node.screenshot &&
          [resolve(dirname(file), node.screenshot), resolve(node.screenshot)].find(existsSync);
        if (source && screenshotsDir) {
          const copy = join(screenshotsDir, "before", `${++n}-${basename(source)}`);
          mkdirSync(dirname(copy), { recursive: true });
          copyFileSync(source, copy);
          entry.before = copy;
        }
        entries.push(entry);
      }
    }
    map.set(path, entries);
  }
  return map;
}

/**
 * Finds what was reported in the previous run and is gone now, and photographs the element as it
 * looks today ("after"). Stores the list in `result.fixed`. Only elements that still exist on the
 * page get an "after" image; a removed element is listed without one.
 */
export async function recordFixed(
  page: Page,
  result: PageResult,
  previous: PreviousRun,
  options: { dir?: string; pageIndex: number },
): Promise<number> {
  const before = previous.get(pathOf(result.url));
  if (!before) return 0;
  const current = new Set(
    result.findings.flatMap((f) => f.nodes.map((n) => `${f.rule}|${n.target}`)),
  );
  const fixed: FixedItem[] = [];
  for (const entry of before) {
    if (current.has(entry.key) || fixed.length >= MAX_PER_PAGE) continue;
    const item: FixedItem = { rule: entry.rule, help: entry.help, target: entry.target };
    if (entry.before) item.before = entry.before;
    if (options.dir && entry.before) {
      const file = join(
        options.dir,
        "after",
        `${options.pageIndex + 1}-${entry.rule}-${fixed.length + 1}.png`,
      );
      if (await shootElement(page, entry.target, file)) item.after = file;
    }
    fixed.push(item);
  }
  if (fixed.length > 0) result.fixed = fixed;
  return fixed.length;
}
