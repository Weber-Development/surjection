import type { Page } from "@playwright/test";
import type { StateConfig, Step } from "./config";

const TIMEOUT = 5000;

export function describeStep(step: Step): string {
  const [kind, value] = Object.entries(step)[0] ?? ["?", ""];
  return `${kind} ${Array.isArray(value) ? value[0] : value}`;
}

/** Runs the steps of a state in order. A step that fails throws with the step and state named. */
export async function runSteps(page: Page, state: StateConfig): Promise<void> {
  for (const step of state.steps) {
    try {
      if ("click" in step) await page.click(step.click, { timeout: TIMEOUT });
      else if ("hover" in step) await page.hover(step.hover, { timeout: TIMEOUT });
      else if ("fill" in step) await page.fill(step.fill[0], step.fill[1], { timeout: TIMEOUT });
      else if ("press" in step) await page.keyboard.press(step.press);
      else if ("waitFor" in step) await page.waitForSelector(step.waitFor, { timeout: TIMEOUT });
      else if ("wait" in step) await page.waitForTimeout(Math.min(step.wait, 10000));
      else throw new Error("unknown step");
    } catch (error) {
      const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
      throw new Error(`State "${state.name}", step "${describeStep(step)}" failed: ${reason}`);
    }
  }
}
