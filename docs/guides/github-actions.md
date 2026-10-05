---
title: GitHub Actions
description: Check every pull request and show the report in the job summary.
---

The CLI adds its Markdown report to the job summary when it runs in GitHub Actions. `npx surjection init` writes a ready workflow and config file for you. This workflow checks a preview deployment on every pull request:

```yaml title=".github/workflows/accessibility.yml"
name: Accessibility

on: pull_request

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx surjection check --config surjection.config.json --out-json a11y.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessibility
          path: a11y.json
```

```json title="surjection.config.json"
{
  "baseUrl": "https://preview.example.ch",
  "urls": ["/", "/shop", "/checkout", "/kontakt"],
  "failOn": "serious",
  "locale": "de-CH",
  "project": "Muster AG"
}
```

To check the app built in the same job, start it in the background first, e.g. `npm run build && npm start &`, and point `baseUrl` at `http://localhost:3000`.

Commit `surjection-baseline.json` next to the config when you use a [baseline](baseline.md).

## GitLab, Azure DevOps, Jenkins

`--out-junit a11y.xml` writes a JUnit report that these systems show as test results, one failed test per rule and page. In GitLab:

```yaml title=".gitlab-ci.yml"
accessibility:
  image: mcr.microsoft.com/playwright:v1.56.0-noble
  script:
    - npx -y @sweberdev/surjection check --config surjection.config.json --out-junit a11y.xml
  artifacts:
    when: always
    reports:
      junit: a11y.xml
```
