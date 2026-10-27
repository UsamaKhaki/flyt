import {
  SearchQuerySchema,
  SORT_ORDERS,
  type OfferFilters,
  type SearchQuery,
  type SortOrder,
} from '@flyt/flight-api';

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ParsedSearch =
  | { status: 'empty' }
  | { status: 'invalid'; message: string }
  | { status: 'ok'; query: SearchQuery };

function first(value: string | string[] | undefined): string | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return single?.trim() || undefined;
}

function all(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : value.split(',')).map((v) => v.trim()).filter(Boolean);
}

// Missing counts fall back to defaults; anything non-numeric becomes NaN so the schema rejects it.
function count(value: string | string[] | undefined, fallback: number): number {
  const raw = first(value);
  return raw === undefined ? fallback : Number(raw);
}

export function parseSearchParams(params: RawSearchParams): ParsedSearch {
  const origin = first(params.from)?.toUpperCase();
  const destination = first(params.to)?.toUpperCase();
  const departDate = first(params.depart);

  if (!origin && !destination && !departDate) return { status: 'empty' };
  if (!origin) return { status: 'invalid', message: 'Choose where you are flying from.' };
  if (!destination) return { status: 'invalid', message: 'Choose where you are flying to.' };
  if (!departDate) return { status: 'invalid', message: 'Choose a departure date.' };

  const result = SearchQuerySchema.safeParse({
    origin,
    destination,
    departDate,
    returnDate: first(params.return),
    travellers: {
      adults: count(params.adults, 1),
      children: count(params.children, 0),
      infants: count(params.infants, 0),
    },
    cabin: first(params.cabin) ?? 'economy',
  });

  if (!result.success) {
    return { status: 'invalid', message: result.error.issues[0]?.message ?? 'Invalid search.' };
  }
  return { status: 'ok', query: result.data };
}

export function searchQueryToParams(query: SearchQuery): URLSearchParams {
  const params = new URLSearchParams({
    from: query.origin,
    to: query.destination,
    depart: query.departDate,
  });
  if (query.returnDate) params.set('return', query.returnDate);
  params.set('adults', String(query.travellers.adults));
  if (query.travellers.children) params.set('children', String(query.travellers.children));
  if (query.travellers.infants) params.set('infants', String(query.travellers.infants));
  params.set('cabin', query.cabin);
  return params;
}

export function parseSort(params: RawSearchParams): SortOrder {
  const sort = first(params.sort);
  return SORT_ORDERS.find((order) => order === sort) ?? 'best';
}

export function parseFilters(params: RawSearchParams): OfferFilters {
  const stops = Number(first(params.stops));
  return {
    maxStops: Number.isInteger(stops) && stops >= 0 ? stops : undefined,
    carriers: all(params.carriers).map((code) => code.toUpperCase()),
  };
}
