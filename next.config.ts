import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
    IPNS_HASH:
      process.env.IPNS_HASH ||
      'k2k4r8ng8uzrtqb5ham8kao889m8qezu96z4w3lpinyqghum43veb6n3',
  },
};

const withNextIntl = createNextIntlPlugin();
export default withBundleAnalyzer(withNextIntl(nextConfig));
