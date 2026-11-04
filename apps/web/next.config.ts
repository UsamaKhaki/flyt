import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so every page is exported and searches run in the browser.
  output: 'export',
  // The site lives under /flyt on GitHub Pages and at the root everywhere else.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  // Workspace packages ship TypeScript source, so Next compiles them with the app.
  transpilePackages: ['@flyt/flight-api', '@flyt/ui'],
  poweredByHeader: false,
  // Pin the workspace root; otherwise Next may pick up a lockfile from a parent directory.
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
};

export default nextConfig;
