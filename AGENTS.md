# AGENTS.md

Hotlink-only convenience layer over [football-logos.cc](https://football-logos.cc) public PNG URLs. The MIT licence covers code and catalog tooling, not the artwork. Do not vendor, bundle, or redistribute crest files.

Read `CONTEXT.md` for domain language. Component name is **FootballLogo**. `country` is the football-logos.cc country slug (`germany`, `england`); ISO codes (`DE`, `ENG`) also work. `club` is the second path segment: a club or a league/competition slug. Omit `club` for that country's top-flight league badge. Never use `GB` for England.

## Layout

| Path | Role |
| --- | --- |
| `src/index.ts` | Public resolver: `getFootballLogoUrl`, `resolveFootballLogo`, `loadCatalog`, listings |
| `src/resolve.ts` | Lookup, ISO/name matching, URL construction |
| `src/types.ts` | Catalog and resolve types |
| `src/catalog.fallback.json` | Bundled catalog snapshot shipped with the package |
| `src/react/` | Compiled `FootballLogo` (`football-logos/react`, named export) |
| `src/vue/FootballLogo.vue` | Source SFC (`football-logos/vue`) |
| `src/svelte/FootballLogo.svelte` | Source Svelte component (`football-logos/svelte`) |
| `src/astro/FootballLogo.astro` | Source Astro component (`football-logos/astro`) |
| `catalog/v1/` | Hosted catalog (`meta.json` + `countries/{slug}.json`) |
| `docs/public/catalog/v1/` | Same catalog, copied for the VitePress site |
| `scripts/index-catalog.mjs` | Indexes football-logos.cc country pages into catalog + fallback |
| `scripts/catalog-parse.mjs` | Shared HTML extract/classify used by the indexer |
| `scripts/extract-server.mjs` | Local POST `/extract` helper when Node cannot reach football-logos.cc |
| `docs/` | VitePress site (intended host: football-logos.yamanlabs.com) |
| `.github/workflows/` | `ci.yml`, `index-catalog.yml` (daily 06:00 UTC), `docs.yml` (GitHub Pages) |

Wrappers stay thin: call the resolver, render an `img`, show a placeholder (or slot) on `LogoResolveError`. Do not duplicate catalog logic in a framework file.

## Commands

```bash
npm test
npm run build
npm run index-catalog            # all countries
npm run index-catalog -- --only=germany
npm run index-catalog -- --from-extract=scripts/.extract
npm run docs:dev
npm run docs:build
```

`tsup` emits `dist/` for the core package and React. Vue, Svelte, and Astro ship as source. After catalog changes, `catalog/v1`, `docs/public/catalog/v1`, and `src/catalog.fallback.json` must stay in sync (the indexer writes all three).

## Catalog

Coverage is every logo listed on a football-logos.cc country page (228 countries as of 2026-09-19) plus every competition on `/tournaments/` (`country="tournaments"`). National team crests live on those country pages as `{country}-national-team`, not under a `national-teams` country slug. See `scripts/country-directory.json` and `COUNTRY_OVERRIDES`. Clubs resolve by football-logos.cc slug or official name, not nicknames. League slugs go in `club`: `country="germany"` + `club="2-bundesliga"`. Tournament examples: `country="tournaments"` + `club="uefa-champions-league"`. `GER2` / `ENG2` as `country` still scopes club lookup to that division; `DE` / `ENG` find any club in that country. Brazil is `BR` / `brazil`; the United States is `US` / `usa`. England is `ENG` / `england`, never `GB`.

Hashes are per size and style. This package indexes **512×512** color PNGs at `https://assets.football-logos.cc/logos/{country}/512x512/{slug}.{hash}.png`. The indexer reads those hashes from each country listing page.

Package name is `football-logos` (unscoped). Do not publish as `@football-logos/*`. Do not create a git remote, GitHub repo, or npm release unless the user asks.
