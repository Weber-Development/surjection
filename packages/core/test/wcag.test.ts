import { describe, expect, it } from "vitest";
import { criteriaFromTags } from "../src";

describe("criteriaFromTags", () => {
  it("maps axe tags to WCAG criteria and EN 301 549 clauses", () => {
    expect(criteriaFromTags(["cat.color", "wcag2aa", "wcag143", "EN-301-549"])).toEqual([
      { id: "1.4.3", level: "AA", en301549: "9.1.4.3" },
    ]);
  });

  it("handles two-digit criterion numbers", () => {
    expect(criteriaFromTags(["wcag2a", "wcag2411"])[0]?.id).toBe("2.4.11");
  });

  it("returns nothing for best-practice rules", () => {
    expect(criteriaFromTags(["best-practice", "cat.keyboard"])).toEqual([]);
  });
});
