import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Singcode - 당신의 노래방 메모장',
    short_name: 'Singcode',
    description:
      '노래방만 가면 부르고 싶었던 노래가 기억 안 날 때? Singcode에서 검색하고 저장하면 걱정 끝!',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#1a1a2e',
    background_color: '#1a1a2e',
    lang: 'ko',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
