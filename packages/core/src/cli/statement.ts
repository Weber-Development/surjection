import { readFileSync, writeFileSync } from "node:fs";
import { generateStatement, type KnownIssue, type StatementInput } from "../statement";

interface ChecklistItem {
  id: string;
  status: "untested" | "pass" | "fail" | "not-applicable";
  notes?: string;
  plannedFix?: string;
  testedOn?: string;
}

/**
 * Status and known issues from a Surjection Pro checklist file: every failed criterion becomes a
 * known issue (its note is the text), and the status follows from the decisions. A statement must
 * not claim more than was checked, so criteria that are still untested are an error.
 */
export function fromChecklist(
  json: string,
): Pick<StatementInput, "status" | "knownIssues"> & { lastReviewedOn?: string } {
  const data = JSON.parse(json) as { version?: number; items?: ChecklistItem[] };
  if (data?.version !== 1 || !Array.isArray(data.items))
    throw new Error("Not a Surjection checklist file.");
  const untested = data.items.filter((i) => i.status === "untested").length;
  if (untested > 0)
    throw new Error(`${untested} criteria are still untested. Finish the checklist first.`);
  const failed = data.items.filter((i) => i.status === "fail");
  const passed = data.items.filter((i) => i.status === "pass").length;
  const knownIssues: KnownIssue[] = failed.map((item) => ({
    description: item.notes?.trim() || `WCAG ${item.id}`,
    ...(item.plannedFix && { plannedFix: item.plannedFix }),
  }));
  const dates = data.items.map((i) => i.testedOn).filter((d): d is string => Boolean(d));
  const last = dates.sort().at(-1);
  return {
    status: failed.length === 0 ? "full" : passed === 0 ? "none" : "partial",
    knownIssues,
    ...(last && { lastReviewedOn: last }),
  };
}

/**
 * Reads statement data from JSON and writes Markdown or HTML, chosen by the output extension.
 * With a checklist, `status` may be left out of the config and the failed criteria are added to
 * the known issues.
 */
export function runStatement(configPath: string, outPath: string, checklistPath?: string): void {
  const config = JSON.parse(readFileSync(configPath, "utf8")) as Omit<StatementInput, "status"> &
    Partial<Pick<StatementInput, "status">>;
  let input = config as StatementInput;
  if (checklistPath) {
    const derived = fromChecklist(readFileSync(checklistPath, "utf8"));
    const own = config.knownIssues ?? [];
    const extra = (derived.knownIssues ?? []).filter(
      (issue) => !own.some((o) => o.description === issue.description),
    );
    input = {
      ...config,
      status: derived.status,
      knownIssues: [...own, ...extra],
      ...(derived.lastReviewedOn &&
        !config.lastReviewedOn && { lastReviewedOn: derived.lastReviewedOn }),
    };
  } else if (!config.status) {
    throw new Error('The statement config needs "status", or pass --checklist.');
  }
  const statement = generateStatement(input);
  writeFileSync(outPath, outPath.endsWith(".html") ? `${statement.html}\n` : statement.markdown);
}
