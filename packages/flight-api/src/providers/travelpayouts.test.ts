import { describe, expect, it } from 'vitest';
import { ProviderError } from '../provider';
import type { SearchQuery } from '../schemas';
import { buildPricesForDatesUrl, createTravelpayoutsProvider } from './travelpayouts';

const query: SearchQuery = {
  origin: 'DXB',
  destination: 'LHR',
  departDate: '2026-12-01',
  returnDate: '2026-12-10',
  travellers: { adults: 2, children: 0, infants: 0 },
  cabin: 'economy',
};

describe('buildPricesForDatesUrl', () => {
  it('maps a return search to query parameters', () => {
    const url = buildPricesForDatesUrl(query, { currency: 'AED' });
    expect(url.origin + url.pathname).toBe(
      'https://api.travelpayouts.com/aviasales/v3/prices_for_dates',
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      origin: 'DXB',
      destination: 'LHR',
      departure_at: '2026-12-01',
      return_at: '2026-12-10',
      one_way: 'false',
      currency: 'aed',
      sorting: 'price',
      limit: '30',
    });
  });

  it('marks a search without a return date as one way', () => {
    const url = buildPricesForDatesUrl({ ...query, returnDate: undefined }, {});
    expect(url.searchParams.get('one_way')).toBe('true');
    expect(url.searchParams.has('return_at')).toBe(false);
  });

  it('never puts the token in the URL', () => {
    const url = buildPricesForDatesUrl(query, { token: 'secret' });
    expect(url.toString()).not.toContain('secret');
  });
});

describe('createTravelpayoutsProvider', () => {
  it('fails fast without a token', () => {
    expect(() => createTravelpayoutsProvider({})).toThrow(
      expect.objectContaining({ code: 'not_configured' }),
    );
  });

  it('reports that searching is not implemented yet', async () => {
    const provider = createTravelpayoutsProvider({ token: 'test-token' });
    await expect(provider.search(query)).rejects.toBeInstanceOf(ProviderError);
    await expect(provider.search(query)).rejects.toMatchObject({ code: 'not_implemented' });
  });
});
