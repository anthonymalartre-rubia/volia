// Robots Next.js metadata route — remplace public/robots.txt
// (les 2 coexistent OK, le statique reste comme fallback, mais ce
// dynamique est plus propre et future-proof).

const SITE_URL = 'https://volia.fr';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/en',
          '/prospection',
          '/prospection-be',
          '/pour',
          '/vs',
          '/alternative',
          '/outils',
          '/mcp',
          '/blog',
          '/ressources',
          '/glossaire',
          '/guide',
          '/etude',
          '/comparatif-outils-prospection-b2b-france',
        ],
        disallow: [
          '/api/',
          '/dashboard',
          '/settings',
          '/admin',
          '/opt-out',
          '/login',
          '/signup',
          '/reset-password',
          '/forgot-password',
        ],
      },
      // Googlebot : pas de crawl-delay (Google ignore de toute façon)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin', '/settings'],
      },
      // Bing : crawl-delay modéré pour éviter de surcharger Vercel sur 15K+ pages
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin', '/settings'],
        crawlDelay: 2,
      },
      // Bloque les bots scraping de contenu agressifs (CommonCrawl, GPTBot peuvent piocher
      // ; CCBot bloqué par défaut pour éviter le scraping massif)
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
