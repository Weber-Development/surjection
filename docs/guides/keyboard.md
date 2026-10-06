---
title: Keyboard and login
description: Find focus traps and missing focus indicators, and check pages behind a login.
---

axe-core looks at the page as it is. Two common barriers only show up when someone actually uses the keyboard, so Surjection can also press Tab through each page.

```sh
npx surjection check --base-url https://preview.example.ch / /shop --keyboard
```

In a config file: `"keyboard": true`. In Playwright tests: `expectAccessible(page, { keyboard: true })`, or call `checkKeyboard(page)` from `@sweberdev/surjection/playwright` on its own.

The keyboard findings work like all others: they appear in every report, count for `--fail-on` and can be accepted in the [baseline](baseline.md).

## Focus trap

Rule `surjection-focus-trap`, WCAG 2.1.2 (A), EN 301 549 9.2.1.2, impact critical.

Surjection presses Tab up to the number of focusable elements plus ten. If focus keeps cycling through the same few elements and never reaches the rest of the page, that is a trap. Typical causes are dialogs that hold focus after they should have closed, embedded players and chat widgets. The finding lists the elements of the cycle.

A dialog that is open on purpose may hold focus as long as Escape closes it. Check such a case by hand and accept it in the baseline.

## Focus visible

Rule `surjection-focus-visible`, WCAG 2.4.7 (AA), EN 301 549 9.2.4.7, impact serious.

For every element that receives focus, Surjection compares outline, shadow, border, background, text colour and underline with and without focus. If nothing changes, keyboard users cannot see where they are. Usually `outline: none` without a replacement is the cause:

```css
a:focus-visible,
button:focus-visible {
  outline: 3px solid #0b6e4f;
  outline-offset: 2px;
}
```

A change elsewhere, for example on a parent element, is not detected and leads to a false positive. Accept it in the baseline after checking it by hand.

## Focus order

Rule `surjection-focus-order`, WCAG 2.4.3 (A), EN 301 549 9.2.4.3, impact moderate.

While pressing Tab, Surjection notes where each focused element sits. If focus jumps up by more than 200 px, for example because of positive `tabindex` values or content moved with CSS, the finding lists the affected elements (at most ten). Fixed and sticky elements such as headers are ignored. A sensible order is more than this rule can judge, so treat the finding as a pointer: remove positive `tabindex` values and keep the DOM order the same as the visual order.

## Pages behind a login

Save a logged-in session once with Playwright and pass it to the check:

```sh
npx playwright codegen --save-storage=auth.json https://preview.example.ch/login
npx surjection check --storage-state auth.json /konto /bestellungen
```

`auth.json` holds session cookies. Keep it out of the repository; in CI create it in a setup step or store it as a secret. In a config file: `"storageState": "auth.json"`.

## Limits

The keyboard check covers traps and visible focus. Whether the focus order really makes sense, whether all functions work with the keyboard and whether shortcuts can be turned off still needs a manual test, see the Pro checklist.
