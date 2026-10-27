import { describe, expect, it } from 'vitest';
import { computePlacement } from './placement';

const viewport = { width: 1024, height: 768 };
const panel = { width: 300, height: 400 };

function rect(left: number, top: number, width = 200, height = 48) {
  return { left, top, right: left + width, bottom: top + height };
}

describe('computePlacement', () => {
  it('opens below and left-aligned when there is room', () => {
    expect(computePlacement(rect(100, 100), panel, viewport)).toEqual({
      side: 'bottom',
      align: 'start',
      maxHeight: 768 - 148 - 8 - 8,
    });
  });

  it('flips above when the panel would overflow the bottom edge', () => {
    expect(computePlacement(rect(100, 600), panel, viewport).side).toBe('top');
  });

  it('stays below when neither side fits but below has more room', () => {
    const tall = { width: 300, height: 900 };
    expect(computePlacement(rect(100, 200), tall, viewport).side).toBe('bottom');
  });

  it('caps the height to the room on the chosen side', () => {
    const tall = { width: 300, height: 900 };
    const placement = computePlacement(rect(100, 460), tall, viewport);
    expect(placement).toMatchObject({ side: 'top', maxHeight: 460 - 8 - 8 });
  });

  it('right-aligns when the panel would overflow the right edge', () => {
    expect(computePlacement(rect(850, 100, 150), panel, viewport).align).toBe('end');
  });

  it('falls back to left-aligned when the panel is wider than either option allows', () => {
    const narrow = { width: 320, height: 768 };
    expect(computePlacement(rect(40, 100, 100), panel, narrow).align).toBe('start');
  });
});
