import { describe, expect, it } from 'vitest';
import robots from './robots';

describe('robots', () => {
  it('keeps crawlers off the pages that render per request', () => {
    expect(robots().rules).toMatchObject({
      allow: '/',
      disallow: ['/flights', '/go', '/deals'],
    });
  });
});
