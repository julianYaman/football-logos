const COMPETITION_SLUG =
  /(^|-)(league|liga|ligue|lig|pokal|championship|cup|shield|trophy|supercup|super-cup|regionalliga|conference|play-off|playoff|federacion|federation|divisie|division|divisao|serie|premier|bundesliga|eredivisie|allsvenskan|superettan|eliteserien|veikkausliiga|pro-league|primeira|segunda|jupiler|ekstraklasa|mls|nwsl|nations|qualifiers|world-cup|association|verband|federacja)(-|$)/i;
const SKIP_HEADING =
  /^(logos by country|logos by league|official shirt partners)$/i;

export function isCompetitionSlug(slug, sectionSlug) {
  if (sectionSlug && slug === sectionSlug) return true;
  if (COMPETITION_SLUG.test(slug)) return true;
  if (/^(eerste|tweede|challenger)-/.test(slug)) return true;
  if (/-national-team$/.test(slug)) return true;
  if (/^national-[a-d0-9]+$/i.test(slug)) return true;
  if (/epo$/.test(slug)) return true;
  if (/^(ispl|isl)$/.test(slug)) return true;
  return false;
}

export function normalizeKey(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripTags(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingAt(index, headings) {
  let current = null;
  for (const heading of headings) {
    if (heading.index < index) current = heading;
    else break;
  }
  return current;
}

function sectionSlugFor(heading) {
  if (!heading) return "";
  if (SKIP_HEADING.test(heading.title)) return null;
  const key = normalizeKey(heading.title);
  if (!key || key.startsWith("other-logos")) return "";
  return key;
}

export function resolveLeagueSlug(sectionSlug, leagues, defaultLeague) {
  if (!sectionSlug) return sectionSlug;
  if (leagues[sectionSlug]) return sectionSlug;
  const slugs = Object.keys(leagues);
  const prefixed = slugs.filter(
    (slug) => slug === sectionSlug || slug.startsWith(`${sectionSlug}-`),
  );
  if (prefixed.includes(defaultLeague)) return defaultLeague;
  if (prefixed.length === 1) return prefixed[0];
  const withoutFootball = slugs.find(
    (slug) => slug.replaceAll("-football-", "-") === sectionSlug,
  );
  return withoutFootball ?? sectionSlug;
}

export function extractLogos(html, countrySlug) {
  const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(
    (match) => ({
      title: stripTags(match[1]),
      index: match.index ?? 0,
    }),
  );

  const logos = [];
  const seen = new Set();

  for (const match of html.matchAll(
    /<div\b[^>]*\bdata-logo-id="([^"]+)"[^>]*>/gi,
  )) {
    const slug = match[1];
    if (!slug || seen.has(slug)) continue;
    const start = match.index ?? 0;
    const heading = headingAt(start, headings);
    const sectionSlug = sectionSlugFor(heading);
    if (sectionSlug === null) continue;

    const chunk = html.slice(start, start + 12_000);
    const href = chunk.match(
      new RegExp(`href="/${countrySlug}/([a-z0-9-]+)/"`),
    );
    if (!href || href[1] !== slug) continue;
    const hash = chunk.match(/value="512::([a-f0-9]+)"/)?.[1];
    if (!hash) continue;
    const name = stripTags(chunk.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || slug);
    seen.add(slug);
    logos.push({
      slug,
      name,
      hash,
      sectionSlug,
    });
  }

  return logos;
}

export function classifyLogos(logos, spec) {
  const leagues = {};
  const clubs = {};
  const sectionToLeague = {};
  const firstInSection = new Set();
  const seenSection = new Set();

  for (const logo of logos) {
    if (!logo.sectionSlug || seenSection.has(logo.sectionSlug)) continue;
    seenSection.add(logo.sectionSlug);
    firstInSection.add(logo.slug);
  }

  for (const logo of logos) {
    const name = spec.leagueNames?.[logo.slug] || logo.name;
    const league = {
      slug: logo.slug,
      name,
      hash: logo.hash,
    };
    const code =
      spec.codes?.[logo.slug] ??
      (logo.slug === spec.defaultLeague ? spec.iso2 : undefined);
    if (code) league.code = code;

    const asLeague =
      spec.allAsLeagues ||
      firstInSection.has(logo.slug) ||
      isCompetitionSlug(logo.slug, logo.sectionSlug) ||
      logo.slug === spec.defaultLeague;

    if (asLeague) {
      leagues[logo.slug] = league;
      if (logo.sectionSlug && !sectionToLeague[logo.sectionSlug]) {
        sectionToLeague[logo.sectionSlug] = logo.slug;
      }
    } else {
      clubs[logo.slug] = {
        slug: logo.slug,
        name,
        hash: logo.hash,
        league: logo.sectionSlug,
      };
    }
  }

  for (const club of Object.values(clubs)) {
    club.league =
      sectionToLeague[club.league] ??
      resolveLeagueSlug(club.league, leagues, spec.defaultLeague);
  }

  return { leagues, clubs };
}

