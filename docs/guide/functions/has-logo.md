# hasLogo()

Returns whether a country and optional club resolve to a crest. It does not throw `LogoResolveError`.

```ts
import { hasLogo } from "football-logos";

hasLogo({ country: "germany", club: "bayern-munchen" });
hasLogo({ country: "germany", club: "unknown-club" });
```

```ts
function hasLogo(input: {
  country: string;
  club?: string | null;
}): boolean;
```

Use this when a missing crest is a normal case. [`getFootballLogoUrl()`](./get-football-logo-url) and [`resolveFootballLogo()`](./resolve-football-logo) still throw when the lookup fails.
