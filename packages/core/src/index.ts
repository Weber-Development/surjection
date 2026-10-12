export { type AssertOptions, failingResult } from "./assert";
export {
  applyBaseline,
  type Baseline,
  type BaselineEntry,
  createBaseline,
  findingId,
  fingerprints,
  normalizeBaseline,
} from "./baseline";
export {
  type CoverageClass,
  type CoverageRow,
  coverage,
  coverageMarkdown,
  coverageSummary,
} from "./coverage";
export { reportMessages } from "./i18n";
export { countByImpact, toPageResult } from "./normalize";
export { toJUnit } from "./report/junit";
export { type ReportOptions, toMarkdown } from "./report/markdown";
export { toSarif } from "./report/sarif";
export { createResults, normalizeResults } from "./results";
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
  ResultsRun,
  WcagLevel,
} from "./types";
export { VERSION } from "./version";
export { criteriaFromTags } from "./wcag";
