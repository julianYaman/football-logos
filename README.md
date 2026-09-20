<p align="center">
  <img src="docs/public/favicon.svg" width="96" height="96" alt="football-logos" />
</p>

<h1 align="center">football-logos</h1>

Hotlink football club and league crests from [football-logos.cc](https://football-logos.cc) in React, Vue, Svelte, Astro, or any framework.

Pass a country and a club (or league). The package returns the public 512×512 PNG URL on `assets.football-logos.cc`.

[Docs](https://football-logos.yamanlabs.com) · [Catalog](https://football-logos.yamanlabs.com/guide/catalog/clubs) · [Disclaimer](https://football-logos.yamanlabs.com/guide/disclaimer)

## Install

```bash
npm install football-logos
```

React, Vue, Svelte, and Astro are optional peer dependencies. Install only the framework you use.

## Contributing

```bash
npm install
npm test
npm run build
npm run docs:dev
```

Re-index hashes from football-logos.cc with `npm run index-catalog` (full recrawl, local). The daily GitHub Action ingests only `https://football-logos.cc/new/` (`npm run index-catalog -- --from-new`). Optionally recrawl one country with `-- --only=germany`.

Report package bugs on [GitHub Issues](https://github.com/julianYaman/football-logos/issues) with the `country` and `club` slugs you used. Requests for new logos, removals, or anything about the artwork itself belong with [football-logos.cc](https://football-logos.cc).

## Usage

Identifiers match football-logos.cc paths: `/{country}/{club}/`. Copy them off any logo page.

```
https://football-logos.cc/germany/bayern-munchen/
                         └─country─┘ └────club─────┘
```

### In frameworks

```tsx
<FootballLogo country="germany" club="bayern-munchen" size={48} />
```

See the [Usage](https://football-logos.yamanlabs.com/guide/usage) docs for React, Vue, Svelte, and Astro.

### General

```ts
import { getFootballLogoUrl } from "football-logos";

getFootballLogoUrl({ country: "germany", club: "bayern-munchen" });
getFootballLogoUrl({ country: "germany", club: "bundesliga" });
getFootballLogoUrl({ country: "tournaments", club: "uefa-champions-league" });
getFootballLogoUrl({ country: "germany" }); // top-flight badge (Bundesliga)
```

## Identifiers

- **`country`** is the first path segment: `germany`, `england`, `usa`, `tournaments`.
- **`club`** is the second segment. It can be a team (`bayern-munchen`) or a competition (`bundesliga`, `uefa-champions-league`).
- Omit `club` for the country’s default top-flight badge.
- International competitions live under `country="tournaments"`.
- Official names resolve; nicknames do not.

`getFootballLogoUrl` throws `LogoResolveError` (`INVALID` | `NOT_FOUND` | `AMBIGUOUS`) when the lookup fails. Use `hasLogo()` when you only need a boolean. Unknown `FootballLogo` lookups render a placeholder.

## Catalog

A snapshot of every football-logos.cc country page plus `/tournaments/` ships with the package (228 countries and international competitions).

National teams use `club="{country}-national-team"` on that country, for example `country="senegal"` or `country="germany"` + `club="germany-national-team"`.

Call `loadCatalog()` to refresh hashes from the GitHub `main` catalog on jsDelivr without an npm release; if that request fails, the snapshot is kept.

Browse clubs and competitions in the [docs catalog](https://football-logos.yamanlabs.com/guide/catalog/leagues).

## Caching

Filenames are content-hashed (`bayern-munchen.8eda8ecc.png`). A stored `src` stays valid when the catalog moves on. Cache-Control on `assets.football-logos.cc` is outside this package.

## Listing helpers

```ts
import {
  hasLogo,
  listCountries,
  listLeagues,
  listLogos,
  resolveFootballLogo,
} from "football-logos";

hasLogo({ country: "germany", club: "bayern-munchen" });
listCountries();
listLeagues();
listLogos("germany");
resolveFootballLogo({ country: "germany", club: "Bayern Munich" });
```

## Licence and trademarks

Club, league, and federation marks are the property of their respective owners. football-logos.cc presents them for informational, editorial, research, and fan use. This package is a convenience layer over those public image URLs.

The MIT licence covers the resolver, components, and catalog tooling — not the artwork. Usage of the images follows [football-logos.cc/license](https://football-logos.cc/license/). Credit [football-logos.cc](https://football-logos.cc) as the image source.

**football-logos is not affiliated with football-logos.cc.**
