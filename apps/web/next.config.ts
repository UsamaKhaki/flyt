import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source, so Next compiles them with the app.
  transpilePackages: ['@flyt/flight-api', '@flyt/ui'],
  poweredByHeader: false,
  // Pin the workspace root; otherwise Next may pick up a lockfile from a parent directory.
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
};

export default nextConfig;
