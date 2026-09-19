import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), svelte({ preprocess: vitePreprocess() })],
  resolve: {
    alias: {
      "football-logos": fileURLToPath(
        new URL("./src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [
      ["src/react/**", "jsdom"],
      ["src/vue/**", "jsdom"],
      ["src/svelte/**", "jsdom"],
    ],
  },
});
