# startCatalogRefresh()

Calls [`loadCatalog()`](./load-catalog) in the current process, then again on an interval. Use it once at **server startup** so a long-lived Node app picks up new and replaced badges without an npm upgrade.

Do not run it in the browser: every visitor would download the catalog. Serverless and edge hosts should call `loadCatalog()` once instead — a timer does not stay alive there.

```ts
import { startCatalogRefresh } from "football-logos";

const stop = startCatalogRefresh();
```

```ts
function startCatalogRefresh(options?: {
  intervalMs?: number;
  country?: string;
  baseUrl?: string;
}): () => void;
```

The default interval is 24 hours. Pass `country` to refresh one country file. Pass `baseUrl` to use a different catalog host. A second call replaces the previous timer. The returned function stops it; [`stopCatalogRefresh()`](#stopcatalogrefresh) does the same.

`FootballLogo` does not re-render when the catalog updates. The next lookup in that process uses the new hashes.

## React

With Next.js on a long-lived Node server:

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startCatalogRefresh } = await import("football-logos");
  startCatalogRefresh();
}
```

A client-only React app (Vite SPA, static export) should skip this and use the bundled snapshot.

## Vue

With Nuxt / Nitro, start it from a server plugin:

```ts
// server/plugins/football-logos.ts
import { startCatalogRefresh } from "football-logos";

export default defineNitroPlugin(() => {
  startCatalogRefresh();
});
```

A client-only Vue app should skip this.

## Svelte

With SvelteKit, start it in the server hook:

```ts
// src/hooks.server.ts
import { startCatalogRefresh } from "football-logos";

startCatalogRefresh();

export async function handle({ event, resolve }) {
  return resolve(event);
}
```

A client-only Svelte app should skip this.

## Astro

Static sites (`output: "static"`) bake logo URLs into HTML at build time. A timer after deploy does nothing. Refresh once before the build:

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import { loadCatalog } from "football-logos";

await loadCatalog();

export default defineConfig({
  // ...
});
```

SSR with a long-lived Node adapter can start the refresher from middleware (module scope, so it is not a new timer per request):

```ts
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { startCatalogRefresh } from "football-logos";

startCatalogRefresh();

export const onRequest = defineMiddleware((_context, next) => next());
```

Serverless or edge adapters should `await loadCatalog()` on the instance instead.

## stopCatalogRefresh()

Stops the timer started by `startCatalogRefresh()`. Safe to call when no refresh is running.

```ts
function stopCatalogRefresh(): void;
```
