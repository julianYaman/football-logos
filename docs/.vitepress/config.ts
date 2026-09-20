import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  title: "football-logos",
  titleTemplate: ":title · football-logos",
  description:
    "Hotlink football club and league logos from football-logos.cc.",
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    [
      "meta",
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
    ],
    [
      "meta",
      {
        name: "theme-color",
        content: "#0f172a",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    [
      "script",
      {
        defer: "",
        "data-domain": "football-logos.yamanlabs.com",
        src: "https://analytics.yamanlabs.com/js/script.js",
      },
    ],
  ],
  themeConfig: {
    logo: "/favicon-96x96.png",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Catalog", link: "/guide/catalog/leagues" },
      {
        text: "Changelog",
        link: "https://github.com/julianYaman/football-logos/blob/main/CHANGELOG.md",
      },
      { text: "Disclaimer", link: "/guide/disclaimer" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "Usage", link: "/guide/usage" },
        ],
      },
      {
        text: "Other functions",
        link: "/guide/functions/",
        items: [
          { text: "getFootballLogoUrl", link: "/guide/functions/get-football-logo-url" },
          { text: "resolveFootballLogo", link: "/guide/functions/resolve-football-logo" },
          { text: "hasLogo", link: "/guide/functions/has-logo" },
          { text: "listCountries", link: "/guide/functions/list-countries" },
          { text: "listLeagues", link: "/guide/functions/list-leagues" },
          { text: "listLogos", link: "/guide/functions/list-logos" },
          { text: "loadCatalog", link: "/guide/functions/load-catalog" },
          { text: "startCatalogRefresh", link: "/guide/functions/start-catalog-refresh" },
          { text: "getCatalog", link: "/guide/functions/get-catalog" },
          { text: "setCatalog", link: "/guide/functions/set-catalog" },
          { text: "setCatalogBaseUrl", link: "/guide/functions/set-catalog-base-url" },
        ],
      },
      {
        text: "Catalog",
        items: [
          { text: "Leagues & Competitions", link: "/guide/catalog/leagues" },
          { text: "Clubs", link: "/guide/catalog/clubs" },
        ],
      },
      {
        text: "Troubleshooting",
        items: [
          {
            text: "Image does not show up",
            link: "/guide/troubleshooting/image-does-not-show-up",
          },
        ],
      },
      {
        items: [
          { text: "Disclaimer", link: "/guide/disclaimer" },
          { text: "Credits", link: "/guide/credits" },
          { text: "Contact", link: "/guide/contact" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/julianYaman/football-logos" },
    ],
    footer: {
      message:
        '<a href="https://yaman.pro">Made by Julian Yaman</a> · <a href="https://github.com/julianYaman/football-logos/blob/main/LICENSE">License</a> · Not affiliated with football-logos.cc · <a href="/guide/credits">Credits</a> · <a href="/guide/contact">Contact</a> · <a href="https://ballguessr.eu/impressum">Legal Notice</a>',
    },
  },
  vite: {
    resolve: {
      alias: {
        "football-logos": fileURLToPath(
          new URL("../../src/index.ts", import.meta.url),
        ),
      },
    },
  },
});
