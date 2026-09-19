<script setup>
import { computed } from "vue";
import { listCountries, listLeagues, listLogos } from "football-logos";

const SITE = "https://football-logos.cc";

const countries = computed(() => {
  const leagues = listLeagues();
  return listCountries()
    .map((country) => {
      const names = Object.fromEntries(
        leagues
          .filter((league) => league.countrySlug === country.slug)
          .map((league) => [league.slug, league.name]),
      );
      const clubs = listLogos(country.slug).filter((logo) => logo.kind === "club");
      const grouped = new Map();
      for (const club of clubs) {
        const key = club.league || "other";
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(club);
      }
      const preferred = [
        country.defaultLeague,
        ...Object.keys(names).filter((slug) => slug !== country.defaultLeague),
        "other",
      ];
      const groups = [];
      const seen = new Set();
      for (const key of preferred) {
        const items = grouped.get(key);
        if (!items?.length) continue;
        seen.add(key);
        groups.push({
          key,
          name: key === "other" ? "Other" : names[key] ?? key,
          clubs: items,
        });
      }
      for (const [key, items] of grouped) {
        if (seen.has(key)) continue;
        groups.push({ key, name: names[key] ?? key, clubs: items });
      }
      return { ...country, groups, href: `${SITE}/${country.slug}/` };
    })
    .filter((country) => country.groups.length);
});

const tag = '<FootballLogo country="germany" club="bayern-munchen" size={48} />';
const clubExample = {
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

# Clubs

Pass a `country` slug and the club slug as `club`. Crests stay on [football-logos.cc](https://football-logos.cc); this page is the identifier index.

<FrameworkExample v-bind="clubExample" name="catalog-club" />

<div
  v-for="country in countries"
  :key="country.slug"
  class="catalog-section"
>
  <h2>
    {{ country.name }}
    <span class="catalog-heading-slug">{{ country.slug }}</span>
  </h2>
  <p class="catalog-browse">
    <a :href="country.href" target="_blank" rel="noreferrer">Browse {{ country.name }} on football-logos.cc</a>
  </p>
  <div v-for="group in country.groups" :key="group.key">
    <h3>{{ group.name }}</h3>
    <ul class="catalog-slug-list">
      <li v-for="club in group.clubs" :key="club.slug">
        <a
          :href="`${SITE}/${country.slug}/${club.slug}/`"
          target="_blank"
          rel="noreferrer"
        >{{ club.name }}</a>
        <span class="catalog-slug">{{ club.slug }}</span>
      </li>
    </ul>
  </div>
</div>
