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
      offsetX: 0,
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

  it('nudges the panel back on screen when it fits neither edge', () => {
    // A 375px phone, a 343px panel and a trigger that starts 33px from the left.
    const phone = { width: 375, height: 812 };
    const placement = computePlacement(rect(33, 100, 309), { width: 343, height: 300 }, phone);
    expect(placement.align).toBe('start');
    // 33 + 343 overflows 375 - 8 by 9px, so it moves 9px left.
    expect(placement.offsetX).toBe(-9);
  });

  it('never nudges past the left margin', () => {
    const phone = { width: 375, height: 812 };
    const placement = computePlacement(rect(20, 100, 100), { width: 400, height: 300 }, phone);
    expect(placement.offsetX).toBe(-12);
  });
});
