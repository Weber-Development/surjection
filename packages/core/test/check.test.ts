import { afterEach, describe, expect, it } from "vitest";
import { applyBaseline, checkDocument, createBaseline, failingResult, toMarkdown } from "../src";
import "../src/vitest";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("checkDocument", () => {
  it("reports a missing alt text with its WCAG criterion", async () => {
    document.body.innerHTML = '<main><h1>Test</h1><img src="a.png"></main>';
    const result = await checkDocument(document.body);
    const finding = result.findings.find((f) => f.rule === "image-alt");
    expect(finding?.impact).toBe("critical");
    expect(finding?.criteria.map((c) => c.id)).toContain("1.1.1");
    expect(finding?.nodes[0]?.target).toBe("img");
  });

  it("uses German axe messages for locale de", async () => {
    document.body.innerHTML = '<main><img src="a.png"></main>';
    const result = await checkDocument(document.body, { locale: "de" });
    expect(result.findings.find((f) => f.rule === "image-alt")?.help).toMatch(/Alternativtext/);
  });

  it("baseline hides accepted findings but keeps new ones", async () => {
    document.body.innerHTML = '<main><img id="old" src="a.png"></main>';
    const before = await checkDocument(document.body);
    const baseline = createBaseline([before], new Date("2026-10-05T00:00:00Z"));
    document.body.innerHTML = '<main><img id="old" src="a.png"><img id="new" src="b.png"></main>';
    const after = applyBaseline(await checkDocument(document.body), baseline);
    const targets = after.findings.flatMap((f) => f.nodes.map((n) => n.target));
    expect(targets).toEqual(["#new"]);
  });

  it("failOn filters findings below the threshold", async () => {
    document.body.innerHTML = '<main><img src="a.png"></main>';
    const result = await checkDocument(document.body);
    expect(failingResult(result, { failOn: "critical" }).findings).toHaveLength(1);
    const minorOnly = {
      ...result,
      findings: result.findings.map((f) => ({ ...f, impact: "minor" as const })),
    };
    expect(failingResult(minorOnly, { failOn: "serious" }).findings).toHaveLength(0);
  });

  it("renders a Markdown report with disclaimer", async () => {
    document.body.innerHTML = '<main><img src="a.png"></main>';
    const md = toMarkdown([await checkDocument(document.body)], {
      locale: "de",
      project: "Muster AG",
    });
    expect(md).toContain("# Bericht zur Barrierefreiheit");
    expect(md).toContain("`image-alt`");
    expect(md).toContain("keine Bestätigung der Konformität");
  });
});

describe("toBeAccessible", () => {
  it("passes for an accessible component", async () => {
    document.body.innerHTML = '<button type="button">Speichern</button>';
    await expect(document.body).toBeAccessible();
  });

  it("fails with a readable message", async () => {
    document.body.innerHTML = "<button></button>";
    await expect(expect(document.body).toBeAccessible()).rejects.toThrow(/button-name/);
  });
});
