import fallbackCatalog from "./catalog.fallback.json";
import type { Catalog, LookupInput } from "./types.js";
import {
  findCountry,
  getFootballLogoUrl as resolveUrl,
  hasLogo as resolveHasLogo,
  listCountries as resolveListCountries,
  listLeagues as resolveListLeagues,
  listLogos as resolveListLogos,
  resolveFootballLogo as resolveRecord,
} from "./resolve.js";

let catalog: Catalog = fallbackCatalog as Catalog;
let catalogBaseUrl =
  "https://cdn.jsdelivr.net/gh/julianYaman/football-logos@main/catalog/v1";
let refreshTimer: ReturnType<typeof setInterval> | undefined;
const DEFAULT_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function getCatalog(): Catalog {
  return catalog;
}

export function setCatalog(next: Catalog): void {
  catalog = next;
}

export function setCatalogBaseUrl(url: string): void {
  catalogBaseUrl = url.replace(/\/$/, "");
}

export function resolveFootballLogo(input: LookupInput) {
  return resolveRecord(input, catalog);
}

export function getFootballLogoUrl(input: LookupInput) {
  return resolveUrl(input, catalog);
}

export function listCountries() {
  return resolveListCountries(catalog);
}

export function listLeagues() {
  return resolveListLeagues(catalog);
}

export function listLogos(country: string) {
  return resolveListLogos(catalog, country);
}

export function hasLogo(input: LookupInput) {
  return resolveHasLogo(input, catalog);
}

export async function loadCatalog(options?: {
  country?: string;
  baseUrl?: string;
}): Promise<Catalog> {
  const base = (options?.baseUrl ?? catalogBaseUrl).replace(/\/$/, "");
  try {
    if (options?.country) {
      const known = findCountry(options.country, catalog);
      const countryKey = known?.slug ?? options.country.toLowerCase();
      const response = await fetch(`${base}/countries/${countryKey}.json`);
      if (!response.ok) return catalog;
      const file = (await response.json()) as { country: Catalog["countries"][string] };
      catalog = {
        ...catalog,
        countries: {
          ...catalog.countries,
          [file.country.slug]: file.country,
        },
      };
      return catalog;
    }

    const metaResponse = await fetch(`${base}/meta.json`);
    if (!metaResponse.ok) return catalog;
    const meta = (await metaResponse.json()) as {
      contentHash?: string;
      countries: Array<{ slug: string }>;
    };
    if (meta.contentHash && meta.contentHash === catalog.contentHash) {
      return catalog;
    }
    const countries: Catalog["countries"] = { ...catalog.countries };
    for (const entry of meta.countries) {
      const response = await fetch(`${base}/countries/${entry.slug}.json`);
      if (!response.ok) continue;
      const file = (await response.json()) as { country: Catalog["countries"][string] };
      countries[file.country.slug] = file.country;
    }
    catalog = {
      ...catalog,
      contentHash: meta.contentHash ?? catalog.contentHash,
      countries,
    };
  } catch {
    return catalog;
  }
  return catalog;
}

export function startCatalogRefresh(options?: {
  intervalMs?: number;
  country?: string;
  baseUrl?: string;
}): () => void {
  const intervalMs = options?.intervalMs ?? DEFAULT_REFRESH_INTERVAL_MS;
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new RangeError("intervalMs must be a positive number");
  }
  stopCatalogRefresh();
  void loadCatalog(options);
  const timer = setInterval(() => {
    void loadCatalog(options);
  }, intervalMs);
  refreshTimer = timer;
  (timer as typeof timer & { unref?: () => void }).unref?.();
  return stopCatalogRefresh;
}

export function stopCatalogRefresh(): void {
  if (refreshTimer === undefined) return;
  clearInterval(refreshTimer);
  refreshTimer = undefined;
}

export type { Catalog, LookupInput, ResolvedLogo } from "./types.js";
export { LogoResolveError } from "./resolve.js";
