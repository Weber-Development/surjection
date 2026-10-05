import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://surjection.sweber.dev",
  integrations: [
    starlight({
      title: "Surjection",
      description:
        "Accessibility checks for CI and tests, client-ready reports and accessibility statements. Built on axe-core, no overlay.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Weber-Development/surjection",
        },
      ],
      sidebar: [
        { label: "Start", items: ["introduction", "getting-started"] },
        {
          label: "Guides",
          items: [
            "guides/cli",
            "guides/github-actions",
            "guides/playwright",
            "guides/vitest",
            "guides/baseline",
            "guides/statement",
            "guides/react",
          ],
        },
        { label: "Reference", items: ["reference/config", "reference/api"] },
        {
          label: "Surjection Pro",
          items: ["pro/overview", "pro/report", "pro/history", "pro/checklist"],
        },
        { label: "Legal", items: ["legal"] },
      ],
    }),
  ],
});
