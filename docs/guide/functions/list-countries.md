# listCountries()

Returns every country in the current catalog, sorted by name.

```ts
import { listCountries } from "football-logos";

const countries = listCountries();
```

Each item is:

```ts
{
  slug: string;
  iso2: string;
  name: string;
  defaultLeague: string;
  clubCount: number;
}
```

`slug` is the `country` value you pass to `FootballLogo` and the other lookup functions. `clubCount` is the number of club crests in that country, not including league badges.

See also [`listLeagues()`](./list-leagues) and [`listLogos()`](./list-logos).
