import { readFileSync, writeFileSync } from "node:fs";
import { normalizeBaseline } from "../baseline";
import { normalizeResults } from "../results";
import type { ResultsFile } from "../types";

export function readResults(file: string): ResultsFile {
  return normalizeResults(JSON.parse(readFileSync(file, "utf8")));
}

/** `surjection convert`: rewrites a results file or a baseline of version 1 as version 2. */
export function convertFile(input: string, output: string): "results" | "baseline" {
  const data = JSON.parse(readFileSync(input, "utf8")) as { entries?: unknown };
  const isBaseline = Array.isArray(data.entries);
  const converted = isBaseline ? normalizeBaseline(data) : normalizeResults(data);
  writeFileSync(output, `${JSON.stringify(converted, null, 2)}\n`);
  return isBaseline ? "baseline" : "results";
}
