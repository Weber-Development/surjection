import type { Finding, PageResult } from "../types";

const xml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    // XML 1.0 forbids most control characters, even escaped.
    // biome-ignore lint/suspicious/noControlCharactersInRegex: removing them is the point
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

function testcase(page: PageResult, finding: Finding): string {
  const criteria = finding.criteria
    .map((c) => `WCAG ${c.id} / EN 301 549 ${c.en301549}`)
    .join(", ");
  const details = [
    `${finding.help} (${finding.impact})`,
    criteria,
    ...finding.nodes.map((node) => `- ${node.target}: ${node.summary}`),
    finding.helpUrl,
  ]
    .filter(Boolean)
    .join("\n");
  return `    <testcase classname="${xml(page.url)}" name="${xml(finding.rule)}">
      <failure type="${xml(finding.impact)}" message="${xml(finding.help)}">${xml(details)}</failure>
    </testcase>`;
}

/**
 * JUnit XML for CI systems that show test reports (GitLab, Azure DevOps,
 * Jenkins, Bitbucket). One test suite per page, one failed test case per
 * violated rule, and one passed case per page without findings.
 */
export function toJUnit(pages: PageResult[]): string {
  const suites = pages.map((page) => {
    const cases =
      page.findings.length > 0
        ? page.findings.map((finding) => testcase(page, finding))
        : [`    <testcase classname="${xml(page.url)}" name="accessibility"/>`];
    const tests = Math.max(page.findings.length, 1);
    return `  <testsuite name="${xml(page.url)}" tests="${tests}" failures="${page.findings.length}" timestamp="${xml(page.testedAt)}">
${cases.join("\n")}
  </testsuite>`;
  });
  const tests = pages.reduce((n, p) => n + Math.max(p.findings.length, 1), 0);
  const failures = pages.reduce((n, p) => n + p.findings.length, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="surjection" tests="${tests}" failures="${failures}">
${suites.join("\n")}
</testsuites>
`;
}
