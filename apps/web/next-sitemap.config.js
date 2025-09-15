const siteUrl = 'https://www.singcode.kr';

const config = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/login*',
    '/signup*',
    '/update-password*',
    '/search*',
    '/info*',
    '/tosing*',
    '/error*',
    '/popular*',
    '/recent*',
    '/withdrawal*',
    '/api/*',
    '/admin/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/', // 다른 경로 막기
        allow: ['/$'], // 루트 경로만 허용
      },
    ],
  },
};

export default config;
