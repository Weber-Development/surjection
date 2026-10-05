import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Browser tests run in Node, not jsdom.
    environmentMatchGlobs: [["test/cli.test.ts", "node"]],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
