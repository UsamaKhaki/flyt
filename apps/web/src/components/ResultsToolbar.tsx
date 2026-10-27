import { totalDuration, type Carrier, type Offer, type SortOrder } from '@flyt/flight-api';
import Link from 'next/link';
import { formatDuration, formatPrice } from '@/lib/format';

const STOP_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: 'Direct only', value: 0 },
  { label: 'Up to 1 stop', value: 1 },
];

function hrefWith(base: URLSearchParams, changes: Record<string, string | undefined>): string {
  const next = new URLSearchParams(base);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, value);
  }
  return `/flights?${next}`;
}

interface ResultsToolbarProps {
  params: URLSearchParams;
  offers: readonly Offer[];
  sort: SortOrder;
  maxStops: number | undefined;
  carriers: readonly Carrier[];
  selectedCarriers: readonly string[];
}

export function ResultsToolbar({
  params,
  offers,
  sort,
  maxStops,
  carriers,
  selectedCarriers,
}: ResultsToolbarProps) {
  const cheapest = offers.length ? Math.min(...offers.map((o) => o.price.amount)) : undefined;
  const fastest = offers.length ? Math.min(...offers.map(totalDuration)) : undefined;
  const currency = offers[0]?.price.currency ?? 'USD';

  const sortTabs: { value: SortOrder; label: string; detail?: string }[] = [
    { value: 'best', label: 'Best', detail: 'Price and time' },
    {
      value: 'cheapest',
      label: 'Cheapest',
      detail: cheapest !== undefined ? formatPrice({ amount: cheapest, currency }) : undefined,
    },
    {
      value: 'fastest',
      label: 'Fastest',
      detail: fastest !== undefined ? formatDuration(fastest) : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      <nav
        aria-label="Sort results"
        className="grid grid-cols-3 overflow-hidden rounded-xl border border-ink-700"
      >
        {sortTabs.map((tab) => (
          <Link
            key={tab.value}
            href={hrefWith(params, { sort: tab.value === 'best' ? undefined : tab.value })}
            aria-current={sort === tab.value ? 'true' : undefined}
            scroll={false}
            className="border-ink-700 px-3 py-3 not-last:border-r hover:bg-ink-900 aria-[current]:bg-ink-900 aria-[current]:shadow-[inset_0_-2px_0_var(--color-amber-400)]"
          >
            <span className="block font-semibold">{tab.label}</span>
            <span className="block font-mono text-xs text-ink-300">{tab.detail ?? 'None'}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Stops">
          <span className="text-ink-400">Stops</span>
          {STOP_OPTIONS.map((option) => (
            <Link
              key={option.label}
              href={hrefWith(params, { stops: option.value?.toString() })}
              aria-current={maxStops === option.value ? 'true' : undefined}
              scroll={false}
              className="rounded-full border border-ink-700 px-3 py-1 hover:border-ink-500 aria-[current]:border-amber-400 aria-[current]:text-amber-300"
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Airlines">
          <span className="text-ink-400">Airlines</span>
          {carriers.map((carrier) => {
            const active = selectedCarriers.includes(carrier.code);
            const nextSelection = active
              ? selectedCarriers.filter((code) => code !== carrier.code)
              : [...selectedCarriers, carrier.code];
            return (
              <Link
                key={carrier.code}
                href={hrefWith(params, { carriers: nextSelection.join(',') })}
                aria-pressed={active}
                scroll={false}
                className="rounded-full border border-ink-700 px-3 py-1 hover:border-ink-500 aria-pressed:border-amber-400 aria-pressed:text-amber-300"
              >
                {carrier.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
