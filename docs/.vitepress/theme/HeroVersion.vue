<script setup lang="ts">
import { onMounted } from "vue";
import pkg from "../../../package.json";

const version = pkg.version;
const changelog =
  "https://github.com/julianYaman/football-logos/blob/main/CHANGELOG.md";

onMounted(() => {
  const name = document.querySelector(".VPHero .name");
  const badge = document.querySelector<HTMLElement>(".hero-version");
  if (name && badge && badge.parentElement !== name.parentElement) {
    name.insertAdjacentElement("afterend", badge);
  }
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
