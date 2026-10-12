---
title: Migrating to 2.0
description: What breaks in Surjection 2.0, what is new, and how to upgrade from 1.x.
---

Surjection 2.0 changes the results format, raises the minimum Node version and adds flows, a coverage table and component checks. Most projects only need to upgrade Node and, if they use the results file in their own scripts, read one new version number.

```sh
pnpm add -D @sweberdev/surjection@^2.0.0
```

## Breaking changes

1. **Node 22 or newer.** Node 20 is end of life. Set `node-version: 22` in your CI (the workflow written by `surjection init` already does).
2. **Results file `version: 2`.** `--out-json` writes version 2: `tool`, `run` and an `id` per affected element are new, nothing was removed. If your own scripts check `version === 1`, accept 2 as well. Surjection itself, `--compare-with` and the Pro history read both versions. Convert old files with `surjection convert old.json --out new.json`, see [Results format](../reference/results-format.md).
3. **Baseline `version: 2`.** `--update-baseline` writes entries with id, page, rule, target and an optional `note`. A baseline of version 1 is still read, so nothing breaks if you do not touch it. Run `surjection convert surjection-baseline.json --out surjection-baseline.json` once to switch and commit the result.
4. **`fingerprints(page)` returns ids.** The exported function now returns the 12 character ids instead of `"<path>|<rule>|<target>"` strings. Only code that reads these strings itself is affected. `createBaseline` and `applyBaseline` take a version 2 baseline; use `normalizeBaseline(json)` to read any version.
5. **`ResultsFile` type.** `version` is `2`, `tool` is required. Code that builds a results file by hand should use `createResults(pages)`.

Nothing else was removed. Surjection 1.x had no deprecated exports.

## New in 2.0

- [Flows](flows.md): check a journey, with a check after each step.
- [Coverage](coverage.md): `surjection coverage` shows which of the 55 WCAG 2.2 A/AA criteria are tested automatically.
- [Component checks](components.md): `@sweberdev/surjection/component` for Storybook and Testing Library.
- [Results format](../reference/results-format.md): stable ids per finding, run settings and tool version.
- Config: `flows` is new, everything else stays as it was (`states` is not deprecated). The JSON schema knows `flows`.

## Surjection Pro

Pro 2.0 adds the WCAG-EM conformance report, the ACR export and the re-test flow, see the [Pro pages](../pro/overview.md). Pro 1.0.1 and newer read results of version 2; if you run an older Pro version, update it before you update Surjection, or convert the file.

## Version 1.x

Version 1.x gets security and bug fixes for 12 months after 2.0.0. See [Stability](../reference/stability.md).
