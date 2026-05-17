import { getAllSeoUrls } from '@/lib/slugs';
import { getAllCompetitors } from '@/lib/competitors';

/**
 * Dynamic sitemap generated at build time + ISR.
 * Includes:
 * - Main pages (/, /login, /signup, /cgu, ...)
 * - Programmatic SEO pages (~15 000 URLs)
 */
export default async function sitemap() {
  const baseUrl = 'https://prospectia.cloud';
  const now = new Date();

  // Static pages
  const staticPages = [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: 'weekly', lastModified: now },
    { url: `${baseUrl}/signup`, priority: 0.9, changeFrequency: 'monthly', lastModified: now },
    { url: `${baseUrl}/login`, priority: 0.8, changeFrequency: 'monthly', lastModified: now },
    { url: `${baseUrl}/cgu`, priority: 0.3, changeFrequency: 'yearly', lastModified: now },
    { url: `${baseUrl}/confidentialite`, priority: 0.3, changeFrequency: 'yearly', lastModified: now },
    { url: `${baseUrl}/rgpd`, priority: 0.3, changeFrequency: 'yearly', lastModified: now },
  ];

  // Programmatic SEO pages
  const seoUrls = getAllSeoUrls(baseUrl).map((u) => ({
    url: u.loc,
    priority: u.priority,
    changeFrequency: u.changefreq,
    lastModified: now,
  }));

  // Competitor comparison pages (high-intent)
  const competitors = getAllCompetitors();
  const vsUrls = competitors.flatMap((c) => [
    { url: `${baseUrl}/vs/${c.slug}`, priority: 0.7, changeFrequency: 'monthly', lastModified: now },
    { url: `${baseUrl}/alternative/${c.slug}`, priority: 0.7, changeFrequency: 'monthly', lastModified: now },
  ]);

  return [...staticPages, ...seoUrls, ...vsUrls];
}
