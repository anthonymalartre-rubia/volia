import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, PlayCircle } from 'lucide-react';
import { getAllGuides } from '@/lib/guides';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'Guides complets de prospection B2B par secteur — Volia',
  description: 'Guides longs (4000+ mots) pour prospecter efficacement chaque secteur : restaurants, BTP, avocats, immobilier, commerces locaux. Méthodes testées et chiffres réels.',
  alternates: { canonical: 'https://volia.fr/guide' },
  openGraph: {
    title: 'Guides Prospection B2B',
    description: 'Guides sectoriels complets pour prospecter en France.',
    url: 'https://volia.fr/guide',
  },
};

export default function GuideIndex() {
  const guides = getAllGuides();
  const breadcrumbs = [{ label: 'Accueil', href: '/' }, { label: 'Guides' }];
  const jsonLd = breadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <BookOpen size={12} />
            Guides Volia
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-content-primary">
            Guides complets prospection B2B
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-2xl">
            Guides longs et opérationnels pour chaque secteur. Méthodes testées, chiffres réels, templates inclus. De quoi prospecter sérieusement.
          </p>

          {/* Cross-link vers le centre vidéo — propose un format alternatif
              court (5 tutos, 19 min) à ceux qui préfèrent la vidéo aux guides
              long-form. */}
          <Link
            href="/tutoriels"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition text-sm text-content-secondary hover:text-content-primary"
          >
            <PlayCircle size={14} className="text-violet-400" />
            <span>Préférez la vidéo ? <span className="font-semibold text-content-primary">5 tutoriels · 19 min</span></span>
            <ArrowRight size={12} />
          </Link>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="block rounded-2xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-6 group"
              >
                <div className="flex items-center gap-3 text-xs text-content-tertiary mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300">{guide.sector}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {guide.readTime} min
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-violet-400 transition">
                  {guide.title}
                </h2>
                <p className="text-sm text-content-secondary leading-relaxed mb-4">{guide.description}</p>
                <div className="flex items-center gap-2 text-sm text-violet-400 font-semibold">
                  Lire le guide
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
