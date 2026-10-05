---
title: Why Surjection
description: What Surjection does, what it deliberately does not do, and where automated testing ends.
---

Since June 2025 the European Accessibility Act applies to many online shops and digital services, in Germany through the Barrierefreiheitsstärkungsgesetz (BFSG). Agencies have to build accessible sites and show what they did. A one-off scan before launch does not help much: the next release can break it again.

Surjection makes accessibility part of the normal workflow:

- **Checks in development and CI.** Playwright, Vitest and a CLI on top of [axe-core](https://github.com/dequelabs/axe-core), the most widely used accessibility engine.
- **Findings you can act on.** Each one names the affected elements, the WCAG 2.2 success criterion and the EN 301 549 clause, in German, Swiss German, French, Italian or English.
- **A baseline.** Existing problems on a site you took over do not block every build. New ones do.
- **Documentation.** A Markdown report for pull requests, a JSON file for further processing, and a generator for the accessibility statement.
- **Accessible building blocks for React.** Skip link, visually hidden text, live announcements and reduced motion.

## No overlay

Overlay widgets put a toolbar on top of a site and leave the code unchanged. They do not fix missing labels, broken focus order or unclear structure, and many people who rely on assistive technology find them in the way. Surjection works the other way round: it shows developers what to fix in the code.

## Limits of automated testing

Automated tests detect only part of all barriers. They cannot judge whether alternative text is meaningful, whether the focus order makes sense or whether a video has correct captions. Surjection therefore lists rules it could not decide as "needs manual review", and [Surjection Pro](pro/overview.md) adds a guided checklist for the criteria that need a person.

A passing run is not proof of conformance with WCAG, EN 301 549, the BFSG or any other law. See [Legal notes](legal.md).

## Packages

| Package | License | Content |
|---|---|---|
| `@sweberdev/surjection` | MIT | Checks, CLI, baseline, reports, statement generator |
| `@sweberdev/surjection-react` | MIT | Accessible React building blocks |
| `@weber-development/surjection-*` | Commercial | [Surjection Pro](pro/overview.md): branded client reports, history across projects, manual checklist |
