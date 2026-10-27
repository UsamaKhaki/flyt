import type { Offer } from './schemas';

export const SORT_ORDERS = ['best', 'cheapest', 'fastest'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export function totalDuration(offer: Offer): number {
  return offer.outbound.durationMinutes + (offer.inbound?.durationMinutes ?? 0);
}

export function maxStops(offer: Offer): number {
  return Math.max(offer.outbound.stops, offer.inbound?.stops ?? 0);
}

// "Best" weighs price and journey time equally, each scaled against the cheapest and
// fastest offer in the same result set, so neither unit dominates the other.
function bestScore(offer: Offer, cheapest: number, fastest: number): number {
  return offer.price.amount / cheapest + totalDuration(offer) / fastest;
}

export function sortOffers(offers: readonly Offer[], order: SortOrder): Offer[] {
  const sorted = [...offers];
  if (sorted.length === 0) return sorted;

  if (order === 'cheapest') {
    return sorted.sort(
      (a, b) => a.price.amount - b.price.amount || totalDuration(a) - totalDuration(b),
    );
  }
  if (order === 'fastest') {
    return sorted.sort(
      (a, b) => totalDuration(a) - totalDuration(b) || a.price.amount - b.price.amount,
    );
  }

  const cheapest = Math.max(1, Math.min(...sorted.map((o) => o.price.amount)));
  const fastest = Math.max(1, Math.min(...sorted.map(totalDuration)));
  return sorted.sort((a, b) => bestScore(a, cheapest, fastest) - bestScore(b, cheapest, fastest));
}

export interface OfferFilters {
  maxStops?: number;
  carriers?: readonly string[];
}

export function filterOffers(offers: readonly Offer[], filters: OfferFilters): Offer[] {
  return offers.filter((offer) => {
    if (filters.maxStops !== undefined && maxStops(offer) > filters.maxStops) return false;
    if (filters.carriers && filters.carriers.length > 0) {
      const operating = offer.outbound.segments[0]?.carrier.code;
      if (!operating || !filters.carriers.includes(operating)) return false;
    }
    return true;
  });
}
