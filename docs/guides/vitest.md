---
title: Vitest
description: Check React components and other DOM output in unit tests.
---

```ts title="vitest.setup.ts"
import "@sweberdev/surjection/vitest";
```

```ts title="vitest.config.ts"
export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
});
```

```tsx title="SaveButton.test.tsx"
import { render } from "@testing-library/react";

it("is accessible", async () => {
  const { container } = render(<SaveButton />);
  await expect(container).toBeAccessible();
});
```

The matcher switches off page-level rules (landmarks, a main heading) that make no sense for a single component. It accepts the same options as [Playwright](playwright.md).

jsdom does not render CSS, so colour contrast cannot be checked here. Cover it with the Playwright helper or the CLI.
