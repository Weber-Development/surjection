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

The page has a search field, a filter for projects that got worse since the last check and a sort order (name, most issues, biggest increase). The controls need JavaScript and are hidden without it; the table is complete either way.

Keep the history folder in a private repository or a shared drive. In CI, record after each check and publish the dashboard as a build artefact.

## badge

Writes a status badge as SVG: the open issues after the latest run, red for critical or serious, orange for moderate, dark yellow for minor and green when nothing was found. The badge has a text alternative and white text with at least 4.5:1 contrast.

```sh
npx surjection-history badge --project "Muster AG" --locale de --out badge.svg
npx surjection-history badge --out-dir badges   # one <project-slug>.svg per project
```

Put it in a README, the client portal or a status page. Publish the badges after each recorded run, for example as part of the same CI job. In code: `renderBadge(projectStatus(slug, runs), "de")`.

## regressions

Compares the latest run of a project with the previous one and lists what got worse. The exit code is `1` when new issues at or above `--fail-on` (default `minor`) appeared, so a scheduled job can alert you.

```sh
npx surjection-history regressions --fail-on serious --locale de --out-md monitoring.md
```

Without `--project` all projects are checked. In GitHub Actions the Markdown is added to the job summary. This workflow checks a client site every night, records the run and fails (GitHub then sends the failure mail to the repository watchers) when a new serious issue appears:

```yaml title=".github/workflows/monitoring.yml"
name: Accessibility monitoring
on:
  schedule: [{ cron: "17 3 * * *" }]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://npm.pkg.github.com
          scope: "@weber-development"
      - run: npm i -g @sweberdev/surjection @weber-development/surjection-history @playwright/test
        env:
          NODE_AUTH_TOKEN: ${{ secrets.SURJECTION_PRO_TOKEN }}
      - run: npx playwright install --with-deps chromium
      - run: surjection check --config surjection.config.json --out-json a11y.json --baseline none.json || true
      - run: surjection-history record --results a11y.json
      - run: |
          git config user.name "a11y-monitor" && git config user.email "monitor@users.noreply.github.com"
          git add .surjection-history && git commit -m "Record accessibility run" && git push
      - run: surjection-history regressions --fail-on serious --out-md monitoring.md
```

### Notify by chat or mail

```sh
npx surjection-history regressions --fail-on serious \
  --webhook "$MONITORING_WEBHOOK" \
  --mail-to team@agency.ch --mail-from monitoring@agency.ch
```

`--webhook` posts a short message with the new issues as JSON (`{"text": …, "content": …}`), which Slack, Mattermost, Discord and Microsoft Teams workflows accept. `--mail-to` sends the same message by SMTP; set `SURJECTION_SMTP_URL` (for example `smtps://user:password@mail.agency.ch:465`). Both are only used when something got worse at or above `--fail-on`, so a quiet week sends nothing. Webhook URL and SMTP URL are secrets: keep them in your CI secrets, never in the repository. The webhook must use https. The exit code stays 1 when issues got worse, so the job still fails.

In code: `notificationText(reports)`, `sendWebhook(url, text)` and `sendMail({ … })`.

## API

```ts
import { compareRuns, loadProject, projectStatus, renderDashboard } from "@weber-development/surjection-history";

const runs = loadProject(".surjection-history", "Muster AG");
const diff = compareRuns(runs.at(-2)?.results, runs.at(-1)!.results);
```
