import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const { version } = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/node.ts",
    "src/bin.ts",
    "src/playwright.ts",
    "src/vitest.ts",
    "src/component.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  define: { __SURJECTION_VERSION__: JSON.stringify(version) },
  target: "es2021",
  external: ["@playwright/test", "vitest"],
  // Locale JSON must be inlined: Node refuses bare JSON imports without import attributes.
  noExternal: [/^axe-core\/locales\//],
});
