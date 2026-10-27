import { addDays } from '@flyt/flight-api';

// The server's calendar day in UTC. Used as the earliest bookable date and as the anchor
// for default search dates, so it is computed once per request on the server.
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultTripDates(today: string) {
  return { departDate: addDays(today, 14), returnDate: addDays(today, 21) };
}
