import Link from 'next/link';

const NAV = [
  { href: '/flights', label: 'Flights' },
  { href: '/deals', label: 'Deals' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/help', label: 'Help' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-ink-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="font-mono text-xl font-bold tracking-tight">
          flyt<span className="text-amber-400">.</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-300">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-amber-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
