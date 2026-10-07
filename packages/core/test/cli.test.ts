import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "@playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { launchChromium, parseViewport, resolveUrls, runCheck, runInit } from "../src/node";
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

    const outJUnit = join(dir, "junit.xml");
    await runCheck(
      {
        urls: [fixture("bad.html")],
        baseline: join(dir, "none.json"),
        viewport: "mobile",
        outJUnit,
        log: silent,
      },
      browser,
    );
    const xml = readFileSync(outJUnit, "utf8");
    expect(xml).toContain("<testsuites");
    expect(xml).toContain('name="image-alt"');
    expect(xml).toContain("<failure");

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

describe("parseViewport", () => {
  it("knows presets and WxH", () => {
    expect(parseViewport(undefined)).toEqual({ width: 1280, height: 800 });
    expect(parseViewport("mobile")).toEqual({ width: 390, height: 844 });
    expect(parseViewport("1024x768")).toEqual({ width: 1024, height: 768 });
    expect(() => parseViewport("huge")).toThrow();
  });
});

describe("runInit", () => {
  it("writes config and workflow once", () => {
    const cwd = mkdtempSync(join(tmpdir(), "surjection-init-"));
    const written = runInit({ cwd, baseUrl: "https://muster.ch", sitemap: true });
    expect(written).toHaveLength(2);
    const config = JSON.parse(readFileSync(join(cwd, "surjection.config.json"), "utf8"));
    expect(config.baseUrl).toBe("https://muster.ch");
    expect(config.sitemap).toBe("/sitemap.xml");
    expect(existsSync(join(cwd, ".github/workflows/accessibility.yml"))).toBe(true);
    expect(runInit({ cwd })).toHaveLength(0);
  });
});

describe("keyboard check", () => {
  it("finds focus traps and missing focus indicators", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("keyboard.html")],
        baseline: join(dir, "none.json"),
        keyboard: true,
        log: silent,
      },
      browser,
    );
    const findings = outcome.pages[0]?.findings ?? [];
    const trap = findings.find((f) => f.rule === "surjection-focus-trap");
    expect(trap?.nodes.map((n) => n.target)).toEqual(["#first", "#last"]);
    expect(trap?.criteria[0]?.id).toBe("2.1.2");
    const focus = findings.find((f) => f.rule === "surjection-focus-visible");
    expect(focus?.nodes.map((n) => n.target)).toEqual(["#plain"]);
  });

  it("passes a page without traps", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("good.html")],
        baseline: join(dir, "none.json"),
        keyboard: true,
        log: silent,
      },
      browser,
    );
    expect(outcome.pages[0]?.findings.filter((f) => f.rule.startsWith("surjection-"))).toEqual([]);
  });

  it("rejects a missing storage state", async () => {
    await expect(
      runCheck(
        { urls: [fixture("good.html")], storageState: join(dir, "missing.json"), log: silent },
        browser,
      ),
    ).rejects.toThrow("not found");
  });
});

describe("screenshots", () => {
  it("stores a screenshot per affected element and references it in the results", async () => {
    const shots = join(dir, "shots");
    const outJson = join(dir, "shots.json");
    await runCheck(
      {
        urls: [fixture("bad.html")],
        baseline: join(dir, "none.json"),
        screenshots: shots,
        outJson,
        log: silent,
      },
      browser,
    );
    const json = JSON.parse(readFileSync(outJson, "utf8")) as ResultsFile;
    const files = json.pages[0]?.findings.flatMap((f) => f.nodes.map((n) => n.screenshot)) ?? [];
    const taken = files.filter((f): f is string => Boolean(f));
    expect(taken.length).toBeGreaterThan(0);
    for (const file of taken) {
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file).subarray(1, 4).toString()).toBe("PNG");
    }
  });
});

describe("layout check", () => {
  it("finds reflow and text spacing problems and restores the viewport", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("layout.html")],
        baseline: join(dir, "none.json"),
        layout: true,
        log: silent,
      },
      browser,
    );
    const findings = outcome.pages[0]?.findings ?? [];
    const reflow = findings.find((f) => f.rule === "surjection-reflow");
    expect(reflow?.nodes.map((n) => n.target)).toEqual(["#wide"]);
    expect(reflow?.criteria[0]?.id).toBe("1.4.10");
    const spacing = findings.find((f) => f.rule === "surjection-text-spacing");
    expect(spacing?.nodes.map((n) => n.target)).toEqual(["#clip"]);
    expect(spacing?.criteria[0]?.id).toBe("1.4.12");
  });

  it("passes a fluid page", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("layout-ok.html")],
        baseline: join(dir, "none.json"),
        layout: true,
        log: silent,
      },
      browser,
    );
    expect(outcome.pages[0]?.findings.filter((f) => f.rule.startsWith("surjection-"))).toEqual([]);
  });
});

