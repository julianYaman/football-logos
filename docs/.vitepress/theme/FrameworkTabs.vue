<script setup lang="ts">
import { ref } from "vue";
import CodeBlock from "./CodeBlock.vue";
import ReactIcon from "./icons/ReactIcon.vue";
import VueIcon from "./icons/VueIcon.vue";
import SvelteIcon from "./icons/SvelteIcon.vue";
import AstroIcon from "./icons/AstroIcon.vue";

export type FrameworkIcon = "react" | "vue" | "svelte" | "astro";

export type FrameworkTab = {
  id: string;
  label: string;
  lang: string;
  code: string;
  icon?: FrameworkIcon;
};

const props = defineProps<{
  tabs: FrameworkTab[];
  name?: string;
}>();

const selected = ref(props.tabs[0]?.id ?? "");

const iconComponents = {
  react: ReactIcon,
  vue: VueIcon,
  svelte: SvelteIcon,
  astro: AstroIcon,
} as const;
</script>

<template>
  <div class="framework-tabs">
    <div class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="tab"
        :class="{ active: selected === tab.id }"
        :aria-selected="selected === tab.id"
        :tabindex="selected === tab.id ? 0 : -1"
        @click="selected = tab.id"
      >
        <component
          :is="tab.icon ? iconComponents[tab.icon] : null"
          v-if="tab.icon"
        />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    <div class="blocks">
      <CodeBlock
        v-for="tab in tabs"
        v-show="selected === tab.id"
        :key="tab.id"
        :code="tab.code"
        :lang="tab.lang"
        :label="tab.lang"
      />
    </div>
  </div>
</template>

<style scoped>
.framework-tabs {
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--vp-code-tab-bg);
}

.tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 8px;
  box-shadow: inset 0 -1px var(--vp-code-tab-divider);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0 12px;
  height: 48px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--vp-code-tab-text-color);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.25s,
    border-color 0.25s;
}

.tab:hover {
  color: var(--vp-code-tab-hover-text-color);
}

.tab.active {
  color: var(--vp-code-tab-active-text-color);
  border-bottom-color: var(--vp-code-tab-active-bar-color);
}

.framework-tabs :deep(.tab-icon) {
  display: block;
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
}

.blocks :deep([class*="language-"]) {
  margin: 0 !important;
  border-radius: 0 !important;
}
</style>
