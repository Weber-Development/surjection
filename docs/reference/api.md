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
| `createBaseline(pages)` / `applyBaseline(page, baseline)` | Baseline handling |
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
| `checkKeyboard(page, options?)` | Press Tab through the page; returns findings for focus traps and missing focus indicators |

## `@sweberdev/surjection/vitest`

Importing it registers `expect(element).toBeAccessible(options?)`.

## `@sweberdev/surjection/node`

Node only. `runCheck(options, browser?)`, `loadConfig`, `loadSitemap`, `launchChromium`, `runStatement`.

## Result types

```ts
interface PageResult {
  url: string;
  title: string | undefined;
  testedAt: string;
  findings: Finding[];
  passedRules: number;
  incomplete: Finding[]; // needs manual review
}

interface Finding {
  rule: string; // axe-core rule id, e.g. "image-alt"
  impact: "minor" | "moderate" | "serious" | "critical";
  help: string;
  helpUrl: string;
  criteria: { id: string; level?: "A" | "AA" | "AAA"; en301549: string }[];
  bestPractice: boolean;
  nodes: { target: string; html: string; summary: string }[];
}

interface ResultsFile {
  version: 1;
  project?: string;
  createdAt: string;
  pages: PageResult[];
}
```
