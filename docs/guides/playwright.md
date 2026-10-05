---
title: Playwright
description: Check pages inside your existing end-to-end tests.
---

```ts title="tests/a11y.spec.ts"
import { test } from "@playwright/test";
import { expectAccessible } from "@sweberdev/surjection/playwright";

for (const path of ["/", "/shop", "/checkout"]) {
  test(`${path} is accessible`, async ({ page }) => {
    await page.goto(path);
    await expectAccessible(page, { failOn: "serious", locale: "de" });
  });
}
```

Check states that only exist after interaction the same way: open the menu, the dialog or the error state first, then call `expectAccessible`.

## Options

`expectAccessible(page, options)` and `checkPage(page, options)` accept:

| Option | Meaning |
|---|---|
| `standard` | `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` (default) |
| `bestPractice` | Also run axe-core best-practice rules |
| `disableRules` | Rule ids to skip |
| `include` / `exclude` | CSS selectors to limit or skip parts of the page |
| `locale` | Language of messages |
| `failOn` | Lowest impact that fails (only `expectAccessible`) |
| `baseline` | Accepted findings (only `expectAccessible`) |

`checkPage` returns the normalized result without failing, e.g. to build your own report.

Only the main frame is checked. Content inside iframes, such as embedded maps or payment forms, needs its own check.
