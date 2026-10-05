import { applyBaseline, type Baseline } from "./baseline";
import { toMarkdown } from "./report/markdown";
import type { Impact, Locale, PageResult } from "./types";

const SEVERITY: Record<Impact, number> = { minor: 0, moderate: 1, serious: 2, critical: 3 };

export interface AssertOptions {
  /** Accepted findings; only new ones fail. */
  baseline?: Baseline;
  /** Lowest impact that fails the check. Default: "minor" (every finding fails). */
  failOn?: Impact;
  /** Language of the failure message. Default: "en". */
  locale?: Locale;
}

/** Returns the findings that should fail a test, after baseline and threshold are applied. */
export function failingResult(page: PageResult, options: AssertOptions = {}): PageResult {
  const threshold = SEVERITY[options.failOn ?? "minor"];
  const filtered = applyBaseline(page, options.baseline);
  return {
    ...filtered,
    findings: filtered.findings.filter((f) => SEVERITY[f.impact] >= threshold),
    incomplete: [],
  };
}

export function failureMessage(page: PageResult, options: AssertOptions = {}): string {
  const count = page.findings.reduce((sum, f) => sum + f.nodes.length, 0);
  return `${count} accessibility issue(s) on ${page.url}\n\n${toMarkdown([page], {
    locale: options.locale ?? "en",
    includeIncomplete: false,
  })}`;
}
