'use client';

import type { CabinClass, SearchQuery, Travellers } from '@flyt/flight-api';
import { DateRangePicker, TravellerSelector, type IsoDateRange } from '@flyt/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { searchQueryToParams } from '@/lib/search-params';
import { AirportCombobox } from './AirportCombobox';

const fieldButton =
  'w-full truncate rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-left text-ink-50 hover:border-ink-500 aria-expanded:border-amber-400';

interface SearchFormProps {
  today: string;
  initial: Partial<SearchQuery> & { departDate: string };
}

export function SearchForm({ today, initial }: SearchFormProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState(initial.origin);
  const [destination, setDestination] = useState(initial.destination);
  const [oneWay, setOneWay] = useState(!initial.returnDate);
  const [dates, setDates] = useState<IsoDateRange>({
    from: initial.departDate,
    to: initial.returnDate,
  });
  const [travellers, setTravellers] = useState<Travellers>(
    initial.travellers ?? { adults: 1, children: 0, infants: 0 },
  );
  const [cabin, setCabin] = useState<CabinClass>(initial.cabin ?? 'economy');
  const [error, setError] = useState<string>();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!origin || !destination) return setError('Choose both airports from the list.');
    if (origin === destination) return setError('Origin and destination must be different.');
    if (!dates.from) return setError('Choose a departure date.');
    if (!oneWay && !dates.to) return setError('Choose a return date, or switch to one way.');

    setError(undefined);
    const params = searchQueryToParams({
      origin,
      destination,
      departDate: dates.from,
      returnDate: oneWay ? undefined : dates.to,
      travellers,
      cabin,
    });
    router.push(`/flights?${params}`);
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-ink-700 bg-ink-900/80 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6"
    >
      <fieldset className="mb-4 flex gap-1 text-sm">
        <legend className="sr-only">Trip type</legend>
        {[
          { label: 'Return', value: false },
          { label: 'One way', value: true },
        ].map((option) => (
          <label
            key={option.label}
            className="cursor-pointer rounded-full px-3 py-1 text-ink-300 has-[:checked]:bg-amber-400 has-[:checked]:font-medium has-[:checked]:text-ink-950"
          >
            <input
              type="radio"
              name="trip-type"
              className="sr-only"
              checked={oneWay === option.value}
              onChange={() => setOneWay(option.value)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr_1.3fr_1fr_auto] lg:items-end">
        <AirportCombobox
          label="From"
          placeholder="City or airport"
          value={origin}
          onChange={setOrigin}
        />
        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={() => {
            setOrigin(destination);
            setDestination(origin);
          }}
          className="mx-auto grid size-10 place-items-center self-end rounded-full border border-ink-700 text-ink-300 hover:border-amber-400 hover:text-amber-300"
        >
          ⇄
        </button>
        <AirportCombobox
          label="To"
          placeholder="City or airport"
          value={destination}
          onChange={setDestination}
        />

        <div>
          <span className="mb-1 block text-xs font-medium tracking-wide text-ink-300 uppercase">
            Dates
          </span>
          <DateRangePicker
            value={oneWay ? { from: dates.from } : dates}
            onChange={setDates}
            oneWay={oneWay}
            minDate={today}
            triggerClassName={fieldButton}
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium tracking-wide text-ink-300 uppercase">
            Travellers
          </span>
          <TravellerSelector
            value={travellers}
            cabin={cabin}
            onChange={setTravellers}
            onCabinChange={setCabin}
            triggerClassName={fieldButton}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-amber-400 px-6 py-2.5 font-semibold text-ink-950 hover:bg-amber-300 md:col-span-3 lg:col-span-1"
        >
          Search
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-amber-300">
          {error}
        </p>
      )}
    </form>
  );
}
