import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/auth-callback/'],
    },
    sitemap: 'https://nigris.app/sitemap.xml',
  };
}
