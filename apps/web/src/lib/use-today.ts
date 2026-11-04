'use client';

import { useSyncExternalStore } from 'react';
import { todayIso } from './dates';

const subscribe = () => () => {};

// Null in the exported HTML, which was built on an earlier day, and the visitor's date once
// the page is running. Going through this hook keeps hydration from seeing a mismatch.
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayIso, () => null);
}
