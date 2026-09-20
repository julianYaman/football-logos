# Image does not show up

A missing crest is often an **outdated catalog**. This package stores hashes for the current football-logos.cc PNG URLs. When a logo is replaced on that site, an old hash 404s.

1. Call [`loadCatalog()`](/guide/functions/load-catalog) (or [`startCatalogRefresh()`](/guide/functions/start-catalog-refresh) on a long-lived Node server) so hashes match the current football-logos.cc files.
2. Update `football-logos` to the latest release if the lookup is still missing from the snapshot.
3. If it still fails, [open a GitHub issue](https://github.com/julianYaman/football-logos/issues) with the `country` and `club` slugs you used.

Do not open an issue here for takedown or trademark requests. Those belong with [football-logos.cc](https://football-logos.cc). See [Contact](/guide/contact).
