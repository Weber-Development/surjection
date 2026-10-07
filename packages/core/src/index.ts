export { type AssertOptions, failingResult } from "./assert";
export { applyBaseline, type Baseline, createBaseline, fingerprints } from "./baseline";
export { reportMessages } from "./i18n";
export { countByImpact, toPageResult } from "./normalize";
export { toJUnit } from "./report/junit";
export { type ReportOptions, toMarkdown } from "./report/markdown";
export { toSarif } from "./report/sarif";
export { axeRunOptions, checkDocument } from "./run";
export {
  type ConformanceStatus,
  enforcementBodies,
  generateStatement,
  type KnownIssue,
  type Statement,
  type StatementInput,
} from "./statement";
export type {
  CheckOptions,
  Criterion,
  Finding,
  FindingNode,
  FixedItem,
  Impact,
  Locale,
  PageResult,
  ResultsFile,
  WcagLevel,
} from "./types";
export { criteriaFromTags } from "./wcag";
