import { describe, expect, it } from "vitest";
import fallback from "./catalog.fallback.json";
import { getFootballLogoUrl, resolveFootballLogo } from "./resolve.js";
import type { Catalog } from "./types.js";

const catalog = fallback as Catalog;

describe("seeded catalog", () => {
  it("covers every football-logos.cc country plus tournaments", () => {
    const slugs = Object.keys(catalog.countries);
    expect(slugs).toHaveLength(229);
    expect(slugs).toEqual(expect.arrayContaining([
      "afghanistan",
      "argentina",
      "brazil",
      "england",
      "germany",
      "japan",
      "scotland",
      "senegal",
      "tournaments",
      "usa",
    ]));
    expect(slugs).not.toContain("national-teams");
    expect(catalog.countries.england!.iso2).toBe("ENG");
    expect(catalog.countries.usa!.iso2).toBe("US");
    expect(catalog.countries.scotland!.iso2).toBe("SCO");
  });

  it("uses unique ISO codes", () => {
    const iso2 = Object.values(catalog.countries).map((country) => country.iso2);
    expect(new Set(iso2).size).toBe(iso2.length);
    expect(iso2).not.toContain("GB");
  });

  it("does not store club nicknames", () => {
    for (const country of Object.values(catalog.countries)) {
      for (const club of Object.values(country.clubs)) {
        expect(club).not.toHaveProperty("aliases");
      }
    }
  });

  it("resolves a league badge from country only", () => {
    const logo = resolveFootballLogo({ country: "DE" }, catalog);
    expect(logo.kind).toBe("league");
    expect(logo.slug).toBe("bundesliga");
    expect(getFootballLogoUrl({ country: "DE" }, catalog)).toContain(
      "/germany/512x512/bundesliga.",
    );
  });

  it("resolves league badges through the club attribute", () => {
    expect(
      resolveFootballLogo(
        { country: "germany", club: "bundesliga" },
        catalog,
      ).kind,
    ).toBe("league");
    expect(
      resolveFootballLogo(
        { country: "germany", club: "2-bundesliga" },
        catalog,
      ).slug,
    ).toBe("2-bundesliga");
    expect(
      resolveFootballLogo(
        { country: "england", club: "english-premier-league" },
        catalog,
      ).slug,
    ).toBe("english-premier-league");
    expect(
      resolveFootballLogo({ country: "france", club: "ligue-1" }, catalog).slug,
    ).toBe("ligue-1");
  });

  it("resolves tournament badges under country tournaments", () => {
    expect(
      resolveFootballLogo(
        { country: "tournaments", club: "uefa-champions-league" },
        catalog,
      ),
    ).toMatchObject({
      kind: "league",
      country: "tournaments",
      slug: "uefa-champions-league",
    });
    expect(
      resolveFootballLogo(
        { country: "tournaments", club: "fifa-world-cup-2026" },
        catalog,
      ).slug,
    ).toBe("fifa-world-cup-2026");
    expect(
      getFootballLogoUrl(
        { country: "tournaments", club: "uefa-europa-league" },
        catalog,
      ),
    ).toContain("/tournaments/512x512/uefa-europa-league.");
    expect(
      Object.keys(catalog.countries.tournaments!.leagues).length,
    ).toBeGreaterThan(14);
  });

  it("indexes clubs beyond the top two German and English divisions", () => {
    expect(
      catalog.countries.germany!.clubs["fc-einheit-wernigerode"],
    ).toMatchObject({
      slug: "fc-einheit-wernigerode",
      name: "FC Einheit Wernigerode",
    });
    expect(Object.keys(catalog.countries.germany!.clubs).length).toBeGreaterThan(
      36,
    );
    expect(Object.keys(catalog.countries.england!.clubs).length).toBeGreaterThan(
      44,
    );
  });

  it("indexes Brazilian and US clubs", () => {
    expect(catalog.countries.brazil!.clubs.flamengo).toMatchObject({
      slug: "flamengo",
    });
    expect(catalog.countries.brazil!.clubs.corinthians).toMatchObject({
      slug: "corinthians",
    });
    expect(resolveFootballLogo({ country: "BR" }, catalog).slug).toBe(
      "brazilian-serie-a",
    );
    expect(
      resolveFootballLogo({ country: "usa", club: "atlanta-united" }, catalog)
        .slug,
    ).toBe("atlanta-united");
    expect(resolveFootballLogo({ country: "US" }, catalog).slug).toBe("mls");
    expect(Object.keys(catalog.countries.brazil!.clubs).length).toBeGreaterThan(
      50,
    );
    expect(Object.keys(catalog.countries.usa!.clubs).length).toBeGreaterThan(20);
  });

  it("indexes clubs and national teams across the rest of the catalog", () => {
    expect(catalog.countries.argentina!.clubs["boca-juniors"]).toMatchObject({
      slug: "boca-juniors",
    });
    expect(
      resolveFootballLogo({ country: "scotland", club: "celtic" }, catalog).slug,
    ).toBe("celtic");
    expect(resolveFootballLogo({ country: "JP" }, catalog).slug).toBe("j-league");
    expect(resolveFootballLogo({ country: "senegal" }, catalog)).toMatchObject({
      kind: "league",
      slug: "senegal-national-team",
    });
    expect(
      resolveFootballLogo(
        { country: "germany", club: "germany-national-team" },
        catalog,
      ).slug,
    ).toBe("germany-national-team");
    expect(() => resolveFootballLogo({ country: "ligue-1" }, catalog)).toThrow(
      /algeria, france, tunisia/i,
    );
  });
});
