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

const clubExample = {
  react: `import { FootballLogo } from "football-logos/react";

<FootballLogo country="germany" club="bayern-munchen" size={48} />`,
  vue: vueClub,
  svelte: svelteClub,
  astro: astroClub,
};

const leagueTag = '<FootballLogo country="england" club="english-premier-league" size={32} />';
const leagueExample = {
  react: leagueTag,
  vue: leagueTag,
  svelte: leagueTag,
  astro: leagueTag,
};

const tournamentTag = '<FootballLogo country="tournaments" club="uefa-champions-league" size={32} />';
const tournamentExample = {
  react: tournamentTag,
  vue: tournamentTag,
  svelte: tournamentTag,
  astro: tournamentTag,
};
</script>

# Usage

**FootballLogo** renders one crest. `country` is the football-logos.cc country slug. `club` is the second slug — a club or a league.

The site path is the same pair of slugs the component needs. Copy them off any logo page:

```
https://football-logos.cc/germany/bayern-munchen/
                         └─country─┘ └────club─────┘
```

```tsx
<FootballLogo country="germany" club="bayern-munchen" size={48} />
```

## Club

<FrameworkExample v-bind="clubExample" name="usage-club" />

Cache the image URL long-term. Filenames are content-hashed, so a stored `src` stays valid when the catalog is updated later.

## Leagues & Competitions

Pass the competition slug as `club`. Omit `club` to get that country's top-flight badge. International competitions use `country="tournaments"`. National teams use `club="{country}-national-team"`; on countries that only have that crest, omitting `club` is enough.

<FrameworkExample v-bind="leagueExample" name="usage-league" />

Tournaments such as the Champions League live under `country="tournaments"`:

```
https://football-logos.cc/tournaments/uefa-champions-league/
                         └──country──┘ └────────club────────┘
```

<FrameworkExample v-bind="tournamentExample" name="usage-tournament" />

Cache the image URL long-term here too. Keeping a hashed `src` avoids broken crests if the package catalog moves on.

Browse the full [Leagues & Competitions](/guide/catalog/leagues) and [Clubs](/guide/catalog/clubs) catalogs. Other helpers are listed under [Other functions](/guide/functions/).

## Without a wrapper

Use `getFootballLogoUrl()` from the core package when you are not using React, Vue, Svelte, or Astro. It returns the public PNG URL; put that on an `img`. See [getFootballLogoUrl](/guide/functions/get-football-logo-url).

```ts
import { getFootballLogoUrl } from "football-logos";

const src = getFootballLogoUrl({
  country: "germany",
  club: "bayern-munchen",
});
```

```jsx
<img src={src} width={48} height={48} alt="Bayern München" />
```

League badges use the same `club` attribute:

```ts
getFootballLogoUrl({ country: "england", club: "english-premier-league" });
getFootballLogoUrl({ country: "tournaments", club: "uefa-champions-league" });
getFootballLogoUrl({ country: "germany" });
```

## Caching

The `src` is a content-hashed PNG, so browsers can reuse it across page loads. `FootballLogo` sets `width`, `height`, `decoding="async"`, and `loading="lazy"` by default.

Color variants (`black` / `white`) can come later as a `variant` prop, next to CSS `style`.
