# getCatalog()

Returns the catalog currently used by the lookup functions.

```ts
import { getCatalog } from "football-logos";

const catalog = getCatalog();
```

```ts
function getCatalog(): Catalog;
```

The first value is the snapshot bundled with the package. [`loadCatalog()`](./load-catalog) and [`setCatalog()`](./set-catalog) replace that in-memory copy.
