import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-amber-300">404</p>
      <h1 className="mt-3 text-3xl font-bold">We could not find that page</h1>
      <p className="mt-3 text-ink-300">
        The link may be out of date, or the fare is no longer available.
      </p>
      <Link href="/" className="mt-8 inline-block text-amber-300 hover:underline">
        Start a new search
      </Link>
    </div>
  );
}
