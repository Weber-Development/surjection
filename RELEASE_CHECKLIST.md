# Release checklist (package-launch)

| Item | Status |
|---|---|
| Repo `Weber-Development/surjection` | open: Seya creates the empty repo, then push this one |
| npm scope `@sweber` | open: Seya creates the npm org `sweber` (alternative: unscoped `surjection`, free as of 2026-10-05) |
| packages.sweber.dev | draft PR sxwxbxr/portfoliov3#45 (coming soon, no prices) |
| Polar | open: Pro not built yet, prices not decided |
| Docs `surjection.sweber.dev` | open: docs app not built yet; Seya sets up the domain in Vercel |
| Trademark check "Surjection" | open (Seya) |

## Next steps

- Docs app (Astro, like Permito) under `apps/docs`.
- Release workflow with Changesets and npm provenance (copy from Permito).
- E2E test for `@sweber/surjection/playwright` in CI (smoke-tested manually in Chromium on 2026-10-05).
- Pro (`@weber-development/surjection-*`, private repo): branded HTML/PDF client report, history across client projects, guided manual checklist.
