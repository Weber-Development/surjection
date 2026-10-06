export type Impact = "minor" | "moderate" | "serious" | "critical";

export type WcagLevel = "A" | "AA" | "AAA";

export type Locale = "de" | "de-CH" | "fr" | "it" | "en";

/** A WCAG success criterion referenced by a finding, e.g. 1.4.3 Contrast (Minimum). */
export interface Criterion {
  /** Success criterion number, e.g. "1.4.3". */
  id: string;
  level: WcagLevel | undefined;
  /** Matching clause of EN 301 549 for web content, e.g. "9.1.4.3". */
  en301549: string;
}

export interface FindingNode {
  /** CSS selector path as reported by axe-core. */
  target: string;
  html: string;
  /** Short explanation of what to fix on this element. */
  summary: string;
  /** Screenshot of the element, written by `surjection check --screenshots <dir>`. */
  screenshot?: string;
}

/** One violated rule on one page, normalized from an axe-core result. */
export interface Finding {
  rule: string;
  impact: Impact;
  description: string;
  help: string;
  helpUrl: string;
  criteria: Criterion[];
  /** Rules tagged "best-practice" are not tied to a WCAG criterion. */
  bestPractice: boolean;
  nodes: FindingNode[];
}

export interface PageResult {
  url: string;
  title: string | undefined;
  testedAt: string;
  findings: Finding[];
  /** Rules that ran and passed, used for the summary in reports. */
  passedRules: number;
  /** Rules axe-core could not decide automatically; need manual review. */
  incomplete: Finding[];
}

export interface CheckOptions {
  /** WCAG version and level to test against. Default: "wcag22aa". */
  standard?: "wcag2a" | "wcag2aa" | "wcag21aa" | "wcag22aa";
  /** Also run axe-core best-practice rules. Default: false. */
  bestPractice?: boolean;
  /** Rule ids to skip, e.g. ["color-contrast"] when contrast is tested elsewhere. */
  disableRules?: string[];
  /** Language of axe-core messages. Default: "en". */
  locale?: Locale;
}

/** File written by `surjection check --out-json`; input for Surjection Pro reports and history. */
export interface ResultsFile {
  version: 1;
  project?: string;
  createdAt: string;
  pages: PageResult[];
}
