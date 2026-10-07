import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { enforcementBodies, generateStatement, type StatementInput } from "../src";
import { runStatement } from "../src/node";

const base: StatementInput = {
  locale: "de",
  organisation: "Muster AG",
  scope: "www.muster.ch",
  status: "partial",
  knownIssues: [
    { description: "Einige PDF-Rechnungen sind nicht getaggt.", plannedFix: "2027-03-31" },
  ],
  method: "self",
  preparedOn: "2026-10-05",
  contact: { email: "barrierefreiheit@muster.ch" },
  enforcement: enforcementBodies.DE,
};

describe("generateStatement", () => {
  it("creates a German statement with known issues and enforcement body", () => {
    const s = generateStatement(base);
    expect(s.title).toBe("Erklärung zur Barrierefreiheit");
    expect(s.markdown).toContain("teilweise vereinbar");
    expect(s.markdown).toContain("31. März 2027");
    expect(s.markdown).toContain("MLBF");
    expect(s.html).toContain("<h2>Nicht barrierefreie Inhalte</h2>");
  });

  it("uses ss instead of ß for Swiss German", () => {
    const s = generateStatement({ ...base, locale: "de-CH" });
    expect(s.markdown).toContain("zuständige Marktüberwachungsbehörde");
    expect(s.markdown).not.toContain("ß");
  });

  it("supports French, Italian and English", () => {
    expect(generateStatement({ ...base, locale: "fr" }).title).toBe("Déclaration d'accessibilité");
    expect(generateStatement({ ...base, locale: "it" }).title).toBe(
      "Dichiarazione di accessibilità",
    );
    expect(generateStatement({ ...base, locale: "en", status: "full" }).markdown).toContain(
      "fully compliant",
    );
  });

  it("escapes user input in HTML", () => {
    const s = generateStatement({ ...base, organisation: "<script>x</script>" });
    expect(s.html).not.toContain("<script>");
  });
});

describe("statement from a checklist", () => {
  const { status: _status, knownIssues: _issues, ...config } = base;
  const checklist = (items: object[]) => JSON.stringify({ version: 1, items });
  const run = (json: string, extra: object = {}) => {
    const dir = mkdtempSync(join(tmpdir(), "surjection-statement-"));
    writeFileSync(join(dir, "c.json"), JSON.stringify({ ...config, ...extra }));
    writeFileSync(join(dir, "l.json"), json);
    runStatement(join(dir, "c.json"), join(dir, "out.md"), join(dir, "l.json"));
    return readFileSync(join(dir, "out.md"), "utf8");
  };

  it("takes status, known issues and review date from the decisions", () => {
    const md = run(
      checklist([
        { id: "1.1.1", status: "pass", testedOn: "2026-10-01" },
        {
          id: "1.4.3",
          status: "fail",
          notes: "Der Kontrast der Fusszeile ist zu gering.",
          plannedFix: "2027-01-31",
          testedOn: "2026-10-03",
        },
        { id: "2.4.2", status: "not-applicable" },
      ]),
    );
    expect(md).toContain("teilweise vereinbar");
    expect(md).toContain("Der Kontrast der Fusszeile ist zu gering.");
    expect(md).toContain("31. Januar 2027");
  });

  it("is fully conformant without failures, and refuses untested criteria", () => {
    expect(run(checklist([{ id: "1.1.1", status: "pass" }]))).toContain("vollständig vereinbar");
    expect(() => run(checklist([{ id: "1.1.1", status: "untested" }]))).toThrow("untested");
  });

  it("needs a status from somewhere", () => {
    const dir = mkdtempSync(join(tmpdir(), "surjection-statement-"));
    writeFileSync(join(dir, "c.json"), JSON.stringify(config));
    expect(() => runStatement(join(dir, "c.json"), join(dir, "o.md"))).toThrow("status");
  });
});
