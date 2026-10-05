import type { AxeResults, Result } from "axe-core";
import type { Finding, Impact, PageResult } from "./types";
import { criteriaFromTags } from "./wcag";

const IMPACT_ORDER: Impact[] = ["critical", "serious", "moderate", "minor"];

export function toFinding(result: Result): Finding {
  return {
    rule: result.id,
    impact: (result.impact ?? "minor") as Impact,
    description: result.description,
    help: result.help,
    helpUrl: result.helpUrl,
    criteria: criteriaFromTags(result.tags),
    bestPractice: result.tags.includes("best-practice"),
    nodes: result.nodes.map((node) => ({
      target: node.target.map(String).join(" "),
      html: node.html,
      summary: node.failureSummary ?? "",
    })),
  };
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) =>
      IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact) ||
      a.rule.localeCompare(b.rule),
  );
}

export function toPageResult(results: AxeResults, title?: string): PageResult {
  return {
    url: results.url,
    title,
    testedAt: results.timestamp,
    findings: sortFindings(results.violations.map(toFinding)),
    passedRules: results.passes.length,
    incomplete: sortFindings(results.incomplete.map(toFinding)),
  };
}

/** Counts affected elements per impact, so totals match what a developer has to fix. */
export function countByImpact(findings: Finding[]): Record<Impact, number> {
  const counts: Record<Impact, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const finding of findings) counts[finding.impact] += finding.nodes.length;
  return counts;
}
