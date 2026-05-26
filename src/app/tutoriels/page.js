import Link from 'next/link';
import { PlayCircle, BookOpen, Sparkles } from 'lucide-react';
import { TUTORIELS, getTotalDurationMinutes } from '@/lib/tutoriels';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import TutorielsGrid from '@/components/TutorielsGrid';

const SITE_URL = 'https://volia.fr';

export const metadata = {
  title: 'Tutoriels vidéo Volia — Maîtriser Volia en 19 minutes',
  description:
    "5 tutoriels vidéo Loom pour devenir autonome sur Volia : prospection Google Places, campagnes email, CRM Kanban, configuration DNS (SPF/DKIM/DMARC). Total : 19 minutes.",
  alternates: { canonical: `${SITE_URL}/tutoriels` },
  openGraph: {
    title: 'Tutoriels vidéo Volia',
    description: '5 vidéos courtes pour devenir autonome sur tous les modules Volia.',
    url: `${SITE_URL}/tutoriels`,
    type: 'website',
  },
};

/**
 * Conversion mm:ss → ISO 8601 duration (PT3M12S) pour le schéma VideoObject.
 * Indispensable pour que Google reconnaisse la durée dans les rich results.
 */
function toIsoDuration(mmss) {
  const [m, s] = String(mmss).split(':').map(Number);
  return `PT${m || 0}M${s || 0}S`;
}

export default function TutorielsPage() {
  const totalMin = getTotalDurationMinutes();
  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Tutoriels' },
  ];

  // JSON-LD VideoObject pour chaque vidéo — booste l'apparition des rich
  // results vidéo dans la SERP Google (vignette + durée à côté du résultat).
  // ItemList wrap pour signaler à Google qu'il s'agit d'une page de liste
  // ordonnée de vidéos (vs des vidéos éparpillées).
  const videoObjects = TUTORIELS.map((t) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: t.title,
    description: t.description,
    duration: toIsoDuration(t.duration),
    embedUrl: t.loomEmbedUrl,
    contentUrl: t.loomEmbedUrl,
    thumbnailUrl: `${SITE_URL}${t.thumbnail || '/opengraph-image'}`,
    uploadDate: '2026-01-01',
    publisher: {
      '@type': 'Organization',
      name: 'Volia',
      url: SITE_URL,
    },
  }));

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tutoriels vidéo Volia',
    itemListElement: TUTORIELS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/tutoriels#${t.id}`,
      name: t.title,
    })),
  };

  const breadcrumbsLd = breadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      {videoObjects.map((v, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(v) }}
        />
      ))}

      <ReaderHeader />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <PlayCircle size={12} />
            Centre vidéo Volia
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-content-primary">
            Tutoriels vidéo Volia
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-2xl">
            {TUTORIELS.length} vidéos courtes pour devenir autonome sur tous les modules.
            Total : <span className="text-content-primary font-semibold">{totalMin} minutes</span>.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-content-tertiary">
            <Sparkles size={12} className="text-violet-400" />
            <span>Prospection · Campagnes Email · CRM · Délivrabilité</span>
          </div>
        </section>

        {/* Grid (client) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <TutorielsGrid />
        </section>

        {/* CTA docs écrites */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
          <div className="rounded-2xl border border-line bg-surface-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <BookOpen size={20} className="text-violet-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-content-primary mb-1">
                  Vous préférez lire ?
                </h2>
                <p className="text-sm text-content-secondary leading-relaxed">
                  Toute la documentation écrite est disponible avec captures, exemples et raccourcis.
                </p>
              </div>
            </div>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition flex-shrink-0"
            >
              Voir la documentation
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
