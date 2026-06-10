// Chunks de sitemap : /sitemap/0.xml, /sitemap/1.xml, …
//
// Remplace la metadata route Next (src/app/sitemap.js) qui entrait en
// collision avec l'index custom /sitemap.xml (crash `next dev`). Sert
// exactement les mêmes URLs et le même contenu, hreflang inclus.
// Statique au build via generateStaticParams (zéro coût runtime).

import { getSitemapIds, getSitemapEntries } from '@/lib/sitemap-data';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const ids = await getSitemapIds();
  return ids.map(({ id }) => ({ part: `${id}.xml` }));
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function serializeEntry(e) {
  const lastmod = e.lastModified
    ? `<lastmod>${new Date(e.lastModified).toISOString()}</lastmod>`
    : '';
  const freq = e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : '';
  const prio = e.priority != null ? `<priority>${e.priority}</priority>` : '';
  const alternates = e.alternates?.languages
    ? Object.entries(e.alternates.languages)
        .map(
          ([lang, href]) =>
            `<xhtml:link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}"/>`
        )
        .join('')
    : '';
  return `<url><loc>${esc(e.url)}</loc>${lastmod}${freq}${prio}${alternates}</url>`;
}

export async function GET(request, { params }) {
  const match = /^(\d+)\.xml$/.exec(params.part || '');
  if (!match) return new Response('Not found', { status: 404 });
  const id = parseInt(match[1], 10);

  const ids = await getSitemapIds();
  if (!ids.some((x) => x.id === id)) return new Response('Not found', { status: 404 });

  const entries = await getSitemapEntries(id);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(serializeEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
