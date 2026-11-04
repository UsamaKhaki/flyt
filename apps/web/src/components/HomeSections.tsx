'use client';

import { defaultTripDates } from '@/lib/dates';
import { getFlightProvider } from '@/lib/provider';
import { useResource } from '@/lib/use-resource';
import { useToday } from '@/lib/use-today';
import { DealCard } from './DealCard';
import { SearchForm } from './SearchForm';

const HOME_DEAL_COUNT = 4;

export function HomeSearch({ origin }: { origin: string }) {
  const today = useToday();
  if (!today) return <div aria-hidden className="h-44 rounded-2xl border border-ink-800" />;

  return <SearchForm today={today} initial={{ origin, ...defaultTripDates(today) }} />;
}

export function HomeDeals({ origin }: { origin: string }) {
  const deals = useResource(origin, () => getFlightProvider().deals(origin));

  return (
    <div className="mt-6 grid min-h-40 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {deals.status === 'ok' &&
        deals.value.slice(0, HOME_DEAL_COUNT).map((deal) => <DealCard key={deal.id} deal={deal} />)}
      {deals.status === 'error' && (
        <p role="alert" className="text-ink-300">
          Deals could not be loaded.
        </p>
      )}
    </div>
  );
}
