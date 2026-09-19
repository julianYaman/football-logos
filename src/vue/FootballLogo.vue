<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { LogoResolveError, resolveFootballLogo } from "football-logos";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    country: string;
    club?: string | null;
    size?: number;
    alt?: string;
    loading?: "lazy" | "eager";
    decoding?: "async" | "auto" | "sync";
  }>(),
  {
    size: 48,
    loading: "lazy",
    decoding: "async",
  },
);

const attrs = useAttrs();

const resolved = computed(() => {
  try {
    return resolveFootballLogo({
      country: props.country,
      club: props.club,
    });
  } catch (error) {
    if (error instanceof LogoResolveError) return null;
    throw error;
  }
});
</script>

<template>
  <img
    v-if="resolved"
    v-bind="attrs"
    :src="resolved.url"
    :width="size"
    :height="size"
    :alt="alt ?? resolved.name"
    :loading="loading"
    :decoding="decoding"
  />
  <slot v-else name="fallback">
    <span
      v-bind="attrs"
      role="img"
      :aria-label="alt ?? 'Unknown football logo'"
      :style="{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '999px',
        background: 'color-mix(in srgb, currentColor 12%, transparent)',
      }"
    />
  </slot>
</template>
