import { MAX_TRAVELLERS, type CabinClass, type Travellers } from '@flyt/flight-api';

export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'Economy',
  premium_economy: 'Premium economy',
  business: 'Business',
  first: 'First',
};

export type TravellerKind = keyof Travellers;

// Mirrors the TravellersSchema rules so the steppers can never produce an invalid value.
export function stepperBounds(value: Travellers, kind: TravellerKind) {
  const total = value.adults + value.children + value.infants;
  const roomLeft = MAX_TRAVELLERS - total;

  switch (kind) {
    case 'adults':
      return { min: Math.max(1, value.infants), max: value.adults + roomLeft };
    case 'children':
      return { min: 0, max: value.children + roomLeft };
    case 'infants':
      return { min: 0, max: Math.min(value.adults, value.infants + roomLeft) };
  }
}

export function summarizeTravellers(value: Travellers, cabin: CabinClass): string {
  const total = value.adults + value.children + value.infants;
  return `${total} ${total === 1 ? 'traveller' : 'travellers'}, ${CABIN_LABELS[cabin]}`;
}
