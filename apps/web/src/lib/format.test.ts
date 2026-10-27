import { describe, expect, it } from 'vitest';
import { dayOffset, formatClock, formatDuration, formatPrice, formatStops } from './format';

describe('format helpers', () => {
  it('formats minor units as whole currency, rounding up', () => {
    expect(formatPrice({ amount: 45_001, currency: 'USD' })).toBe('$451');
    expect(formatPrice({ amount: 45_000, currency: 'USD' })).toBe('$450');
    expect(formatPrice({ amount: 120_000, currency: 'EUR' })).toBe('€1,200');
  });

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(805)).toBe('13h 25m');
  });

  it('reads the clock time from a local datetime', () => {
    expect(formatClock('2026-12-01T08:05')).toBe('08:05');
  });

  it('counts arrival days after departure', () => {
    expect(dayOffset('2026-12-01T22:00', '2026-12-01T23:30')).toBe(0);
    expect(dayOffset('2026-12-31T22:00', '2027-01-02T06:00')).toBe(2);
  });

  it('labels stops', () => {
    expect(formatStops(0)).toBe('Direct');
    expect(formatStops(1)).toBe('1 stop');
    expect(formatStops(2)).toBe('2 stops');
  });
});
