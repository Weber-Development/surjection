import { describe, expect, it } from "vitest";
import { coverage, coverageMarkdown, coverageSummary } from "../src";
import { checkComponent, expectAccessibleComponent } from "../src/component";

describe("coverage", () => {
  it("lists the 55 criteria of WCAG 2.2 A and AA", () => {
    const rows = coverage();
    expect(rows).toHaveLength(55);
    expect(rows.filter((r) => r.level === "A")).toHaveLength(31);
    expect(rows.find((r) => r.id === "4.1.1")).toBeUndefined();
    const s = coverageSummary(rows);
    expect(s.mostly + s.partly + s.manual).toBe(55);
  });

  it("derives the rules from the rule set and Surjection's own checks", () => {
    const byId = new Map(coverage().map((r) => [r.id, r]));
    expect(byId.get("1.4.3")?.rules).toContain("color-contrast");
    expect(byId.get("1.4.10")?.rules).toContain("surjection-reflow");
    expect(byId.get("2.5.8")?.rules).toContain("target-size");
    expect(byId.get("3.3.4")?.coverage).toBe("manual");
    expect(byId.get("1.1.1")?.coverage).toBe("partly");
  });

  it("renders a table with the caveat", () => {
    const text = coverageMarkdown();
    expect(text).toContain("| 1.4.3 | AA | Contrast (Minimum) | mostly automatic |");
    expect(text).toContain("no proof of conformance");
  });
});

describe("component mode", () => {
  it("checks a component without page-level rules", async () => {
    document.body.innerHTML = '<div id="c"><button type="button">Save</button></div>';
    const result = await checkComponent(document.getElementById("c") as HTMLElement, {
      name: "button--primary",
    });
    expect(result.url).toBe("component:button--primary");
    expect(result.findings).toEqual([]);
    await expectAccessibleComponent("#c");
  });

  it("fails with the broken element named", async () => {
    document.body.innerHTML = '<div id="c"><button type="button"></button></div>';
    await expect(expectAccessibleComponent("#c", { name: "icon-button" })).rejects.toThrow(
      "component:icon-button",
    );
  });
});
