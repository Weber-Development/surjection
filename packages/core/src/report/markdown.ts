import { reportMessages } from "../i18n";
import { countByImpact } from "../normalize";
import type { Finding, Locale, PageResult } from "../types";

export interface ReportOptions {
  locale?: Locale;
  /** Shown under the title, e.g. the client's project name. */
  project?: string;
  /** Include findings axe-core could not decide automatically. Default: true. */
  includeIncomplete?: boolean;
}

function findingMarkdown(finding: Finding, locale: Locale): string {
  const t = reportMessages(locale);
  const criteria = finding.criteria.length
    ? finding.criteria.map((c) => `${c.id}${c.level ? ` (${c.level})` : ""}`).join(", ")
    : t.bestPractice;
  const nodes = finding.nodes
    .slice(0, 10)
    .map((node) => `  - \`${node.target.replaceAll("`", "'")}\``)
    .join("\n");
  const more = finding.nodes.length > 10 ? `\n  - … +${finding.nodes.length - 10}` : "";
  return [
    `#### ${finding.help} (\`${finding.rule}\`)`,
    "",
    `- **${t.impact[finding.impact]}** · ${t.criteria}: ${criteria}`,
    `- ${t.elements} (${finding.nodes.length}):`,
    nodes + more,
    `- ${t.howToFix}: ${finding.helpUrl}`,
    "",
  ].join("\n");
}

/** Renders one or more page results as Markdown, e.g. for a PR comment or a GitHub job summary. */
export function toMarkdown(pages: PageResult[], options: ReportOptions = {}): string {
  const locale = options.locale ?? "en";
  const t = reportMessages(locale);
  const all = pages.flatMap((page) => page.findings);
  const counts = countByImpact(all);
  const lines = [`# ${t.title}`, ""];
  if (options.project) lines.push(`**${options.project}**`, "");
  lines.push(
    `## ${t.summary}`,
    "",
    `| ${t.page} | ${t.impact.critical} | ${t.impact.serious} | ${t.impact.moderate} | ${t.impact.minor} |`,
    "|---|---:|---:|---:|---:|",
  );
  for (const page of pages) {
    const c = countByImpact(page.findings);
    lines.push(`| ${page.url} | ${c.critical} | ${c.serious} | ${c.moderate} | ${c.minor} |`);
  }
  if (pages.length > 1) {
    lines.push(
      `| **Total** | **${counts.critical}** | **${counts.serious}** | **${counts.moderate}** | **${counts.minor}** |`,
    );
  }
  lines.push("");
  for (const page of pages) {
    lines.push(`## ${page.title ? `${page.title} · ` : ""}${page.url}`, "");
    lines.push(`${t.testedAt}: ${page.testedAt} · ${t.passedRules}: ${page.passedRules}`, "");
    if (page.findings.length === 0) lines.push(t.noFindings, "");
    else {
      lines.push(`### ${t.findings}`, "");
      for (const finding of page.findings) lines.push(findingMarkdown(finding, locale));
    }
    if (options.includeIncomplete !== false && page.incomplete.length > 0) {
      lines.push(`### ${t.needsReview}`, "");
      for (const finding of page.incomplete) lines.push(findingMarkdown(finding, locale));
    }
  }
  lines.push("---", "", `_${t.disclaimer}_`, "");
  return lines.join("\n");
}
