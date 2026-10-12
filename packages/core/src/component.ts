import type { ElementContext } from "axe-core";
import { type AssertOptions, failingResult, failureMessage } from "./assert";
import { checkDocument } from "./run";
import type { CheckOptions, PageResult } from "./types";

/** Rules about a whole page; they make no sense for a single component. */
export const PAGE_LEVEL_RULES = ["region", "landmark-one-main", "page-has-heading-one"];

export interface ComponentCheckOptions extends CheckOptions {
  /** Name shown in the result and in failure messages, e.g. the story id. Default: "component". */
  name?: string;
}

/**
 * Checks one component (an element, a selector or a container) in the current document: in a
 * Storybook play function, a Testing Library test or any browser-like environment.
 * Page-level rules are switched off.
 */
export async function checkComponent(
  element: ElementContext,
  options: ComponentCheckOptions = {},
): Promise<PageResult> {
  const { name, ...rest } = options;
  const result = await checkDocument(element, {
    ...rest,
    disableRules: [...PAGE_LEVEL_RULES, ...(options.disableRules ?? [])],
  });
  return { ...result, url: `component:${name ?? "component"}` };
}

/**
 * Fails when the component has accessibility issues (after baseline and threshold).
 *
 * @example
 * // Storybook play function
 * play: async ({ canvasElement, id }) => {
 *   await expectAccessibleComponent(canvasElement, { name: id });
 * }
 */
export async function expectAccessibleComponent(
  element: ElementContext,
  options: ComponentCheckOptions & AssertOptions = {},
): Promise<PageResult> {
  const result = await checkComponent(element, options);
  const failing = failingResult(result, options);
  if (failing.findings.length > 0) throw new Error(failureMessage(failing, options));
  return result;
}
