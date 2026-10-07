# @sweberdev/surjection

## 0.9.0

### Minor Changes

- 0bb33a5: New: `--concurrency <n>` checks up to 8 pages at once; pages that cannot be loaded no longer stop the run (the others are checked, exit code 2). `surjection statement --checklist` derives status and known issues from a Pro checklist. `toSarif` and the `StateConfig`/`Step`/`FixedItem` types are exported. Target size (WCAG 2.5.8) is covered and tested.

## 0.8.0

### Minor Changes

- 8b79f04: New: `--compare-with <results.json>` lists issues of the earlier run that are gone as `fixed` in the results and, with `--screenshots`, takes before and after screenshots of those elements.

## 0.7.0

### Minor Changes

- 3dc86f5: New: `--out-sarif` writes SARIF 2.1.0; `--color-scheme dark` and `--reduced-motion` (config: `colorScheme`, `reducedMotion`) emulate visitor settings; the package ships `surjection.config.schema.json` and `surjection init` references it as `$schema` for completion and validation in editors.

## 0.6.0

### Minor Changes

- 70e7fe6: Check opened menus, dialogs and forms with `states` (click, hover, fill, press, wait steps) in the config file; each state is reported and baselined as its own page. New focus-order check `surjection-focus-order` (WCAG 2.4.3) in the keyboard check.

## 0.5.0

### Minor Changes

- 4d52f0a: New: `--layout` (and `checkLayout()`, `layout: true` in `expectAccessible`) tests reflow at 320 CSS pixels (WCAG 1.4.10) and text spacing (WCAG 1.4.12), two criteria axe-core cannot decide.

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
