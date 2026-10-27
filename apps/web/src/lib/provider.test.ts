import { describe, expect, it } from 'vitest';
import { createProviderFromEnv } from './provider';

describe('createProviderFromEnv', () => {
  it('uses the mock provider by default', () => {
    expect(createProviderFromEnv({}).id).toBe('mock');
  });

  it('builds the Travelpayouts provider when it is selected and configured', () => {
    const provider = createProviderFromEnv({
      FLIGHT_PROVIDER: 'travelpayouts',
      TRAVELPAYOUTS_TOKEN: 'test-token',
    });
    expect(provider.id).toBe('travelpayouts');
  });

  it('fails fast when Travelpayouts is selected without a token', () => {
    expect(() => createProviderFromEnv({ FLIGHT_PROVIDER: 'travelpayouts' })).toThrow(
      /TRAVELPAYOUTS_TOKEN/,
    );
  });

  it('rejects an unknown provider name', () => {
    expect(() => createProviderFromEnv({ FLIGHT_PROVIDER: 'amadeus' })).toThrow(
      /Invalid flight provider configuration/,
    );
  });
});
