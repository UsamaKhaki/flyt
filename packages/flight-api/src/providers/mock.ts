import { distanceKm, findAirport } from '../airports';
import { ProviderError, type FlightProvider } from '../provider';
import {
  SearchQuerySchema,
  type Airport,
  type CabinClass,
  type Carrier,
  type Deal,
  type IataCode,
  type Leg,
  type Offer,
  type SearchQuery,
  type Segment,
} from '../schemas';
import { addDays, localToUtcMs, utcMsToLocal } from '../time';

// Fictional carriers and agents, so mock prices are never mistaken for real fares.
export const MOCK_CARRIERS: readonly Carrier[] = [
  { code: 'NW', name: 'Northwind Air' },
  { code: 'QK', name: 'Quokka Airways' },
  { code: 'HB', name: 'Harbour Blue' },
  { code: 'ZR', name: 'Zephyr Atlantic' },
  { code: 'MV', name: 'Meridian Vale' },
  { code: 'SJ', name: 'Saffron Jet' },
];

const MOCK_AGENTS = [
  { id: 'skylark', name: 'Skylark Travel' },
  { id: 'bluefin', name: 'Bluefin Fares' },
  { id: 'kite', name: 'Kite Tickets' },
  { id: 'carrier-direct', name: 'Book with the airline' },
] as const;

const HUBS: readonly IataCode[] = ['DXB', 'DOH', 'IST', 'FRA', 'AMS', 'SIN', 'LHR', 'JFK'];

const POPULAR_DESTINATIONS: readonly IataCode[] = [
  'DXB',
  'LHR',
  'IST',
  'BCN',
  'BKK',
  'JFK',
  'SIN',
  'LIS',
  'NRT',
  'CPT',
];

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1,
  premium_economy: 1.6,
  business: 3.4,
  first: 5.5,
};

const CRUISE_KMH = 820;
const TAXI_AND_CLIMB_MINUTES = 30;

// Mulberry32: a tiny seeded PRNG. Seeding from the route and dates makes every search
// repeatable, so a results page, a redirect and a test all see the same offers.
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('pick() called with an empty list');
  return item;
}

function roundTo5(minutes: number): number {
  return Math.max(5, Math.round(minutes / 5) * 5);
}

function requireAirport(iata: IataCode): Airport {
  const airport = findAirport(iata);
  if (!airport) {
    throw new ProviderError('invalid_query', `The mock provider has no data for airport ${iata}`);
  }
  return airport;
}

function stopsFor(distance: number, random: () => number): number {
  const roll = random();
  if (distance < 1500) return roll < 0.8 ? 0 : 1;
  if (distance < 6000) return roll < 0.5 ? 0 : roll < 0.9 ? 1 : 2;
  return roll < 0.3 ? 0 : roll < 0.8 ? 1 : 2;
}

function connectionsFor(
  from: Airport,
  to: Airport,
  stops: number,
  random: () => number,
): Airport[] {
  const candidates = HUBS.filter((code) => code !== from.iata && code !== to.iata).map(
    requireAirport,
  );
  const direct = distanceKm(from, to);
  // Prefer hubs that do not add a huge detour; fall back to any hub on odd routes.
  const sensible = candidates.filter(
    (hub) => distanceKm(from, hub) + distanceKm(hub, to) < direct * 1.5,
  );
  const pool = sensible.length >= stops ? sensible : candidates;

  const chosen: Airport[] = [];
  while (chosen.length < stops) {
    const hub = pick(pool, random);
    if (!chosen.includes(hub)) chosen.push(hub);
  }
  // Fly the hubs in geographic order rather than zig-zagging between them.
  return chosen.sort((a, b) => distanceKm(from, a) - distanceKm(from, b));
}

function buildLeg(
  from: Airport,
  to: Airport,
  date: string,
  stops: number,
  carrier: Carrier,
  random: () => number,
): Leg {
  const stopsAndDestination = [...connectionsFor(from, to, stops, random), to];
  const departHour = 6 + Math.floor(random() * 17);
  const departMinute = roundTo5(random() * 55) % 60;
  let departUtc = localToUtcMs(
    `${date}T${String(departHour).padStart(2, '0')}:${String(departMinute).padStart(2, '0')}`,
    from.utcOffsetMinutes,
  );
  const legStartUtc = departUtc;

  const segments: Segment[] = [];
  let segFrom = from;
  let arriveUtc = departUtc;
  for (const segTo of stopsAndDestination) {
    const durationMinutes = roundTo5(
      (distanceKm(segFrom, segTo) / CRUISE_KMH) * 60 + TAXI_AND_CLIMB_MINUTES,
    );
    arriveUtc = departUtc + durationMinutes * 60_000;

    segments.push({
      carrier,
      flightNumber: `${carrier.code}${100 + Math.floor(random() * 900)}`,
      from: segFrom.iata,
      to: segTo.iata,
      departAt: utcMsToLocal(departUtc, segFrom.utcOffsetMinutes),
      arriveAt: utcMsToLocal(arriveUtc, segTo.utcOffsetMinutes),
      durationMinutes,
    });

    const layoverMinutes = roundTo5(55 + random() * 185);
    departUtc = arriveUtc + layoverMinutes * 60_000;
    segFrom = segTo;
  }

  return {
    segments,
    durationMinutes: Math.round((arriveUtc - legStartUtc) / 60_000),
    stops,
  };
}

