import type { Deal, IataCode, Offer, SearchQuery } from './schemas';

export interface FlightProvider {
  readonly id: string;
  search(query: SearchQuery, options?: { signal?: AbortSignal }): Promise<Offer[]>;
  deals(origin: IataCode, options?: { signal?: AbortSignal }): Promise<Deal[]>;
}

export type ProviderErrorCode =
  'invalid_query' | 'not_configured' | 'not_implemented' | 'upstream_failed' | 'invalid_response';

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;

  constructor(code: ProviderErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ProviderError';
    this.code = code;
  }
}