export function parseCountryPage(html, spec) {
  return classifyLogos(extractLogos(html, spec.slug), spec);
}

function isNationalOrGoverningBody(slug) {
  return (
    slug.endsWith("-national-team") ||
    /(association|federation|verband|federacja|epo)$/.test(slug)
  );
}

const LOGO_PATH = /href="\/([a-z0-9-]+)\/([a-z0-9-]+)\/"/i;
const ASSET_512 =
  /(?:https?:)?\/\/assets\.football-logos\.cc\/logos\/([a-z0-9-]+)\/512x512\/([a-z0-9-]+)\.([a-f0-9]+)\.png/i;

function countryFromDirectory(chunk, directory) {
  if (!directory) return null;
  const text = stripTags(chunk);
  if (!text) return null;
  return [...directory.values()]
    .filter((entry) => entry.name)
    .sort((a, b) => b.name.length - a.name.length)
    .find((entry) => text.includes(entry.name))?.slug;
}

function cardChunk(html, start, limit = 12_000) {
  const rest = html.slice(start);
  const next = rest.slice(1).search(/<div\b[^>]*\bdata-logo-id="/i);
  const end = next === -1 ? limit : Math.min(limit, next + 1);
  return html.slice(start, start + end);
}

function logoFromChunk(chunk, fallbackSlug, directory) {
  const path = chunk.match(LOGO_PATH);
  const asset = chunk.match(ASSET_512);
  const slug = fallbackSlug || path?.[2] || asset?.[2];
  const country =
    path?.[1] ||
    asset?.[1] ||
    countryFromDirectory(chunk, directory);
  const hash = chunk.match(/value="512::([a-f0-9]+)"/)?.[1] || asset?.[3];
  const name = stripTags(
    chunk.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ||
      chunk.match(/<img\b[^>]*\balt="([^"]+)"/i)?.[1] ||
      "",
  );
  if (!slug || !country) return null;
  return {
    country,
    slug,
    name: name || slug,
    hash: hash || "",
  };
}

export function resolveCountrySlug(value, directory) {
  if (!directory) return null;
  const key = normalizeKey(value);
  if (!key) return null;
  if (directory.has(key)) return directory.get(key).slug;
  for (const entry of directory.values()) {
    if (normalizeKey(entry.name) === key || normalizeKey(entry.slug) === key) {
      return entry.slug;
    }
  }
  return null;
}

