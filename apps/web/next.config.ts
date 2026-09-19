import withBundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

// 개발 배지(Next.js 인디케이터 / React Query Devtools)는 기본으로 숨긴다.
// 켜고 싶으면 .env.development.local 에 NEXT_PUBLIC_SHOW_DEV_BADGES=true 를 넣는다.
const showDevBadges = process.env.NEXT_PUBLIC_SHOW_DEV_BADGES === 'true';

const nextConfig: NextConfig = {
  devIndicators: showDevBadges ? undefined : false,

  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
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
