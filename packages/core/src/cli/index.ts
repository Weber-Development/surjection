import { parseArgs } from "node:util";
import type { Impact, Locale } from "../types";
import { runCheck } from "./check";
import { loadConfig } from "./config";
import { runInit } from "./init";
import { runStatement } from "./statement";

const HELP = `Usage:
  surjection check [urls...] [options]
  surjection statement --config statement.json --out erklaerung.md
  surjection init [--base-url https://example.ch] [--sitemap] [--project "Muster AG"] [--no-workflow]

check options:
  --config <file>        Config file (default: surjection.config.json if present)
  --base-url <url>       Resolve relative URLs against this
  --sitemap <url>        Check the pages of a sitemap
  --max-pages <n>        Limit pages taken from the sitemap (default: 50)
  --standard <id>        wcag2a | wcag2aa | wcag21aa | wcag22aa (default)
  --fail-on <impact>     minor (default) | moderate | serious | critical
  --locale <locale>      de | de-CH | fr | it | en (default)
  --exclude <selector>   Skip elements, repeatable
  --baseline <file>      Baseline file (default: surjection-baseline.json)
  --update-baseline      Accept all current findings into the baseline
  --best-practice        Also run axe-core best-practice rules
  --out-md <file>        Write the Markdown report
  --out-json <file>      Write all results as JSON
  --out-junit <file>     Write a JUnit XML report (GitLab, Azure DevOps, Jenkins)
  --viewport <size>      desktop (default) | mobile | <width>x<height>
  --screenshots <dir>    Screenshot every affected element (evidence for Pro reports)
  --keyboard             Also Tab through each page: focus traps, missing focus indicators
  --storage-state <file> Playwright storage state, to check pages behind a login
  --project <name>       Project name for reports

Exit code 1 when issues remain after baseline and --fail-on.
Automated tests find only part of all barriers. A passing run is no proof of conformance.`;

export async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    return 0;
  }
  if (command === "statement") {
    const { values } = parseArgs({
      args: rest,
      options: { config: { type: "string" }, out: { type: "string" } },
    });
    if (!values.config || !values.out) {
      console.error("statement needs --config and --out.");
      return 2;
    }
    runStatement(values.config, values.out);
    console.log(`Statement written to ${values.out}.`);
    return 0;
  }
  if (command === "init") {
    const { values } = parseArgs({
      args: rest,
      options: {
        "base-url": { type: "string" },
        sitemap: { type: "boolean" },
        project: { type: "string" },
        "no-workflow": { type: "boolean" },
      },
    });
    const written = runInit({
      ...(values["base-url"] && { baseUrl: values["base-url"] }),
      sitemap: values.sitemap ?? false,
      ...(values.project && { project: values.project }),
      workflow: !values["no-workflow"],
    });
    console.log(
      written.length > 0
        ? `Created ${written.join(", ")}. Run: npx surjection check`
        : "Nothing to do: the files exist already.",
    );
    return 0;
  }
  if (command !== "check") {
    console.error(`Unknown command "${command}".\n\n${HELP}`);
    return 2;
  }
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      config: { type: "string" },
      "base-url": { type: "string" },
      sitemap: { type: "string" },
      "max-pages": { type: "string" },
      standard: { type: "string" },
      "fail-on": { type: "string" },
      locale: { type: "string" },
      exclude: { type: "string", multiple: true },
      baseline: { type: "string" },
      "update-baseline": { type: "boolean" },
      "best-practice": { type: "boolean" },
      "out-md": { type: "string" },
      "out-json": { type: "string" },
      "out-junit": { type: "string" },
      viewport: { type: "string" },
      keyboard: { type: "boolean" },
      screenshots: { type: "string" },
      "storage-state": { type: "string" },
      project: { type: "string" },
    },
  });
  const config = loadConfig(values.config);
  const outcome = await runCheck({
    ...config,
    urls: positionals.length > 0 ? positionals : config.urls,
    ...(values["base-url"] && { baseUrl: values["base-url"] }),
    ...(values.sitemap && { sitemap: values.sitemap }),
    ...(values["max-pages"] && { maxPages: Number(values["max-pages"]) }),
    ...(values.standard && { standard: values.standard as never }),
    ...(values["fail-on"] && { failOn: values["fail-on"] as Impact }),
    ...(values.locale && { locale: values.locale as Locale }),
    ...(values.exclude && { exclude: values.exclude }),
    ...(values.baseline && { baseline: values.baseline }),
    ...(values["best-practice"] && { bestPractice: true }),
    ...(values.project && { project: values.project }),
    updateBaseline: values["update-baseline"] ?? false,
    ...(values["out-md"] && { outMarkdown: values["out-md"] }),
    ...(values["out-json"] && { outJson: values["out-json"] }),
    ...(values["out-junit"] && { outJUnit: values["out-junit"] }),
    ...(values.viewport && { viewport: values.viewport }),
    ...(values.keyboard && { keyboard: true }),
    ...(values.screenshots && { screenshots: values.screenshots }),
    ...(values["storage-state"] && { storageState: values["storage-state"] }),
  });
  if (outcome.failed) {
    const issues = outcome.failing.reduce(
      (n, p) => n + p.findings.reduce((m, f) => m + f.nodes.length, 0),
      0,
    );
    console.error(`\n${issues} accessibility issue(s) on ${outcome.failing.length} page(s).`);
    return 1;
  }
  console.log(`\nNo failing accessibility issues on ${outcome.pages.length} page(s).`);
  return 0;
}
