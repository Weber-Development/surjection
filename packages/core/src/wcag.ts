import type { Criterion, WcagLevel } from "./types";

const LEVEL_TAG = /^wcag(2|21|22)(a|aa|aaa)$/;
const CRITERION_TAG = /^wcag(\d)(\d)(\d+)$/;

/** Turns axe-core tags like ["wcag2aa", "wcag143"] into WCAG criteria with EN 301 549 clauses. */
export function criteriaFromTags(tags: readonly string[]): Criterion[] {
  let level: WcagLevel | undefined;
  for (const tag of tags) {
    const match = LEVEL_TAG.exec(tag);
    if (match?.[2]) level = match[2].toUpperCase() as WcagLevel;
  }
  const criteria: Criterion[] = [];
  for (const tag of tags) {
    const match = CRITERION_TAG.exec(tag);
    if (!match) continue;
    const id = `${match[1]}.${match[2]}.${match[3]}`;
    criteria.push({ id, level, en301549: `9.${id}` });
  }
  return criteria;
}

export function standardTags(standard: string): string[] {
  switch (standard) {
    case "wcag2a":
      return ["wcag2a"];
    case "wcag2aa":
      return ["wcag2a", "wcag2aa"];
    case "wcag21aa":
      return ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
    default:
      return ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
  }
}
