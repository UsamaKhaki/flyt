import { findAirport, type Leg, type Offer } from '@flyt/flight-api';
import Link from 'next/link';
import { dayOffset, formatClock, formatDuration, formatPrice, formatStops } from '@/lib/format';

function LegRow({ leg, label }: { leg: Leg; label: string }) {
  const first = leg.segments[0];
  const last = leg.segments.at(-1);
  if (!first || !last) return null;

  const offset = dayOffset(first.departAt, last.arriveAt);
  const via = leg.segments.slice(1).map((segment) => segment.from);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
      <div className="text-right">
        <p className="font-mono text-lg">{formatClock(first.departAt)}</p>
        <p className="text-xs text-ink-400">{first.from}</p>
      </div>
      <div className="text-center text-xs text-ink-300">
        <p>{formatDuration(leg.durationMinutes)}</p>
        <div className="relative my-1 h-px bg-ink-600" aria-hidden>
          {via.map((code, index) => (
            <span
              key={code}
              className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-amber-400"
              style={{ left: `${((index + 1) / (via.length + 1)) * 100}%` }}
            />
          ))}
        </div>
        <p className={leg.stops === 0 ? 'text-emerald-300' : ''}>
          {formatStops(leg.stops)}
          {via.length > 0 && <span className="text-ink-400"> via {via.join(', ')}</span>}
        </p>
      </div>
      <div>
        <p className="font-mono text-lg">
          {formatClock(last.arriveAt)}
          {offset > 0 && <sup className="ml-0.5 text-xs text-amber-300">+{offset}</sup>}
        </p>
        <p className="text-xs text-ink-400">{last.to}</p>
      </div>
      <span className="sr-only">
        {label}: departs {findAirport(first.from)?.city} at {formatClock(first.departAt)}, arrives{' '}
        {findAirport(last.to)?.city} at {formatClock(last.arriveAt)}
        {offset > 0 ? `, ${offset} day later` : ''}.
      </span>
    </div>
  );
}

export function OfferCard({ offer, href, badge }: { offer: Offer; href: string; badge?: string }) {
  const carrier = offer.outbound.segments[0]?.carrier;

  return (
    <article className="grid gap-4 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid size-7 place-items-center rounded bg-ink-800 font-mono text-xs text-amber-300">
            {carrier?.code}
          </span>
          <span>{carrier?.name}</span>
          {badge && (
            <span className="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300 sm:ml-2">
              {badge}
            </span>
          )}
        </div>
        <LegRow leg={offer.outbound} label="Outbound" />
        {offer.inbound && <LegRow leg={offer.inbound} label="Return" />}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-ink-700 pt-4 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
        <div className="sm:text-right">
          <p className="font-mono text-2xl font-bold text-amber-300">{formatPrice(offer.price)}</p>
          <p className="text-xs text-ink-400">total on {offer.agent.name}</p>
        </div>
        <Link
          href={href}
          prefetch={false}
          rel="nofollow"
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-amber-300"
        >
          View deal
        </Link>
      </div>
    </article>
  );
}
