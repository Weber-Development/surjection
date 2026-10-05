import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DEFAULT_CONFIG_FILE, type SurjectionConfig } from "./config";

export interface InitOptions {
  /** Site to check, e.g. https://example.ch. */
  baseUrl?: string;
  /** Use the sitemap of baseUrl instead of a fixed list of pages. */
  sitemap?: boolean;
  project?: string;
  /** Write .github/workflows/accessibility.yml. Default: true. */
  workflow?: boolean;
  cwd?: string;
}

export const WORKFLOW_FILE = ".github/workflows/accessibility.yml";

const WORKFLOW = `name: Accessibility

on:
  pull_request:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm i -g @sweberdev/surjection @playwright/test
      - run: npx playwright install --with-deps chromium
      - run: surjection check --out-md a11y.md --out-json a11y.json --out-junit a11y.xml
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility
          path: a11y.*
`;

/** Writes a starter config and CI workflow. Existing files are never overwritten. */
export function runInit(options: InitOptions = {}): string[] {
  const cwd = options.cwd ?? process.cwd();
  const base = options.baseUrl ?? "https://example.ch";
  const config: SurjectionConfig = {
    ...(options.project && { project: options.project }),
    baseUrl: base,
    ...(options.sitemap ? { sitemap: "/sitemap.xml", maxPages: 50 } : { urls: ["/"] }),
    standard: "wcag22aa",
    failOn: "serious",
    locale: "en",
  };
  const files: [string, string][] = [[DEFAULT_CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`]];
  if (options.workflow !== false) files.push([WORKFLOW_FILE, WORKFLOW]);

  const written: string[] = [];
  for (const [name, content] of files) {
    const path = join(cwd, name);
    if (existsSync(path)) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    written.push(name);
  }
  return written;
}
