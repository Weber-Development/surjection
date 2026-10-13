# @sweberdev/surjection

Accessibility checks for CI and tests, client-ready reports and accessibility statements in five languages. Built on [axe-core](https://github.com/dequelabs/axe-core). **Not an overlay**: Surjection helps you fix the code, it does not hide problems.

> Automated tests detect only part of all barriers. Surjection does not confirm conformance with WCAG, EN 301 549, the European Accessibility Act or the German BFSG. A manual review is still needed.

```sh
npm i -D @sweberdev/surjection @playwright/test && npx playwright install chromium
npx surjection check --base-url https://preview.example.ch / /shop /kontakt --fail-on serious --out-md a11y.md
```

```ts
import { expectAccessible } from "@sweberdev/surjection/playwright";

test("home is accessible", async ({ page }) => {
  await page.goto("/");
  await expectAccessible(page, { failOn: "serious", locale: "de" });
});
```

Also: Vitest matcher, baseline for existing sites, WCAG 2.2 / EN 301 549 mapping, accessibility statement generator. Needs Node 22 or newer. Full guide: [packages.sweber.dev/surjection/docs](https://packages.sweber.dev/surjection/docs). React building blocks: [`@sweberdev/surjection-react`](https://www.npmjs.com/package/@sweberdev/surjection-react).

MIT.

<!-- pro-promo -->
## Surjection Pro

Need more than the free package? **Surjection Pro** adds:

- Client reports in your branding (HTML, PDF, Word), WCAG-EM conformance report and ACR export
- History: every run per project, dashboard, trend, badge and regression check
- Checklist: the 55 WCAG 2.2 A/AA criteria with manual-testing instructions

Subscriptions from CHF 19 per month, or a one-time lifetime licence. [See what is included](https://packages.sweber.dev/surjection?utm_source=npm&utm_medium=readme&utm_campaign=pro)
