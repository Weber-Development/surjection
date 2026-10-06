---
title: States and click steps
description: Check menus, dialogs and forms in their opened state with a few click steps.
---

A page that is only checked after loading misses everything behind a click: the open menu, the cookie dialog, the form with an error message. With `states` you describe how to get there, and Surjection checks the page again in each state.

```json
{
  "baseUrl": "https://preview.example.ch",
  "urls": ["/"],
  "states": [
    {
      "name": "menu-open",
      "url": "/",
      "steps": [{ "click": "#menu" }, { "waitFor": "#panel" }]
    },
    {
      "name": "contact-error",
      "url": "/kontakt",
      "steps": [{ "fill": ["#email", "no-address"] }, { "click": "button[type=submit]" }]
    }
  ]
}
```

Each state loads its `url` (default: the first URL), runs the steps in order and then runs all checks, including [keyboard and layout](keyboard.md) if enabled. In reports the state appears as its own page, `https://preview.example.ch/#state:menu-open`, and the [baseline](baseline.md) keeps it apart from the plain page. You can use `states` without `urls`.

## Steps

| Step | Meaning |
|---|---|
| `{ "click": "<selector>" }` | Click an element |
| `{ "hover": "<selector>" }` | Move the mouse over an element |
| `{ "fill": ["<selector>", "<text>"] }` | Type into a field |
| `{ "press": "<key>" }` | Press a key, e.g. `Enter` or `Escape` |
| `{ "waitFor": "<selector>" }` | Wait until an element appears |
| `{ "wait": 500 }` | Wait in milliseconds (at most 10000) |

Every step waits up to five seconds. If one fails, the check stops with the state and step named, for example `State "menu-open", step "click #menu" failed: ...`, so a changed page is not mistaken for an accessible one.

For anything more complicated use Playwright: navigate in your test and call `expectAccessible(page)` at the point you want to check.
