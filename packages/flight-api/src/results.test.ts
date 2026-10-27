import { describe, expect, it } from 'vitest';
import { filterOffers, sortOffers } from './results';
import type { Leg, Offer } from './schemas';

function leg(durationMinutes: number, stops: number, carrierCode = 'NW'): Leg {
  return {
    durationMinutes,
    stops,
    segments: [
      {
        carrier: { code: carrierCode, name: carrierCode },
        flightNumber: `${carrierCode}100`,
        from: 'LHR',
        to: 'DXB',
        departAt: '2026-12-01T08:00',
        arriveAt: '2026-12-01T18:00',
        durationMinutes,
      },
    ],
  };
}

function offer(id: string, amount: number, duration: number, stops = 0, carrier = 'NW'): Offer {
  return {
    id,
    outbound: leg(duration, stops, carrier),
    price: { amount, currency: 'USD' },
    agent: { id: 'a', name: 'Agent' },
    deepLink: 'https://agent.example/book',
  };
}

const offers = [
  offer('cheap-slow', 30000, 900, 2, 'QK'),
  offer('pricey-fast', 90000, 420, 0, 'NW'),
  offer('balanced', 40000, 480, 1, 'HB'),
];

describe('sortOffers', () => {
  it('sorts by price for cheapest', () => {
    expect(sortOffers(offers, 'cheapest').map((o) => o.id)).toEqual([
      'cheap-slow',
      'balanced',
      'pricey-fast',
    ]);
  });

  it('sorts by total duration for fastest', () => {
    expect(sortOffers(offers, 'fastest').map((o) => o.id)).toEqual([
      'pricey-fast',
      'balanced',
      'cheap-slow',
    ]);
  });

  it('puts a good price-to-time trade-off first for best', () => {
    expect(sortOffers(offers, 'best')[0]?.id).toBe('balanced');
  });

  it('counts the return leg in the duration', () => {
    const withReturn = { ...offer('round', 50000, 400), inbound: leg(600, 1) };
    expect(sortOffers([withReturn, offer('one-way', 50000, 900)], 'fastest')[0]?.id).toBe(
      'one-way',
    );
  });

  it('does not mutate its input and handles an empty list', () => {
    const input = [...offers];
    sortOffers(input, 'cheapest');
    expect(input).toEqual(offers);
    expect(sortOffers([], 'best')).toEqual([]);
  });
});

describe('filterOffers', () => {
  it('filters by maximum stops', () => {
    expect(filterOffers(offers, { maxStops: 0 }).map((o) => o.id)).toEqual(['pricey-fast']);
    expect(filterOffers(offers, { maxStops: 1 })).toHaveLength(2);
  });

  it('filters by carrier, treating an empty list as no filter', () => {
    expect(filterOffers(offers, { carriers: ['QK', 'HB'] }).map((o) => o.id)).toEqual([
      'cheap-slow',
      'balanced',
    ]);
    expect(filterOffers(offers, { carriers: [] })).toHaveLength(3);
  });
});
