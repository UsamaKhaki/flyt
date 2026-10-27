'use client';

import { findAirport, searchAirports, type Airport } from '@flyt/flight-api';
import { useId, useState } from 'react';

function airportLabel(airport: Airport): string {
  return `${airport.city} (${airport.iata})`;
}

interface AirportComboboxProps {
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (iata: string | undefined) => void;
}

export function AirportCombobox({ label, placeholder, value, onChange }: AirportComboboxProps) {
  const selected = value ? findAirport(value) : undefined;
  const [text, setText] = useState(selected ? airportLabel(selected) : '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevValue, setPrevValue] = useState(value);
  const id = useId();
  const listId = `${id}-list`;

  // Keep the text in sync when the parent changes the value, e.g. the swap button.
  if (value !== prevValue) {
    setPrevValue(value);
    setText(selected ? airportLabel(selected) : '');
  }

  const options = open ? searchAirports(text) : [];

  function choose(airport: Airport) {
    onChange(airport.iata);
    setText(airportLabel(airport));
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || options.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (event.key === 'Enter') {
      const option = options[activeIndex];
      if (option) {
        event.preventDefault();
        choose(option);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium tracking-wide text-ink-300 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[activeIndex] ? `${listId}-${options[activeIndex].iata}` : undefined
        }
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setActiveIndex(0);
          setOpen(true);
          if (value) onChange(undefined);
        }}
        onFocus={(event) => event.target.select()}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-ink-50 placeholder:text-ink-500 focus:border-amber-400 focus:outline-none"
      />
      {open && options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-40 mt-1 max-h-72 w-full min-w-64 overflow-auto rounded-lg border border-ink-700 bg-ink-900 py-1 shadow-xl"
        >
          {options.map((airport, index) => (
            <li
              key={airport.iata}
              id={`${listId}-${airport.iata}`}
              role="option"
              aria-selected={index === activeIndex}
              // mousedown fires before the input's blur, so the choice is not lost.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(airport);
              }}
              className={`flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 ${
                index === activeIndex ? 'bg-ink-800' : ''
              }`}
            >
              <span>
                {airport.city}
                <span className="block text-xs text-ink-400">
                  {airport.name}, {airport.country}
                </span>
              </span>
              <span className="font-mono text-sm text-amber-300">{airport.iata}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
