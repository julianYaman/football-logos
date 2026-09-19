# getFootballLogoUrl()

Returns the public 512×512 PNG URL for a country and optional club.

```ts
import { getFootballLogoUrl } from "football-logos";

getFootballLogoUrl({ country: "germany", club: "bayern-munchen" });
getFootballLogoUrl({ country: "germany", club: "bundesliga" });
getFootballLogoUrl({ country: "tournaments", club: "uefa-champions-league" });
getFootballLogoUrl({ country: "germany" });
```

`country` is the football-logos.cc country slug. `club` is the second path segment: a club, league, or competition. Omit `club` for that country's default top-flight badge.

```ts
function getFootballLogoUrl(input: {
  country: string;
  club?: string | null;
}): string;
```

The filename is content-hashed, so a stored `src` stays valid when the catalog moves on.

Throws `LogoResolveError` when the lookup fails. Use [`hasLogo()`](./has-logo) when you only need a boolean. For the crest record instead of a URL, use [`resolveFootballLogo()`](./resolve-football-logo).
