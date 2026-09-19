const COMPETITION_SLUG =
  /(^|-)(league|liga|ligue|lig|pokal|championship|cup|shield|trophy|supercup|super-cup|regionalliga|conference|play-off|playoff|federacion|federation|divisie|division|divisao|serie|premier|bundesliga|eredivisie|allsvenskan|superettan|eliteserien|veikkausliiga|pro-league|primeira|segunda|jupiler|ekstraklasa|mls|nwsl|nations|qualifiers|world-cup|association|verband|federacja)(-|$)/i;
const SKIP_HEADING =
  /^(logos by country|logos by league|official shirt partners)$/i;

export function isCompetitionSlug(slug, sectionSlug) {
  if (!slug) return true;
  if (sectionSlug && slug === sectionSlug) return true;
  if (COMPETITION_SLUG.test(slug)) return true;
  if (/^\d+-/.test(slug) && /liga|bundesliga|league|lig$/.test(slug)) return true;
  if (/^(serie|ligue|national)-[a-d0-9]+$/i.test(slug)) return true;
  if (/^(eerste|tweede|challenger)-/.test(slug)) return true;
  if (/^[123]-lig$/.test(slug)) return true;
  if (/^(1|2)-liga$/.test(slug)) return true;
  if (/-national-team$/.test(slug)) return true;
  if (/(association|federation|verband|federacja|epo)$/.test(slug)) return true;
  if (/^brazilian-serie-[a-d]$/.test(slug)) return true;
  if (/^(mls|nwsl|mls-cup)$/.test(slug)) return true;
  if (/^(j1|j2|j3|k)-league/.test(slug)) return true;
  if (/^(a-league|ispl|isl|i-league)$/.test(slug)) return true;
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
  const sectionToLeague = { ...(spec.sectionAliases ?? {}) };
  const firstInSection = new Set();
  const seenSection = new Set();

  for (const logo of logos) {
    if (!logo.sectionSlug || seenSection.has(logo.sectionSlug)) continue;
    seenSection.add(logo.sectionSlug);
    firstInSection.add(logo.slug);
  }

  for (const logo of logos) {
    if (spec.onlyPrefix && !logo.slug.startsWith(spec.onlyPrefix)) continue;
    const name = spec.leagueNames?.[logo.slug] || logo.name;
    const league = {
      slug: logo.slug,
      name,
      hash: logo.hash,
      kind: "league",
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
