# Surjection

Accessibility checks for CI and tests, client-ready reports and accessibility statements in five languages. Built on [axe-core](https://github.com/dequelabs/axe-core). **Not an overlay**: Surjection helps you fix the code, it does not hide problems.

> Automated tests detect only part of all barriers. Surjection does not confirm conformance with WCAG, EN 301 549, the European Accessibility Act or the German BFSG. A manual review is still needed.

| Package | What it does |
|---|---|
| [`@sweberdev/surjection`](packages/core) | axe-core checks for Playwright and Vitest, WCAG 2.2 / EN 301 549 mapping, baseline, Markdown report, accessibility statement generator |
| [`@sweberdev/surjection-react`](packages/react) | `SkipLink`, `VisuallyHidden`, `AnnouncerProvider` + `useAnnounce`, `useReducedMotion` |

## CLI

Check a whole site in CI, with a baseline and a report:

```sh
npm i -D @sweberdev/surjection @playwright/test && npx playwright install chromium
npx surjection check --base-url https://preview.example.ch / /shop /kontakt --fail-on serious --out-md a11y.md
npx surjection check --sitemap https://example.ch/sitemap.xml --max-pages 100 --update-baseline
npx surjection statement --config statement.json --out erklaerung.html
```

Options can also live in `surjection.config.json`. In GitHub Actions the report is added to the job summary automatically. `--out-json` writes all results for Surjection Pro reports and history, `--out-junit` a JUnit XML for GitLab, Azure DevOps or Jenkins, `--viewport mobile` checks the mobile layout, `--screenshots dir` photographs every affected element for Pro reports, `--layout` tests reflow at 320 px and text spacing, `--keyboard` finds focus traps and missing focus indicators, and `--storage-state` checks pages behind a login. `npx surjection init` sets up the config file and a GitHub Actions workflow.

## Playwright

```ts
import { test } from "@playwright/test";
import { expectAccessible } from "@sweberdev/surjection/playwright";

test("home is accessible", async ({ page }) => {
  await page.goto("/");
  await expectAccessible(page, { failOn: "serious", locale: "de" });
});
```

### Baseline for existing sites

Taking over a site with 200 known issues? Record them once, then CI fails only on new ones:

```ts
import { createBaseline } from "@sweberdev/surjection";
import { checkPage } from "@sweberdev/surjection/playwright";

const baseline = createBaseline([await checkPage(page)]);
// write baseline to a11y-baseline.json, commit it, then:
await expectAccessible(page, { baseline });
```

## Vitest

```ts
import "@sweberdev/surjection/vitest";

it("is accessible", async () => {
  render(<SaveButton />);
  await expect(document.body).toBeAccessible();
});
```

## Accessibility statement

```ts
import { enforcementBodies, generateStatement } from "@sweberdev/surjection";

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