export function extractNewLogos(html, directory) {
  const logos = [];
  const seen = new Set();

  function add(logo, heading) {
    if (!logo) return;
    if (
      directory &&
      !directory.has(logo.country) &&
      !resolveCountrySlug(logo.country, directory)
    ) {
      return;
    }
    const key = `${logo.country}/${logo.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    const title = heading?.title ? stripTags(heading.title) : "";
    logos.push({
      ...logo,
      date: title || undefined,
    });
  }

  const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(
    (match) => ({
      title: stripTags(match[1]),
      index: match.index ?? 0,
    }),
  );

  for (const match of html.matchAll(
    /<div\b[^>]*\bdata-logo-id="([^"]+)"[^>]*>/gi,
  )) {
    const start = match.index ?? 0;
    add(
      logoFromChunk(cardChunk(html, start), match[1], directory),
      headingAt(start, headings),
    );
  }

  if (logos.some((logo) => logo.hash)) return logos;

  for (const match of html.matchAll(new RegExp(LOGO_PATH, "gi"))) {
    const start = match.index ?? 0;
    add(
      logoFromChunk(cardChunk(html, start, 8_000), match[2], directory),
      headingAt(start, headings),
    );
  }

  return logos;
}

export function parseNewLogoDate(value) {
  const match = String(value ?? "").match(
    /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/,
  );
  if (!match) return null;
  const month = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  }[match[1].toLowerCase()];
  if (month == null) return null;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[2])));
}

function utcDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function recentNewLogos(logos, { now = new Date(), days = 2 } = {}) {
  const end = utcDay(now);
  const start = end - (days - 1) * 24 * 60 * 60 * 1000;
  const recent = [];
  const older = [];
  const undated = [];
  for (const logo of logos) {
    const date = parseNewLogoDate(logo.date);
    if (!date) {
      undated.push(logo);
      continue;
    }
    const day = utcDay(date);
    if (day >= start && day <= end) recent.push(logo);
    else older.push(logo);
  }
  return { recent: [...recent, ...undated], older, undated };
}

export function applyNewLogos(countries, logos, getSpec) {
  const next = { ...countries };
  const changed = new Set();
  const unknownCountries = [];
  const skipped = [];
  const stats = { added: 0, updated: 0 };

  function writable(countrySlug, existing) {
    if (!changed.has(countrySlug)) {
      next[countrySlug] = {
        ...existing,
        leagues: { ...existing.leagues },
        clubs: { ...existing.clubs },
      };
      changed.add(countrySlug);
    }
    return next[countrySlug];
  }

  for (const logo of logos) {
    if (!logo?.slug || !logo.country) {
      skipped.push(logo);
      continue;
    }
    if (!logo.hash) {
      skipped.push(logo);
      continue;
    }

    let spec;
    try {
      spec = getSpec(logo.country);
    } catch {
      unknownCountries.push(logo);
      continue;
    }

    const existing = next[spec.slug];
    if (!existing) {
      unknownCountries.push(logo);
      continue;
    }

    const name = spec.leagueNames?.[logo.slug] || logo.name || logo.slug;
    const knownLeague = Boolean(existing.leagues[logo.slug]);
    const knownClub = Boolean(existing.clubs[logo.slug]);
    const asLeague =
      knownLeague ||
      (!knownClub && (spec.allAsLeagues || isCompetitionSlug(logo.slug)));

    if (asLeague) {
      const prev = existing.leagues[logo.slug];
      if (prev && prev.hash === logo.hash && prev.name === name) continue;
      const league = {
        ...(prev ?? { slug: logo.slug }),
        slug: logo.slug,
        name,
        hash: logo.hash,
      };
      const code =
        spec.codes?.[logo.slug] ??
        (logo.slug === spec.defaultLeague || logo.slug === existing.defaultLeague
          ? spec.iso2 ?? existing.iso2
          : prev?.code);
      if (code) league.code = code;
      writable(spec.slug, existing).leagues[logo.slug] = league;
      if (prev) stats.updated += 1;
      else stats.added += 1;
      continue;
    }

    const prev = existing.clubs[logo.slug];
    if (prev && prev.hash === logo.hash && prev.name === name) continue;
    const club = {
      ...(prev ?? {
        slug: logo.slug,
        league: existing.defaultLeague,
      }),
      slug: logo.slug,
      name,
      hash: logo.hash,
    };
    if (!club.league) club.league = existing.defaultLeague;
    writable(spec.slug, existing).clubs[logo.slug] = club;
    if (prev) stats.updated += 1;
    else stats.added += 1;
  }

  return {
    countries: next,
    changed: [...changed],
    unknownCountries,
    skipped,
    stats,
  };
}

export function inferDefaultLeague(spec, leagues, clubs) {
  if (spec.defaultLeague && leagues[spec.defaultLeague]) {
    return spec.defaultLeague;
  }

  const leagueSlugs = Object.keys(leagues);
  const topFlight = leagueSlugs.find((slug) => !isNationalOrGoverningBody(slug));
  if (topFlight) return topFlight;

  const counts = new Map();
  for (const club of Object.values(clubs)) {
    if (!club.league || !leagues[club.league]) continue;
    counts.set(club.league, (counts.get(club.league) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked[0]?.[0]) return ranked[0][0];
  if (leagueSlugs[0]) return leagueSlugs[0];
  throw new Error(`No logos classified for /${spec.slug}/`);
}
