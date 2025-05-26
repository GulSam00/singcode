const siteUrl = 'https://www.singcode.kr';

const config = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/login',
    '/signup',
    '/update-password',
    '/search',
    '/library',
    '/library/*',
    '/tosing',
    '/error',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/', // 기본은 모든 경로 막기
        allow: ['/', '/popular'], // 이 두 경로만 허용
      },
    ],
  },
};

export default config;
