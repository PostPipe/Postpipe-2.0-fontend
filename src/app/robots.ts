import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/private/', '/dashboard/settings'],
    },
    sitemap: 'https://www.postpipe.in/sitemap.xml',
  };
}
