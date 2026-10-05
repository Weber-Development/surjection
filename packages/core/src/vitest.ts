import type { ElementContext } from "axe-core";
import { expect } from "vitest";
import { type AssertOptions, failingResult, failureMessage } from "./assert";
import { checkDocument } from "./run";
import type { CheckOptions } from "./types";

export type MatcherOptions = CheckOptions & AssertOptions;

export const matchers = {
  async toBeAccessible(received: ElementContext, options: MatcherOptions = {}) {
    // Page-level rules make no sense for an isolated component.
    const disableRules = [
      "region",
      "landmark-one-main",
      "page-has-heading-one",
      ...(options.disableRules ?? []),
    ];
    const result = await checkDocument(received, { ...options, disableRules });
    const failing = failingResult(result, options);
    return {
      pass: failing.findings.length === 0,
      message: () =>
        failing.findings.length === 0
          ? "Expected accessibility issues, found none."
          : failureMessage(failing, options),
    };
  },
};

expect.extend(matchers);

// Typed against Vitest 5. The matcher itself works with older versions too.
declare module "vitest" {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toBeAccessible(options?: MatcherOptions): Promise<void>;
  }
}