describe("states", () => {
  it("runs the steps and reports findings per state, without touching the plain page", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("states.html")],
        baseline: join(dir, "none.json"),
        states: [{ name: "menu-open", steps: [{ click: "#menu" }, { waitFor: "#logo" }] }],
        log: silent,
      },
      browser,
    );
    expect(outcome.pages).toHaveLength(2);
    expect(outcome.pages[0]?.findings.some((f) => f.rule === "image-alt")).toBe(false);
    const state = outcome.pages[1];
    expect(state?.url.endsWith("#state:menu-open")).toBe(true);
    expect(state?.findings.some((f) => f.rule === "image-alt")).toBe(true);
  });

  it("works with states only and names a failing step", async () => {
    const only = await runCheck(
      {
        baseline: join(dir, "none.json"),
        states: [{ name: "x", url: fixture("states.html"), steps: [{ click: "#menu" }] }],
        log: silent,
      },
      browser,
    );
    expect(only.pages).toHaveLength(1);
    await expect(
      runCheck(
        {
          baseline: join(dir, "none.json"),
          states: [{ name: "broken", url: fixture("states.html"), steps: [{ click: "#missing" }] }],
          log: silent,
        },
        browser,
      ),
    ).rejects.toThrow('State "broken", step "click #missing" failed');
  });

  it("keeps states apart in the baseline", async () => {
    const baseline = join(dir, "state-baseline.json");
    const run = {
      urls: [fixture("states.html")],
      baseline,
      states: [{ name: "menu-open", steps: [{ click: "#menu" }] }],
      log: silent,
    };
    await runCheck({ ...run, updateBaseline: true }, browser);
    const accepted = JSON.parse(readFileSync(baseline, "utf8")) as { entries: string[] };
    expect(accepted.entries.some((e) => e.includes("#state:menu-open|image-alt"))).toBe(true);
    expect((await runCheck(run, browser)).failed).toBe(false);
  });
});

describe("focus order", () => {
  it("finds a jump up the page caused by a positive tabindex", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("order.html")],
        baseline: join(dir, "none.json"),
        keyboard: true,
        log: silent,
      },
      browser,
    );
    const order = outcome.pages[0]?.findings.find((f) => f.rule === "surjection-focus-order");
    expect(order?.nodes.map((n) => n.target)).toEqual(["#first"]);
    expect(order?.criteria[0]?.id).toBe("2.4.3");
  });
});

describe("SARIF output", () => {
  it("writes one result per element with rule metadata", async () => {
    const out = join(dir, "out.sarif");
    await runCheck(
      { urls: [fixture("bad.html")], baseline: join(dir, "none.json"), outSarif: out, log: silent },
      browser,
    );
    const sarif = JSON.parse(readFileSync(out, "utf8"));
    expect(sarif.version).toBe("2.1.0");
    const run = sarif.runs[0];
    expect(run.tool.driver.name).toBe("Surjection");
    expect(run.results.length).toBeGreaterThan(0);
    const ruleIds = run.tool.driver.rules.map((r: { id: string }) => r.id);
    for (const result of run.results) {
      expect(ruleIds).toContain(result.ruleId);
      expect(["error", "warning", "note"]).toContain(result.level);
      expect(result.locations[0].physicalLocation.artifactLocation.uri).toContain("bad.html");
    }
  });
});

describe("colour scheme", () => {
  it("finds a contrast problem that exists only in dark mode", async () => {
    const run = (colorScheme?: "dark") =>
      runCheck(
        {
          urls: [fixture("scheme.html")],
          baseline: join(dir, "none.json"),
          ...(colorScheme && { colorScheme }),
          log: silent,
        },
        browser,
      );
    expect((await run()).failed).toBe(false);
    const dark = await run("dark");
    expect(dark.failing[0]?.findings.map((f) => f.rule)).toContain("color-contrast");
  });
});

