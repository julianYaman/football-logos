import { describe, expect, it } from "vitest";
import {
  applyNewLogos,
  extract512Hash,
  extractNewLogos,
  parseNewLogoDate,
  recentNewLogos,
  resolveCountrySlug,
} from "./catalog-parse.mjs";

const directory = new Map([
  ["france", { slug: "france", name: "France", iso2: "FR" }],
  ["england", { slug: "england", name: "England", iso2: "ENG" }],
  ["uae", { slug: "uae", name: "United Arab Emirates", iso2: "AE" }],
  ["tournaments", { slug: "tournaments", name: "Tournaments", iso2: "INT" }],
]);

function getSpec(slug) {
  const resolved = resolveCountrySlug(slug, directory) ?? slug;
  if (resolved === "tournaments") {
    return {
      slug: "tournaments",
      iso2: "INT",
      name: "Tournaments",
      defaultLeague: "uefa-champions-league",
      allAsLeagues: true,
    };
  }
  const entry = directory.get(resolved);
  if (!entry) throw new Error(`Unknown country slug "${slug}"`);
  return {
    slug: entry.slug,
    iso2: entry.iso2,
    name: entry.name,
    defaultLeague: entry.slug === "france" ? "ligue-1" : "english-premier-league",
  };
}

const countries = {
  france: {
    slug: "france",
    iso2: "FR",
    name: "France",
    defaultLeague: "ligue-1",
    leagues: {
      "ligue-1": {
        slug: "ligue-1",
        name: "Ligue 1",
        hash: "aaa11111",
        code: "FR",
      },
    },
    clubs: {
      "paris-saint-germain": {
        slug: "paris-saint-germain",
        name: "Paris Saint-Germain",
        hash: "bbb22222",
        league: "ligue-1",
      },
    },
  },
  tournaments: {
    slug: "tournaments",
    iso2: "INT",
    name: "Tournaments",
    defaultLeague: "uefa-champions-league",
    leagues: {
      "uefa-champions-league": {
        slug: "uefa-champions-league",
        name: "UEFA Champions League",
        hash: "ccc33333",
        code: "UCL",
      },
    },
    clubs: {},
  },
};

describe("extractNewLogos", () => {
  it("reads country, slug, and 512 hash from listing cards", () => {
    const html = `
      <h2>September 20, 2026</h2>
      <div data-logo-id="as-brest">
        <a href="/france/as-brest/">AS Brest</a>
        <input value="512::abcdef12" />
        <h3>AS Brest</h3>
      </div>
      <div data-logo-id="grimsby-borough">
        <a href="/england/grimsby-borough/">Grimsby Borough</a>
        <img src="https://assets.football-logos.cc/logos/england/512x512/grimsby-borough.fedcba98.png" />
        <h3>Grimsby Borough</h3>
      </div>
    `;
    expect(extractNewLogos(html, directory)).toEqual([
      {
        country: "france",
        slug: "as-brest",
        name: "AS Brest",
        hash: "abcdef12",
        date: "September 20, 2026",
      },
      {
        country: "england",
        slug: "grimsby-borough",
        name: "Grimsby Borough",
        hash: "fedcba98",
        date: "September 20, 2026",
      },
    ]);
  });

  it("does not take the next card's 512 hash", () => {
    const html = `
      <h2>September 20, 2026</h2>
      <div data-logo-id="club-a">
        <a href="/france/club-a/">Club A</a>
        <img src="https://assets.football-logos.cc/logos/france/512x512/club-a.aaaa1111.png" />
        <h3>Club A</h3>
      </div>
      <div data-logo-id="club-b">
        <a href="/france/club-b/">Club B</a>
        <input value="512::bbbb2222" />
        <h3>Club B</h3>
      </div>
    `;
    expect(extractNewLogos(html, directory)).toEqual([
      {
        country: "france",
        slug: "club-a",
        name: "Club A",
        hash: "aaaa1111",
        date: "September 20, 2026",
      },
      {
        country: "france",
        slug: "club-b",
        name: "Club B",
        hash: "bbbb2222",
        date: "September 20, 2026",
      },
    ]);
  });

  it("falls back to logo page links when cards omit data-logo-id", () => {
    const html = `
      <a href="/france/as-aixoise/">
        <img src="//assets.football-logos.cc/logos/france/512x512/as-aixoise.1111aaaa.png" alt="AS Aixoise" />
      </a>
      <a href="/license/terms/">ignore</a>
    `;
    expect(extractNewLogos(html, directory)).toEqual([
      {
        country: "france",
        slug: "as-aixoise",
        name: "AS Aixoise",
        hash: "1111aaaa",
        date: undefined,
      },
    ]);
  });
});

