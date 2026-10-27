import { ProviderError, type FlightProvider } from '../provider';
import type { SearchQuery } from '../schemas';

const PRICES_FOR_DATES_URL = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';

export interface TravelpayoutsConfig {
  token?: string;
  marker?: string;
  currency?: string;
}

// Builds the Aviasales Data API v3 "prices for dates" request for a search. This mapping is
// the first piece of the real integration and is unit tested; it has not been run against
// the live API yet. Note that the API returns cached cheapest fares per date, not live
// itineraries, so it cannot carry cabin class or passenger counts.
export function buildPricesForDatesUrl(query: SearchQuery, config: TravelpayoutsConfig): URL {
  const url = new URL(PRICES_FOR_DATES_URL);
  url.searchParams.set('origin', query.origin);
  url.searchParams.set('destination', query.destination);
  url.searchParams.set('departure_at', query.departDate);
  if (query.returnDate) url.searchParams.set('return_at', query.returnDate);
  url.searchParams.set('one_way', String(query.returnDate === undefined));
  url.searchParams.set('currency', (config.currency ?? 'usd').toLowerCase());
  url.searchParams.set('sorting', 'price');
  url.searchParams.set('limit', '30');
  return url;
}

// A stub that keeps the real provider behind the same interface as the mock. It validates
// its configuration so a missing token fails loudly at startup instead of at search time.
export function createTravelpayoutsProvider(config: TravelpayoutsConfig): FlightProvider {
  if (!config.token) {
    throw new ProviderError(
      'not_configured',
      'TRAVELPAYOUTS_TOKEN is not set. Use FLIGHT_PROVIDER=mock or add a token.',
    );
  }

  const notImplemented = () =>
    new ProviderError(
      'not_implemented',
      'The Travelpayouts provider is a stub and does not fetch yet.',
    );

  return {
    id: 'travelpayouts',
    async search() {
      throw notImplemented();
    },
    async deals() {
      throw notImplemented();
    },
  };
}
