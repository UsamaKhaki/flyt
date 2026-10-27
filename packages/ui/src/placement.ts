export interface Placement {
  side: 'bottom' | 'top';
  align: 'start' | 'end';
  // Room left on the chosen side; the panel scrolls rather than leaving the viewport.
  maxHeight: number;
}

interface TriggerRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Size {
  width: number;
  height: number;
}

const VIEWPORT_MARGIN = 8;

// Opens below the trigger unless the panel would overflow the viewport and there is more
// room above. Aligns to the trigger's left edge unless that would run off the right side.
export function computePlacement(
  trigger: TriggerRect,
  panel: Size,
  viewport: Size,
  gap = 8,
): Placement {
  const spaceBelow = viewport.height - trigger.bottom - gap - VIEWPORT_MARGIN;
  const spaceAbove = trigger.top - gap - VIEWPORT_MARGIN;
  const side = panel.height <= spaceBelow || spaceBelow >= spaceAbove ? 'bottom' : 'top';

  const fitsFromLeft = trigger.left + panel.width <= viewport.width - VIEWPORT_MARGIN;
  const fitsFromRight = trigger.right - panel.width >= VIEWPORT_MARGIN;
  const align = fitsFromLeft || !fitsFromRight ? 'start' : 'end';

  return { side, align, maxHeight: Math.max(0, side === 'bottom' ? spaceBelow : spaceAbove) };
}
