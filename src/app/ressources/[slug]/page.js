import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { getResource, getAllResources } from '@/lib/resources';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import ResourceDownloadForm from '@/components/ResourceDownloadForm';

export async function generateStaticParams() {
  return getAllResources().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = getResource(slug);
  if (!r) return {};

  return {
    title: `${r.title} — Ressource gratuite Prospectia`,
    description: r.shortDesc,
    keywords: r.keywords,
    alternates: { canonical: `https://prospectia.cloud/ressources/${slug}` },
    openGraph: {
      title: r.title,
      description: r.shortDesc,
      url: `https://prospectia.cloud/ressources/${slug}`,
      type: 'article',
    },
  };
}

// Rendu markdown minimal (h2, h3, lists, bold, code, links)
function renderMarkdown(md) {
  if (!md) return null;
  const lines = md.split('\n');
  const blocks = [];
  let currentList = null;
  let currentOlist = null;
  let key = 0;

  const flushLists = () => {
    if (currentList) { blocks.push(<ul key={key++} className="list-disc list-inside space-y-2 mb-4 text-content-secondary">{currentList}</ul>); currentList = null; }
    if (currentOlist) { blocks.push(<ol key={key++} className="list-decimal list-inside space-y-2 mb-4 text-content-secondary">{currentOlist}</ol>); currentOlist = null; }
  };

  const renderInline = (text) => {
    if (!text) return text;
    const parts = [];
    let lastIdx = 0;
    const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    let i = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
      if (m[1]) parts.push(<strong key={`b${i++}`} className="text-content-primary font-semibold">{m[1]}</strong>);
      else if (m[2] && m[3]) parts.push(<Link key={`l${i++}`} href={m[3]} className="text-violet-400 hover:underline">{m[2]}</Link>);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx));
    return parts.length ? parts : text;
  };

  for (const line of lines) {
    if (line.startsWith('### ')) { flushLists(); blocks.push(<h3 key={key++} className="text-xl font-bold mt-6 mb-3 text-content-primary">{renderInline(line.slice(4))}</h3>); }
    else if (line.startsWith('## ')) { flushLists(); blocks.push(<h2 key={key++} className="text-2xl font-bold mt-8 mb-3 text-content-primary">{renderInline(line.slice(3))}</h2>); }
    else if (/^\d+\.\s/.test(line)) { if (!currentOlist) currentOlist = []; currentOlist.push(<li key={key++}>{renderInline(line.replace(/^\d+\.\s/, ''))}</li>); }
    else if (/^[-*]\s/.test(line)) { if (!currentList) currentList = []; currentList.push(<li key={key++}>{renderInline(line.replace(/^[-*]\s/, ''))}</li>); }
    else if (!line.trim()) flushLists();
    else { flushLists(); blocks.push(<p key={key++} className="text-content-secondary leading-relaxed mb-4">{renderInline(line)}</p>); }
  }
  flushLists();
  return blocks;
}

export default async function RessourcePage({ params }) {
  const { slug } = await params;
  const r = getResource(slug);
  if (!r) notFound();

  // 3 autres ressources suggérées
  const others = getAllResources().filter((x) => x.slug !== slug).slice(0, 3);

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Ressources', href: '/ressources' },
    { label: r.title.length > 60 ? r.title.slice(0, 60) + '…' : r.title },
  ];

  // JSON-LD : CreativeWork ou HowTo selon le type
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'CreativeWork',
        name: r.title,
        headline: r.title,
        description: r.shortDesc,
        url: `https://prospectia.cloud/ressources/${r.slug}`,
        keywords: r.keywords.join(', '),
        inLanguage: 'fr-FR',
        isAccessibleForFree: true,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        creator: {
          '@type': 'Organization',
          name: 'Prospectia',
          url: 'https://prospectia.cloud',
        },
        encodingFormat: r.format,
        ...(r.pages && { numberOfPages: r.pages }),
        ...(r.fileSize && { fileSize: r.fileSize }),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/ressources" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Toutes les ressources
          </Link>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="mb-10">
            <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300">{r.category}</span>
              <span>{r.format}</span>
              {r.pages && (<><span>·</span><span>{r.pages} pages</span></>)}
              {r.fileSize && (<><span>·</span><span>{r.fileSize}</span></>)}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
              {r.title}
            </h1>
            <p className="text-lg text-content-secondary leading-relaxed">
              {r.shortDesc}
            </p>
          </div>

          {/* 2 colonnes : description longue à gauche, formulaire à droite */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Description longue */}
            <div className="lg:col-span-2 prose prose-invert max-w-none">
              {renderMarkdown(r.longDesc)}
            </div>

            {/* Sticky form */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <ResourceDownloadForm resource={r} />
              </div>
            </div>
          </div>

          {/* Article lié */}
          {r.relatedArticle && (
            <div className="mb-12 rounded-2xl border border-line bg-surface-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-violet-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Article complet associé</div>
                  <Link href={r.relatedArticle} className="text-base font-semibold text-content-primary hover:text-violet-400 transition inline-flex items-center gap-1.5">
                    Lire l&apos;article détaillé sur le sujet
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Autres ressources */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Autres ressources gratuites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/ressources/${o.slug}`}
                  className="group rounded-xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-4"
                >
                  <div className="text-xs text-violet-300 mb-1">{o.category}</div>
                  <h3 className="font-semibold text-content-primary group-hover:text-violet-400 transition mb-1 text-sm leading-snug">
                    {o.title}
                  </h3>
                  <p className="text-xs text-content-tertiary leading-relaxed">{o.shortDesc.slice(0, 90)}…</p>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Prospectia */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Sparkles size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Au-delà de cette ressource</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              Prospectia trouve les entreprises et leurs emails partout en France.
              Gratuit pour commencer · à partir de 19 €/mois — le ticket d&apos;entrée le moins cher du marché français.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              Démarrer gratuitement
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
