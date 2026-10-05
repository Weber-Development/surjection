const LOC = /<loc>\s*([^<\s]+)\s*<\/loc>/g;

function decodeXml(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

/** Extracts URLs from a sitemap or sitemap index. */
export function parseSitemap(xml: string): { urls: string[]; sitemaps: string[] } {
  const locs = [...xml.matchAll(LOC)].map((m) => decodeXml(m[1] ?? ""));
  if (/<sitemapindex[\s>]/.test(xml)) return { urls: [], sitemaps: locs };
  return { urls: locs, sitemaps: [] };
}

/** Loads all page URLs of a sitemap, following one level of sitemap index. */
export async function loadSitemap(
  url: string,
  fetcher: (url: string) => Promise<string> = defaultFetch,
): Promise<string[]> {
  const { urls, sitemaps } = parseSitemap(await fetcher(url));
  if (sitemaps.length === 0) return urls;
  const nested = await Promise.all(sitemaps.map(async (s) => parseSitemap(await fetcher(s)).urls));
  return nested.flat();
}

async function defaultFetch(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load sitemap ${url}: HTTP ${response.status}`);
  return response.text();
}
