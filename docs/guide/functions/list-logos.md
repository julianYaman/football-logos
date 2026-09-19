# listLogos()

Returns the league badges and clubs catalogued for one country.

```ts
import { listLogos } from "football-logos";

const logos = listLogos("germany");
```

```ts
function listLogos(country: string): Array<{
  kind: "club" | "league";
  country: string;
  slug: string;
  name: string;
  league?: string;
}>;
```

`country` is a football-logos.cc country slug. Unknown countries return an empty array.

League entries have `kind: "league"`. Club entries have `kind: "club"` and may include the parent `league` slug.

See also [`listCountries()`](./list-countries) and [`listLeagues()`](./list-leagues).
