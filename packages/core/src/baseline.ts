import type { Finding, PageResult } from "./types";

/**
 * A baseline records findings an agency has accepted for now (e.g. when taking over an
 * existing site), so CI fails only on new problems instead of on the whole backlog.
 */
export interface Baseline {
  version: 2;
  createdAt: string;
  entries: BaselineEntry[];
}

/** One accepted finding. `note` is free text, e.g. why it is accepted or the ticket that tracks it. */
export interface BaselineEntry {
  /** Same id as the finding has in the results file. */
  id: string;
  page: string;
  rule: string;
  target: string;
  note?: string;
}

/** Reads a baseline of version 1 (a list of "<path>|<rule>|<target>") or 2 and returns version 2. */
export function normalizeBaseline(data: unknown): Baseline {
  const file = data as { version?: number; createdAt?: string; entries?: unknown } | null;
  if ((file?.version !== 1 && file?.version !== 2) || !Array.isArray(file.entries))
    throw new Error(
      `Not a Surjection baseline${typeof file?.version === "number" ? ` (version ${file.version}; this release reads versions 1 and 2)` : ""}.`,
    );
  const entries = file.entries.map((entry): BaselineEntry => {
    if (typeof entry !== "string") return entry as BaselineEntry;
    const [page = "", rule = "", ...target] = entry.split("|");
    const joined = target.join("|");
    return { id: findingId(page, rule, joined), page, rule, target: joined };
  });
  return { version: 2, createdAt: file.createdAt ?? new Date().toISOString(), entries };
}

/**
 * Stable identity of one finding on one element: the same issue gets the same id in every run,
 * on localhost, preview and production alike (the host is not part of it).
 */
export function findingId(path: string, rule: string, target: string): string {
  const text = `${path}|${rule}|${target}`;
  // Two FNV-1a runs with different seeds: 48 bits, no Node API, so it works in the browser too.
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 0x01000193);
    b = Math.imul(b ^ text.charCodeAt(i), 0x85ebca6b);
  }
  return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 16).toString(16).padStart(4, "0");
}

export function pathOf(url: string): string {
  try {
    const parsed = new URL(url);
    // A page state ("#state:menu-open") is part of the identity, other fragments are not.
    return (
      parsed.pathname + parsed.search + (/^#(state|flow):/.test(parsed.hash) ? parsed.hash : "")
    );
  } catch {
    return url;
  }
}

/** Ids of all findings of a page, as used in baselines and results of version 2. */
export function fingerprints(page: PageResult): string[] {
  const path = pathOf(page.url);
  return page.findings.flatMap((finding) =>
    finding.nodes.map((node) => findingId(path, finding.rule, node.target)),
  );
}

export function createBaseline(
  pages: PageResult[],
  now = new Date(),
  previous?: Baseline,
): Baseline {
  const notes = new Map(previous?.entries.filter((e) => e.note).map((e) => [e.id, e.note]));
  const entries = new Map<string, BaselineEntry>();
  for (const page of pages) {
    const path = pathOf(page.url);
    for (const finding of page.findings)
      for (const node of finding.nodes) {
        const id = findingId(path, finding.rule, node.target);
        const note = notes.get(id);
        entries.set(id, {
          id,
          page: path,
          rule: finding.rule,
          target: node.target,
          ...(note && { note }),
        });
      }
  }
  return {
    version: 2,
    createdAt: now.toISOString(),
    entries: [...entries.values()].sort((a, b) =>
      `${a.page}|${a.rule}|${a.target}`.localeCompare(`${b.page}|${b.rule}|${b.target}`),
    ),
  };
}

/** Returns the page with only the findings (and elements) that are not in the baseline. */
export function applyBaseline(page: PageResult, baseline: Baseline | undefined): PageResult {
  if (!baseline) return page;
  const accepted = new Set(baseline.entries.map((entry) => entry.id));
  const path = pathOf(page.url);
  const findings: Finding[] = [];
  for (const finding of page.findings) {
    const nodes = finding.nodes.filter(
      (node) => !accepted.has(findingId(path, finding.rule, node.target)),
    );
    if (nodes.length > 0) findings.push({ ...finding, nodes });
  }
  return { ...page, findings };
}
