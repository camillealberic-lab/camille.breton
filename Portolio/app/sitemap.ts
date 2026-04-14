import type { MetadataRoute } from 'next';
import { projects } from '@/lib/projects';

export default function sitemap(): MetadataRoute.Sitemap {
  const projectUrls = projects.map((p) => ({
    url: `https://camillebreton.com/work/${p.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: 'https://camillebreton.com', lastModified: new Date() },
    { url: 'https://camillebreton.com/about', lastModified: new Date() },
    { url: 'https://camillebreton.com/contact', lastModified: new Date() },
    ...projectUrls,
  ];
}
