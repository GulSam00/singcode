import withBundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

const withBundle = withBundleAnalyzer({
  // enabled: process.env.ANALYZE === 'true',
  enabled: true,
  openAnalyzer: true,
});

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist(withBundle(nextConfig));
