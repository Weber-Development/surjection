---
title: Stability and versioning
description: What Surjection promises to keep working, and what can still change.
---

Surjection follows [semantic versioning](https://semver.org). Within a major version nothing listed below is removed or changes its meaning. Breaking changes wait for the next major version and come with a migration guide; the one for 2.0 is [Migrating to 2.0](../guides/migrating-to-2.md).

## What is stable

- The exports listed on the [API page](api.md) of `@sweberdev/surjection`, `/playwright`, `/vitest` and `/node`, with their options.
- Every command line option documented in the [CLI guide](../guides/cli.md), the `init` and `statement` commands, and exit codes: 0 for no failing issues, 1 for failing issues, 2 for an error such as an unreachable page.
- The fields of `surjection.config.json`, as described in the [config reference](config.md) and in the JSON schema.
- The format of the results file written by `--out-json` (`version: 2`, see [Results format](results-format.md)), the baseline file and the checklist file. New fields may appear, existing ones keep their meaning. Readers should ignore fields they do not know.
- The rule ids of Surjection's own checks (`surjection-focus-trap`, `surjection-focus-visible`, `surjection-focus-order`, `surjection-reflow`, `surjection-text-spacing`) and the finding ids (`id` in results and baselines).

## What can change in any release

- Anything that is exported but not documented, for example helper functions.
- Which problems the checks find. axe-core is updated regularly and finds more, so a new minor version can report issues on a site that was clean before. Use a baseline and pin the version in CI if you need identical results.
- Texts of reports, statements and the checklist, including translations.
- The look of reports, badges and dashboards.
- Heuristics of our own checks, for example the 200 px threshold of the focus order, if a better rule is found. Such changes are noted in the changelog.

## Versions of Surjection Pro

The Pro packages `surjection-report`, `surjection-history` and `surjection-checklist` are released together with the same version numbers and follow the same rules. They read the results file of any compatible free version.

## Support policy

Bugs are fixed in the latest minor version of the current major version. Version 1.x gets security and bug fixes for 12 months after the release of 2.0.0, then it ends.

Automated tests find only part of all barriers. A passing run is no proof of conformance.
