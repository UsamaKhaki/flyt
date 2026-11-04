'use client';

import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { formatPrice } from '@/lib/format';
import { getFlightProvider } from '@/lib/provider';
import { parseSearchParams, searchQueryToParams } from '@/lib/search-params';
import { useResource } from '@/lib/use-resource';

// The redirect step of the metasearch model. The offer is looked up again from the search
// instead of trusting a URL from the query string, so /go cannot be used as an open redirect.
export function GoView() {
  const params = useSearchParams();
  const parsed = parseSearchParams(Object.fromEntries(params));
  const offerId = params.get('offer');
  const query = parsed.status === 'ok' ? parsed.query : undefined;

  const provider = getFlightProvider();
  const offers = useResource(query ? params.toString() : null, () => provider.search(query!));
  const offer =
    offers.status === 'ok' ? offers.value.find((candidate) => candidate.id === offerId) : undefined;
  const partnerUrl = offer && provider.id !== 'mock' ? offer.deepLink : undefined;

  useEffect(() => {
    if (partnerUrl) window.location.replace(partnerUrl);
  }, [partnerUrl]);

  if (!query || !offerId || offers.status === 'error') notFound();
  if (offers.status === 'loading' || partnerUrl) return null;
  if (!offer) notFound();

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
        href={`/flights?${searchQueryToParams(query)}`}
        className="mt-8 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-ink-950 hover:bg-amber-300"
      >
        Back to results
      </Link>
    </div>
  );
}
