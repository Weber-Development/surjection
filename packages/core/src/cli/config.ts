import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Impact, Locale } from "../types";

/**
 * One action before a state is checked. Exactly one key per step:
 * `{ "click": "#menu" }`, `{ "hover": "#nav" }`, `{ "fill": ["#email", "x"] }`,
 * `{ "press": "Escape" }`, `{ "waitFor": "#dialog" }` or `{ "wait": 500 }` (milliseconds).
 */
export type Step =
  | { click: string }
  | { hover: string }
  | { fill: [selector: string, value: string] }
  | { press: string }
  | { waitFor: string }
  | { wait: number };

/** A page in a certain state, e.g. with the menu open or with form errors. */
export interface StateConfig {
  /** Short name without spaces, shown in reports as "#state:<name>". */
  name: string;
  /** Page to open first. Default: the first of `urls`. */
  url?: string;
  steps: Step[];
}

/** Shape of surjection.config.json. Every field can also be given as a CLI flag. */
export interface SurjectionConfig {
  /** Absolute URLs, or paths resolved against baseUrl. */
  urls?: string[];
  baseUrl?: string;
  sitemap?: string;
  /** Cap for URLs taken from a sitemap. Default: 50. */
  maxPages?: number;
  standard?: "wcag2a" | "wcag2aa" | "wcag21aa" | "wcag22aa";
  bestPractice?: boolean;
  disableRules?: string[];
  /** CSS selectors to skip on every page, e.g. third-party widgets. */
  exclude?: string[];
  failOn?: Impact;
  locale?: Locale;
  /** Path of the baseline file. Default: surjection-baseline.json. */
  baseline?: string;
  /** Project name shown in reports. */
  project?: string;
  /** Window size: "desktop" (1280x800, default), "mobile" (390x844) or "<width>x<height>". */
  viewport?: string;
  /** Also press Tab through every page to find focus traps and missing focus indicators. */
  keyboard?: boolean;
  /** Emulate the colour scheme of the visitor, e.g. "dark" to check the dark theme. */
  colorScheme?: "light" | "dark";
  /** Emulate "reduce motion", to check pages that react to it. */
  reducedMotion?: boolean;
  /** Pages in other states: run the steps, then check like any other page. */
  states?: StateConfig[];
  /** Also check reflow at 320 px and text spacing. */
  layout?: boolean;
  /** Folder for screenshots of the affected elements, as evidence for reports. */
  screenshots?: string;
  /** Pages checked at the same time, 1 to 8. Default: 1. */
  concurrency?: number;
  /** Results of an earlier run (--out-json). Fixed issues get a before and after screenshot. */
  compareWith?: string;
  /** Playwright storage state (cookies, local storage) to check pages behind a login. */
  storageState?: string;
}

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
} as const;

/** Parses "mobile", "desktop" or "390x844". */
export function parseViewport(value: string | undefined): { width: number; height: number } {
  if (!value) return VIEWPORTS.desktop;
  if (value in VIEWPORTS) return VIEWPORTS[value as keyof typeof VIEWPORTS];
  const m = /^(\d{2,5})x(\d{2,5})$/.exec(value);
  if (!m) throw new Error(`Invalid viewport "${value}". Use desktop, mobile or <width>x<height>.`);
  return { width: Number(m[1]), height: Number(m[2]) };
}

export const DEFAULT_CONFIG_FILE = "surjection.config.json";

export function loadConfig(path: string | undefined, cwd = process.cwd()): SurjectionConfig {
  const file = resolve(cwd, path ?? DEFAULT_CONFIG_FILE);
  if (!existsSync(file)) {
    if (path) throw new Error(`Config file not found: ${file}`);
    return {};
  }
  return JSON.parse(readFileSync(file, "utf8")) as SurjectionConfig;
}

/** Resolves configured paths against the base URL and removes duplicates. */
export function resolveUrls(urls: string[], baseUrl: string | undefined): string[] {
  const resolved = urls.map((url) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
    if (!baseUrl) throw new Error(`Relative URL "${url}" needs --base-url.`);
    return new URL(url, baseUrl).toString();
  });
  return [...new Set(resolved)];
}
