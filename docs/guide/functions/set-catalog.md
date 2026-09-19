# setCatalog()

Replaces the in-memory catalog used by the lookup functions.

```ts
import { getCatalog, setCatalog } from "football-logos";

const catalog = getCatalog();
setCatalog(catalog);
```

```ts
function setCatalog(next: Catalog): void;
```

Use this when you already have a `Catalog` object. To refresh hashes from the hosted files, call [`loadCatalog()`](./load-catalog) instead.
