---
title: Accessibility statement
description: Generate the accessibility statement in German, Swiss German, French, Italian or English.
---

Many services covered by the European Accessibility Act have to explain how they meet the accessibility requirements, and most public bodies have to publish an accessibility statement. Surjection generates a structured statement as Markdown and HTML.

```ts
import { enforcementBodies, generateStatement } from "@sweberdev/surjection";

const { markdown, html } = generateStatement({
  locale: "de",
  organisation: "Muster GmbH",
  scope: "www.muster.de",
  serviceDescription: "Online-Shop für Haushaltswaren mit Kundenkonto und Bestellverlauf.",
  status: "partial",
  knownIssues: [
    {
      description: "Ältere PDF-Rechnungen sind nicht getaggt.",
      reason: "Auf Anfrage senden wir die Rechnung als barrierefreies Dokument.",
      plannedFix: "2027-03-31",
    },
  ],
  method: "self",
  preparedOn: "2026-10-05",
  contact: { email: "barrierefreiheit@muster.de", phone: "+49 30 123456" },
  enforcement: enforcementBodies.DE,
});
```

Or from the command line with the same data as JSON:

```sh
npx surjection statement --config statement.json --out erklaerung.html
```

The output extension decides the format: `.html` writes HTML, anything else Markdown.

## From the Pro checklist

If you work through the manual checklist of [Surjection Pro](../pro/checklist.md), the statement can be derived from it. Leave `status` out of `statement.json` and pass the checklist:

```sh
npx surjection statement --config statement.json --checklist checklist.json --out erklaerung.html
```

Status follows from the decisions (no failed criterion: `full`, some: `partial`, none passed: `none`), every failed criterion becomes a known issue with its note and planned fix date, and the date of the last test becomes `lastReviewedOn`. Known issues you list in `statement.json` stay and are not duplicated. While criteria are still untested the command stops with an error, because a statement must not claim more than was checked.

## Fields

| Field | Meaning |
|---|---|
| `locale` | `de`, `de-CH` (uses "ss" instead of "ß"), `fr`, `it`, `en` |
| `status` | `full`, `partial` or `none` |
| `standard` | Default `WCAG 2.2 AA / EN 301 549 V3.2.1` |
| `knownIssues` | What is not accessible, why, the alternative and the planned fix date |
| `method` | `self` or `third-party` (with `auditor`) |
| `contact` | Email, optional phone and postal address for feedback |
| `enforcement` | The authority people can turn to. Presets: `enforcementBodies.DE`, `enforcementBodies.AT` |

The text is a starting point, not legal advice. Check the requirements for your service and have the statement reviewed before you publish it. [Surjection Pro](../pro/checklist.md) fills `status` and `knownIssues` from your manual checklist.
