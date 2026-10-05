---
title: Client report
description: Accessibility reports in your branding, as HTML or PDF.
---

`@weber-development/surjection-report` turns a check into a report you can send to a client.

## Contents

- Cover page with your logo, the client and the date
- Summary by impact (critical, serious, moderate, minor)
- The most frequent issues
- Change since the last check, when a [history](history.md) is available
- Overview by WCAG 2.2 criterion with the matching EN 301 549 clauses
- Findings per page with the affected elements and a hint how to fix them
- Rules that need a manual review
- Your [manual checklist](checklist.md), when you pass one
- Method and limits of the test

The report is available in German (`de`), Swiss German spelling (`de-CH`), French, Italian and English. The HTML report passes its own accessibility check.

## Command line

```sh
npx surjection check --config surjection.config.json --out-json a11y.json
npx surjection-report --results a11y.json --brand brand.json --client "Muster AG" --locale de --out report.pdf
```

| Option | Meaning |
|---|---|
| `--results` | Output of `surjection check --out-json` |
| `--brand` | Branding file, see below |
| `--client` | Client name (default: the project name in the results) |
| `--client-url` | Client website |
| `--checklist` | Checklist file from `surjection-checklist` |
| `--history-dir` | History folder from `surjection-history`, for trend and comparison |
| `--locale` | `de`, `de-CH`, `fr`, `it` or `en` (default) |
| `--standard` | Text for the target standard (default: WCAG 2.2 AA) |
| `--out` | `.html` or `.pdf` |

## Branding

```json title="brand.json"
{
  "agency": "Pixel & Co",
  "logo": "https://pixel.example/logo.png",
  "color": "#0055aa",
  "website": "https://pixel.example",
  "email": "hello@pixel.example",
  "phone": "+41 44 000 00 00"
}
```

The logo can be a URL or a `data:` URL. A light brand colour is darkened automatically until text on it reaches a contrast of 4.5:1.

## PDF

PDF output uses Playwright with Chromium:

```sh
npm i -D playwright
npx playwright install chromium
```

## API

```ts
import { renderPdf, renderReport } from "@weber-development/surjection-report";

const html = renderReport({
  results,
  branding,
  client: { name: "Muster AG" },
  locale: "de",
  checklist,
  history,
});
const pdf = await renderPdf(html, { footer: "Pixel & Co" });
```
