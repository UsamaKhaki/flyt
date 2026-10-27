import { describe, expect, it } from 'vitest';
import { addDays, localToUtcMs, utcMsToLocal } from './time';

describe('time helpers', () => {
  it('round-trips a local time through UTC', () => {
    const utc = localToUtcMs('2026-12-01T08:15', 240);
    expect(new Date(utc).toISOString()).toBe('2026-12-01T04:15:00.000Z');
    expect(utcMsToLocal(utc, 240)).toBe('2026-12-01T08:15');
  });

  it('crosses the date line when converting between zones', () => {
    const utc = localToUtcMs('2026-12-01T23:30', 0);
    expect(utcMsToLocal(utc, 540)).toBe('2026-12-02T08:30');
  });

  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-28', 7)).toBe('2027-01-04');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
});
