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
npx surjection-report --results a11y.json --locale de --out massnahmen.csv
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
| `--out` | `.html`, `.pdf`, `.docx` or `.csv` |

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

## Screenshots as evidence

Run the check with `--screenshots` and the report shows a picture of every affected element next to its selector, so the client sees the problem instead of reading about it. The report stays one self-contained file.

```sh
npx surjection check --config surjection.config.json --out-json a11y.json --screenshots a11y-shots
npx surjection-report --results a11y.json --brand brand.json --locale de --out report.pdf
```

The paths in `a11y.json` are resolved relative to the results file or the working directory. Elements inside iframes or shadow DOM and invisible elements get no picture.

## Fixed since the last report (before and after)

Show the client what you fixed. Keep the results of the last run and pass them to the next one:

```sh
npx surjection check --config surjection.config.json --screenshots a11y-shots \
  --compare-with last-a11y.json --out-json a11y.json
npx surjection-report --results a11y.json --brand brand.json --client "Muster AG" --out report.pdf
```

Surjection copies the old screenshots aside before the run, takes new ones of the same elements and records each issue that is gone as `fixed`. The report gets the section "Fixed since the last report" with the image before and after for every item, in HTML, PDF and Word. An element that was removed from the page is listed without an after image. Many fixes are invisible (alt text, labels, `lang`): there both images look the same, and the list is the evidence. Contrast, size and layout fixes show best. Pages are matched by path, so a preview and the live site can be compared.

## Word (DOCX)

With `--out report.docx` you get the same content as an editable Word document, for clients who want to adjust texts or forward the report inside their organisation. The file uses real headings, table header rows, the document language and alt text for every element screenshot, so it is accessible itself. It needs no Playwright. In code: `await renderDocx({ results, branding, client })`.

## Fix list (CSV)

With `--out massnahmen.csv` you get a fix list instead of a report: one row per affected element with page, rule, impact, WCAG and EN 301 549 criteria, selector and what to do, plus empty Status and Note columns for the team that fixes it. The file uses `;` and a BOM, so Excel opens it directly with umlauts intact. Only `--results` and `--locale` are needed. In code: `toFixListCsv(results, { locale: "de-CH" })`.

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
