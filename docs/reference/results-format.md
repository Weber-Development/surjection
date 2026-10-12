---
title: Results format
description: The results and baseline files, version 2, and how to convert version 1.
---

`surjection check --out-json results.json` writes all results. Surjection Pro reads this file for reports, history and the checklist.

```json
{
  "version": 2,
  "project": "Muster AG",
  "createdAt": "2026-10-12T14:30:00.000Z",
  "tool": { "name": "surjection", "version": "2.0.0" },
  "run": {
    "standard": "wcag22aa",
    "viewport": "desktop",
    "keyboard": true,
    "layout": false,
    "startedAt": "2026-10-12T14:29:10.000Z",
    "finishedAt": "2026-10-12T14:30:00.000Z"
  },
  "pages": [
    {
      "url": "https://example.ch/shop",
      "title": "Shop",
      "testedAt": "2026-10-12T14:29:30.000Z",
      "passedRules": 61,
      "incomplete": [],
      "findings": [
        {
          "rule": "image-alt",
          "impact": "critical",
          "criteria": [{ "id": "1.1.1", "level": "A", "en301549": "9.1.1.1" }],
          "nodes": [{ "id": "3f2a9c01b7de", "target": "#hero", "html": "<img ...>", "summary": "..." }]
        }
      ]
    }
  ]
}
```

(Shortened; see the [API](api.md) for all fields.)

## What is new in version 2

- **`id` per element.** A finding keeps the same `id` in every run, on localhost, preview and production alike. It is the first 12 hex characters of a hash of page path, rule and selector. History and the baseline use it to tell a new finding from a known one.
- **`tool`** records which version wrote the file, **`run`** how the check was configured (standard, viewport, locale, keyboard, layout, colour scheme, motion, start and end).
- Pages of [states](../guides/states.md) and [flows](../guides/flows.md) carry `#state:` and `#flow:` in `url` and are different pages for the id.

Existing fields keep their meaning. Readers should ignore fields they do not know.

## Baseline

The baseline is `{ "version": 2, "createdAt": "...", "entries": [{ "id", "page", "rule", "target", "note?" }] }`, see [Baseline](../guides/baseline.md).

## Reading version 1

Surjection 2 reads files of version 1 and treats them like version 2 (the ids are computed on reading), so `--compare-with` and baselines from 1.x keep working. Other programs, including Surjection Pro before 1.0.1, need version 2 support or a converted file:

```sh
npx surjection convert results-v1.json --out results.json
npx surjection convert surjection-baseline.json --out surjection-baseline.json
```

`convert` recognises results and baselines by their content. It fails with a clear message for files of a newer version than it knows.
