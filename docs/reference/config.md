---
title: Configuration
description: Fields of surjection.config.json.
---

The CLI reads `surjection.config.json` from the working directory, or the file passed with `--config`. Flags override the file.

```json title="surjection.config.json"
{
  "baseUrl": "https://preview.example.ch",
  "urls": ["/", "/shop"],
  "sitemap": "/sitemap.xml",
  "maxPages": 50,
  "standard": "wcag22aa",
  "bestPractice": false,
  "disableRules": [],
  "exclude": ["#cookie-banner-iframe"],
  "failOn": "serious",
  "locale": "de-CH",
  "baseline": "surjection-baseline.json",
  "project": "Muster AG"
}
```

| Field | Type | Default |
|---|---|---|
| `urls` | string[] | |
| `baseUrl` | string | |
| `sitemap` | string | |
| `maxPages` | number | `50` |
| `standard` | `wcag2a` \| `wcag2aa` \| `wcag21aa` \| `wcag22aa` | `wcag22aa` |
| `bestPractice` | boolean | `false` |
| `disableRules` | string[] | `[]` |
| `exclude` | string[] | `[]` |
| `failOn` | `minor` \| `moderate` \| `serious` \| `critical` | `minor` |
| `locale` | `de` \| `de-CH` \| `fr` \| `it` \| `en` | `en` |
| `baseline` | string | `surjection-baseline.json` |
| `viewport` | `desktop` \| `mobile` \| `<width>x<height>` | `desktop` |
| `screenshots` | string | |
| `layout` | boolean | `false` |
| `keyboard` | boolean | `false` |
| `storageState` | string | |
| `colorScheme` | `light` \| `dark` | |
| `reducedMotion` | boolean | `false` |
| `states` | `{ name, url?, steps }[]` | `[]` |
| `project` | string | |

## Editor support (JSON schema)

`surjection init` writes the config with a `$schema` line. Editors such as VS Code then complete field names, show the descriptions and flag typos or invalid steps while you type. For an existing file add:

```json
{ "$schema": "https://unpkg.com/@sweberdev/surjection/surjection.config.schema.json" }
```

The schema ships with the package as `surjection.config.schema.json`.
