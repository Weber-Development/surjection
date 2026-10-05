import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Impact, Locale } from "../types";

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
