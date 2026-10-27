// Local times are kept as naive ISO strings ("2026-11-03T08:15"), which is how itineraries
// are shown to travellers. These helpers move between them and UTC epoch milliseconds.

export function localToUtcMs(local: string, utcOffsetMinutes: number): number {
  return Date.parse(`${local}:00Z`) - utcOffsetMinutes * 60_000;
}

export function utcMsToLocal(utcMs: number, utcOffsetMinutes: number): string {
  return new Date(utcMs + utcOffsetMinutes * 60_000).toISOString().slice(0, 16);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
