<script setup>
import { computed } from "vue";
import { listLeagues } from "football-logos";

const SITE = "https://football-logos.cc";
const leagues = computed(() => listLeagues());

const tag = '<FootballLogo country="germany" club="bundesliga" size={48} />';
const leagueExample = {
  react: `import { FootballLogo } from "football-logos/react";\n\n${tag}`,
  vue: [
    "<script setup>",
    '  import FootballLogo from "football-logos/vue";',
    "</" + "script>",
    "",
    tag,
  ].join("\n"),
  svelte: [
    "<script>",
    '  import FootballLogo from "football-logos/svelte";',
    "</" + "script>",
    "",
    tag,
  ].join("\n"),
  astro: [
    "---",
    'import FootballLogo from "football-logos/astro";',
    "---",
    "",
    tag,
  ].join("\n"),
};
</script>

# Leagues & Competitions

Pass the competition slug as `club` under that `country`. International competitions use `country="tournaments"`. National teams use `club="{country}-national-team"`. Crests stay on [football-logos.cc](https://football-logos.cc); this page is the identifier index.

<FrameworkExample v-bind="leagueExample" name="catalog-league" />

<table class="catalog-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>country</th>
      <th>club</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="league in leagues" :key="`${league.countrySlug}/${league.slug}`">
      <td>
        <a
          :href="`${SITE}/${league.countrySlug}/${league.slug}/`"
          target="_blank"
          rel="noreferrer"
        >{{ league.name }}</a>
      </td>
      <td><CatalogSlug :value="league.countrySlug" /></td>
      <td><CatalogSlug :value="league.slug" /></td>
    </tr>
  </tbody>
</table>
