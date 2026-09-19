# listLeagues()

Returns every league, cup, tournament, and national-team badge in the current catalog.

```ts
import { listLeagues } from "football-logos";

const leagues = listLeagues();
```

Each item is:

```ts
{
  countrySlug: string;
  countryName: string;
  iso2: string;
  code?: string;
  slug: string;
  name: string;
  clubCount: number;
}
```

Pass `countrySlug` as `country` and `slug` as `club` to resolve that badge. International competitions use `countrySlug: "tournaments"`.

See also [`listCountries()`](./list-countries) and the [Leagues & Competitions](/guide/catalog/leagues) catalog.
