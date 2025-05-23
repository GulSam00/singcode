import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

const withBundle = withBundleAnalyzer({
  // enabled: process.env.ANALYZE === 'true',
  enabled: true,
  openAnalyzer: true,
});

export default withBundle(nextConfig);
