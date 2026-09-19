import { readFileSync } from "node:fs";
import { transform } from "@astrojs/compiler";
import { describe, expect, it } from "vitest";
import {
  getFootballLogoUrl,
  LogoResolveError,
  resolveFootballLogo,
} from "../../src/index.js";

const source = readFileSync(new URL("./FootballLogo.astro", import.meta.url), "utf8");

function render(country: string, club?: string | null, size = 48) {
  let src: string | null = null;
  let name = "Unknown football logo";
  try {
    const record = resolveFootballLogo({ country, club });
    src = getFootballLogoUrl({ country, club });
    name = record.name;
  } catch (error) {
    if (!(error instanceof LogoResolveError)) throw error;
  }
  return { src, name, size };
}

describe("FootballLogo (Astro)", () => {
  it("compiles and uses the public resolver", async () => {
    const result = await transform(source, { filename: "FootballLogo.astro" });
    expect(result.code).toContain("getFootballLogoUrl");
    expect(result.code).toContain("resolveFootballLogo");
    expect(source).toContain("<img");
  });

  it("renders a hashed PNG for a known club", () => {
    const view = render("germany", "bayern-munchen", 48);
    expect(view.src).toContain(
      "https://assets.football-logos.cc/logos/germany/512x512/bayern-munchen.",
    );
    expect(view.name).toBeTruthy();
  });

  it("falls back when the lookup fails", () => {
    const view = render("not-a-country");
    expect(view.src).toBeNull();
    expect(view.name).toBe("Unknown football logo");
  });
});
