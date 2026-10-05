# Surjection

Accessibility checks for CI and tests, client-ready reports and accessibility statements in five languages. Built on [axe-core](https://github.com/dequelabs/axe-core). **Not an overlay**: Surjection helps you fix the code, it does not hide problems.

> Automated tests detect only part of all barriers. Surjection does not confirm conformance with WCAG, EN 301 549, the European Accessibility Act or the German BFSG. A manual review is still needed.

| Package | What it does |
|---|---|
| [`@sweber/surjection`](packages/core) | axe-core checks for Playwright and Vitest, WCAG 2.2 / EN 301 549 mapping, baseline, Markdown report, accessibility statement generator |
| [`@sweber/surjection-react`](packages/react) | `SkipLink`, `VisuallyHidden`, `AnnouncerProvider` + `useAnnounce`, `useReducedMotion` |

## Playwright

```ts
import { test } from "@playwright/test";
import { expectAccessible } from "@sweber/surjection/playwright";

test("home is accessible", async ({ page }) => {
  await page.goto("/");
  await expectAccessible(page, { failOn: "serious", locale: "de" });
});
```

### Baseline for existing sites

Taking over a site with 200 known issues? Record them once, then CI fails only on new ones:

```ts
import { createBaseline } from "@sweber/surjection";
import { checkPage } from "@sweber/surjection/playwright";

const baseline = createBaseline([await checkPage(page)]);
// write baseline to a11y-baseline.json, commit it, then:
await expectAccessible(page, { baseline });
```

## Vitest

```ts
import "@sweber/surjection/vitest";

it("is accessible", async () => {
  render(<SaveButton />);
  await expect(document.body).toBeAccessible();
});
```

## Accessibility statement

```ts
import { enforcementBodies, generateStatement } from "@sweber/surjection";

const { markdown, html } = generateStatement({
  locale: "de-CH",
  organisation: "Muster AG",
  scope: "www.muster.ch",
  status: "partial",
  knownIssues: [{ description: "Ältere PDF-Rechnungen sind nicht getaggt.", plannedFix: "2027-03-31" }],
  method: "self",
  preparedOn: "2026-10-05",
  contact: { email: "barrierefreiheit@muster.ch" },
  enforcement: enforcementBodies.DE,
});
```

The text is a starting point. Review it for the specific service before publishing.

## Development

```sh
pnpm install
pnpm build && pnpm typecheck && pnpm test && pnpm lint
```

## License

MIT
