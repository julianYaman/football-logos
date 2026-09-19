# resolveFootballLogo()

Resolves a country and optional club to a crest record: slug, name, hash, PNG URL, and football-logos.cc page path.

```ts
import { resolveFootballLogo } from "football-logos";

const logo = resolveFootballLogo({
  country: "germany",
  club: "bayern-munchen",
});
```

```ts
function resolveFootballLogo(input: {
  country: string;
  club?: string | null;
}): {
  kind: "club" | "league";
  country: string;
  iso2: string;
  slug: string;
  name: string;
  hash: string;
  pagePath: string;
  url: string;
  league?: string;
};
```

Official names resolve as `club` as well as slugs. Nicknames do not.

Throws `LogoResolveError` (`INVALID`, `NOT_FOUND`, or `AMBIGUOUS`) when the lookup fails. `url` is the same hashed PNG [`getFootballLogoUrl()`](./get-football-logo-url) returns.
