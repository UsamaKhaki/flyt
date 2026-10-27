import type { Airport, IataCode } from './schemas';

// A small, hand-picked set that is enough to demo search and route generation.
// UTC offsets are standard time; daylight saving is ignored on purpose.
// prettier-ignore
export const AIRPORTS: readonly Airport[] = [
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', lat: 51.47, lon: -0.4543, utcOffsetMinutes: 0 },
  { iata: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', lat: 53.4264, lon: -6.2499, utcOffsetMinutes: 0 },
  { iata: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal', lat: 38.7742, lon: -9.1342, utcOffsetMinutes: 0 },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, utcOffsetMinutes: 60 },
  { iata: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, utcOffsetMinutes: 60 },
  { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, utcOffsetMinutes: 60 },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', lat: 40.4983, lon: -3.5676, utcOffsetMinutes: 60 },
  { iata: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain', lat: 41.2974, lon: 2.0833, utcOffsetMinutes: 60 },
  { iata: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', lat: 41.8003, lon: 12.2389, utcOffsetMinutes: 60 },
  { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Türkiye', lat: 41.2753, lon: 28.7519, utcOffsetMinutes: 180 },
  { iata: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', lat: 30.1219, lon: 31.4056, utcOffsetMinutes: 120 },
  { iata: 'JNB', name: 'O. R. Tambo', city: 'Johannesburg', country: 'South Africa', lat: -26.1392, lon: 28.246, utcOffsetMinutes: 120 },
  { iata: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', lat: -33.9715, lon: 18.6021, utcOffsetMinutes: 120 },
  { iata: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081, utcOffsetMinutes: 180 },
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lon: 55.3657, utcOffsetMinutes: 240 },
  { iata: 'AUH', name: 'Zayed International', city: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.433, lon: 54.6511, utcOffsetMinutes: 240 },
  { iata: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan', lat: 24.9065, lon: 67.1608, utcOffsetMinutes: 300 },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, utcOffsetMinutes: 330 },
  { iata: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', lat: 28.5562, lon: 77.1, utcOffsetMinutes: 330 },
  { iata: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', lat: 13.69, lon: 100.7501, utcOffsetMinutes: 420 },
  { iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, utcOffsetMinutes: 480 },
  { iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', lat: 22.308, lon: 113.9185, utcOffsetMinutes: 480 },
  { iata: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan', lat: 35.772, lon: 140.3929, utcOffsetMinutes: 540 },
  { iata: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753, utcOffsetMinutes: 600 },
  { iata: 'GRU', name: 'Guarulhos', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lon: -46.4731, utcOffsetMinutes: -180 },
  { iata: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'United States', lat: 40.6413, lon: -73.7781, utcOffsetMinutes: -300 },
  { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', lat: 25.7959, lon: -80.287, utcOffsetMinutes: -300 },
  { iata: 'YYZ', name: 'Pearson', city: 'Toronto', country: 'Canada', lat: 43.6777, lon: -79.6248, utcOffsetMinutes: -300 },
  { iata: 'ORD', name: "O'Hare", city: 'Chicago', country: 'United States', lat: 41.9742, lon: -87.9073, utcOffsetMinutes: -360 },
  { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', lat: 33.9416, lon: -118.4085, utcOffsetMinutes: -480 },
];

const AIRPORTS_BY_IATA = new Map(AIRPORTS.map((airport) => [airport.iata, airport]));

export function findAirport(iata: IataCode): Airport | undefined {
  return AIRPORTS_BY_IATA.get(iata);
}

export function searchAirports(term: string, limit = 8): Airport[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];

  const exactCode = AIRPORTS.filter((a) => a.iata.toLowerCase() === needle);
  const others = AIRPORTS.filter(
    (a) =>
      a.iata.toLowerCase() !== needle &&
      [a.iata, a.city, a.name, a.country].some((field) => field.toLowerCase().includes(needle)),
  );
  return [...exactCode, ...others].slice(0, limit);
}

export function distanceKm(a: Airport, b: Airport): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
