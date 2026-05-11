import type { MetadataRoute } from 'next';

const siteUrl = 'https://domilix.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/settings',
          '/notifications',
          '/favorite',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/Validation',
          '/Forgot',
          '/401',
          '/403',
          '/404',
          '/500',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
