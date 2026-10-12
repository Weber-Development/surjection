import { findingId, pathOf } from "./baseline";
import type { PageResult, ResultsFile, ResultsRun } from "./types";
import { VERSION } from "./version";

/** Copies the pages and adds the stable `id` to every affected element. */
export function withIds(pages: PageResult[]): PageResult[] {
  return pages.map((page) => {
    const path = pathOf(page.url);
    const withNodes = (findings: PageResult["findings"]) =>
      findings.map((finding) => ({
        ...finding,
        nodes: finding.nodes.map((node) => ({
          ...node,
          id: findingId(path, finding.rule, node.target),
        })),
      }));
    return { ...page, findings: withNodes(page.findings), incomplete: withNodes(page.incomplete) };
  });
}

export function createResults(
  pages: PageResult[],
  options: { project?: string; run?: ResultsRun; createdAt?: Date } = {},
): ResultsFile {
  return {
    version: 2,
    ...(options.project && { project: options.project }),
    createdAt: (options.createdAt ?? new Date()).toISOString(),
    tool: { name: "surjection", version: VERSION },
    ...(options.run && { run: options.run }),
    pages: withIds(pages),
  };
}

/** Accepts results of version 1 and 2 and returns version 2. Other versions are rejected. */
export function normalizeResults(data: unknown): ResultsFile {
  const file = data as { version?: number; pages?: unknown } | null;
  if ((file?.version !== 1 && file?.version !== 2) || !Array.isArray(file.pages))
    throw new Error(
      `Not a Surjection results file${typeof file?.version === "number" ? ` (version ${file.version}; this release reads versions 1 and 2)` : ""}.`,
    );
  const source = file as unknown as ResultsFile;
  return {
    ...source,
    version: 2,
    tool: source.tool ?? { name: "surjection", version: "1.x" },
    pages: withIds(source.pages),
  };
}
