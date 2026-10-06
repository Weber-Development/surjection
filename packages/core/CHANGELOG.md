# @sweberdev/surjection

## 0.4.0

### Minor Changes

- c9b9432: New: `--screenshots <dir>` (and `captureEvidence()`) saves a screenshot of every affected element and stores the path in the results, as evidence for Surjection Pro reports.

## 0.3.0

### Minor Changes

- c524e9c: New: `--keyboard` (and `checkKeyboard()`, `keyboard: true` in `expectAccessible`) presses Tab through each page and reports focus traps (WCAG 2.1.2) and missing focus indicators (WCAG 2.4.7). `--storage-state` checks pages behind a login.

## 0.2.0

### Minor Changes

- 49319c3: New: `--out-junit` writes a JUnit XML report for GitLab, Azure DevOps and Jenkins; `--viewport mobile|desktop|WxH` checks other screen sizes; `surjection init` creates a config file and a GitHub Actions workflow.

## 0.1.0

### Minor Changes

- bd94c27: Add the `surjection` CLI (`check` with sitemap, baseline, `--fail-on`, Markdown/JSON output and GitHub job summary; `statement`) and the `@sweberdev/surjection/node` entry. Report totals now count affected elements.
- 5ffe601: First release: axe-core checks for Playwright and Vitest, WCAG 2.2 / EN 301 549 mapping, baseline, Markdown report, accessibility statement generator (DE, DE-CH, FR, IT, EN) and accessible React building blocks.
