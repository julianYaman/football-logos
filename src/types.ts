export type LogoKind = "club" | "league";

export type LogoResolveCode = "INVALID" | "NOT_FOUND" | "AMBIGUOUS";

export type LookupInput = {
  country: string;
  club?: string | null;
};

export type ClubRecord = {
  slug: string;
  name: string;
  hash: string;
  league: string;
};

export type LeagueRecord = {
  slug: string;
  name: string;
  hash: string;
  kind: "league";
  code?: string;
};

export type CountryRecord = {
  slug: string;
  iso2: string;
  name: string;
  defaultLeague: string;
  leagues: Record<string, LeagueRecord>;
  clubs: Record<string, ClubRecord>;
};

export type Catalog = {
  schemaVersion: 1;
  generatedAt: string;
  contentHash: string;
  defaultSize: number;
  assetBase: string;
  countries: Record<string, CountryRecord>;
};

export type ResolvedLogo = {
  kind: LogoKind;
  country: string;
  iso2: string;
  slug: string;
  name: string;
  hash: string;
  pagePath: string;
  league?: string;
};
