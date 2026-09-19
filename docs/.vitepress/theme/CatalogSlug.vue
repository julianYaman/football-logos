<script setup lang="ts">
import { onUnmounted, ref } from "vue";

const props = defineProps<{
  value: string;
}>();

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value);
  } catch {
    const field = document.createElement("textarea");
    field.value = props.value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  copied.value = true;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    copied.value = false;
  }, 1400);
}

onUnmounted(() => {
  clearTimeout(resetTimer);
});
</script>

<template>
  <span class="catalog-slug-copy" :class="{ copied }">
    <code>{{ value }}</code>
    <button
      type="button"
      class="catalog-slug-copy-btn"
      :aria-label="copied ? 'Copied' : `Copy ${value}`"
      :title="copied ? 'Copied' : 'Copy'"
      @click.stop="copy"
    >
      <svg
        v-if="copied"
        class="catalog-slug-copy-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L7 9.94l5.72-5.72a.75.75 0 0 1 1.06 0Z"
        />
      </svg>
      <svg
        v-else
        class="catalog-slug-copy-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M5.75 2A1.75 1.75 0 0 0 4 3.75v8.5C4 13.216 4.784 14 5.75 14h6.5A1.75 1.75 0 0 0 14 12.25v-8.5A1.75 1.75 0 0 0 12.25 2h-6.5ZM5.5 3.75a.25.25 0 0 1 .25-.25h6.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25v-8.5ZM2 6.75A.75.75 0 0 1 2.75 6H3.5v7.25c0 .966.784 1.75 1.75 1.75h6.5A.75.75 0 0 1 11 16H5.25A3.25 3.25 0 0 1 2 12.75V6.75Z"
        />
      </svg>
    </button>
  </span>
</template>
