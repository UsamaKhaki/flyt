# Flyt

A flight metasearch site built on the redirect model: search once, compare fares from airlines and travel agents side by side, then hand off to the partner to book. Flyt never sells tickets itself.

This is a portfolio project. It runs on a deterministic mock data provider. The real data source (Travelpayouts) sits behind the same interface but is a stub and does not fetch yet.

## What works today

- **Search** from the home page: airport autocomplete with keyboard support, return or one-way trips, a date range picker, and a traveller selector with cabin class.
- **Results** at `/flights`: sort by best, cheapest or fastest, and filter by stops and airline. All search state lives in the URL, so results are server rendered and shareable.
- **Redirect step** at `/go`: shows where a real provider would send you. It re-runs the search to find the offer instead of trusting a URL parameter, so it cannot be abused as an open redirect.
- **Deals** at `/deals`: the cheapest week-long return fare per route from a chosen city. Each deal is taken from the same generator as search, so clicking through lands on results that contain the advertised price.
- **Content pages**: `/how-it-works` and `/help`.

## Structure

```
apps/web               Next.js 15 (App Router) site
packages/flight-api    Domain package: Zod schemas, FlightProvider interface, providers, sorting and filtering
packages/ui            React components and design tokens shared by apps
packages/config        Shared TypeScript and ESLint config
```

The packages ship TypeScript source and are compiled by Next (`transpilePackages`), so there is no separate package build step.

### flight-api

- `schemas.ts` holds the Zod schemas and inferred types for search queries, offers, deals and airports. Booking rules live here once: at least one adult, at most 9 travellers, no more infants than adults, return date not before departure.
- `provider.ts` defines `FlightProvider` (`search`, `deals`) and a typed `ProviderError`.
- `providers/mock.ts` generates offers from a seeded PRNG keyed on route, dates and cabin. Durations come from great-circle distance, local times use each airport's UTC offset, and prices scale with cabin, stops and travellers (children about 75%, lap infants about 10% of the adult fare). Carriers and agents are fictional on purpose.
- `providers/travelpayouts.ts` validates its config (it fails fast without a token) and maps a search to an Aviasales Data API v3 request URL. The mapping is unit tested; `search` and `deals` throw `not_implemented`.
- `results.ts` sorts and filters offers. "Best" weighs price and journey time equally, each scaled against the cheapest and fastest offer in the result set.

### ui

- `Dropdown`: a disclosure panel that measures itself before paint, opens above or below and left or right depending on the room in the viewport, and caps its height so it scrolls instead of leaving the screen. Closes on Escape (returning focus) and outside clicks.
- `TravellerSelector`: steppers whose limits mirror the schema rules, so the UI cannot produce an invalid party.
- `DateRangePicker`: wraps react-day-picker and converts between local `Date` objects and `YYYY-MM-DD` strings without timezone drift.
- `styles.css`: Tailwind v4 theme tokens (ink navy scale, amber accent, Space Grotesk and Space Mono).

### web

- `lib/provider.ts` picks the provider from `FLIGHT_PROVIDER`, validated with Zod, and is marked `server-only`.
- `lib/search-params.ts` parses and serialises search URLs through the shared schema, with clear messages for missing fields.

## Running locally

Requires Node 22.13 or newer (see `.nvmrc`) and pnpm 10 (pinned in `package.json`; `corepack enable` will pick it up).

```bash
pnpm install
pnpm dev
```

The site runs at http://localhost:3000 with the mock provider. No environment variables are needed. To try the Travelpayouts stub, copy `apps/web/.env.example` to `apps/web/.env.local` and set `FLIGHT_PROVIDER=travelpayouts` with a token; searches will then show the "not implemented" message.

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Start the web app in development mode |
| `pnpm build`        | Production build                      |
| `pnpm lint`         | ESLint in every package               |
| `pnpm typecheck`    | `tsc` in every package                |
| `pnpm test`         | Vitest in every package               |
| `pnpm format:check` | Prettier check                        |

CI (`.github/workflows/ci.yml`) runs install, format check, lint, typecheck, test and build on every push to `main` and on pull requests.

## Testing

Vitest with Testing Library and jsdom for components.

- `flight-api`: schema rules, airport search and distances, time zone conversion, sorting and filtering, mock determinism and itinerary consistency (segments connect, durations match timestamps, prices scale with travellers), deal prices matching search results, and the Travelpayouts request mapping.
- `ui`: placement maths, stepper limits, keyboard and outside-click behaviour, and date selection.
- `web`: URL parsing and round-tripping, formatting, provider selection from env, and the search form flow with a mocked router.

There are no end-to-end browser tests yet.

## Known limitations

- **No real data.** Travelpayouts is a stub. Its API returns cached cheapest fares rather than live itineraries, so wiring it in will need a mapping from its price records to the `Offer` shape and decisions about what to show when cabin or passenger data is missing.
- **Daylight saving is ignored.** Airport UTC offsets are standard time, so mock local times can be an hour out during summer time.
- **One currency.** Mock prices are in USD and there is no currency or locale switcher.
- **Partial results are not streamed.** A real metasearch would query partners in parallel and stream results as they arrive.
- **`/go` re-runs the search.** That is cheap with the mock; a real provider would need offers cached between the results page and the redirect.

## License

MIT, see [LICENSE](LICENSE).
