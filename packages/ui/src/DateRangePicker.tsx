'use client';

import { DayPicker, type DateRange } from 'react-day-picker';
import { Dropdown } from './Dropdown';

export interface IsoDateRange {
  from?: string;
  to?: string;
}

// The picker works with local Date objects; the rest of the app uses "YYYY-MM-DD" strings.
// Building dates from parts (not Date.parse) keeps them on the user's local calendar day.
export function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function localDateToIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const displayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export function formatIsoDate(iso: string): string {
  return displayFormat.format(isoToLocalDate(iso));
}

export interface DateRangePickerProps {
  value: IsoDateRange;
  onChange: (value: IsoDateRange) => void;
  // One-way trips pick a single departure date.
  oneWay?: boolean;
  minDate: string;
  triggerClassName?: string;
}

export function DateRangePicker({
  value,
  onChange,
  oneWay = false,
  minDate,
  triggerClassName,
}: DateRangePickerProps) {
  const from = value.from ? isoToLocalDate(value.from) : undefined;
  const to = value.to ? isoToLocalDate(value.to) : undefined;
  const disabled = { before: isoToLocalDate(minDate) };

  const departLabel = value.from ? formatIsoDate(value.from) : 'Depart';
  const returnLabel = value.to ? formatIsoDate(value.to) : 'Return';
  const trigger = oneWay ? departLabel : `${departLabel} → ${returnLabel}`;

  return (
    <Dropdown
      label={oneWay ? 'Choose a departure date' : 'Choose travel dates'}
      trigger={trigger}
      triggerClassName={triggerClassName}
    >
      {(close) =>
        oneWay ? (
          <DayPicker
            mode="single"
            numberOfMonths={2}
            defaultMonth={from}
            selected={from}
            disabled={disabled}
            onSelect={(date) => {
              onChange({ from: date ? localDateToIso(date) : undefined });
              if (date) close();
            }}
          />
        ) : (
          <DayPicker
            mode="range"
            numberOfMonths={2}
            defaultMonth={from}
            selected={{ from, to }}
            disabled={disabled}
            onSelect={(range: DateRange | undefined) => {
              onChange({
                from: range?.from ? localDateToIso(range.from) : undefined,
                to: range?.to ? localDateToIso(range.to) : undefined,
              });
            }}
          />
        )
      }
    </Dropdown>
  );
}
