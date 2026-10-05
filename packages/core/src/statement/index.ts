import { localizeText } from "../i18n";
import type { Locale } from "../types";
import { statementTexts } from "./texts";
import type { Statement, StatementInput } from "./types";

export { enforcementBodies } from "./texts";
export type { ConformanceStatus, KnownIssue, Statement, StatementInput } from "./types";

const DEFAULT_STANDARD = "WCAG 2.2 AA / EN 301 549 V3.2.1";

const DATE_LOCALE: Record<Locale, string> = {
  de: "de-DE",
  "de-CH": "de-CH",
  fr: "fr-CH",
  it: "it-CH",
  en: "en-GB",
};

function formatDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[\]<>#|])/g, "\\$1");
}

type Block = { heading?: string; paragraphs?: string[]; list?: string[] };

function buildBlocks(input: StatementInput): { title: string; blocks: Block[] } {
  const t = statementTexts[input.locale === "de-CH" ? "de" : input.locale];
  const standard = input.standard ?? DEFAULT_STANDARD;
  const blocks: Block[] = [{ paragraphs: [t.intro(input.organisation, input.scope)] }];
  if (input.serviceDescription) {
    blocks.push({ heading: t.service, paragraphs: [input.serviceDescription] });
  }
  blocks.push({ heading: t.statusHeading, paragraphs: [t.status[input.status](standard)] });
  if (input.knownIssues?.length) {
    blocks.push({
      heading: t.issuesHeading,
      list: input.knownIssues.map((issue) =>
        [
          issue.description,
          issue.reason ? `${t.reason}: ${issue.reason}` : "",
          issue.plannedFix ? `${t.plannedFix}: ${formatDate(issue.plannedFix, input.locale)}` : "",
        ]
          .filter(Boolean)
          .join(" "),
      ),
    });
  }
  const preparation = [t.prepared(formatDate(input.preparedOn, input.locale))];
  if (input.lastReviewedOn)
    preparation.push(t.reviewed(formatDate(input.lastReviewedOn, input.locale)));
  preparation.push(
    input.method === "third-party" && input.auditor
      ? t.methodThirdParty(input.auditor)
      : t.methodSelf,
  );
  blocks.push({ heading: t.preparationHeading, paragraphs: [preparation.join(" ")] });
  const contact = [`${t.email}: ${input.contact.email}`];
  if (input.contact.phone) contact.push(`${t.phone}: ${input.contact.phone}`);
  if (input.contact.postal) contact.push(`${t.postal}: ${input.contact.postal}`);
  blocks.push({ heading: t.feedbackHeading, paragraphs: [t.feedback], list: contact });
  if (input.enforcement) {
    const body = [input.enforcement.name, input.enforcement.address, input.enforcement.url].filter(
      (part): part is string => Boolean(part),
    );
    blocks.push({ heading: t.enforcementHeading, paragraphs: [t.enforcement], list: body });
  }
  return { title: t.title, blocks };
}

/**
 * Generates an accessibility statement (Erklärung zur Barrierefreiheit) as Markdown and HTML.
 * The text is a starting point: review it for the specific service before publishing.
 */
export function generateStatement(input: StatementInput): Statement {
  const { title, blocks } = buildBlocks(input);
  const loc = (text: string) => localizeText(text, input.locale);

  const md = [`# ${loc(title)}`, ""];
  const html = [`<h1>${escapeHtml(loc(title))}</h1>`];
  for (const block of blocks) {
    if (block.heading) {
      md.push(`## ${loc(block.heading)}`, "");
      html.push(`<h2>${escapeHtml(loc(block.heading))}</h2>`);
    }
    for (const p of block.paragraphs ?? []) {
      md.push(escapeMarkdown(loc(p)), "");
      html.push(`<p>${escapeHtml(loc(p))}</p>`);
    }
    if (block.list) {
      for (const item of block.list) md.push(`- ${escapeMarkdown(loc(item))}`);
      md.push("");
      html.push(
        `<ul>${block.list.map((item) => `<li>${escapeHtml(loc(item))}</li>`).join("")}</ul>`,
      );
    }
  }
  return { title: loc(title), markdown: md.join("\n"), html: html.join("\n") };
}
