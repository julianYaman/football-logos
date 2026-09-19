<script setup lang="ts">
import CodeBlock from "./CodeBlock.vue";
import FrameworkTabs from "./FrameworkTabs.vue";

const installCommand = "npm install football-logos";

const usageTabs = [
  {
    id: "react",
    label: "React",
    icon: "react" as const,
    lang: "tsx",
    code: '<FootballLogo country="germany" club="bayern-munchen" />',
  },
  {
    id: "vue",
    label: "Vue",
    icon: "vue" as const,
    lang: "vue",
    code: '<FootballLogo country="germany" club="bayern-munchen" />',
  },
  {
    id: "svelte",
    label: "Svelte",
    icon: "svelte" as const,
    lang: "svelte",
    code: '<FootballLogo country="germany" club="bayern-munchen" />',
  },
  {
    id: "astro",
    label: "Astro",
    icon: "astro" as const,
    lang: "astro",
    code: '<FootballLogo country="germany" club="bayern-munchen" />',
  },
];
</script>

<template>
  <div class="hero-install vp-doc">
    <CodeBlock :code="installCommand" lang="sh" label="sh" />
    <FrameworkTabs :tabs="usageTabs" name="hero-usage" />
  </div>
</template>

<style scoped>
.hero-install {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 34rem;
  text-align: left;
}

.hero-install :deep([class*="language-"]) {
  margin: 0;
}

.hero-install :deep(button.copy) {
  opacity: 1;
}
</style>
