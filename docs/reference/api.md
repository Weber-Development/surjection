---
title: API
description: Exports of @sweberdev/surjection.
---

## `@sweberdev/surjection`

Works in the browser, jsdom and Node.

| Export | Purpose |
|---|---|
| `checkDocument(context?, options?)` | Run the check in the current document, returns a `PageResult` |
| `toMarkdown(pages, { locale, project, includeIncomplete })` | Markdown report |
| `toJUnit(pages)` / `toSarif(pages)` | JUnit XML and SARIF 2.1.0 |
| `createBaseline(pages)` / `applyBaseline(page, baseline)` / `normalizeBaseline(data)` | Baseline handling; `normalizeBaseline` reads versions 1 and 2 |
| `createResults(pages, { project, run })` / `normalizeResults(data)` | Build a results file (version 2) or read version 1 and 2 |
| `findingId(path, rule, target)` | The stable id of a finding |
| `coverage()` / `coverageMarkdown()` / `coverageSummary()` | Which WCAG 2.2 criteria are tested automatically |
| `failingResult(page, { baseline, failOn })` | Findings that fail after baseline and threshold |
| `generateStatement(input)` | Accessibility statement as `{ title, markdown, html }` |
| `enforcementBodies` | Presets for Germany and Austria |
| `criteriaFromTags(tags)` | Map axe-core tags to WCAG criteria and EN 301 549 clauses |
| `countByImpact(findings)` | Affected elements per impact |

## `@sweberdev/surjection/playwright`

| Export | Purpose |
|---|---|
| `checkPage(page, options?)` | Check a Playwright page |
| `expectAccessible(page, options?)` | Check and throw when issues remain. `keyboard: true` adds the keyboard check |
| `checkLayout(page, options?)` | Check reflow at 320 px and text spacing; returns findings. `layout: true` in `expectAccessible` adds it |
| `checkKeyboard(page, options?)` | Press Tab through the page; returns findings for focus traps, missing focus indicators and a jumping focus order |
| `captureEvidence(page, result, { dir, pageIndex })` | Screenshot every affected element and store the path in `node.screenshot` |

## `@sweberdev/surjection/component`

Works in the browser, jsdom and Node, see [Testing components](../guides/components.md).

| Export | Purpose |
|---|---|
| `checkComponent(element, options?)` | Check one component (element or selector); page-level rules are off |
| `expectAccessibleComponent(element, options?)` | Check and throw when issues remain |

## `@sweberdev/surjection/vitest`

Importing it registers `expect(element).toBeAccessible(options?)`.

## `@sweberdev/surjection/node`

Node only. `runCheck(options, browser?)`, `loadConfig`, `readResults(file)`, `convertFile(input, output)`, `loadSitemap`, `launchChromium`, `runStatement(config, out, checklist?)`, `runInit`, and the types `SurjectionConfig`, `StateConfig`, `FlowConfig`, `FlowStep` and `Step`.

Everything not listed on this page is internal, even when it is exported. It can change in any release. See [Stability and versioning](stability.md).

## Result types

```ts
interface PageResult {
  url: string;
  title: string | undefined;
  testedAt: string;
  findings: Finding[];
  passedRules: number;
  incomplete: Finding[]; // needs manual review
  fixed?: { rule: string; help: string; target: string; before?: string; after?: string }[]; // with --compare-with
}

interface Finding {
  rule: string; // axe-core rule id, e.g. "image-alt"
  impact: "minor" | "moderate" | "serious" | "critical";
  help: string;
  helpUrl: string;
  criteria: { id: string; level?: "A" | "AA" | "AAA"; en301549: string }[];
  bestPractice: boolean;
  nodes: { id: string; target: string; html: string; summary: string; screenshot?: string }[];
}

interface ResultsFile {
  version: 2;
  project?: string;
  createdAt: string;
  tool: { name: string; version: string };
  run?: { standard: string; viewport: string; keyboard: boolean; layout: boolean; startedAt: string; finishedAt: string };
  pages: PageResult[];
}
```
