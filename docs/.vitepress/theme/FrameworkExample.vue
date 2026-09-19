<script setup lang="ts">
import FrameworkTabs from "./FrameworkTabs.vue";

const props = defineProps<{
  react: string;
  vue: string;
  svelte: string;
  astro: string;
  name?: string;
}>();

const tabs = [
  {
    id: "react",
    label: "React",
    icon: "react" as const,
    lang: "tsx",
    code: props.react,
  },
  {
    id: "vue",
    label: "Vue",
    icon: "vue" as const,
    lang: "vue",
    code: props.vue,
  },
  {
    id: "svelte",
    label: "Svelte",
    icon: "svelte" as const,
    lang: "svelte",
    code: props.svelte,
  },
  {
    id: "astro",
    label: "Astro",
    icon: "astro" as const,
    lang: "astro",
    code: props.astro,
  },
];
</script>

<template>
  <FrameworkTabs :tabs="tabs" :name="name" />
</template>
