import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Browser } from "@playwright/test";
import { failingResult } from "../assert";
import { applyBaseline, type Baseline, createBaseline } from "../baseline";
import { checkPage } from "../playwright";
import { toMarkdown } from "../report/markdown";
import type { PageResult, ResultsFile } from "../types";
import { resolveUrls, type SurjectionConfig } from "./config";
import { loadSitemap } from "./sitemap";

export interface CheckRun extends SurjectionConfig {
  updateBaseline?: boolean;
  /** Write the Markdown report here. */
  outMarkdown?: string;
  /** Write all results as JSON here (input for Surjection Pro reports and history). */
  outJson?: string;
  log?: (line: string) => void;
}

export interface CheckOutcome {
  pages: PageResult[];
  /** Pages reduced to findings that fail the run. */
  failing: PageResult[];
  failed: boolean;
}

/** Loads Playwright lazily so the core package works without it. */
export async function launchChromium(): Promise<Browser> {
  let playwright: { chromium: { launch(o?: object): Promise<Browser> } };
  try {
    playwright = (await import("@playwright/test")) as never;
  } catch {
    try {
      // A variable keeps bundlers from resolving the optional fallback at build time.
      const fallback = "playwright";
      playwright = (await import(/* @vite-ignore */ fallback)) as never;
    } catch {
      throw new Error(
        "Surjection needs Playwright to check pages. Install it with: npm i -D @playwright/test && npx playwright install chromium",
      );
    }
  }
  const executablePath = process.env.SURJECTION_CHROMIUM_PATH;
  return playwright.chromium.launch(executablePath ? { executablePath } : {});
}

export async function collectUrls(run: CheckRun): Promise<string[]> {
  const urls = [...(run.urls ?? [])];
  if (run.sitemap) {
    const fromSitemap = await loadSitemap(resolveUrls([run.sitemap], run.baseUrl)[0] as string);
    urls.push(...fromSitemap.slice(0, run.maxPages ?? 50));
  }
  if (urls.length === 0)
    throw new Error("No URLs to check. Pass URLs, --sitemap or a config file.");
  return resolveUrls(urls, run.baseUrl);
}

export async function runCheck(run: CheckRun, browser?: Browser): Promise<CheckOutcome> {
  const log = run.log ?? ((line: string) => console.log(line));
  const urls = await collectUrls(run);
  const baselinePath = run.baseline ?? "surjection-baseline.json";
  const baseline =
    !run.updateBaseline && existsSync(baselinePath)
      ? (JSON.parse(readFileSync(baselinePath, "utf8")) as Baseline)
      : undefined;

  const ownBrowser = browser ? undefined : await launchChromium();
  const active = (browser ?? ownBrowser) as Browser;
  const pages: PageResult[] = [];
  try {
    const context = await active.newContext();
    for (const url of urls) {
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: "load" });
        const result = await checkPage(page, {
          ...(run.standard && { standard: run.standard }),
          ...(run.bestPractice && { bestPractice: run.bestPractice }),
          ...(run.disableRules && { disableRules: run.disableRules }),
          ...(run.exclude && { exclude: run.exclude }),
          ...(run.locale && { locale: run.locale }),
        });
        pages.push(result);
        const count = result.findings.reduce((n, f) => n + f.nodes.length, 0);
        log(`${count === 0 ? "✓" : "✗"} ${url} (${count} issue${count === 1 ? "" : "s"})`);
      } finally {
        await page.close();
      }
    }
    await context.close();
  } finally {
    await ownBrowser?.close();
  }

  if (run.updateBaseline) {
    writeFileSync(baselinePath, `${JSON.stringify(createBaseline(pages), null, 2)}\n`);
    log(`Baseline written to ${baselinePath}.`);
  }

  const failing = pages
    .map((page) =>
      failingResult(applyBaseline(page, run.updateBaseline ? undefined : baseline), {
        ...(run.failOn && { failOn: run.failOn }),
      }),
    )
    .filter((page) => page.findings.length > 0);
  const failed = !run.updateBaseline && failing.length > 0;

  const markdown = toMarkdown(baseline ? pages.map((p) => applyBaseline(p, baseline)) : pages, {
    locale: run.locale ?? "en",
    ...(run.project && { project: run.project }),
  });
  if (run.outMarkdown) writeFileSync(run.outMarkdown, markdown);
  if (run.outJson) {
    const file: ResultsFile = {
      version: 1,
      ...(run.project && { project: run.project }),
      createdAt: new Date().toISOString(),
      pages,
    };
    writeFileSync(run.outJson, `${JSON.stringify(file, null, 2)}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);

  return { pages, failing, failed };
}