describe("applyNewLogos", () => {
  it("updates hashes, adds clubs, and treats new tournaments as leagues", () => {
    const result = applyNewLogos(
      countries,
      [
        {
          country: "france",
          slug: "paris-saint-germain",
          name: "Paris Saint-Germain",
          hash: "ddd44444",
        },
        {
          country: "france",
          slug: "as-brest",
          name: "AS Brest",
          hash: "abcdef12",
        },
        {
          country: "tournaments",
          slug: "arabian-gulf-cup",
          name: "Arabian Gulf Cup",
          hash: "eee55555",
        },
      ],
      getSpec,
    );

    expect(result.stats).toEqual({ added: 2, updated: 1 });
    expect(result.changed.sort()).toEqual(["france", "tournaments"]);
    expect(result.countries.france.clubs["paris-saint-germain"].hash).toBe(
      "ddd44444",
    );
    expect(result.countries.france.clubs["as-brest"]).toMatchObject({
      slug: "as-brest",
      name: "AS Brest",
      hash: "abcdef12",
      league: "ligue-1",
    });
    expect(result.countries.tournaments.leagues["arabian-gulf-cup"]).toMatchObject({
      slug: "arabian-gulf-cup",
      name: "Arabian Gulf Cup",
      hash: "eee55555",
    });
    expect(result.countries.france.clubs["paris-saint-germain"].league).toBe(
      "ligue-1",
    );
  });

  it("does not mark a country changed when hashes already match", () => {
    const result = applyNewLogos(
      countries,
      [
        {
          country: "france",
          slug: "paris-saint-germain",
          name: "Paris Saint-Germain",
          hash: "bbb22222",
        },
      ],
      getSpec,
    );
    expect(result.changed).toEqual([]);
    expect(result.stats).toEqual({ added: 0, updated: 0 });
    expect(result.countries.france).toBe(countries.france);
  });

  it("reports unknown countries instead of inventing catalog entries", () => {
    const result = applyNewLogos(
      countries,
      [
        {
          country: "atlantis",
          slug: "fc-made-up",
          name: "FC Made Up",
          hash: "ffff0000",
        },
      ],
      getSpec,
    );
    expect(result.unknownCountries).toHaveLength(1);
    expect(result.changed).toEqual([]);
  });
});

describe("recentNewLogos", () => {
  const now = new Date("2026-09-20T06:00:00Z");

  it("keeps today, yesterday, and undated logos", () => {
    const { recent, older } = recentNewLogos(
      [
        { slug: "today", date: "September 20, 2026" },
        { slug: "yesterday", date: "September 19, 2026" },
        { slug: "two-days-ago", date: "September 18, 2026" },
        { slug: "undated" },
      ],
      { now },
    );
    expect(recent.map((logo) => logo.slug)).toEqual([
      "today",
      "yesterday",
      "undated",
    ]);
    expect(older.map((logo) => logo.slug)).toEqual(["two-days-ago"]);
  });

  it("parses football-logos.cc day headings as UTC calendar dates", () => {
    expect(parseNewLogoDate("September 20, 2026")).toEqual(
      new Date("2026-09-20T00:00:00Z"),
    );
    expect(parseNewLogoDate("July 13, 2026")).toEqual(
      new Date("2026-07-13T00:00:00Z"),
    );
    expect(parseNewLogoDate("not a date")).toBeNull();
  });
});

describe("extract512Hash", () => {
  it("prefers the matching 512 asset filename over other copy fields", () => {
    const html = `
      <input value="256::zzzzzzzz" />
      <img src="https://assets.football-logos.cc/logos/france/512x512/as-brest.0f78d10f.png" />
    `;
    expect(extract512Hash(html, "france", "as-brest")).toBe("0f78d10f");
    expect(extract512Hash(`<input value="512::abcdef12" />`, "france", "as-brest")).toBe(
      "abcdef12",
    );
  });
});
