import type {
  Catalog,
  CountryRecord,
  LeagueRecord,
  LookupInput,
  ResolvedLogo,
} from "./types.js";

export const CDN_SIZE = 512;
export const DEFAULT_ASSET_BASE = "https://assets.football-logos.cc/logos";

export class LogoResolveError extends Error {
  readonly code: "INVALID" | "NOT_FOUND" | "AMBIGUOUS";

  constructor(code: "INVALID" | "NOT_FOUND" | "AMBIGUOUS", message: string) {
    super(message);
    this.name = "LogoResolveError";
    this.code = code;
  }
}

type CountryMatch = {
  country: CountryRecord;
  league: LeagueRecord;
  code: string;
  scoped: boolean;
};

export function resolveFootballLogo(
  input: LookupInput,
  catalog: Catalog,
): ResolvedLogo {
  if (!input?.country) {
    throw new LogoResolveError(
      "INVALID",
      'FootballLogo requires a "country" (slug or ISO code).',
    );
  }

  const match = findCountryMatch(input.country, catalog);
  if (!match) {
    throw new LogoResolveError(
      "NOT_FOUND",
      `Unknown country "${input.country}".`,
    );
  }

  if (input.club == null || input.club === "") {
    return leagueLogo(match.country, match.league, match.code);
  }

  const club = findClub(
    input.club,
    match.country,
    match.scoped ? match.league.slug : undefined,
  );
  if (club) {
    return {
      kind: "club",
      country: match.country.slug,
      iso2: match.code,
      slug: club.slug,
      name: club.name,
      hash: club.hash,
      pagePath: `/${match.country.slug}/${club.slug}/`,
      league: club.league || undefined,
    };
  }

  const league = findLeague(input.club, match.country);
  if (league) {
    return leagueLogo(
      match.country,
      league,
      league.code ?? match.country.iso2,
    );
  }

  throw new LogoResolveError(
    "NOT_FOUND",
    `Unknown club "${input.club}" in ${match.scoped ? match.league.name : match.country.name}.`,
  );
}

export function getFootballLogoUrl(
  input: LookupInput & { assetBase?: string },
  catalog: Catalog,
): string {
  const record = resolveFootballLogo(input, catalog);
  const base = input.assetBase ?? catalog.assetBase ?? DEFAULT_ASSET_BASE;
  return `${base}/${record.country}/${CDN_SIZE}x${CDN_SIZE}/${record.slug}.${record.hash}.png`;
}

