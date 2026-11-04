'use client';

import { useEffect, useState } from 'react';

export type Resource<T> =
  { status: 'loading' } | { status: 'ok'; value: T } | { status: 'error'; error: unknown };

type Settled<T> = { key: string; result: Resource<T> };

// Runs `load` whenever `key` changes and ignores answers to a key that is no longer current.
// A null key means there is nothing to load yet.
export function useResource<T>(key: string | null, load: () => Promise<T>): Resource<T> {
  const [settled, setSettled] = useState<Settled<T>>();

  useEffect(() => {
    if (key === null) return;
    let current = true;
    load().then(
      (value) => {
        if (current) setSettled({ key, result: { status: 'ok', value } });
      },
      (error: unknown) => {
        if (current) setSettled({ key, result: { status: 'error', error } });
      },
    );
    return () => {
      current = false;
    };
    // `load` is rebuilt on every render; `key` is what identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return settled?.key === key ? settled.result : { status: 'loading' };
}
