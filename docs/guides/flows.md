---
title: Flows
description: Check a multi-step journey such as a checkout, with a check after each step.
---

Accessibility problems often sit in the middle of a journey: the second step of a checkout, the confirmation after sending a form. With `flows` you describe the journey once and decide after which steps the page is checked.

```json
{
  "baseUrl": "https://preview.example.ch",
  "flows": [
    {
      "name": "checkout",
      "url": "/warenkorb",
      "steps": [
        { "check": "cart" },
        { "click": "#to-address" },
        { "waitFor": "#address-form" },
        { "check": "address" },
        { "fill": ["#email", "no-address"] },
        { "click": "button[type=submit]" },
        { "check": "address-error" }
      ]
    }
  ]
}
```

The flow loads its `url` (default: the first URL) and runs the steps in order. At each `{ "check": "<label>" }` it runs all checks on the page as it is at that moment, including [keyboard and layout](keyboard.md) if enabled. In reports every check is its own page: `https://preview.example.ch/warenkorb#flow:checkout:address`.

- Steps are the same as for [states](states.md): `click`, `hover`, `fill`, `press`, `waitFor` and `wait`.
- A flow without a `check` step is checked once at the end, labelled `end`.
- Labels and flow names contain no spaces or `#`.
- If a step fails, the run stops with the flow and step named, for example `Flow "checkout", step "click #to-address" failed: ...`.
- The [baseline](baseline.md) keeps every check of a flow apart, so you can accept the findings of one step and keep failing on the others.

A flow follows one path. It does not click through all alternatives; for that write Playwright tests and call `expectAccessible(page)` where you want to check. Flows can be combined with `urls` and `states` in the same config.
