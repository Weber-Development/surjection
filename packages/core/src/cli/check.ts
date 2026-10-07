import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Browser } from "@playwright/test";
import { failingResult } from "../assert";
import { applyBaseline, type Baseline, createBaseline } from "../baseline";
import { loadPreviousRun, recordFixed } from "../compare";
import { checkPage } from "../playwright";
import { toJUnit } from "../report/junit";
import { toMarkdown } from "../report/markdown";
import { toSarif } from "../report/sarif";
import { captureEvidence } from "../screenshots";
import type { PageResult, ResultsFile } from "../types";
import { parseViewport, resolveUrls, type StateConfig, type SurjectionConfig } from "./config";
import { loadSitemap } from "./sitemap";
import { runSteps } from "./steps";

export interface CheckRun extends SurjectionConfig {
  updateBaseline?: boolean;
  /** Write the Markdown report here. */
  outMarkdown?: string;
  /** Write all results as JSON here (input for Surjection Pro reports and history). */
  outJson?: string;
  /** Write a JUnit XML report here, for CI test report views. */
  outJUnit?: string;
  /** Write SARIF 2.1.0 here, for tools that read static analysis results. */
  outSarif?: string;
  log?: (line: string) => void;
}

export interface CheckOutcome {
  pages: PageResult[];
  /** Pages reduced to findings that fail the run. */
  failing: PageResult[];
  failed: boolean;
  /** Pages that could not be loaded; the run continues without them. */
  loadErrors: string[];
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
  if (urls.length === 0 && !run.states?.length)
    throw new Error("No URLs to check. Pass URLs, --sitemap or a config file.");
  return urls.length > 0 ? resolveUrls(urls, run.baseUrl) : [];
}

export async function runCheck(run: CheckRun, browser?: Browser): Promise<CheckOutcome> {
  const log = run.log ?? ((line: string) => console.log(line));
  const urls = await collectUrls(run);
  const baselinePath = run.baseline ?? "surjection-baseline.json";
  const baseline =
    !run.updateBaseline && existsSync(baselinePath)
      ? (JSON.parse(readFileSync(baselinePath, "utf8")) as Baseline)
      : undefined;

  const previousRun = run.compareWith
    ? loadPreviousRun(run.compareWith, run.screenshots)
    : undefined;
  const viewport = parseViewport(run.viewport);
  const ownBrowser = browser ? undefined : await launchChromium();
  const active = (browser ?? ownBrowser) as Browser;
  const pages: PageResult[] = [];
  const loadErrors: string[] = [];
  try {
    if (run.storageState && !existsSync(run.storageState))
      throw new Error(`Storage state ${run.storageState} not found.`);
    const context = await active.newContext({
      viewport,
      isMobile: run.viewport === "mobile",
      ...(run.colorScheme && { colorScheme: run.colorScheme }),
      ...(run.reducedMotion && { reducedMotion: "reduce" as const }),
      ...(run.storageState && { storageState: run.storageState }),
    });
    const targets = [
      ...urls.map((url) => ({ url, label: url, state: undefined as StateConfig | undefined })),
      ...(run.states ?? []).map((state) => {
        const open = state.url ?? run.urls?.[0] ?? "/";
        const url = resolveUrls([open], run.baseUrl)[0] as string;
        return { url, label: `${url}#state:${state.name}`, state };
      }),
    ];
    const slots: (PageResult | undefined)[] = new Array(targets.length).fill(undefined);
    let next = 0;
    const worker = async () => {
      while (next < targets.length) {
        const index = next++;
        const target = targets[index] as (typeof targets)[number];
        const page = await context.newPage();
        try {
          try {
            await page.goto(target.url, { waitUntil: "load", timeout: 30000 });
          } catch (error) {
            const reason =
              error instanceof Error ? (error.message.split("\n")[0] ?? "") : String(error);
            loadErrors.push(`${target.label}: ${reason}`);
            log(`! ${target.label} (could not be loaded: ${reason})`);
            continue;
          }
          if (target.state) await runSteps(page, target.state);
          const result = await checkPage(page, {
            ...(run.standard && { standard: run.standard }),
            ...(run.bestPractice && { bestPractice: run.bestPractice }),
            ...(run.disableRules && { disableRules: run.disableRules }),
            ...(run.exclude && { exclude: run.exclude }),
            ...(run.locale && { locale: run.locale }),
            ...(run.keyboard && { keyboard: true }),
            ...(run.layout && { layout: true }),
          });
          if (target.state) result.url = target.label;
          if (run.screenshots)
            await captureEvidence(page, result, { dir: run.screenshots, pageIndex: index });
          if (previousRun)
            await recordFixed(page, result, previousRun, {
              ...(run.screenshots && { dir: run.screenshots }),
              pageIndex: index,
            });
          slots[index] = result;
          const count = result.findings.reduce((n, f) => n + f.nodes.length, 0);
          log(
            `${count === 0 ? "✓" : "✗"} ${target.label} (${count} issue${count === 1 ? "" : "s"})`,
          );
        } finally {
          await page.close();
        }
      }
    };
    const size = Math.max(1, Math.min(run.concurrency ?? 1, 8, targets.length));
    await Promise.all(Array.from({ length: size }, worker));
    for (const result of slots) if (result) pages.push(result);
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

  const reported = baseline ? pages.map((p) => applyBaseline(p, baseline)) : pages;
  const markdown = toMarkdown(reported, {
    locale: run.locale ?? "en",
    ...(run.project && { project: run.project }),
  });
  if (run.outMarkdown) writeFileSync(run.outMarkdown, markdown);
  if (run.outJUnit) writeFileSync(run.outJUnit, toJUnit(reported));
  if (run.outSarif) writeFileSync(run.outSarif, toSarif(reported));
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

  return { pages, failing, failed, loadErrors };
}
