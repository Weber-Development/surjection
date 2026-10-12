---
title: Testing components
description: Check single components in Storybook, Testing Library or any test with a DOM.
---

`@sweberdev/surjection/component` checks one component instead of a whole page. It runs in the browser, in jsdom and in happy-dom, and needs no Playwright. Rules about whole pages (landmarks, a single `h1`) are switched off.

## Storybook

Use it in a `play` function, so every story is checked when the story runs in the test runner or in the interactions panel:

```ts
import { expectAccessibleComponent } from "@sweberdev/surjection/component";

export const Primary = {
  play: async ({ canvasElement, id }) => {
    await expectAccessibleComponent(canvasElement, { name: id });
  },
};
```

To check a state, put the interaction before the check, for example `await userEvent.click(...)`, then call `expectAccessibleComponent`.

## Testing Library

```ts
import { render } from "@testing-library/react";
import { expectAccessibleComponent } from "@sweberdev/surjection/component";

it("dialog is accessible", async () => {
  const { container } = render(<Dialog open />);
  await expectAccessibleComponent(container, { failOn: "serious", name: "dialog" });
});
```

`expectAccessibleComponent(element, options)` takes the same options as the [page check](../reference/config.md) (`standard`, `disableRules`, `locale`, `failOn`, `baseline`) plus `name`, which is shown in the failure message as `component:<name>`. `checkComponent` returns the result without throwing, for example to write it to a report.

## Limits

jsdom has no layout engine, so colour contrast and target size cannot be decided there; axe-core skips them or reports them as "needs review". Run the same stories in a real browser (Storybook test runner) to include them. Keyboard and reflow checks need a page and stay in [`surjection check`](cli.md).
