import { describe, expect, it } from 'vitest';
import { parseFilters, parseSearchParams, parseSort, searchQueryToParams } from './search-params';

describe('parseSearchParams', () => {
  it('reports an empty search when no route is given', () => {
    expect(parseSearchParams({})).toEqual({ status: 'empty' });
    expect(parseSearchParams({ sort: 'cheapest' })).toEqual({ status: 'empty' });
  });

  it('parses a full return search, upper-casing airport codes', () => {
    const parsed = parseSearchParams({
      from: 'lhr',
      to: 'dxb',
      depart: '2026-12-01',
      return: '2026-12-08',
      adults: '2',
      children: '1',
      cabin: 'business',
    });
    expect(parsed).toEqual({
      status: 'ok',
      query: {
        origin: 'LHR',
        destination: 'DXB',
        departDate: '2026-12-01',
        returnDate: '2026-12-08',
        travellers: { adults: 2, children: 1, infants: 0 },
        cabin: 'business',
      },
    });
  });

  it('defaults to one adult in economy', () => {
    const parsed = parseSearchParams({ from: 'LHR', to: 'DXB', depart: '2026-12-01' });
    expect(parsed.status === 'ok' && parsed.query).toMatchObject({
      travellers: { adults: 1, children: 0, infants: 0 },
      cabin: 'economy',
    });
  });

  it('gives a specific message for each missing field', () => {
    expect(parseSearchParams({ to: 'DXB' })).toEqual({
      status: 'invalid',
      message: 'Choose where you are flying from.',
    });
    expect(parseSearchParams({ from: 'LHR', depart: '2026-12-01' })).toMatchObject({
      message: 'Choose where you are flying to.',
    });
    expect(parseSearchParams({ from: 'LHR', to: 'DXB' })).toMatchObject({
      message: 'Choose a departure date.',
    });
  });

  it('rejects tampered values using the schema rules', () => {
    const base = { from: 'LHR', to: 'DXB', depart: '2026-12-01' };
    expect(parseSearchParams({ ...base, adults: 'two' }).status).toBe('invalid');
    expect(parseSearchParams({ ...base, adults: '1', infants: '2' }).status).toBe('invalid');
    expect(parseSearchParams({ ...base, cabin: 'cockpit' }).status).toBe('invalid');
    expect(parseSearchParams({ ...base, return: '2026-11-01' }).status).toBe('invalid');
  });

  it('uses the first value when a parameter is repeated', () => {
    const parsed = parseSearchParams({ from: ['LHR', 'JFK'], to: 'DXB', depart: '2026-12-01' });
    expect(parsed.status === 'ok' && parsed.query.origin).toBe('LHR');
  });
});

describe('searchQueryToParams', () => {
  it('round-trips through parseSearchParams and omits zero counts', () => {
    const query = {
      origin: 'LHR',
      destination: 'SYD',
      departDate: '2026-12-01',
      travellers: { adults: 2, children: 0, infants: 1 },
      cabin: 'premium_economy' as const,
    };
    const params = searchQueryToParams(query);
    expect(params.has('children')).toBe(false);
    expect(params.has('return')).toBe(false);
    expect(parseSearchParams(Object.fromEntries(params))).toEqual({ status: 'ok', query });
  });
});

describe('parseSort and parseFilters', () => {
  it('falls back to best for unknown sort orders', () => {
    expect(parseSort({ sort: 'fastest' })).toBe('fastest');
    expect(parseSort({ sort: 'random' })).toBe('best');
    expect(parseSort({})).toBe('best');
  });

  it('parses stops and a comma-separated carrier list', () => {
    expect(parseFilters({ stops: '0', carriers: 'nw,QK' })).toEqual({
      maxStops: 0,
      carriers: ['NW', 'QK'],
    });
    expect(parseFilters({ stops: '-1' }).maxStops).toBeUndefined();
    expect(parseFilters({ stops: 'abc' }).maxStops).toBeUndefined();
    expect(parseFilters({}).carriers).toEqual([]);
  });
});
