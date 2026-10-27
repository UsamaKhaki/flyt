import { describe, expect, it } from 'vitest';
import { OfferSchema, type SearchQuery } from '../schemas';
import { localToUtcMs } from '../time';
import { findAirport } from '../airports';
import { createMockProvider } from './mock';

const provider = createMockProvider({ today: () => '2026-11-01' });

const query: SearchQuery = {
  origin: 'LHR',
  destination: 'SYD',
  departDate: '2026-12-01',
  returnDate: '2026-12-15',
  travellers: { adults: 1, children: 0, infants: 0 },
  cabin: 'economy',
};

describe('mock provider search', () => {
  it('returns offers that satisfy the Offer schema', async () => {
    const offers = await provider.search(query);
    expect(offers.length).toBeGreaterThanOrEqual(14);
    for (const offer of offers) expect(() => OfferSchema.parse(offer)).not.toThrow();
  });

  it('is deterministic for the same query', async () => {
    expect(await provider.search(query)).toEqual(await provider.search(query));
  });

  it('builds connected legs that start and end at the right airports', async () => {
    for (const offer of await provider.search(query)) {
      const { segments, stops } = offer.outbound;
      expect(segments[0]?.from).toBe('LHR');
      expect(segments.at(-1)?.to).toBe('SYD');
      expect(segments).toHaveLength(stops + 1);
      for (let i = 1; i < segments.length; i++) {
        expect(segments[i]?.from).toBe(segments[i - 1]?.to);
      }
      expect(offer.inbound?.segments[0]?.from).toBe('SYD');
    }
  });

  it('never offers nonstop flights on ultra-long routes', async () => {
    const offers = await provider.search(query);
    expect(offers.every((offer) => offer.outbound.stops >= 1)).toBe(true);
  });

  it('reports a leg duration that matches its first departure and last arrival', async () => {
    const [offer] = await provider.search({ ...query, returnDate: undefined });
    const { segments, durationMinutes } = offer!.outbound;
    const departUtc = localToUtcMs(segments[0]!.departAt, findAirport('LHR')!.utcOffsetMinutes);
    const arriveUtc = localToUtcMs(segments.at(-1)!.arriveAt, findAirport('SYD')!.utcOffsetMinutes);
    expect(durationMinutes).toBe((arriveUtc - departUtc) / 60_000);
  });

  it('keeps the same flights but scales the price with travellers', async () => {
    const solo = await provider.search(query);
    const family = await provider.search({
      ...query,
      travellers: { adults: 2, children: 1, infants: 1 },
    });
    expect(family.map((o) => o.outbound)).toEqual(solo.map((o) => o.outbound));
    // 2 adults + 0.75 child + 0.1 infant
    const ratio = family[0]!.price.amount / solo[0]!.price.amount;
    expect(ratio).toBeCloseTo(2.85, 2);
  });

  it('prices business above economy for the same route', async () => {
    const cheapest = async (cabin: SearchQuery['cabin']) =>
      Math.min(...(await provider.search({ ...query, cabin })).map((o) => o.price.amount));
    expect(await cheapest('business')).toBeGreaterThan(await cheapest('economy'));
  });

  it('rejects invalid queries and unknown airports', async () => {
    await expect(provider.search({ ...query, destination: 'LHR' })).rejects.toMatchObject({
      code: 'invalid_query',
    });
    await expect(provider.search({ ...query, destination: 'ZZZ' })).rejects.toMatchObject({
      code: 'invalid_query',
    });
  });

  it('respects an already aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(provider.search(query, { signal: controller.signal })).rejects.toThrow();
  });
});

describe('mock provider deals', () => {
  it('excludes the origin and dates deals from today', async () => {
    const deals = await provider.deals('LHR');
    expect(deals.some((deal) => deal.destination === 'LHR')).toBe(false);
    expect(deals[0]?.departDate).toBe('2026-11-15');
  });

  it('advertises a price that the matching search actually returns', async () => {
    const [deal] = await provider.deals('DXB');
    const offers = await provider.search({
      origin: deal!.origin,
      destination: deal!.destination,
      departDate: deal!.departDate,
      returnDate: deal!.returnDate,
      travellers: { adults: 1, children: 0, infants: 0 },
      cabin: 'economy',
    });
    expect(Math.min(...offers.map((o) => o.price.amount))).toBe(deal!.price.amount);
  });
});
