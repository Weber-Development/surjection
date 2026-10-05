import { describe, expect, it } from "vitest";
import { enforcementBodies, generateStatement, type StatementInput } from "../src";

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
