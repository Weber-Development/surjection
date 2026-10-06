---
title: CLI
description: Check a whole site from the command line.
---

```sh
npx surjection check [urls...] [options]
npx surjection statement --config statement.json --out erklaerung.md
npx surjection init --base-url https://example.ch --sitemap
```

## Start a project

`surjection init` writes a `surjection.config.json` and a GitHub Actions workflow (`.github/workflows/accessibility.yml`) that checks every pull request and runs once a week. Existing files are never overwritten. `--no-workflow` skips the workflow, `--project` sets the project name.

## Which pages

Pass absolute URLs, paths with `--base-url`, or a sitemap:

```sh
npx surjection check --base-url https://preview.example.ch / /shop /kontakt
npx surjection check --sitemap https://example.ch/sitemap.xml --max-pages 100
```

Sitemap indexes are followed one level deep. `--max-pages` (default 50) keeps large shops manageable.

## Options

| Option | Default | Meaning |
|---|---|---|
| `--config <file>` | `surjection.config.json` if present | Read options from a file, see [Configuration](../reference/config.md) |
| `--standard <id>` | `wcag22aa` | `wcag2a`, `wcag2aa`, `wcag21aa` or `wcag22aa` |
| `--fail-on <impact>` | `minor` | Lowest impact that fails the run: `minor`, `moderate`, `serious`, `critical` |
| `--locale <locale>` | `en` | Language of messages and reports: `de`, `de-CH`, `fr`, `it`, `en` |
| `--exclude <selector>` | | Skip elements you do not control, e.g. a third-party chat widget. Repeatable |
| `--baseline <file>` | `surjection-baseline.json` | Accepted findings, see [Baseline](baseline.md) |
| `--update-baseline` | | Write all current findings into the baseline and exit with `0` |
| `--best-practice` | | Also run axe-core rules that are not WCAG criteria |
| `--out-md <file>` | | Markdown report |
| `--out-json <file>` | | All results as JSON, input for [Surjection Pro](../pro/overview.md) |
| `--out-junit <file>` | | JUnit XML: one test suite per page, one failed test per rule. GitLab, Azure DevOps and Jenkins show it as test results |
| `--viewport <size>` | `desktop` | `desktop` (1280×800), `mobile` (390×844, touch) or `<width>x<height>`, e.g. to catch issues in the mobile menu |
| `--keyboard` | | Also press Tab through each page to find focus traps and missing focus indicators, see [Keyboard and login](keyboard.md) |
| `--storage-state <file>` | | Playwright storage state, to check pages behind a login |
| `--project <name>` | | Project name in reports |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | No failing issues |
| `1` | Issues remain after baseline and `--fail-on` |
| `2` | Usage or runtime error, e.g. Playwright missing |

## Browser

The CLI starts Chromium through Playwright. Set `SURJECTION_CHROMIUM_PATH` to use a browser that is already installed.
