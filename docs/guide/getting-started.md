<script setup>
const vueClub = [
  "<script setup>",
  '  import FootballLogo from "football-logos/vue";',
  "</" + "script>",
  "",
  '<FootballLogo country="germany" club="bayern-munchen" size={48} />',
].join("\n");

const svelteClub = [
  "<script>",
  '  import FootballLogo from "football-logos/svelte";',
  "</" + "script>",
  "",
  '<FootballLogo country="germany" club="bayern-munchen" size={48} />',
].join("\n");

const astroClub = [
  "---",
  'import FootballLogo from "football-logos/astro";',
  "---",
  "",
  '<FootballLogo country="germany" club="bayern-munchen" size={48} />',
].join("\n");

const quickExample = {
  react: `import { FootballLogo } from "football-logos/react";

<FootballLogo country="germany" club="bayern-munchen" size={48} />`,
  vue: vueClub,
  svelte: svelteClub,
  astro: astroClub,
};
</script>

# Getting started

## Install

```bash
npm install football-logos
```

## Quick example

<FrameworkExample v-bind="quickExample" name="quick-example" />

Pass a `country` slug and a `club` slug. `club` can be a team or a league. Omit `club` to show that country's top-flight league badge.

See [Usage](/guide/usage) for league slugs and caching. Listing and catalog helpers are under [Other functions](/guide/functions/).

## Catalog updates

The package ships a catalog snapshot. Lookups use that until you refresh it. On a long-lived Node server, call [`startCatalogRefresh()`](/guide/functions/start-catalog-refresh) once at startup. Static builds should [`loadCatalog()`](/guide/functions/load-catalog) once at build time.

See [`startCatalogRefresh()`](/guide/functions/start-catalog-refresh) for how to implement it in React, Vue, Svelte, and Astro.
