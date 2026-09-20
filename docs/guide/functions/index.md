# Other functions

Import these from `football-logos` when you need a URL, a lookup result, or a catalog listing instead of `FootballLogo`.

- [`getFootballLogoUrl`](./get-football-logo-url) — public 512×512 PNG URL
- [`resolveFootballLogo`](./resolve-football-logo) — resolved crest record
- [`hasLogo`](./has-logo) — boolean lookup
- [`listCountries`](./list-countries) — catalogued countries
- [`listLeagues`](./list-leagues) — leagues and competitions
- [`listLogos`](./list-logos) — clubs and leagues in one country
- [`loadCatalog`](./load-catalog) — refresh hashes from the hosted catalog
- [`startCatalogRefresh`](./start-catalog-refresh) — reload that catalog on an interval in a long-lived Node process
- [`getCatalog`](./get-catalog) — current in-memory catalog
- [`setCatalog`](./set-catalog) — replace the in-memory catalog
- [`setCatalogBaseUrl`](./set-catalog-base-url) — hosted catalog base URL for `loadCatalog`

Lookups that cannot resolve throw `LogoResolveError` (`INVALID`, `NOT_FOUND`, or `AMBIGUOUS`).
