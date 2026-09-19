import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import CatalogSlug from "./CatalogSlug.vue";
import FrameworkExample from "./FrameworkExample.vue";
import HeroVersion from "./HeroVersion.vue";
import InstallCommand from "./InstallCommand.vue";
import type { Theme } from "vitepress";
import "./custom.css";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("FrameworkExample", FrameworkExample);
    app.component("CatalogSlug", CatalogSlug);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "home-hero-before": () => h(HeroVersion),
      "home-hero-image": () => h(InstallCommand),
    });
  },
};

export default theme;
