import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { getAllPostsWithAuto } from '@/lib/blog';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import NewsletterCapture from '@/components/NewsletterCapture';

// ISR : la liste d'articles se rebuild toutes les 30 min. Suffisant pour que
// les articles programmés (publishedAt > today) apparaissent dans les ~30 min
// suivant minuit le jour J, sans nécessiter de redéploiement Vercel.
export const revalidate = 1800;

export const metadata = {
  title: 'Blog Volia — Prospection B2B, cold emailing, RGPD',
  description: 'Tous nos articles sur la prospection B2B en France : comment trouver des emails, cold emailing, conformité RGPD, comparatifs d\'outils.',
  alternates: { canonical: 'https://volia.fr/blog' },
  openGraph: {
    title: 'Blog Volia — Prospection B2B en France',
    description: 'Conseils, comparatifs, guides RGPD pour la prospection B2B en France.',
    url: 'https://volia.fr/blog',
  },
};

export default async function BlogIndex() {
  const posts = await getAllPostsWithAuto();

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <ReaderHeader />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <Tag size={12} />
            Blog Volia
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-content-primary">
            Conseils & guides prospection B2B
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-2xl">
            Méthodes testées, comparatifs d&apos;outils, conformité RGPD, hacks 2026. Tout ce qu&apos;il faut savoir pour prospecter efficacement en France.
          </p>
        </section>

        {/* Articles list */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-6 group"
              >
                <div className="flex items-center gap-3 text-xs text-content-tertiary mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300">{post.category}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.readTime} min
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-violet-400 transition">
                  {post.title}
                </h2>
                <p className="text-sm text-content-secondary leading-relaxed mb-4">{post.description}</p>
                <div className="flex items-center gap-2 text-sm text-violet-400 font-semibold">
                  Lire l&apos;article
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter capture en fin de hub */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <NewsletterCapture
            source="blog-hub"
            title="Recevez le meilleur du blog en 1 email/mois"
            subtitle="Sélection des articles les plus lus + 1 stat marché B2B + 1 ressource gratuite. Le 1er du mois."
          />
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
