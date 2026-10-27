import 'server-only';
import {
  createMockProvider,
  createTravelpayoutsProvider,
  type FlightProvider,
} from '@flyt/flight-api';
import { z } from 'zod';

const EnvSchema = z.object({
  FLIGHT_PROVIDER: z.enum(['mock', 'travelpayouts']).default('mock'),
  TRAVELPAYOUTS_TOKEN: z.string().optional(),
  TRAVELPAYOUTS_MARKER: z.string().optional(),
});

export function createProviderFromEnv(env: Record<string, string | undefined>): FlightProvider {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid flight provider configuration: ${parsed.error.issues[0]?.message}`);
  }

  const config = parsed.data;
  if (config.FLIGHT_PROVIDER === 'travelpayouts') {
    return createTravelpayoutsProvider({
      token: config.TRAVELPAYOUTS_TOKEN,
      marker: config.TRAVELPAYOUTS_MARKER,
    });
  }
  return createMockProvider();
}

let provider: FlightProvider | undefined;

export function getFlightProvider(): FlightProvider {
  provider ??= createProviderFromEnv(process.env);
  return provider;
}
