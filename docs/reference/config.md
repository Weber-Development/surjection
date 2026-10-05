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
| `project` | string | |
