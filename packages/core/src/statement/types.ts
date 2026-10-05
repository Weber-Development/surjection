import type { Locale } from "../types";

export type ConformanceStatus = "full" | "partial" | "none";

export interface KnownIssue {
  /** What is not accessible, in plain language. */
  description: string;
  /** Why (e.g. third-party content, disproportionate burden) and what the alternative is. */
  reason?: string;
  /** Planned fix date, ISO format. */
  plannedFix?: string;
}

export interface StatementInput {
  locale: Locale;
  /** Organisation offering the service, e.g. "Muster AG". */
  organisation: string;
  /** Website or app the statement covers. */
  scope: string;
  /** Short description of the service (the BFSG asks for a description of the service). */
  serviceDescription?: string;
  status: ConformanceStatus;
  /** Default: "WCAG 2.2 AA / EN 301 549 V3.2.1". */
  standard?: string;
  knownIssues?: KnownIssue[];
  /** How the assessment was made. */
  method: "self" | "third-party";
  /** Name of the auditor when method is "third-party". */
  auditor?: string;
  /** Date the statement was prepared, ISO format. */
  preparedOn: string;
  lastReviewedOn?: string;
  contact: { email: string; phone?: string; postal?: string };
  /** Market surveillance or enforcement body users can turn to. */
  enforcement?: { name: string; url?: string; address?: string };
}

export interface Statement {
  title: string;
  markdown: string;
  html: string;
}
