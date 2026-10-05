import { describe, expect, it } from "vitest";
import { loadSitemap, parseSitemap } from "../src/node";

describe("parseSitemap", () => {
  it("reads page URLs and decodes entities", () => {
    const xml = `<?xml version="1.0"?><urlset><url><loc>https://a.ch/</loc></url><url><loc> https://a.ch/?a=1&amp;b=2 </loc></url></urlset>`;
    expect(parseSitemap(xml)).toEqual({
      urls: ["https://a.ch/", "https://a.ch/?a=1&b=2"],
      sitemaps: [],
    });
  });

  it("follows a sitemap index", async () => {
    const files: Record<string, string> = {
      "https://a.ch/sitemap.xml":
        "<sitemapindex><sitemap><loc>https://a.ch/s1.xml</loc></sitemap></sitemapindex>",
      "https://a.ch/s1.xml": "<urlset><url><loc>https://a.ch/kontakt</loc></url></urlset>",
    };
    const urls = await loadSitemap("https://a.ch/sitemap.xml", async (url) => files[url] ?? "");
    expect(urls).toEqual(["https://a.ch/kontakt"]);
  });
});
