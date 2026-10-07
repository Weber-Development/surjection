---
title: Upgrading to 1.0
description: What changed on the way to 1.0.0 and what to do when upgrading from 0.x.
---

Version 1.0.0 adds no breaking change compared with 0.9. If you run 0.9 you can upgrade without touching anything.

```sh
pnpm add -D @sweberdev/surjection@^1.0.0
```

## Coming from an earlier 0.x version

Nothing was removed on the way to 1.0, but defaults and checks grew. Look at these points:

| Since | What to know |
|---|---|
| 0.3 | `--keyboard` checks focus traps and visible focus. Opt-in. |
| 0.4 | `--screenshots <dir>` stores a PNG of each affected element. Opt-in. |
| 0.5 | `--layout` tests reflow and text spacing. Opt-in. |
| 0.6 | `states` in the config and the focus-order rule (inside `--keyboard`). Accepted keyboard findings in a baseline do not cover the new rule, so it can show up once. |
| 0.7 | `--out-sarif`, `--color-scheme`, `--reduced-motion`, and `$schema` in the config. Opt-in. |
| 0.8 | `--compare-with` for before and after images. Opt-in. |
| 0.9 | `--concurrency`, `surjection statement --checklist`. Pages that cannot be loaded no longer stop the run: the others are checked, and the exit code is 2. |

If CI treated a failed page load as a crash before, it still fails (exit code 2), but now with results for all other pages.

## New findings after the upgrade

axe-core is updated with Surjection. A newer version may find issues that were not reported before. Run `surjection check --update-baseline` once if you want to accept the current state and fail only on new problems, see [Baseline](baseline.md).

## Surjection Pro

Update `@weber-development/surjection-report`, `-history` and `-checklist` to 1.0.0 together. Existing history folders and checklist files keep working.
