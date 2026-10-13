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

## Pull request comment (beta)

From Pro 2.1 `pr-comment` compares the results of a base (for example production) with the results of a pull request (its preview) and comments what is new, so reviewers see the effect of a change where they review it:

```sh
surjection check --base-url https://www.example.ch --out-json base.json
surjection check --base-url https://preview-123.example.ch --out-json head.json
surjection-history pr-comment --base base.json --head head.json --fail-on serious
```

The comment lists the new issues (impact, page, issue, element, what to fix), counts fixed and unchanged ones and ends with the reminder that automated tests find only part of all barriers. Issues are matched by page path, rule and element, so the host does not matter. There is one comment per pull request: every push updates it instead of adding another. The command exits with 1 when new issues reach `--fail-on`, so the job can block the merge; the comment is posted either way.

It reads `GITHUB_TOKEN`, `GITHUB_REPOSITORY` and the pull request number from the GitHub Actions environment (or `--repo` and `--pr`), and the workflow needs `pull-requests: write`. A pull request from a fork has no write token: the comment is then skipped with a note, and the result still appears in the job summary. `--dry-run` prints the Markdown without posting, `--out-md` writes it to a file, `--locale` picks German, Swiss German, French, Italian or English.

`surjection-history init-ci --pull-request` writes a ready workflow, `.github/workflows/accessibility-pr.yml`. You set the repository variables `A11Y_BASE_URL` and `A11Y_PREVIEW_URL` and the secret `SURJECTION_PRO_TOKEN` (the token with `read:packages` from your purchase). Adapt the step "Preview URL" if your host passes the preview address another way.

**Beta:** posting and updating the comment is verified against the GitHub API. The workflow file itself has not been run in a customer repository yet; check the first run and report problems.

## Scheduled monitoring (beta)

`regressions` already tells you what got worse since the previous run. Run on a schedule it needs one more thing: the history must survive between runs, because every CI job starts empty. `surjection-history init-ci --monitor` writes `.github/workflows/accessibility-monitor.yml`, which

1. restores the history from the branch `surjection-history` (created on the first run),
2. checks the site and records the run,
3. compares it with the previous run and notifies by webhook (Slack, Teams, Discord) or mail only when something got worse at or above `serious`,
4. saves the history back to the branch and fails the job when something got worse.

Secrets: `SURJECTION_PRO_TOKEN` (required) and, to be notified, `A11Y_WEBHOOK`, or `A11Y_MAIL_TO`, `A11Y_MAIL_FROM` and `SURJECTION_SMTP_URL`. The config needs a `project` name, because the history is kept per project. The schedule is daily at 05:00 UTC; change the cron line. Scheduled workflows may start late and GitHub pauses them in repositories without activity for 60 days.

**Beta:** the steps were run against a local Git remote and the notifications use the tested [webhook and mail code](#notify-by-chat-or-mail), but the workflow has not run on a real schedule yet and delivery to a real Slack or mail account is not verified.

## Re-test

After a fix you do not need to check the whole site again. `retest` builds a config with only the pages, states and flows that had findings, and `merge` puts the new results into the earlier ones:

```sh
npx surjection-history retest --config surjection.config.json --results a11y.json \
  --out retest.config.json                      # --criteria 1.4.3,2.4.7 limits it to these criteria
npx surjection check --config retest.config.json --out-json retest.json
npx surjection-history merge --base a11y.json --update retest.json --out a11y.json
```

`merge` prints how many findings were fixed, remain or are new in the re-tested pages. Pages that were not re-tested stay as they were, with their old test date, so the merged file is a complete results file for [reports](report.md) and the [checklist](checklist.md). Pages that cannot be checked again from the config, for example a state you removed, are listed as skipped. `retest` exits with 1 when nothing needs a re-test; `merge` exits with 1 when new findings appeared.

A re-test is a shortcut for the time between full checks. A change in one place can break another page, so run the full check regularly (for example nightly or before a report).

## API

```ts
import { compareRuns, loadProject, projectStatus, renderDashboard } from "@weber-development/surjection-history";

const runs = loadProject(".surjection-history", "Muster AG");
const diff = compareRuns(runs.at(-2)?.results, runs.at(-1)!.results);
```
