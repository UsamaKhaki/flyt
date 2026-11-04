import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FlightsView, ResultsPlaceholder } from '@/components/FlightsView';

export const metadata: Metadata = {
  title: 'Flights',
  description: 'Compare flight prices across airlines and travel agents.',
  robots: { index: false, follow: false },
};

export default function FlightsPage() {
  return (
    <Suspense fallback={<ResultsPlaceholder />}>
      <FlightsView />
    </Suspense>
  );
}
