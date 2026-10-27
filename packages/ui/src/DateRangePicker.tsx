'use client';

import { DayPicker, type DateRange } from 'react-day-picker';
import { formatIsoDate, isoToLocalDate, localDateToIso } from './dates';
import { Dropdown } from './Dropdown';

export interface IsoDateRange {
  from?: string;
  to?: string;
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
            // Once a full range is chosen, the next click starts a new trip instead of extending it.
            resetOnSelect
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
