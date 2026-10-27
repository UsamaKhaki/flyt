import { describe, expect, it } from 'vitest';
import { AIRPORTS, distanceKm, findAirport, searchAirports } from './airports';
import { AirportSchema } from './schemas';

describe('airports', () => {
  it('has valid, unique entries', () => {
    for (const airport of AIRPORTS) expect(AirportSchema.parse(airport)).toEqual(airport);
    expect(new Set(AIRPORTS.map((a) => a.iata)).size).toBe(AIRPORTS.length);
  });

  it('finds an airport by code', () => {
    expect(findAirport('DXB')?.city).toBe('Dubai');
    expect(findAirport('XXX')).toBeUndefined();
  });

  it('ranks an exact code match first', () => {
    expect(searchAirports('lis')[0]?.iata).toBe('LIS');
  });

  it('matches on city and country, case-insensitively', () => {
    expect(searchAirports('TOKYO').map((a) => a.iata)).toEqual(['NRT']);
    expect(
      searchAirports('united arab')
        .map((a) => a.iata)
        .sort(),
    ).toEqual(['AUH', 'DXB']);
  });

  it('returns nothing for a blank term and respects the limit', () => {
    expect(searchAirports('   ')).toEqual([]);
    expect(searchAirports('a', 3)).toHaveLength(3);
  });

  it('computes great-circle distance', () => {
    const lhr = findAirport('LHR')!;
    const jfk = findAirport('JFK')!;
    // Published LHR to JFK great-circle distance is about 5,540 km.
    expect(distanceKm(lhr, jfk)).toBeGreaterThan(5500);
    expect(distanceKm(lhr, jfk)).toBeLessThan(5600);
  });
});
