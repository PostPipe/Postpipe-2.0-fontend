import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.postpipe.in';

  // Core routes
  const routes = [
    '',
    '/explore',
    '/static',
    '/docs',
    '/login',
    '/dashboard',
    '/dashboard/changelog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // You can fetch dynamic content here if needed (e.g., blog posts, templates)
  // const templates = await getTemplates();
  // const templateRoutes = templates.map(...)

  return [...routes];
}
