# loadCatalog()

Fetches the hosted catalog and updates hashes in memory. The bundled snapshot stays in place if the request fails. The default host is the `main` branch on jsDelivr: `https://cdn.jsdelivr.net/gh/julianYaman/football-logos@main/catalog/v1`.

```ts
import { loadCatalog, getFootballLogoUrl } from "football-logos";

await loadCatalog();
const src = getFootballLogoUrl({
  country: "germany",
  club: "bayern-munchen",
});
```

```ts
function loadCatalog(options?: {
  country?: string;
  baseUrl?: string;
}): Promise<Catalog>;
```

Pass `country` to refresh a single country file. Pass `baseUrl` to load from a different catalog host. [`setCatalogBaseUrl()`](./set-catalog-base-url) changes the default host for later calls.

Returns the catalog after the refresh (or the existing snapshot on failure).

For a long-lived Node server, [`startCatalogRefresh()`](./start-catalog-refresh) calls this on an interval. Static Astro builds should `await loadCatalog()` once at build time instead.
