import axe from "axe-core";
import { criteriaFromTags } from "./wcag";

export type CoverageClass = "mostly" | "partly" | "manual";

export interface CoverageRow {
  id: string;
  level: "A" | "AA";
  title: string;
  /** How much of the criterion Surjection can test without a person. */
  coverage: CoverageClass;
  /** Rules (axe-core and Surjection's own) that test part of it. */
  rules: string[];
  /** What stays manual. */
  manual: string;
}

/** The 55 success criteria of WCAG 2.2 at levels A and AA (4.1.1 was removed in 2.2). */
const CRITERIA: [id: string, level: "A" | "AA", title: string][] = [
  ["1.1.1", "A", "Non-text Content"],
  ["1.2.1", "A", "Audio-only and Video-only (Prerecorded)"],
  ["1.2.2", "A", "Captions (Prerecorded)"],
  ["1.2.3", "A", "Audio Description or Media Alternative (Prerecorded)"],
  ["1.2.4", "AA", "Captions (Live)"],
  ["1.2.5", "AA", "Audio Description (Prerecorded)"],
  ["1.3.1", "A", "Info and Relationships"],
  ["1.3.2", "A", "Meaningful Sequence"],
  ["1.3.3", "A", "Sensory Characteristics"],
  ["1.3.4", "AA", "Orientation"],
  ["1.3.5", "AA", "Identify Input Purpose"],
  ["1.4.1", "A", "Use of Color"],
  ["1.4.2", "A", "Audio Control"],
  ["1.4.3", "AA", "Contrast (Minimum)"],
  ["1.4.4", "AA", "Resize Text"],
  ["1.4.5", "AA", "Images of Text"],
  ["1.4.10", "AA", "Reflow"],
  ["1.4.11", "AA", "Non-text Contrast"],
  ["1.4.12", "AA", "Text Spacing"],
  ["1.4.13", "AA", "Content on Hover or Focus"],
  ["2.1.1", "A", "Keyboard"],
  ["2.1.2", "A", "No Keyboard Trap"],
  ["2.1.4", "A", "Character Key Shortcuts"],
  ["2.2.1", "A", "Timing Adjustable"],
  ["2.2.2", "A", "Pause, Stop, Hide"],
  ["2.3.1", "A", "Three Flashes or Below Threshold"],
  ["2.4.1", "A", "Bypass Blocks"],
  ["2.4.2", "A", "Page Titled"],
  ["2.4.3", "A", "Focus Order"],
  ["2.4.4", "A", "Link Purpose (In Context)"],
  ["2.4.5", "AA", "Multiple Ways"],
  ["2.4.6", "AA", "Headings and Labels"],
  ["2.4.7", "AA", "Focus Visible"],
  ["2.4.11", "AA", "Focus Not Obscured (Minimum)"],
  ["2.5.1", "A", "Pointer Gestures"],
  ["2.5.2", "A", "Pointer Cancellation"],
  ["2.5.3", "A", "Label in Name"],
  ["2.5.4", "A", "Motion Actuation"],
  ["2.5.7", "AA", "Dragging Movements"],
  ["2.5.8", "AA", "Target Size (Minimum)"],
  ["3.1.1", "A", "Language of Page"],
  ["3.1.2", "AA", "Language of Parts"],
  ["3.2.1", "A", "On Focus"],
  ["3.2.2", "A", "On Input"],
  ["3.2.3", "AA", "Consistent Navigation"],
  ["3.2.4", "AA", "Consistent Identification"],
  ["3.2.6", "A", "Consistent Help"],
  ["3.3.1", "A", "Error Identification"],
  ["3.3.2", "A", "Labels or Instructions"],
  ["3.3.3", "AA", "Error Suggestion"],
  ["3.3.4", "AA", "Error Prevention (Legal, Financial, Data)"],
  ["3.3.7", "A", "Redundant Entry"],
  ["3.3.8", "AA", "Accessible Authentication (Minimum)"],
  ["4.1.2", "A", "Name, Role, Value"],
  ["4.1.3", "AA", "Status Messages"],
];

