---
"@sweberdev/surjection": major
"@sweberdev/surjection-react": major
---

Surjection 2.0.

Breaking: Node 22 or newer; results files and baselines are `version: 2` (stable `id` per finding, `tool` and `run` in the results; baseline entries with id, page, rule, target and an optional note); `fingerprints()` returns ids. Version 1 files are still read, `surjection convert` rewrites them as version 2. See `docs/guides/migrating-to-2.md`.

New: `flows` (check a multi-step journey after the steps you choose), `surjection coverage` (which of the 55 WCAG 2.2 A/AA criteria are tested automatically), `@sweberdev/surjection/component` for Storybook and Testing Library, `flows` in the config schema.