export function listCountries(catalog: Catalog) {
  return Object.values(catalog.countries)
    .map((country) => ({
      slug: country.slug,
      iso2: country.iso2,
      name: country.name,
      defaultLeague: country.defaultLeague,
      clubCount: Object.keys(country.clubs).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listLeagues(catalog: Catalog) {
  return Object.values(catalog.countries)
    .flatMap((country) =>
      Object.values(country.leagues).map((league) => ({
        countrySlug: country.slug,
        countryName: country.name,
        iso2: league.code ?? country.iso2,
        code: league.code,
        slug: league.slug,
        name: league.name,
        clubCount: Object.values(country.clubs).filter(
          (club) => club.league === league.slug,
        ).length,
      })),
    )
    .sort(
      (a, b) =>
        a.countryName.localeCompare(b.countryName) ||
        a.name.localeCompare(b.name),
    );
}

export function listLogos(catalog: Catalog, countryCode: string) {
  const match = findCountryMatch(countryCode, catalog);
  if (!match) return [];
  const logos: Array<{
    kind: "club" | "league";
    country: string;
    slug: string;
    name: string;
    league?: string;
  }> = [];

  const leagues = match.scoped
    ? [match.league]
    : Object.values(match.country.leagues);
  for (const league of leagues) {
    logos.push({
      kind: "league",
      country: match.country.slug,
      slug: league.slug,
      name: league.name,
    });
  }

  for (const club of Object.values(match.country.clubs)) {
    if (match.scoped && club.league !== match.league.slug) continue;
    logos.push({
      kind: "club",
      country: match.country.slug,
      slug: club.slug,
      name: club.name,
      league: club.league || undefined,
    });
  }
  return logos;
}

export function hasLogo(input: LookupInput, catalog: Catalog): boolean {
  try {
    resolveFootballLogo(input, catalog);
    return true;
  } catch (error) {
    if (error instanceof LogoResolveError) return false;
    throw error;
  }
}

export function findCountry(
  countryInput: string,
  catalog: Catalog,
): CountryRecord | undefined {
  return findCountryMatch(countryInput, catalog)?.country;
}

function leagueLogo(
  country: CountryRecord,
  league: LeagueRecord,
  iso2: string,
): ResolvedLogo {
  return {
    kind: "league",
    country: country.slug,
    iso2,
    slug: league.slug,
    name: league.name,
    hash: league.hash,
    pagePath: `/${country.slug}/${league.slug}/`,
  };
}

function findCountryMatch(
  countryInput: string,
  catalog: Catalog,
): CountryMatch | undefined {
  const key = normalizeKey(countryInput);
  if (!key) return undefined;

  const bySlug = catalog.countries[key];
  if (bySlug) return primaryMatch(bySlug);

  const byCountryCode = Object.values(catalog.countries).find(
    (country) =>
      normalizeKey(country.iso2) === key || normalizeKey(country.name) === key,
  );
  if (byCountryCode) return primaryMatch(byCountryCode);

  const codeHits: CountryMatch[] = [];
  const slugHits: CountryMatch[] = [];
  for (const country of Object.values(catalog.countries)) {
    for (const league of Object.values(country.leagues)) {
      const scoped = {
        country,
        league,
        code: league.code ?? country.iso2,
        scoped: true,
      };
      if (normalizeKey(league.code ?? "") === key) codeHits.push(scoped);
      if (normalizeKey(league.slug) === key) slugHits.push(scoped);
    }
  }
  if (codeHits.length === 1) return codeHits[0];
  if (codeHits.length > 1) {
    throw new LogoResolveError(
      "AMBIGUOUS",
      `Country "${countryInput}" matches multiple leagues. Use the football-logos.cc country slug.`,
    );
  }
  if (slugHits.length === 1) return slugHits[0];
  if (slugHits.length > 1) {
    throw new LogoResolveError(
      "AMBIGUOUS",
      `Country "${countryInput}" matches ${slugHits
        .map((hit) => hit.country.slug)
        .join(", ")}. Use the country slug.`,
    );
  }

  return undefined;
}

function primaryMatch(country: CountryRecord): CountryMatch | undefined {
  const league = country.leagues[country.defaultLeague];
  if (!league) return undefined;
  return {
    country,
    league,
    code: league.code ?? country.iso2,
    scoped: false,
  };
}

function findClub(
  clubInput: string,
  country: CountryRecord,
  leagueSlug?: string,
) {
  const key = normalizeKey(clubInput);
  if (!key) return undefined;
  const pool = Object.values(country.clubs).filter((club) =>
    leagueSlug ? club.league === leagueSlug : true,
  );
  const bySlug = country.clubs[key];
  if (bySlug && (!leagueSlug || bySlug.league === leagueSlug)) return bySlug;
  const matches = pool.filter((club) => normalizeKey(club.name) === key);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new LogoResolveError(
      "AMBIGUOUS",
      `Club "${clubInput}" is ambiguous in ${country.name}: ${matches
        .map((club) => club.slug)
        .join(", ")}. Use the football-logos.cc slug.`,
    );
  }
  return undefined;
}

function findLeague(leagueInput: string, country: CountryRecord) {
  const key = normalizeKey(leagueInput);
  if (!key) return undefined;
  const bySlug = country.leagues[key];
  if (bySlug) return bySlug;
  const matches = Object.values(country.leagues).filter(
    (league) =>
      normalizeKey(league.name) === key ||
      normalizeKey(league.code ?? "") === key,
  );
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new LogoResolveError(
      "AMBIGUOUS",
      `League "${leagueInput}" is ambiguous in ${country.name}: ${matches
        .map((league) => league.slug)
        .join(", ")}. Use the football-logos.cc slug.`,
    );
  }
  return undefined;
}

export function normalizeKey(value: string): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
