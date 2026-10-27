import { findAirport, type Deal } from '@flyt/flight-api';
import { formatIsoDate } from '@flyt/ui';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { searchQueryToParams } from '@/lib/search-params';

export function DealCard({ deal }: { deal: Deal }) {
  const destination = findAirport(deal.destination);
  const params = searchQueryToParams({
    origin: deal.origin,
    destination: deal.destination,
    departDate: deal.departDate,
    returnDate: deal.returnDate,
    travellers: { adults: 1, children: 0, infants: 0 },
    cabin: 'economy',
  });
  params.set('sort', 'cheapest');

  return (
    <Link
      href={`/flights?${params}`}
      className="group flex flex-col justify-between gap-6 rounded-xl border border-ink-700 bg-ink-900 p-5 hover:border-amber-400"
    >
      <div>
        <p className="font-mono text-xs text-ink-400">
          {deal.origin} → {deal.destination}
        </p>
        <h3 className="mt-1 text-xl font-semibold group-hover:text-amber-300">
          {destination?.city ?? deal.destination}
        </h3>
        <p className="text-sm text-ink-400">{destination?.country}</p>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xs text-ink-300">
          {formatIsoDate(deal.departDate)}
          {deal.returnDate && ` to ${formatIsoDate(deal.returnDate)}`}
        </p>
        <p className="text-right">
          <span className="block text-xs text-ink-400">from</span>
          <span className="font-mono text-xl font-bold text-amber-300">
            {formatPrice(deal.price)}
          </span>
        </p>
      </div>
    </Link>
  );
}
