---
title: Baseline
description: Accept existing issues once and fail only on new ones.
---

A site you take over may have hundreds of issues. Fixing them takes time, but new ones should not be added meanwhile. A baseline records the current findings so the build fails only on new ones.

```sh
# Record the current state once and commit the file
npx surjection check --config surjection.config.json --update-baseline
git add surjection-baseline.json

# Every later run ignores what is in the baseline
npx surjection check --config surjection.config.json
```

Each entry records the page path, the rule and the element selector, plus the stable `id` the finding has in the [results file](../reference/results-format.md):

```json
{ "id": "3f2a9c01b7de", "page": "/shop", "rule": "image-alt", "target": "#hero", "note": "Ticket SHOP-214" }
```

Host and protocol are ignored, so the same baseline works for localhost, preview and production. The optional `note` is yours: write down why an entry is accepted or which ticket tracks it. It survives `--update-baseline` as long as the finding stays.

A baseline written by Surjection 1.x (a list of `"/shop|image-alt|#hero"` strings) is still read. Convert it once with `surjection convert surjection-baseline.json --out surjection-baseline.json`.

When you fix an issue, run `--update-baseline` again so the entry disappears and the problem cannot come back unnoticed.

With Playwright, pass the file directly:

```ts
import baseline from "../surjection-baseline.json";

await expectAccessible(page, { baseline });
```

The Markdown report also leaves out accepted findings. Keep the baseline as short as you can: it is a list of known debt, not an exception list.
