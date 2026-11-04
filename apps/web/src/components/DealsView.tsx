'use client';

import { findAirport, type IataCode } from '@flyt/flight-api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getFlightProvider } from '@/lib/provider';
import { useResource } from '@/lib/use-resource';
import { DealCard } from './DealCard';

const ORIGINS: readonly IataCode[] = ['DXB', 'LHR', 'JFK', 'SIN', 'KHI', 'BOM'];
const DEFAULT_ORIGIN = 'DXB';

export function DealsView() {
  const requested = useSearchParams().get('from')?.toUpperCase();
  const origin = requested && ORIGINS.includes(requested) ? requested : DEFAULT_ORIGIN;
  const deals = useResource(origin, () => getFlightProvider().deals(origin));
  const city = findAirport(origin)?.city ?? origin;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Deals from {city}</h1>
      <p className="mt-2 max-w-2xl text-ink-300">
        The cheapest return fare for one adult in economy on each route, for a week-long trip.
        Prices change often, so a deal is a starting point rather than a promise.
      </p>

      <nav aria-label="Departure city" className="mt-6 flex flex-wrap gap-2 text-sm">
        {ORIGINS.map((code) => (
          <Link
            key={code}
            href={`/deals?from=${code}`}
            aria-current={code === origin ? 'page' : undefined}
            prefetch={false}
            className="rounded-full border border-ink-700 px-3 py-1 hover:border-ink-500 aria-[current]:border-amber-400 aria-[current]:text-amber-300"
          >
            {findAirport(code)?.city ?? code}
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.status === 'ok' && deals.value.map((deal) => <DealCard key={deal.id} deal={deal} />)}
        {deals.status === 'error' && (
          <p role="alert" className="text-ink-300">
            Deals could not be loaded.
          </p>
        )}
      </div>
    </div>
  );
}
