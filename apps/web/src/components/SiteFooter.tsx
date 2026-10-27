import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-400 sm:flex-row sm:justify-between">
        <p>
          Flyt is a portfolio project. Prices and airlines shown are generated mock data, not real
          fares.
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/how-it-works" className="hover:text-amber-300">
            How it works
          </Link>
          <Link href="/help" className="hover:text-amber-300">
            Help
          </Link>
        </nav>
      </div>
    </footer>
  );
}
