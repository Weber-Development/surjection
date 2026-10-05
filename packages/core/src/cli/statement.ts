import { readFileSync, writeFileSync } from "node:fs";
import { generateStatement, type StatementInput } from "../statement";

/** Reads statement data from JSON and writes Markdown or HTML, chosen by the output extension. */
export function runStatement(configPath: string, outPath: string): void {
  const input = JSON.parse(readFileSync(configPath, "utf8")) as StatementInput;
  const statement = generateStatement(input);
  writeFileSync(outPath, outPath.endsWith(".html") ? `${statement.html}\n` : statement.markdown);
}
