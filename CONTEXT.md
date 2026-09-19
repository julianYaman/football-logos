# Football logos package

A convenience layer that turns country/club identifiers into public football-logos.cc PNG URLs.

## Language

**FootballLogo**:
The UI component that renders one crest as an `img`. Country is required. Club is optional.
_Avoid_: FootballIcon, FootballIcons

**Country**:
The first football-logos.cc path segment, for example `germany` or `tournaments`. ISO codes such as `DE` and `ENG` also match. Never `GB` for England.
_Avoid_: league slug as the primary country id

**Club**:
The second football-logos.cc path segment. Usually a team slug such as `bayern-munchen` or `fc-einheit-wernigerode`. League and competition slugs such as `bundesliga` also go here; the prop name stays `club`.
_Avoid_: icon, team id, renaming the prop to entity or slug

**League logo**:
The competition badge for a league or cup. Pass it as `club` under that country, or omit `club` to get the country's default top-flight badge. League codes such as `GER2` still work as `country` or as `club`.
_Avoid_: country flag, national team

**League code**:
The compact identifier for a catalogued league. Examples: `DE`, `GER2`, `ENG`, `ENG2`, `UCL`. Use as `country` for a scoped lookup, or as `club` under the country slug.
_Avoid_: nickname, alias

**Catalog**:
The generated index of slugs, names, and current 512 PNG hashes for every logo on a football-logos.cc country page, plus `/tournaments/`. National team crests are stored on the country, not as a separate `national-teams` country.
_Avoid_: API, icon set

**Hash**:
The fingerprint in a football-logos.cc asset filename. Each size and color variant has its own hash.
_Avoid_: cache buster, version query
