import { describe, expect, it } from 'vitest';
import { SearchQuerySchema, TravellersSchema } from './schemas';

const validQuery = {
  origin: 'LHR',
  destination: 'DXB',
  departDate: '2026-12-01',
  returnDate: '2026-12-08',
  travellers: { adults: 1, children: 0, infants: 0 },
  cabin: 'economy',
};

describe('TravellersSchema', () => {
  it('accepts a family within the booking limit', () => {
    expect(TravellersSchema.safeParse({ adults: 2, children: 3, infants: 2 }).success).toBe(true);
  });

  it('rejects more than nine travellers in total', () => {
    expect(TravellersSchema.safeParse({ adults: 5, children: 4, infants: 1 }).success).toBe(false);
  });

  it('rejects more infants than adults', () => {
    const result = TravellersSchema.safeParse({ adults: 1, children: 0, infants: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['infants']);
  });

  it('requires at least one adult', () => {
    expect(TravellersSchema.safeParse({ adults: 0, children: 2, infants: 0 }).success).toBe(false);
  });
});

describe('SearchQuerySchema', () => {
  it('accepts a valid return search', () => {
    expect(SearchQuerySchema.safeParse(validQuery).success).toBe(true);
  });

  it('accepts a one-way search', () => {
    const { returnDate: _, ...oneWay } = validQuery;
    expect(SearchQuerySchema.safeParse(oneWay).success).toBe(true);
  });

  it('rejects lowercase or unknown-length airport codes', () => {
    expect(SearchQuerySchema.safeParse({ ...validQuery, origin: 'lhr' }).success).toBe(false);
    expect(SearchQuerySchema.safeParse({ ...validQuery, origin: 'LOND' }).success).toBe(false);
  });

  it('rejects the same origin and destination', () => {
    const result = SearchQuerySchema.safeParse({ ...validQuery, destination: 'LHR' });
    expect(result.error?.issues[0]?.path).toEqual(['destination']);
  });

  it('rejects a return before departure but allows a same-day return', () => {
    expect(SearchQuerySchema.safeParse({ ...validQuery, returnDate: '2026-11-30' }).success).toBe(
      false,
    );
    expect(SearchQuerySchema.safeParse({ ...validQuery, returnDate: '2026-12-01' }).success).toBe(
      true,
    );
  });

  it('rejects impossible calendar dates', () => {
    expect(SearchQuerySchema.safeParse({ ...validQuery, departDate: '2026-02-30' }).success).toBe(
      false,
    );
  });
});
