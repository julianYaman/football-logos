<script setup lang="ts">
import { onMounted } from "vue";
import pkg from "../../../package.json";

const version = pkg.version;
const changelog =
  "https://github.com/julianYaman/football-logos/blob/main/CHANGELOG.md";

onMounted(() => {
  const name = document.querySelector<HTMLElement>(".VPHero .name");
  const badge = document.querySelector<HTMLElement>(".hero-version");
  if (!name || !badge) return;
  if (name.parentElement?.classList.contains("hero-title-row")) return;

  const row = document.createElement("span");
  row.className = "hero-title-row";
  name.replaceWith(row);
  row.append(name, badge);
});
</script>

<template>
  <a
    class="hero-version"
    :href="changelog"
    target="_blank"
    rel="noreferrer"
  >v{{ version }}</a>
</template>