/** Rules of Surjection itself (`--keyboard`, `--layout`) and the criteria they test. */
const OWN_RULES: Record<string, string> = {
  "surjection-focus-trap": "2.1.2",
  "surjection-focus-order": "2.4.3",
  "surjection-focus-visible": "2.4.7",
  "surjection-reflow": "1.4.10",
  "surjection-text-spacing": "1.4.12",
};

/**
 * Criteria where a passing run says most of what there is to say. Everything else with a rule is
 * "partly": the rule finds missing or wrong markup, but a person must judge the rest.
 */
const MOSTLY = new Set([
  "1.3.5",
  "1.4.3",
  "1.4.4",
  "1.4.10",
  "1.4.12",
  "2.1.2",
  "2.4.1",
  "2.4.2",
  "2.5.8",
  "3.1.1",
  "4.1.2",
]);

const MANUAL: Record<string, string> = {
  "1.1.1": "Whether the alternative text describes the image.",
  "1.3.1": "Whether the structure matches what is shown.",
  "1.4.3": "Text over images and gradients (reported as 'needs review').",
  "2.1.1": "Operating every function by keyboard.",
  "2.4.4": "Whether the link text makes sense in context.",
  "2.4.6": "Whether headings and labels describe their content.",
  "2.4.7": "Whether the focus indicator is clearly visible.",
  "3.1.2": "Whether passages in other languages are marked.",
  "4.1.2": "Custom widgets that behave differently from their roles.",
};

/** Which of the 55 criteria Surjection tests automatically, derived from the installed rule set. */
export function coverage(): CoverageRow[] {
  const byCriterion = new Map<string, Set<string>>();
  const add = (id: string, rule: string) => {
    const set = byCriterion.get(id) ?? new Set<string>();
    set.add(rule);
    byCriterion.set(id, set);
  };
  for (const rule of axe.getRules(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]))
    for (const criterion of criteriaFromTags(rule.tags)) add(criterion.id, rule.ruleId);
  for (const [rule, id] of Object.entries(OWN_RULES)) add(id, rule);
  return CRITERIA.map(([id, level, title]) => {
    const rules = [...(byCriterion.get(id) ?? [])].sort();
    const coverage: CoverageClass =
      rules.length === 0 ? "manual" : MOSTLY.has(id) ? "mostly" : "partly";
    return {
      id,
      level,
      title,
      coverage,
      rules,
      manual:
        MANUAL[id] ??
        (coverage === "manual"
          ? "No automatic test; needs a person."
          : "Anything beyond the rules."),
    };
  });
}

export function coverageSummary(rows: CoverageRow[] = coverage()): Record<CoverageClass, number> {
  return {
    mostly: rows.filter((r) => r.coverage === "mostly").length,
    partly: rows.filter((r) => r.coverage === "partly").length,
    manual: rows.filter((r) => r.coverage === "manual").length,
  };
}

export function coverageMarkdown(rows: CoverageRow[] = coverage()): string {
  const s = coverageSummary(rows);
  const label = { mostly: "mostly automatic", partly: "partly automatic", manual: "manual only" };
  const lines = [
    "# WCAG 2.2 coverage of Surjection",
    "",
    `${rows.length} success criteria at level A and AA: ${s.mostly} mostly automatic, ${s.partly} partly automatic, ${s.manual} manual only.`,
    'A passing run is no proof of conformance, not even for "mostly automatic" criteria.',
    "",
    "| Criterion | Level | Name | Coverage | Rules |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${r.id} | ${r.level} | ${r.title} | ${label[r.coverage]} | ${r.rules.map((x) => `\`${x}\``).join(", ") || "-"} |`,
    ),
    "",
  ];
  return lines.join("\n");
}
