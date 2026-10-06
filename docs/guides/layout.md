---
title: Layout checks
description: Reflow at 320 pixels and text spacing, two criteria axe-core cannot test.
---

Two WCAG criteria depend on a changed window or changed styles, so axe-core cannot decide them. `--layout` tests both and reports them like all other findings.

```sh
npx surjection check --base-url https://preview.example.ch / /shop --layout
```

In a config file: `"layout": true`. In Playwright tests: `expectAccessible(page, { layout: true })`, or call `checkLayout(page)` from `@sweberdev/surjection/playwright`. The page is changed during the check and restored afterwards.

## Reflow

Rule `surjection-reflow`, WCAG 1.4.10 (AA), EN 301 549 9.1.4.10, impact serious.

The window is set to 320 CSS pixels, which is a 1280 pixel window at 400 % zoom. The page must not need sideways scrolling. Surjection lists the elements that reach beyond the right edge, the cause and not every child of it. Content that scrolls inside its own box, such as a wide table in a container with `overflow-x: auto`, is allowed by the criterion and not reported. Fixed elements are ignored.

Typical fixes are fixed pixel widths on containers, images and embeds without `max-width: 100%`, and long unbreakable strings such as URLs (`overflow-wrap: anywhere`).

## Text spacing

Rule `surjection-text-spacing`, WCAG 1.4.12 (AA), EN 301 549 9.1.4.12, impact serious.

Surjection applies the values of the criterion: line height 1.5, letter spacing 0.12 em, word spacing 0.16 em and paragraph spacing 2 em. Elements that cut off text with the new spacing but did not before are reported. Fixed heights combined with `overflow: hidden` on buttons, cards and menu items are the usual cause: use `min-height` instead.

## Limits

Two-dimensional content such as maps, data tables, diagrams and toolbars may scroll in two directions. If such content makes the page fail, exclude it with `--exclude` and test it by hand.
