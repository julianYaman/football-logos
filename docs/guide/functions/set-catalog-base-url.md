# setCatalogBaseUrl()

Sets the hosted catalog URL that [`loadCatalog()`](./load-catalog) fetches from.

```ts
import { setCatalogBaseUrl, loadCatalog } from "football-logos";

setCatalogBaseUrl("https://example.com/catalog/v1");
await loadCatalog();
```

```ts
function setCatalogBaseUrl(url: string): void;
```

The default is `https://cdn.jsdelivr.net/gh/julianYaman/football-logos@main/catalog/v1`. A trailing slash is ignored. Passing `baseUrl` to `loadCatalog()` overrides this for that call only.
