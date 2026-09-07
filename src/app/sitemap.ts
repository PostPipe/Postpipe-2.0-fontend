import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.postpipe.in';
  const routes = [
    '',
    '/pricing',
    '/explore',
    '/static',
    '/docs',
    '/docs/getting-started',
    '/docs/connectors',
    '/docs/cli',
    '/blog',
    '/dashboard',
    '/login',
    '/sitemap',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
