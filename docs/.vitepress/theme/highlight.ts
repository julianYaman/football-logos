import { createHighlighter, type Highlighter } from "shiki";

const langAliases: Record<string, string> = {
  sh: "bash",
  shell: "bash",
};

let highlighter: Highlighter | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["bash", "tsx", "vue", "svelte", "astro", "typescript"],
    });
  }
  return highlighter;
}

export async function highlightCode(code: string, lang: string) {
  const resolvedLang = langAliases[lang] ?? lang;
  const instance = await getHighlighter();
  return instance.codeToHtml(code, {
    lang: resolvedLang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      {
        code(node) {
          this.addClassToHast(node, "vp-code");
        },
      },
    ],
  });
}
