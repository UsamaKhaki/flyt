'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { computePlacement, type Placement } from './placement';

export interface DropdownProps {
  trigger: ReactNode;
  // Accessible name for the panel, e.g. "Choose travellers".
  label: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  className?: string;
  triggerClassName?: string;
}

export function Dropdown({ trigger, label, children, className, triggerClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  // Null until the panel has been measured; it renders below and left-aligned until then.
  const [placement, setPlacement] = useState<Placement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const updatePlacement = useCallback(() => {
    const triggerEl = triggerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !panelEl) return;
    setPlacement(
      computePlacement(
        triggerEl.getBoundingClientRect(),
        { width: panelEl.offsetWidth, height: panelEl.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
      ),
    );
  }, []);

  // Measure before paint so the panel never flashes on the wrong side.
  useLayoutEffect(() => {
    if (open) updatePlacement();
  }, [open, updatePlacement]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement);
    };
  }, [open, close, updatePlacement]);

  const sideClass = placement?.side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          // Re-measure from scratch on every open; the last height cap would skew the size.
          if (!open) setPlacement(null);
          setOpen(!open);
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={label}
          data-side={placement?.side ?? 'bottom'}
          data-align={placement?.align ?? 'start'}
          style={{
            maxHeight: placement?.maxHeight,
            ...(placement?.align === 'end' ? { right: 0 } : { left: placement?.offsetX ?? 0 }),
          }}
          className={`absolute z-50 ${sideClass} w-max max-w-[calc(100vw-16px)] overflow-auto overscroll-contain rounded-xl border border-ink-700 bg-ink-900 p-4 text-ink-50 shadow-2xl shadow-black/40`}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}
