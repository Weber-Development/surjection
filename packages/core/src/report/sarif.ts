import type { Finding, Impact, PageResult } from "../types";

const LEVEL: Record<Impact, "error" | "warning" | "note"> = {
  critical: "error",
  serious: "error",
  moderate: "warning",
  minor: "note",
};

/** Security-severity style score so tools can sort results; not a CVSS value. */
const RANK: Record<Impact, string> = {
  critical: "9.0",
  serious: "7.0",
  moderate: "4.0",
  minor: "1.0",
};

function rule(finding: Finding) {
  return {
    id: finding.rule,
    name: finding.rule,
    shortDescription: { text: finding.help },
    fullDescription: { text: finding.description },
    helpUri: finding.helpUrl,
    defaultConfiguration: { level: LEVEL[finding.impact] },
    properties: {
      tags: ["accessibility", ...finding.criteria.map((c) => `WCAG ${c.id}`)],
      "security-severity": RANK[finding.impact],
    },
  };
}

/**
 * SARIF 2.1.0 for tools that read static analysis results. One result per affected element; the
 * location is the page URL, the element is given as logical location (CSS selector).
 *
 * Note: GitHub code scanning shows results on files of the repository. URL locations are accepted
 * by SARIF viewers and by the upload, but GitHub cannot link them to a line of code.
 */
export function toSarif(pages: PageResult[], version = "0.0.0"): string {
  const rules = new Map<string, ReturnType<typeof rule>>();
  const results = pages.flatMap((page) =>
    page.findings.flatMap((finding) => {
      if (!rules.has(finding.rule)) rules.set(finding.rule, rule(finding));
      return finding.nodes.map((node) => ({
        ruleId: finding.rule,
        level: LEVEL[finding.impact],
        message: { text: `${finding.help}: ${node.summary || finding.description}` },
        locations: [
          {
            physicalLocation: { artifactLocation: { uri: page.url } },
            logicalLocations: [
              { name: node.target, kind: "element", fullyQualifiedName: node.target },
            ],
          },
        ],
        partialFingerprints: { "surjection/v1": `${page.url}|${finding.rule}|${node.target}` },
      }));
    }),
  );
  return `${JSON.stringify(
    {
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "Surjection",
              version,
              informationUri: "https://packages.sweber.dev/surjection",
              rules: [...rules.values()],
            },
          },
          results,
        },
      ],
    },
    null,
    2,
  )}\n`;
}
