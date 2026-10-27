export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true" aria-label="Loading results">
      <div className="mb-8 h-14 animate-pulse rounded-2xl bg-ink-900" />
      <div className="h-16 animate-pulse rounded-xl bg-ink-900" />
      <ol className="mt-9 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="h-36 animate-pulse rounded-xl bg-ink-900" />
        ))}
      </ol>
    </div>
  );
}