function farePerAdultMinor(
  distance: number,
  cabin: CabinClass,
  stops: number,
  random: () => number,
) {
  const base = 45 + distance * 0.075;
  const connectionDiscount = 1 - 0.12 * stops;
  const marketNoise = 0.8 + random() * 0.6;
  return base * CABIN_MULTIPLIER[cabin] * connectionDiscount * marketNoise * 100;
}

function generateOffers(query: SearchQuery): Offer[] {
  const from = requireAirport(query.origin);
  const to = requireAirport(query.destination);
  const distance = distanceKm(from, to);

  // Travellers are left out of the seed: adding a passenger changes the total, not the flights.
  const seedKey = [
    query.origin,
    query.destination,
    query.departDate,
    query.returnDate ?? '',
    query.cabin,
  ].join('|');
  const seed = hashString(seedKey);
  const random = createRandom(seed);

  const { adults, children, infants } = query.travellers;
  // Typical airline pricing: children pay about 75% of the adult fare, lap infants about 10%.
  const passengerFactor = adults + children * 0.75 + infants * 0.1;
  const count = 14 + Math.floor(random() * 8);

  return Array.from({ length: count }, (_, index): Offer => {
    const carrier = pick(MOCK_CARRIERS, random);
    const agent = pick(MOCK_AGENTS, random);
    const outboundStops = stopsFor(distance, random);
    const outbound = buildLeg(from, to, query.departDate, outboundStops, carrier, random);
    const inbound = query.returnDate
      ? buildLeg(to, from, query.returnDate, stopsFor(distance, random), carrier, random)
      : undefined;

    let perAdult = farePerAdultMinor(distance, query.cabin, outboundStops, random);
    if (inbound) perAdult *= 1.8;

    const id = `mock-${seed.toString(36)}-${index}`;
    const deepLink = new URL(`https://${agent.id}.example/book`);
    deepLink.searchParams.set('ref', 'flyt');
    deepLink.searchParams.set('offer', id);

    return {
      id,
      outbound,
      inbound,
      price: { amount: Math.round(perAdult * passengerFactor), currency: 'USD' },
      agent: { ...agent },
      deepLink: deepLink.toString(),
    };
  });
}

export interface MockProviderOptions {
  // Injected so deal dates are stable in tests.
  today?: () => string;
}

export function createMockProvider(options: MockProviderOptions = {}): FlightProvider {
  const today = options.today ?? (() => new Date().toISOString().slice(0, 10));

  return {
    id: 'mock',

    async search(query, { signal } = {}) {
      signal?.throwIfAborted();
      const parsed = SearchQuerySchema.safeParse(query);
      if (!parsed.success) {
        throw new ProviderError(
          'invalid_query',
          parsed.error.issues[0]?.message ?? 'Invalid query',
        );
      }
      return generateOffers(parsed.data);
    },

    async deals(origin, { signal } = {}) {
      signal?.throwIfAborted();
      requireAirport(origin);
      const start = today();

      // Each deal is the cheapest offer an actual search would return, so clicking through
      // from /deals lands on results that contain the advertised price.
      return POPULAR_DESTINATIONS.filter((code) => code !== origin).map(
        (destination, index): Deal => {
          const departDate = addDays(start, 14 + index * 6);
          const returnDate = addDays(departDate, 7);
          const offers = generateOffers({
            origin,
            destination,
            departDate,
            returnDate,
            travellers: { adults: 1, children: 0, infants: 0 },
            cabin: 'economy',
          });
          const cheapest = Math.min(...offers.map((offer) => offer.price.amount));
          return {
            id: `deal-${origin}-${destination}-${departDate}`,
            origin,
            destination,
            departDate,
            returnDate,
            price: { amount: cheapest, currency: 'USD' },
          };
        },
      );
    },
  };
}
