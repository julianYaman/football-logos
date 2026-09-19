<script setup lang="ts">
import { onMounted, ref } from "vue";
import { highlightCode } from "./highlight";

const props = defineProps<{
  code: string;
  lang: string;
  label?: string;
}>();

const html = ref("");
const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | undefined;

onMounted(async () => {
  html.value = await highlightCode(props.code, props.lang);
});

async function copy() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div :class="['language-' + lang, 'vp-adaptive-theme']">
    <button
      type="button"
      title="Copy Code"
      class="copy"
      :class="{ copied }"
      @click="copy"
    />
    <span class="lang">{{ label ?? lang }}</span>
    <div v-if="html" class="highlight" v-html="html" />
    <pre v-else><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.highlight :deep(pre) {
  margin: 0;
  padding: 20px 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  overflow-x: hidden;
}

.highlight :deep(code) {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

pre {
  margin: 0;
  padding: 20px 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  overflow-x: hidden;
}

pre code {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
