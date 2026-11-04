import type { MetadataRoute } from 'next';

// Filters multiply into endless URLs and every one renders on the server, so crawlers only
// get the pages that are served from the CDN.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/flights', '/go', '/deals'] },
  };
}
