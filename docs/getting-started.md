---
title: Getting started
description: Install Surjection and run your first check.
---

1. Install the package and Playwright with a browser:

   ```sh
   pnpm add -D @sweberdev/surjection @playwright/test
   pnpm exec playwright install chromium
   ```

   With npm: `npm i -D @sweberdev/surjection @playwright/test` and `npx playwright install chromium`.

2. Check a page:

   ```sh
   npx surjection check https://example.ch --locale de
   ```

   Each page prints one line. The command exits with code `1` when issues remain.

3. Write a report you can attach to a pull request or hand to your team:

   ```sh
   npx surjection check https://example.ch --out-md a11y.md --out-json a11y.json
   ```

4. Run it on every build. See [GitHub Actions](guides/github-actions.md), or use the [Playwright helper](guides/playwright.md) in your existing end-to-end tests.

## Requirements

- Node.js 20 or newer
- Playwright 1.40 or newer for page checks (`@playwright/test` or `playwright`)
- Vitest 3 or newer for the component matcher (types target Vitest 5)
