'use client';

import { CABIN_CLASSES, MAX_TRAVELLERS, type CabinClass, type Travellers } from '@flyt/flight-api';
import { Dropdown } from './Dropdown';
import { CABIN_LABELS, stepperBounds, summarizeTravellers, type TravellerKind } from './travellers';

const ROWS: { kind: TravellerKind; label: string; hint: string }[] = [
  { kind: 'adults', label: 'Adults', hint: '12+ years' },
  { kind: 'children', label: 'Children', hint: '2 to 11' },
  { kind: 'infants', label: 'Infants', hint: 'Under 2, on lap' },
];

export interface TravellerSelectorProps {
  value: Travellers;
  cabin: CabinClass;
  onChange: (value: Travellers) => void;
  onCabinChange: (cabin: CabinClass) => void;
  triggerClassName?: string;
}

export function TravellerSelector({
  value,
  cabin,
  onChange,
  onCabinChange,
  triggerClassName,
}: TravellerSelectorProps) {
  return (
    <Dropdown
      label="Travellers and cabin class"
      trigger={summarizeTravellers(value, cabin)}
      triggerClassName={triggerClassName}
    >
      <div className="w-72 space-y-4">
        <ul className="space-y-3">
          {ROWS.map(({ kind, label, hint }) => {
            const { min, max } = stepperBounds(value, kind);
            const count = value[kind];
            return (
              <li key={kind} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium" id={`traveller-${kind}`}>
                    {label}
                  </p>
                  <p className="text-xs text-ink-300">{hint}</p>
                </div>
                <div
                  className="flex items-center gap-3"
                  role="group"
                  aria-labelledby={`traveller-${kind}`}
                >
                  <StepButton
                    label={`Remove one ${label.toLowerCase()}`}
                    disabled={count <= min}
                    onClick={() => onChange({ ...value, [kind]: count - 1 })}
                  >
                    −
                  </StepButton>
                  <output className="w-5 text-center font-mono" aria-live="polite">
                    {count}
                  </output>
                  <StepButton
                    label={`Add one ${label.toLowerCase()}`}
                    disabled={count >= max}
                    onClick={() => onChange({ ...value, [kind]: count + 1 })}
                  >
                    +
                  </StepButton>
                </div>
              </li>
            );
          })}
        </ul>

        <fieldset className="border-t border-ink-700 pt-4">
          <legend className="mb-2 text-sm font-medium">Cabin class</legend>
          <div className="grid grid-cols-2 gap-2">
            {CABIN_CLASSES.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-700 px-3 py-2 text-sm has-[:checked]:border-amber-400 has-[:checked]:text-amber-300"
              >
                <input
                  type="radio"
                  name="cabin"
                  value={option}
                  checked={cabin === option}
                  onChange={() => onCabinChange(option)}
                  className="accent-amber-400"
                />
                {CABIN_LABELS[option]}
              </label>
            ))}
          </div>
        </fieldset>
        {value.adults + value.children + value.infants >= MAX_TRAVELLERS && (
          <p className="text-xs text-ink-300">
            Bookings are limited to {MAX_TRAVELLERS} travellers.
          </p>
        )}
      </div>
    </Dropdown>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full border border-ink-600 text-lg leading-none hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-600"
    >
      {children}
    </button>
  );
}
