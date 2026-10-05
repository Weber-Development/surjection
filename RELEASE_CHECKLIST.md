# Release checklist (package-launch)

| Item | Status |
|---|---|
| Repo `Weber-Development/surjection` | private; make it public before the docs can render (they are read from GitHub) |
| npm `@sweberdev/surjection`, `@sweberdev/surjection-react` | version 0.1.0 on `main`; the release run failed with `ENEEDAUTH` because the `NPM_TOKEN` secret is missing |
| packages.sweber.dev | sxwxbxr/portfoliov3#45 (entry, prices, docs config) |
| Docs | Markdown in `docs/` with `nav.json`, rendered at packages.sweber.dev/surjection/docs |
| Pro | `Weber-Development/surjection-pro` and `-dist`, see `RELEASE_CHECKLIST.md` there |
| Polar | `scripts/polar-setup.mjs` in `surjection-pro`, not run yet |
| Trademark check "Surjection" | open (Seya) |

## Open (Seya)

- [ ] Add the `NPM_TOKEN` secret (automation token of the npm org `sweberdev`) and re-run the
      failed Release workflow on `main`.
- [ ] Make the repository public.
- [ ] Trademark check.

## Later

- E2E test for `@sweberdev/surjection/playwright` in CI (smoke-tested manually in Chromium on 2026-10-05).
