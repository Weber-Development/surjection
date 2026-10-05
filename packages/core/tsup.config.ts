import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/playwright.ts", "src/vitest.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2021",
  external: ["@playwright/test", "vitest"],
  // Locale JSON must be inlined: Node refuses bare JSON imports without import attributes.
  noExternal: [/^axe-core\/locales\//],
});
