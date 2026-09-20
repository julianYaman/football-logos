# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Daily catalog workflow ingests logos dated today and yesterday from [football-logos.cc/new](https://football-logos.cc/new/) instead of recrawling every country page. Full recrawls stay local (`npm run index-catalog`).

## [0.2.0] - 2026-09-19

### Added

- `url` on the record returned by `resolveFootballLogo()`, matching the hashed PNG from `getFootballLogoUrl()`

### Changed

- Framework wrappers resolve the catalog once and use `record.url`
- Docs homepage shows the package version beside the title

## [0.1.0] - 2026-09-19

### Added

- Resolver that turns a country and club (or league) identifier into a public 512×512 football-logos.cc PNG URL
- `FootballLogo` wrappers for React, Vue, Svelte, and Astro, plus `getFootballLogoUrl()` for any other framework
- Bundled catalog for every football-logos.cc country page (228 countries) plus international competitions under `tournaments`
- Lookup by football-logos.cc slug, league code (`GER2`, `UCL`, …), or official name
- `loadCatalog()` to refresh hashes from a hosted `catalog/v1` without an npm release
- Listing helpers: `hasLogo`, `listCountries`, `listLeagues`, `listLogos`, `getCatalog`, `setCatalog`, and `setCatalogBaseUrl`
- Docs catalog pages that list slugs and link to football-logos.cc

[Unreleased]: https://github.com/julianYaman/football-logos/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/julianYaman/football-logos/releases/tag/v0.2.0
[0.1.0]: https://github.com/julianYaman/football-logos/releases/tag/v0.1.0
