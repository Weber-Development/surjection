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

Each entry is the page path, the rule and the element selector, for example `/shop|image-alt|#hero`. Host and protocol are ignored, so the same baseline works for localhost, preview and production.

When you fix an issue, run `--update-baseline` again so the entry disappears and the problem cannot come back unnoticed.

With Playwright, pass the file directly:

```ts
import baseline from "../surjection-baseline.json";

await expectAccessible(page, { baseline });
```

The Markdown report also leaves out accepted findings. Keep the baseline as short as you can: it is a list of known debt, not an exception list.
