import Link from 'next/link';
import { DealCard } from '@/components/DealCard';
import { SearchForm } from '@/components/SearchForm';
import { defaultTripDates, todayIso } from '@/lib/dates';
import { getFlightProvider } from '@/lib/provider';

// Default dates are relative to today, so the page must render per request.
export const dynamic = 'force-dynamic';

const HOME_ORIGIN = 'DXB';

const STEPS = [
  { title: 'Search once', body: 'Flyt asks every partner for prices on your route and dates.' },
  { title: 'Compare honestly', body: 'Sort by price, journey time or the best balance of both.' },
  {
    title: 'Book with the partner',
    body: 'We hand you to the airline or agent. They take payment and issue your ticket.',
  },
];

export default async function HomePage() {
  const today = todayIso();
  const { departDate, returnDate } = defaultTripDates(today);
  const deals = (await getFlightProvider().deals(HOME_ORIGIN)).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-amber-400)_0%,transparent_45%)] opacity-15"
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
          <p className="font-mono text-sm text-amber-300">Flight metasearch</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Every fare in one place. Book wherever it is cheapest.
          </h1>
          <p className="mt-4 max-w-xl text-ink-300">
            Compare airlines and travel agents side by side, then book directly with the one you
            choose.
          </p>
          <div className="mt-10">
            <SearchForm today={today} initial={{ origin: HOME_ORIGIN, departDate, returnDate }} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="deals-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="deals-heading" className="text-2xl font-semibold">
            Cheapest from Dubai right now
          </h2>
          <Link
            href={`/deals?from=${HOME_ORIGIN}`}
            className="text-sm text-amber-300 hover:underline"
          >
            All deals
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-semibold">
          How Flyt works
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-ink-800 p-5">
              <span className="font-mono text-sm text-amber-300">0{index + 1}</span>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-300">{step.body}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/how-it-works"
          className="mt-6 inline-block text-sm text-amber-300 hover:underline"
        >
          Read how we make money
        </Link>
      </section>
    </>
  );
}
