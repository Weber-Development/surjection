import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "@playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { launchChromium, resolveUrls, runCheck } from "../src/node";
import type { ResultsFile } from "../src/types";

const fixture = (name: string) => pathToFileURL(join(__dirname, "fixtures", name)).toString();
const silent = () => {};

let browser: Browser;
let dir: string;

beforeAll(async () => {
  browser = await launchChromium();
  dir = mkdtempSync(join(tmpdir(), "surjection-"));
});

afterAll(async () => {
  await browser?.close();
});

describe("runCheck", () => {
  it("passes for an accessible page", async () => {
    const outcome = await runCheck(
      { urls: [fixture("good.html")], baseline: join(dir, "none.json"), log: silent },
      browser,
    );
    expect(outcome.failed).toBe(false);
  });

  it("fails, writes reports and respects --fail-on and --exclude", async () => {
    const outMarkdown = join(dir, "report.md");
    const outJson = join(dir, "results.json");
    const outcome = await runCheck(
      {
        urls: [fixture("bad.html")],
        baseline: join(dir, "none.json"),
        locale: "de",
        project: "Muster AG",
        outMarkdown,
        outJson,
        log: silent,
      },
      browser,
    );
    expect(outcome.failed).toBe(true);
    const rules = outcome.failing[0]?.findings.map((f) => f.rule);
    expect(rules).toEqual(expect.arrayContaining(["image-alt", "button-name"]));
    expect(readFileSync(outMarkdown, "utf8")).toContain("Bericht zur Barrierefreiheit");
    const json = JSON.parse(readFileSync(outJson, "utf8")) as ResultsFile;
    expect(json.project).toBe("Muster AG");
    expect(json.pages).toHaveLength(1);

    const excluded = await runCheck(
      {
        urls: [fixture("bad.html")],
        baseline: join(dir, "none.json"),
        exclude: [".widget"],
        log: silent,
      },
      browser,
    );
    const imageNodes = excluded.pages[0]?.findings.find((f) => f.rule === "image-alt")?.nodes;
    expect(imageNodes?.map((n) => n.target)).toEqual(["#hero"]);
  });

  it("baseline accepts existing issues; new ones still fail", async () => {
    const baseline = join(dir, "baseline.json");
    await runCheck(
      { urls: [fixture("bad.html")], baseline, updateBaseline: true, log: silent },
      browser,
    );
    expect(existsSync(baseline)).toBe(true);
    const again = await runCheck({ urls: [fixture("bad.html")], baseline, log: silent }, browser);
    expect(again.failed).toBe(false);

    const changed = join(dir, "changed.html");
    writeFileSync(
      changed,
      readFileSync(join(__dirname, "fixtures", "bad.html"), "utf8").replace(
        "</main>",
        '<input id="email"></main>',
      ),
    );
    // Same path as the baseline entries, so only the new input fails.
    const entries = JSON.parse(readFileSync(baseline, "utf8"));
    const path = new URL(pathToFileURL(changed)).pathname;
    entries.entries = entries.entries.map((e: string) => e.replace(/^[^|]+/, path));
    writeFileSync(baseline, JSON.stringify(entries));
    const withNew = await runCheck(
      { urls: [pathToFileURL(changed).toString()], baseline, log: silent },
      browser,
    );
    expect(withNew.failing[0]?.findings.map((f) => f.rule)).toEqual(["label"]);
  });
});

describe("resolveUrls", () => {
  it("resolves paths against the base URL and removes duplicates", () => {
    expect(resolveUrls(["/", "/shop", "https://a.ch/"], "https://a.ch")).toEqual([
      "https://a.ch/",
      "https://a.ch/shop",
    ]);
  });

  it("asks for a base URL for relative paths", () => {
    expect(() => resolveUrls(["/shop"], undefined)).toThrow(/--base-url/);
  });
});
