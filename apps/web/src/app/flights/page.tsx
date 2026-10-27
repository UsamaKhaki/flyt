import {
  filterOffers,
  findAirport,
  ProviderError,
  sortOffers,
  type Carrier,
  type Offer,
} from '@flyt/flight-api';
import { formatIsoDate, summarizeTravellers } from '@flyt/ui';
import type { Metadata } from 'next';
import { OfferCard } from '@/components/OfferCard';
import { ResultsToolbar } from '@/components/ResultsToolbar';
import { SearchForm } from '@/components/SearchForm';
import { defaultTripDates, todayIso } from '@/lib/dates';
import { getFlightProvider } from '@/lib/provider';
import {
  parseFilters,
  parseSearchParams,
  parseSort,
  searchQueryToParams,
  type RawSearchParams,
} from '@/lib/search-params';

export const metadata: Metadata = {
  title: 'Flights',
  description: 'Compare flight prices across airlines and travel agents.',
};

function uniqueCarriers(offers: readonly Offer[]): Carrier[] {
  const byCode = new Map<string, Carrier>();
  for (const offer of offers) {
    const carrier = offer.outbound.segments[0]?.carrier;
    if (carrier) byCode.set(carrier.code, carrier);
  }
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const parsed = parseSearchParams(rawParams);
  const today = todayIso();

  if (parsed.status !== 'ok') {
    const defaults = defaultTripDates(today);
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Search flights</h1>
        {parsed.status === 'invalid' && (
          <p role="alert" className="mt-3 text-amber-300">
            {parsed.message}
          </p>
        )}
        <div className="mt-6">
          <SearchForm today={today} initial={defaults} />
        </div>
      </div>
    );
  }

  const { query } = parsed;
  let offers: Offer[];
  try {
    offers = await getFlightProvider().search(query);
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">We could not search that route</h1>
        <p role="alert" className="mt-3 text-ink-300">
          {error.message}
        </p>
        <div className="mt-6">
          <SearchForm today={today} initial={query} />
        </div>
      </div>
    );
  }

  const sort = parseSort(rawParams);
  const filters = parseFilters(rawParams);
  const visible = sortOffers(filterOffers(offers, filters), sort);

  const queryParams = searchQueryToParams(query);
  const toolbarParams = new URLSearchParams(queryParams);
  if (sort !== 'best') toolbarParams.set('sort', sort);
  if (filters.maxStops !== undefined) toolbarParams.set('stops', String(filters.maxStops));
  if (filters.carriers?.length) toolbarParams.set('carriers', filters.carriers.join(','));

  const cheapestId = sortOffers(visible, 'cheapest')[0]?.id;
  const fastestId = sortOffers(visible, 'fastest')[0]?.id;
  const origin = findAirport(query.origin);
  const destination = findAirport(query.destination);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <details className="group mb-8 rounded-2xl border border-ink-800 open:border-transparent">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 p-4 group-open:hidden">
          <h1 className="text-xl font-semibold">
            {origin?.city ?? query.origin} to {destination?.city ?? query.destination}
          </h1>
          <span className="text-sm text-ink-300">
            {formatIsoDate(query.departDate)}
            {query.returnDate ? ` to ${formatIsoDate(query.returnDate)}` : ', one way'} ·{' '}
            {summarizeTravellers(query.travellers, query.cabin)}
          </span>
          <span className="ml-auto text-sm text-amber-300">Edit search</span>
        </summary>
        <SearchForm today={today} initial={query} />
      </details>

      <ResultsToolbar
        params={toolbarParams}
        offers={offers}
        sort={sort}
        maxStops={filters.maxStops}
        carriers={uniqueCarriers(offers)}
        selectedCarriers={filters.carriers ?? []}
      />

      <p className="mt-6 text-sm text-ink-400" aria-live="polite">
        {visible.length} of {offers.length} results
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-xl border border-ink-800 p-8 text-center text-ink-300">
          No flights match these filters. Try allowing more stops or more airlines.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {visible.map((offer) => {
            const goParams = new URLSearchParams(queryParams);
            goParams.set('offer', offer.id);
            const badge =
              offer.id === cheapestId ? 'Cheapest' : offer.id === fastestId ? 'Fastest' : undefined;
            return (
              <li key={offer.id}>
                <OfferCard offer={offer} href={`/go?${goParams}`} badge={badge} />
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-6 text-xs text-ink-500">
        Prices are totals for all travellers. Journey times include connections. The partner&apos;s
        price is final; Flyt never adds fees.
      </p>
    </div>
  );
}
