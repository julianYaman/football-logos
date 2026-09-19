#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import dns from "node:dns";
import {
  classifyLogos,
  inferDefaultLeague,
  parseCountryPage,
} from "./catalog-parse.mjs";
import { COUNTRY_OVERRIDES, EXTRA_COUNTRIES } from "./country-overrides.mjs";

dns.setDefaultResultOrder("ipv4first");

const execFileAsync = promisify(execFile);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://football-logos.cc";
const UA =
  "football-logos-catalog-indexer/0.1 (+https://github.com/julianYaman/football-logos; catalog seed)";

const DIRECTORY = JSON.parse(
  await readFile(join(ROOT, "scripts/country-directory.json"), "utf8"),
);

let playwrightBrowser;

async function getPlaywrightBrowser() {
  if (playwrightBrowser) return playwrightBrowser;
  const { chromium } = await import("playwright");
  playwrightBrowser = await chromium.launch({ headless: true });
  return playwrightBrowser;
}

async function closePlaywright() {
  if (!playwrightBrowser) return;
  await playwrightBrowser.close();
  playwrightBrowser = undefined;
}

async function fetchWithPlaywright(url) {
  const browser = await getPlaywrightBrowser();
  const page = await browser.newPage({ userAgent: UA });
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    if (!response?.ok()) {
      throw new Error(`${response?.status() ?? "no-response"} ${url}`);
    }
    return await page.content();
  } finally {
    await page.close();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, attempt = 1) {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${url}`);
    }
    return response.text();
  } catch (fetchError) {
    try {
      const { stdout } = await execFileAsync(
        "curl",
        ["-4", "-fsSL", "-A", UA, "--max-time", "45", url],
        { maxBuffer: 12_000_000 },
      );
      return stdout;
    } catch {
      try {
        console.warn(`playwright ${url}`);
        return await fetchWithPlaywright(url);
      } catch (playwrightError) {
        if (attempt >= 4) {
          throw new Error(
            `${fetchError.message}; playwright: ${playwrightError instanceof Error ? playwrightError.message : playwrightError}`,
          );
        }
        console.warn(`retry ${attempt} ${url}: ${fetchError.message}`);
        await sleep(2000 * attempt);
        return fetchText(url, attempt + 1);
      }
    }
  }
}

function buildDirectory() {
  const bySlug = new Map();
  for (const [slug, name, iso2] of DIRECTORY) {
    bySlug.set(slug, { slug, name, iso2 });
  }
  for (const extra of EXTRA_COUNTRIES) {
    bySlug.set(extra.slug, { ...bySlug.get(extra.slug), ...extra });
  }
  const iso2Seen = new Map();
  for (const entry of bySlug.values()) {
    const prev = iso2Seen.get(entry.iso2);
    if (prev && prev !== entry.slug) {
      throw new Error(`Duplicate iso2 ${entry.iso2}: ${prev} and ${entry.slug}`);
    }
    iso2Seen.set(entry.iso2, entry.slug);
  }
  return bySlug;
}

function specFor(slug, directory) {
  const base = directory.get(slug);
  const override = COUNTRY_OVERRIDES[slug] ?? {};
  if (!base && !override.iso2) {
    throw new Error(`Unknown country slug "${slug}"`);
  }
  return {
    slug,
    iso2: override.iso2 ?? base.iso2,
    name: override.name ?? base?.name ?? slug,
    defaultLeague: override.defaultLeague,
    codes: override.codes,
    leagueNames: override.leagueNames,
    allAsLeagues: override.allAsLeagues === true,
    onlyPrefix: override.onlyPrefix,
  };
}

function specIds(spec) {
  return [
    spec.slug,
    spec.iso2,
    spec.defaultLeague,
    spec.name,
    ...Object.keys(spec.codes ?? {}),
    ...Object.values(spec.codes ?? {}),
  ].filter(Boolean);
}

function applyCodes(leagues, spec) {
  const next = { ...leagues };
  for (const [slug, league] of Object.entries(next)) {
    const code =
      spec.codes?.[slug] ?? (slug === spec.defaultLeague ? spec.iso2 : undefined);
    if (code && league.code !== code) {
      next[slug] = { ...league, code };
    }
  }
  return next;
}

function finalizeCountry(spec, leagues, clubs) {
  const defaultLeague = inferDefaultLeague(spec, leagues, clubs);
  const coded = applyCodes(leagues, { ...spec, defaultLeague });
  return {
    slug: spec.slug,
    iso2: spec.iso2,
    name: spec.name,
    defaultLeague,
    leagues: coded,
    clubs,
  };
}

async function indexCountry(spec) {
  const html = await fetchText(`${BASE}/${spec.slug}/`);
  const { leagues, clubs } = parseCountryPage(html, spec);
  return finalizeCountry(spec, leagues, clubs);
}

async function loadExtract(dir, spec) {
  const file = join(dir, `${spec.slug}.json`);
  const payload = JSON.parse(await readFile(file, "utf8"));
  if (Array.isArray(payload.logos)) {
    const { leagues, clubs } = classifyLogos(payload.logos, spec);
    return finalizeCountry(spec, leagues, clubs);
  }
  if (payload.leagues && payload.clubs) {
    const leagues = { ...payload.leagues };
    for (const [slug, league] of Object.entries(leagues)) {
      if (spec.leagueNames?.[slug]) {
        leagues[slug] = { ...league, name: spec.leagueNames[slug] };
      }
    }
    return finalizeCountry(spec, leagues, payload.clubs);
  }
  throw new Error(`Extract ${file} is missing logos or leagues/clubs`);
}

async function loadExistingCountries() {
  try {
    const existing = JSON.parse(
      await readFile(join(ROOT, "src/catalog.fallback.json"), "utf8"),
    );
    return { ...existing.countries };
  } catch {
    return {};
  }
}

async function listExtractSlugs(dir) {
  const names = await readdir(dir);
  return names
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length));
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function main() {
  const directory = buildDirectory();
  const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
  const extractArg = process.argv.find((arg) =>
    arg.startsWith("--from-extract="),
  );
  const extractDir = extractArg
    ? extractArg.slice("--from-extract=".length)
    : null;
  const only = onlyArg
    ? onlyArg.slice("--only=".length).split(",").filter(Boolean)
    : null;

  const discovered = extractDir
    ? await listExtractSlugs(extractDir)
    : [...directory.keys()];
  const specs = discovered.map((slug) => specFor(slug, directory));
  const toIndex = only
    ? specs.filter((spec) =>
        only.some((id) => specIds(spec).includes(id)),
      )
    : specs;
  if (only) {
    const known = new Set(specs.flatMap(specIds));
    const unknown = only.filter((id) => !known.has(id));
    if (unknown.length) {
      throw new Error(`Unknown --only country: ${unknown.join(", ")}`);
    }
  }

  const countries = only ? await loadExistingCountries() : {};
  for (const spec of toIndex) {
    console.log(`Indexing ${spec.name}…`);
    const country = extractDir
      ? await loadExtract(extractDir, spec)
      : await indexCountry(spec);
    countries[spec.slug] = country;
    console.log(
      `  ${Object.keys(country.leagues).length} leagues, ${Object.keys(country.clubs).length} clubs (default ${country.defaultLeague})`,
    );
  }

  const generatedAt = new Date().toISOString();
  const countryFiles = {};
  for (const [slug, country] of Object.entries(countries)) {
    countryFiles[slug] = {
      schemaVersion: 1,
      generatedAt,
      country,
    };
  }

  const meta = {
    schemaVersion: 1,
    generatedAt,
    defaultSize: 512,
    assetBase: "https://assets.football-logos.cc/logos",
    countries: Object.values(countries)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => ({
        slug: country.slug,
        iso2: country.iso2,
        name: country.name,
        defaultLeague: country.defaultLeague,
        clubCount: Object.keys(country.clubs).length,
      })),
  };

  const fallback = {
    schemaVersion: 1,
    generatedAt,
    defaultSize: 512,
    assetBase: "https://assets.football-logos.cc/logos",
    countries,
  };

  meta.contentHash = createHash("sha256")
    .update(JSON.stringify(fallback.countries))
    .digest("hex")
    .slice(0, 16);
  fallback.contentHash = meta.contentHash;

  const catalogDir = join(ROOT, "catalog/v1");
  const docsDir = join(ROOT, "docs/public/catalog/v1");
  await mkdir(join(catalogDir, "countries"), { recursive: true });
  await mkdir(join(docsDir, "countries"), { recursive: true });

  await writeFile(join(catalogDir, "meta.json"), stableStringify(meta));
  await writeFile(join(docsDir, "meta.json"), stableStringify(meta));

  for (const [slug, file] of Object.entries(countryFiles)) {
    const body = stableStringify(file);
    await writeFile(join(catalogDir, "countries", `${slug}.json`), body);
    await writeFile(join(docsDir, "countries", `${slug}.json`), body);
  }

  await mkdir(join(ROOT, "src"), { recursive: true });
  await writeFile(
    join(ROOT, "src/catalog.fallback.json"),
    stableStringify(fallback),
  );

  console.log(
    `Wrote catalog ${meta.contentHash} (${meta.countries.length} countries)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => closePlaywright());
