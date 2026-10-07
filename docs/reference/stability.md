---
title: Stability and versioning
description: What Surjection promises to keep working, and what can still change.
---

From version 1.0.0 Surjection follows [semantic versioning](https://semver.org). Within 1.x nothing listed below is removed or changes its meaning. Breaking changes wait for 2.0.0 and come with a migration guide.

## What is stable

- The exports listed on the [API page](api.md) of `@sweberdev/surjection`, `/playwright`, `/vitest` and `/node`, with their options.
- Every command line option documented in the [CLI guide](../guides/cli.md), the `init` and `statement` commands, and exit codes: 0 for no failing issues, 1 for failing issues, 2 for an error such as an unreachable page.
- The fields of `surjection.config.json`, as described in the [config reference](config.md) and in the JSON schema.
- The format of the results file written by `--out-json` (`version: 1`), the baseline file and the checklist file. New fields may appear, existing ones keep their meaning. Readers should ignore fields they do not know.
- The rule ids of Surjection's own checks (`surjection-focus-trap`, `surjection-focus-visible`, `surjection-focus-order`, `surjection-reflow`, `surjection-text-spacing`) and the fingerprint format of the baseline.

## What can change in any release

- Anything that is exported but not documented, for example helper functions.
- Which problems the checks find. axe-core is updated regularly and finds more, so a new minor version can report issues on a site that was clean before. Use a baseline and pin the version in CI if you need identical results.
- Texts of reports, statements and the checklist, including translations.
- The look of reports, badges and dashboards.
- Heuristics of our own checks, for example the 200 px threshold of the focus order, if a better rule is found. Such changes are noted in the changelog.

## Versions of Surjection Pro

The Pro packages `surjection-report`, `surjection-history` and `surjection-checklist` are released together with the same version numbers and follow the same rules. They read the results file of any compatible free version.

## Support policy

Bugs are fixed in the latest minor version. When 1.x has a security problem it is fixed in the latest 1.x release.

Automated tests find only part of all barriers. A passing run is no proof of conformance.
