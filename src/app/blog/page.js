import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog Prospectia — Prospection B2B, cold emailing, RGPD',
  description: 'Tous nos articles sur la prospection B2B en France : comment trouver des emails, cold emailing, conformité RGPD, comparatifs d\'outils.',
  alternates: { canonical: 'https://prospectia.cloud/blog' },
  openGraph: {
    title: 'Blog Prospectia — Prospection B2B en France',
    description: 'Conseils, comparatifs, guides RGPD pour la prospection B2B en France.',
    url: 'https://prospectia.cloud/blog',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="dark min-h-screen bg-[#08080c] text-white">
      <nav className="fixed top-0 w-full z-50 bg-[#08080c]/70 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-1.5">
              <span className="text-[11px] font-bold text-white">P</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Prospectia</span>
            <span className="text-violet-400 text-xs font-semibold">.cloud</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">Se connecter</Link>
            <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition">
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <Tag size={12} />
            Blog Prospectia
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Conseils & guides prospection B2B
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
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
                className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/30 transition p-6 group"
              >
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
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
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{post.description}</p>
                <div className="flex items-center gap-2 text-sm text-violet-400 font-semibold">
                  Lire l&apos;article
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">© 2026 Prospectia.cloud</div>
          <div className="flex gap-4 text-xs text-zinc-500">
            <Link href="/cgu" className="hover:text-zinc-300 transition">CGU</Link>
            <Link href="/confidentialite" className="hover:text-zinc-300 transition">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-zinc-300 transition">RGPD</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
