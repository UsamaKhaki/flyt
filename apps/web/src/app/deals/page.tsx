import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DealsView } from '@/components/DealsView';

export const metadata: Metadata = {
  title: 'Flight deals',
  description: 'The cheapest return fares we have seen recently from popular departure cities.',
  robots: { index: false, follow: false },
};

export default function DealsPage() {
  return (
    <Suspense>
      <DealsView />
    </Suspense>
  );
}
