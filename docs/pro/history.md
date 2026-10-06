---
title: History
description: Track accessibility results across client projects and runs.
---

`@weber-development/surjection-history` keeps every run per project and shows what changed.

```sh
npx surjection check --config surjection.config.json --out-json a11y.json
npx surjection-history record --results a11y.json --dir .surjection-history
npx surjection-history dashboard --dir .surjection-history --locale de --out dashboard.html
npx surjection-history badge --project "Muster AG" --locale de --out badge.svg
```

## record

Stores the run as `<dir>/<project>/<timestamp>.json` and prints which elements were fixed and which are new since the previous run of the same project. The project name comes from the results (`project` in `surjection.config.json`) or from `--project`.

```text
Recorded .surjection-history/muster-ag/2026-10-05T08-00-00-000Z.json
Fixed: 4  New: 1  Unchanged: 12
  + /kontakt|color-contrast|.footer a
```

Elements are matched by page path, rule and selector (the same fingerprint as the [baseline](../guides/baseline.md)), so a fixed issue and a new one with the same rule are told apart.

## dashboard

Writes one accessible HTML page with a row per project: latest status, change since the previous run and a trend line. Locales: `de`, `de-CH`, `fr`, `it`, `en`.

Keep the history folder in a private repository or a shared drive. In CI, record after each check and publish the dashboard as a build artefact.

## badge

Writes a status badge as SVG: the open issues after the latest run, red for critical or serious, orange for moderate, dark yellow for minor and green when nothing was found. The badge has a text alternative and white text with at least 4.5:1 contrast.

```sh
npx surjection-history badge --project "Muster AG" --locale de --out badge.svg
npx surjection-history badge --out-dir badges   # one <project-slug>.svg per project
```

Put it in a README, the client portal or a status page. Publish the badges after each recorded run, for example as part of the same CI job. In code: `renderBadge(projectStatus(slug, runs), "de")`.

## API

```ts
import { compareRuns, loadProject, projectStatus, renderDashboard } from "@weber-development/surjection-history";

const runs = loadProject(".surjection-history", "Muster AG");
const diff = compareRuns(runs.at(-2)?.results, runs.at(-1)!.results);
```
