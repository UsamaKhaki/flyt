import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoView } from '@/components/GoView';

export const metadata: Metadata = {
  title: 'Taking you to the partner',
  robots: { index: false, follow: false },
};

export default function GoPage() {
  return (
    <Suspense>
      <GoView />
    </Suspense>
  );
}
