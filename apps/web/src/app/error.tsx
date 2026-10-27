'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-ink-300">The search could not be completed. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-ink-950 hover:bg-amber-300"
      >
        Try again
      </button>
    </div>
  );
}
