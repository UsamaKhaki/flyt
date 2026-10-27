import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import { getFlightProvider } from '@/lib/provider';
import { parseSearchParams, searchQueryToParams, type RawSearchParams } from '@/lib/search-params';

export const metadata: Metadata = {
  title: 'Taking you to the partner',
  robots: { index: false, follow: false },
};

// The redirect step of the metasearch model. The offer is looked up again from the search
// instead of trusting a URL from the query string, so /go cannot be used as an open redirect.
export default async function GoPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const rawParams = await searchParams;
  const parsed = parseSearchParams(rawParams);
  const offerId = typeof rawParams.offer === 'string' ? rawParams.offer : undefined;
  if (parsed.status !== 'ok' || !offerId) notFound();

  const provider = getFlightProvider();
  const offer = (await provider.search(parsed.query)).find((candidate) => candidate.id === offerId);
  if (!offer) notFound();

  if (provider.id !== 'mock') redirect(offer.deepLink);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-mono text-sm text-amber-300">Demo mode</p>
      <h1 className="mt-3 text-3xl font-bold">This is where you would go to {offer.agent.name}</h1>
      <p className="mt-4 text-ink-300">
        With a real provider, Flyt sends you straight to the partner to book this{' '}
        {formatPrice(offer.price)} fare. The mock provider uses made-up partners, so the redirect
        stops here.
      </p>
      <p className="mt-6 rounded-lg border border-ink-800 bg-ink-900 p-3 font-mono text-xs break-all text-ink-400">
        {offer.deepLink}
      </p>
      <Link
        href={`/flights?${searchQueryToParams(parsed.query)}`}
        className="mt-8 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-ink-950 hover:bg-amber-300"
      >
        Back to results
      </Link>
    </div>
  );
}
