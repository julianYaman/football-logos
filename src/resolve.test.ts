import { describe, expect, it } from "vitest";
import {
  getFootballLogoUrl,
  hasLogo,
  LogoResolveError,
  resolveFootballLogo,
  setCatalog,
} from "../src/index.js";
import type { Catalog } from "../src/types.js";

const catalog: Catalog = {
  schemaVersion: 1,
  generatedAt: "2026-09-18T00:00:00.000Z",
  contentHash: "test",
  defaultSize: 512,
  assetBase: "https://assets.football-logos.cc/logos",
  countries: {
    germany: {
      slug: "germany",
      iso2: "DE",
      name: "Germany",
      defaultLeague: "bundesliga",
      leagues: {
        bundesliga: {
          slug: "bundesliga",
          name: "Bundesliga",
          hash: "24d9c6f9",
          kind: "league",
          code: "DE",
        },
        "2-bundesliga": {
          slug: "2-bundesliga",
          name: "2. Bundesliga",
          hash: "11755b17",
          kind: "league",
          code: "GER2",
        },
      },
      clubs: {
        "bayern-munchen": {
          slug: "bayern-munchen",
          name: "Bayern Munich",
          hash: "8eda8ecc",
          league: "bundesliga",
        },
        "st-pauli": {
          slug: "st-pauli",
          name: "St Pauli",
          hash: "b84f62fc",
          league: "2-bundesliga",
        },
        "fc-einheit-wernigerode": {
          slug: "fc-einheit-wernigerode",
          name: "FC Einheit Wernigerode",
          hash: "476ea1d8",
          league: "",
        },
      },
    },
    england: {
      slug: "england",
      iso2: "ENG",
      name: "England",
      defaultLeague: "english-premier-league",
      leagues: {
        "english-premier-league": {
          slug: "english-premier-league",
          name: "English Premier League",
          hash: "b597f797",
          kind: "league",
          code: "ENG",
        },
        "efl-championship": {
          slug: "efl-championship",
          name: "EFL Championship",
          hash: "2766b536",
          kind: "league",
          code: "ENG2",
        },
      },
      clubs: {
        liverpool: {
          slug: "liverpool",
          name: "Liverpool FC",
          hash: "bc7f4063",
          league: "english-premier-league",
        },
        wrexham: {
          slug: "wrexham",
          name: "Wrexham AFC",
          hash: "d83ddbbd",
          league: "efl-championship",
        },
      },
    },
  },
};

setCatalog(catalog);

describe("resolveFootballLogo", () => {
  it("resolves a club by country slug and club slug", () => {
    const logo = resolveFootballLogo({
      country: "germany",
      club: "bayern-munchen",
    });
    expect(logo.kind).toBe("club");
    expect(logo.slug).toBe("bayern-munchen");
    expect(logo.hash).toBe("8eda8ecc");
  });

  it("accepts ISO country codes and club names", () => {
    const logo = resolveFootballLogo({ country: "DE", club: "Bayern Munich" });
    expect(logo.slug).toBe("bayern-munchen");
  });

  it("uses the top-flight league when club is omitted", () => {
    const logo = resolveFootballLogo({ country: "DE" });
    expect(logo.kind).toBe("league");
    expect(logo.slug).toBe("bundesliga");
    expect(logo.name).toBe("Bundesliga");
  });

  it("resolves a league through the club attribute", () => {
    const logo = resolveFootballLogo({
      country: "germany",
      club: "bundesliga",
    });
    expect(logo.kind).toBe("league");
    expect(logo.slug).toBe("bundesliga");
    expect(
      getFootballLogoUrl({ country: "germany", club: "2-bundesliga" }),
    ).toBe(
      "https://assets.football-logos.cc/logos/germany/512x512/2-bundesliga.11755b17.png",
    );
    expect(
      resolveFootballLogo({ country: "germany", club: "GER2" }).slug,
    ).toBe("2-bundesliga");
  });

  it("resolves clubs outside the default league", () => {
    const logo = resolveFootballLogo({
      country: "germany",
      club: "fc-einheit-wernigerode",
    });
    expect(logo.kind).toBe("club");
    expect(logo.hash).toBe("476ea1d8");
    expect(hasLogo({ country: "germany", club: "fc-einheit-wernigerode" })).toBe(
      true,
    );
  });

  it("does not map GB to England", () => {
    expect(() => resolveFootballLogo({ country: "GB" })).toThrow(
      LogoResolveError,
    );
  });

  it("builds a hashed 512 CDN URL", () => {
    expect(
      getFootballLogoUrl({ country: "england", club: "liverpool" }),
    ).toBe(
      "https://assets.football-logos.cc/logos/england/512x512/liverpool.bc7f4063.png",
    );
  });

  it("does not resolve club nicknames", () => {
    expect(() =>
      resolveFootballLogo({ country: "DE", club: "Die Roten" }),
    ).toThrow(LogoResolveError);
  });

  it("resolves second divisions by league code and slug", () => {
    expect(resolveFootballLogo({ country: "GER2" }).slug).toBe("2-bundesliga");
    expect(resolveFootballLogo({ country: "2-bundesliga" }).slug).toBe(
      "2-bundesliga",
    );
    expect(resolveFootballLogo({ country: "ENG2" }).slug).toBe(
      "efl-championship",
    );
    expect(resolveFootballLogo({ country: "efl-championship" }).slug).toBe(
      "efl-championship",
    );
    expect(
      getFootballLogoUrl({ country: "GER2" }),
    ).toBe(
      "https://assets.football-logos.cc/logos/germany/512x512/2-bundesliga.11755b17.png",
    );
  });

  it("scopes GER2 and ENG2 club lookup to that division", () => {
    expect(
      resolveFootballLogo({ country: "GER2", club: "st-pauli" }).slug,
    ).toBe("st-pauli");
    expect(() =>
      resolveFootballLogo({ country: "GER2", club: "bayern-munchen" }),
    ).toThrow(LogoResolveError);
    expect(
      resolveFootballLogo({ country: "DE", club: "st-pauli" }).slug,
    ).toBe("st-pauli");
  });
});
