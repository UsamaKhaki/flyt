import type { Price } from '@flyt/flight-api';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatPrice({ amount, currency }: Price): string {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }
  // Round up so the headline price is never lower than what the partner charges.
  return formatter.format(Math.ceil(amount / 100));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatClock(localDateTime: string): string {
  return localDateTime.slice(11, 16);
}

// How many calendar days later the arrival is, in local time ("+1" on overnight flights).
export function dayOffset(departLocal: string, arriveLocal: string): number {
  const depart = Date.parse(`${departLocal.slice(0, 10)}T00:00:00Z`);
  const arrive = Date.parse(`${arriveLocal.slice(0, 10)}T00:00:00Z`);
  return Math.round((arrive - depart) / 86_400_000);
}

export function formatStops(stops: number): string {
  if (stops === 0) return 'Direct';
  return stops === 1 ? '1 stop' : `${stops} stops`;
}