describe("config schema", () => {
  const schema = JSON.parse(
    readFileSync(join(__dirname, "..", "surjection.config.schema.json"), "utf8"),
  );

  it("describes every field of the config and of the init file", () => {
    const keys = Object.keys(schema.properties).sort();
    expect(keys).toEqual(
      [
        "$schema",
        "urls",
        "baseUrl",
        "sitemap",
        "maxPages",
        "standard",
        "bestPractice",
        "disableRules",
        "exclude",
        "failOn",
        "locale",
        "baseline",
        "project",
        "viewport",
        "keyboard",
        "layout",
        "screenshots",
        "storageState",
        "colorScheme",
        "compareWith",
        "concurrency",
        "reducedMotion",
        "states",
      ].sort(),
    );
    const cwd = mkdtempSync(join(tmpdir(), "surjection-schema-"));
    runInit({ cwd, project: "X", sitemap: true });
    const config = JSON.parse(readFileSync(join(cwd, "surjection.config.json"), "utf8"));
    for (const key of Object.keys(config)) expect(keys).toContain(key);
    expect(config.$schema).toContain("surjection.config.schema.json");
  });

  it("knows the same steps as the runner", () => {
    const steps = schema.properties.states.items.properties.steps.items.oneOf.map(
      (s: { required: string[] }) => s.required[0],
    );
    expect(steps.sort()).toEqual(["click", "fill", "hover", "press", "wait", "waitFor"]);
  });
});

describe("compare with an earlier run", () => {
  it("keeps before and after screenshots of what was fixed", async () => {
    const work = mkdtempSync(join(tmpdir(), "surjection-compare-"));
    const file = join(work, "page.html");
    const html = (img: string) =>
      `<!doctype html><html lang="en"><head><title>P</title></head><body><main><h1>P</h1>${img}</main></body></html>`;
    const gif = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    writeFileSync(file, html(`<img id="logo" src="${gif}" width="80" height="40">`));
    const url = pathToFileURL(file).toString();
    const shots = join(work, "shots");
    const first = join(work, "run1.json");
    await runCheck(
      {
        urls: [url],
        baseline: join(work, "none.json"),
        screenshots: shots,
        outJson: first,
        log: silent,
      },
      browser,
    );
    writeFileSync(file, html(`<img id="logo" src="${gif}" width="80" height="40" alt="Logo">`));
    const second = join(work, "run2.json");
    await runCheck(
      {
        urls: [url],
        baseline: join(work, "none.json"),
        screenshots: shots,
        compareWith: first,
        outJson: second,
        log: silent,
      },
      browser,
    );
    const page = (JSON.parse(readFileSync(second, "utf8")) as ResultsFile).pages[0];
    const fixed = page?.fixed ?? [];
    expect(fixed.map((f) => f.rule)).toContain("image-alt");
    const item = fixed.find((f) => f.rule === "image-alt");
    expect(item?.before && existsSync(item.before)).toBe(true);
    expect(item?.after && existsSync(item.after)).toBe(true);
    expect(item?.before).not.toBe(item?.after);
  });

  it("fails clearly when the earlier results are missing", async () => {
    await expect(
      runCheck(
        { urls: [fixture("good.html")], compareWith: join(dir, "nope.json"), log: silent },
        browser,
      ),
    ).rejects.toThrow("not found");
  });
});

describe("many pages", () => {
  it("checks in parallel with the same results in the same order", async () => {
    const urls = [
      "good.html",
      "bad.html",
      "keyboard.html",
      "layout-ok.html",
      "bad.html",
      "good.html",
    ].map(fixture);
    const base = { urls, baseline: join(dir, "none.json"), log: silent };
    const serial = await runCheck(base, browser);
    const parallel = await runCheck({ ...base, concurrency: 4 }, browser);
    const summary = (o: typeof serial) => o.pages.map((p) => `${p.url}:${p.findings.length}`);
    expect(summary(parallel)).toEqual(summary(serial));
  });

  it("keeps going when a page cannot be loaded and reports it", async () => {
    const outcome = await runCheck(
      {
        urls: [fixture("good.html"), "http://127.0.0.1:9/nothing", fixture("bad.html")],
        baseline: join(dir, "none.json"),
        log: silent,
      },
      browser,
    );
    expect(outcome.pages).toHaveLength(2);
    expect(outcome.loadErrors).toHaveLength(1);
    expect(outcome.loadErrors[0]).toContain("127.0.0.1:9");
  });
});

describe("target size (WCAG 2.5.8)", () => {
  it("is covered by axe-core in the default standard", async () => {
    const outcome = await runCheck(
      { urls: [fixture("target.html")], baseline: join(dir, "none.json"), log: silent },
      browser,
    );
    const rules = outcome.pages[0]?.findings.map((f) => f.rule) ?? [];
    expect(rules).toContain("target-size");
  });
});
