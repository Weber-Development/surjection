---
title: Coverage
description: Which WCAG 2.2 criteria Surjection tests automatically, and which stay manual.
---

A green run does not mean a site is accessible. Automatic tests can decide only part of the criteria. `surjection coverage` shows the split for the 55 success criteria of WCAG 2.2 at levels A and AA:

```sh
npx surjection coverage            # table as Markdown
npx surjection coverage --json     # for scripts
npx surjection coverage --out coverage.md
```

| Class | Meaning |
|---|---|
| mostly automatic | The rules cover the core of the criterion. A finding is almost always right, a pass says a lot, but not everything. |
| partly automatic | Rules find missing or wrong markup, a person must judge the rest (for example whether alternative text describes the image). |
| manual only | No automatic test. Needs a person. |

The table lists the rules behind every criterion. They are read from the installed axe-core version and Surjection's own checks (`--keyboard`, `--layout`), so the list follows the tool when axe-core is updated. Which criteria count as "mostly" is our own judgement and can change between minor versions, see [Stability](../reference/stability.md).

Use the table to plan manual testing: the [Pro checklist](../pro/checklist.md) covers all 55 criteria, with the automatic ones pre-marked by the last run.

A passing run is no proof of conformance, not even for the criteria marked "mostly automatic".
