# @sweberdev/surjection-react

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

## 0.4.0

## 0.3.0

## 0.2.0

## 0.1.0

### Minor Changes

- 5ffe601: First release: axe-core checks for Playwright and Vitest, WCAG 2.2 / EN 301 549 mapping, baseline, Markdown report, accessibility statement generator (DE, DE-CH, FR, IT, EN) and accessible React building blocks.
