import type { Page } from "@playwright/test";
import type { FlowConfig, FlowStep, StateConfig, Step } from "./config";

const TIMEOUT = 5000;

/** Label used when a flow has no `check` step: it is checked after the last step. */
export const FLOW_END = "end";

export function describeStep(step: FlowStep): string {
  const [kind, value] = Object.entries(step)[0] ?? ["?", ""];
  return `${kind} ${Array.isArray(value) ? value[0] : value}`;
}

async function perform(page: Page, step: Step): Promise<void> {
  if ("click" in step) await page.click(step.click, { timeout: TIMEOUT });
  else if ("hover" in step) await page.hover(step.hover, { timeout: TIMEOUT });
  else if ("fill" in step) await page.fill(step.fill[0], step.fill[1], { timeout: TIMEOUT });
  else if ("press" in step) await page.keyboard.press(step.press);
  else if ("waitFor" in step) await page.waitForSelector(step.waitFor, { timeout: TIMEOUT });
  else if ("wait" in step) await page.waitForTimeout(Math.min(step.wait, 10000));
  else throw new Error("unknown step");
}

async function run(
  page: Page,
  kind: string,
  name: string,
  steps: FlowStep[],
  onCheck?: (label: string) => Promise<void>,
): Promise<void> {
  for (const step of steps) {
    if ("check" in step) {
      await onCheck?.(step.check);
      continue;
    }
    try {
      await perform(page, step);
    } catch (error) {
      const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
      throw new Error(`${kind} "${name}", step "${describeStep(step)}" failed: ${reason}`);
    }
  }
}

/** Runs the steps of a state in order. A step that fails throws with the step and state named. */
export async function runSteps(page: Page, state: StateConfig): Promise<void> {
  await run(page, "State", state.name, state.steps);
}

/**
 * Runs a flow and calls `onCheck` at every `check` step, or once at the end when the flow has
 * none. A step that fails throws with the step and flow named.
 */
export async function runFlow(
  page: Page,
  flow: FlowConfig,
  onCheck: (label: string) => Promise<void>,
): Promise<void> {
  await run(page, "Flow", flow.name, flow.steps, onCheck);
  if (!flow.steps.some((step) => "check" in step)) await onCheck(FLOW_END);
}
