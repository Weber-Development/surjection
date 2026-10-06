import type { Finding, PageResult } from "./types";

/**
 * A baseline records findings an agency has accepted for now (e.g. when taking over an
 * existing site), so CI fails only on new problems instead of on the whole backlog.
 */
export interface Baseline {
  version: 1;
  createdAt: string;
  /** Fingerprints of accepted findings: "<url>|<rule>|<target>". */
  entries: string[];
}

function pathOf(url: string): string {
  try {
    const parsed = new URL(url);
    // A page state ("#state:menu-open") is part of the identity, other fragments are not.
    return parsed.pathname + parsed.search + (parsed.hash.startsWith("#state:") ? parsed.hash : "");
  } catch {
    return url;
  }
}

/** Fingerprints ignore host and protocol so a baseline works for localhost, preview and production alike. */
export function fingerprints(page: PageResult): string[] {
  const path = pathOf(page.url);
  return page.findings.flatMap((finding) =>
    finding.nodes.map((node) => `${path}|${finding.rule}|${node.target}`),
  );
}

export function createBaseline(pages: PageResult[], now = new Date()): Baseline {
  const entries = [...new Set(pages.flatMap(fingerprints))].sort();
  return { version: 1, createdAt: now.toISOString(), entries };
}

/** Returns the page with only the findings (and elements) that are not in the baseline. */
export function applyBaseline(page: PageResult, baseline: Baseline | undefined): PageResult {
  if (!baseline) return page;
  const accepted = new Set(baseline.entries);
  const path = pathOf(page.url);
  const findings: Finding[] = [];
  for (const finding of page.findings) {
    const nodes = finding.nodes.filter(
      (node) => !accepted.has(`${path}|${finding.rule}|${node.target}`),
    );
    if (nodes.length > 0) findings.push({ ...finding, nodes });
  }
  return { ...page, findings };
}
