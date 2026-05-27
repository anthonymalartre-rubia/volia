// ─────────────────────────────────────────────────────────────────────
// /docs/[slug] — Article de documentation
// ─────────────────────────────────────────────────────────────────────
// Server component (SEO).
// - Sidebar permanente (DocsSidebar) à gauche, contenu à droite.
// - JSON-LD Article + BreadcrumbList.
// - Markdown renderer inline (même pattern que /blog/[slug]).
// ─────────────────────────────────────────────────────────────────────

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ChevronRight, Home } from 'lucide-react';
import {
  DOCS_CATEGORIES,
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryById,
} from '@/lib/docs';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import DocsSidebar from '@/components/DocsSidebar';
import DocsContactFooter from '@/components/DocsContactFooter';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} — Aide Volia`,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: `https://volia.fr/docs/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://volia.fr/docs/${slug}`,
      type: 'article',
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

// ─── Tiny markdown renderer (h2/h3/lists/code/tables/links/bold/inline-code)
//    Forked depuis /blog/[slug] pour cohérence stylistique.
function renderMarkdown(md) {
  if (!md) return null;
  const lines = md.split('\n');
  const blocks = [];
  let currentList = null;
  let currentOrdered = null;
  let currentCodeBlock = null;
  let currentCodeLang = '';
  let currentTable = null;
  let key = 0;

  const flushList = () => {
    if (currentList) {
      blocks.push(
        <ul
          key={key++}
          className="list-disc list-outside ml-5 space-y-2 mb-5 text-content-secondary marker:text-violet-500/60"
        >
          {currentList}
        </ul>,
      );
      currentList = null;
    }
    if (currentOrdered) {
      blocks.push(
        <ol
          key={key++}
          className="list-decimal list-outside ml-5 space-y-2 mb-5 text-content-secondary marker:text-violet-500/60 marker:font-semibold"
        >
          {currentOrdered}
        </ol>,
      );
      currentOrdered = null;
    }
  };

  const flushCodeBlock = () => {
    if (currentCodeBlock) {
      blocks.push(
        <pre
          key={key++}
          className="rounded-xl bg-surface-deep border border-line p-4 overflow-x-auto mb-5 text-xs text-content-secondary"
        >
          <code>{currentCodeBlock.join('\n')}</code>
        </pre>,
      );
      currentCodeBlock = null;
      currentCodeLang = '';
    }
  };

  const flushTable = () => {
    if (currentTable && currentTable.length > 1) {
      const [header, , ...rows] = currentTable;
      blocks.push(
        <div key={key++} className="overflow-x-auto mb-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line-hover">
                {header.map((h, i) => (
                  <th
                    key={i}
                    className="text-left p-2 text-violet-500 dark:text-violet-400 font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-line">
                  {row.map((cell, j) => (
                    <td key={j} className="p-2 text-content-secondary">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }
    currentTable = null;
  };

  const renderInline = (text) => {
    if (!text) return text;
    const parts = [];
    let lastIdx = 0;
    const regex = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    let i = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
      if (m[1])
        parts.push(
          <strong
            key={`b${i++}`}
            className="text-content-primary font-semibold"
          >
            {m[1]}
          </strong>,
        );
      else if (m[2])
        parts.push(
          <code
            key={`c${i++}`}
            className="px-1.5 py-0.5 rounded bg-surface-elevated text-violet-500 dark:text-violet-300 text-[0.9em]"
          >
            {m[2]}
          </code>,
        );
      else if (m[3] && m[4])
        parts.push(
          <Link
            key={`l${i++}`}
            href={m[4]}
            className="text-violet-500 dark:text-violet-400 hover:underline"
          >
            {m[3]}
          </Link>,
        );
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx));
    return parts.length ? parts : text;
  };

  for (const rawLine of lines) {
    const line = rawLine;

    // Code block fence
    if (line.startsWith('```')) {
      if (currentCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        flushTable();
        currentCodeBlock = [];
        currentCodeLang = line.slice(3).trim();
      }
      continue;
    }
    if (currentCodeBlock) {
      currentCodeBlock.push(line);
      continue;
    }

    // Table row
    if (line.startsWith('|')) {
      flushList();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      if (!currentTable) currentTable = [];
      currentTable.push(cells);
      continue;
    } else if (currentTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2
          key={key++}
          className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-content-primary scroll-mt-24"
        >
          {renderInline(line.slice(3))}
        </h2>,
      );
    } else if (line.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3
          key={key++}
          className="text-lg sm:text-xl font-bold mt-7 mb-3 text-content-primary scroll-mt-24"
        >
          {renderInline(line.slice(4))}
        </h3>,
      );
    }
    // Ordered list item (1. 2. 3.)
    else if (/^\d+\.\s/.test(line)) {
      if (currentList) flushList();
      if (!currentOrdered) currentOrdered = [];
      currentOrdered.push(
        <li key={key++}>{renderInline(line.replace(/^\d+\.\s/, ''))}</li>,
      );
    }
    // Unordered list item (- ou *)
    else if (/^[-*]\s/.test(line)) {
      if (currentOrdered) flushList();
      if (!currentList) currentList = [];
      currentList.push(<li key={key++}>{renderInline(line.replace(/^[-*]\s/, ''))}</li>);
    }
    // Image (placeholder pour /docs/screenshots/*.png)
    else if (/^!\[(.*?)\]\((.*?)\)/.test(line)) {
      flushList();
      const match = line.match(/^!\[(.*?)\]\((.*?)\)/);
      blocks.push(
        <div
          key={key++}
          className="my-6 rounded-xl border border-line bg-surface-elevated p-3 text-center text-xs text-content-muted italic"
        >
          [Capture : {match[1] || 'illustration'} — {match[2]}]
        </div>,
      );
    }
    // Empty line
    else if (!line.trim()) {
      flushList();
    }
    // Paragraph
    else {
      flushList();
      blocks.push(
        <p
          key={key++}
          className="text-content-secondary leading-relaxed mb-4"
        >
          {renderInline(line)}
        </p>,
      );
    }
  }

  flushList();
  flushCodeBlock();
  flushTable();
  return blocks;
}

export default async function DocsArticle({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryById(article.category);
  const allArticles = getAllArticles();
  const sameCatArticles = getArticlesByCategory(article.category);
  const idxInCat = sameCatArticles.findIndex((a) => a.slug === slug);
  const prevArticle = idxInCat > 0 ? sameCatArticles[idxInCat - 1] : null;
  const nextArticle =
    idxInCat < sameCatArticles.length - 1 ? sameCatArticles[idxInCat + 1] : null;

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Doc', href: '/docs' },
    { label: category?.label || 'Catégorie' },
    { label: article.title },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'TechArticle',
        headline: article.title,
        description: article.description,
        dateModified: article.updatedAt,
        author: {
          '@type': 'Organization',
          name: 'Volia',
          url: 'https://volia.fr',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Volia',
          url: 'https://volia.fr',
          logo: {
            '@type': 'ImageObject',
            url: 'https://volia.fr/icon.svg',
          },
        },
        url: `https://volia.fr/docs/${slug}`,
        mainEntityOfPage: `https://volia.fr/docs/${slug}`,
        inLanguage: 'fr-FR',
        articleSection: category?.label,
        keywords: (article.tags || []).join(', '),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReaderHeader />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <DocsSidebar
            categories={DOCS_CATEGORIES}
            articles={allArticles}
            currentSlug={slug}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Breadcrumbs */}
            <nav
              aria-label="Fil d'Ariane"
              className="flex items-center gap-1.5 text-xs text-content-muted mb-5 flex-wrap"
            >
              <Link href="/" className="hover:text-content-primary transition flex items-center gap-1">
                <Home size={11} />
                Accueil
              </Link>
              <ChevronRight size={11} />
              <Link href="/docs" className="hover:text-content-primary transition">
                Doc
              </Link>
              <ChevronRight size={11} />
              {category && (
                <>
                  <span>{category.label}</span>
                  <ChevronRight size={11} />
                </>
              )}
              <span className="text-content-tertiary truncate">{article.title}</span>
            </nav>

            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-violet-500 dark:hover:text-violet-400 transition mb-4 lg:hidden"
            >
              <ArrowLeft size={12} />
              Tous les guides
            </Link>

            {/* Header */}
            <header className="mb-8">
              {category && (
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-600 dark:text-violet-300 hover:bg-violet-500/15 transition mb-4"
                >
                  {category.label}
                </Link>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4 text-content-primary">
                {article.title}
              </h1>
              <p className="text-base sm:text-lg text-content-secondary leading-relaxed">
                {article.description}
              </p>
              {article.updatedAt && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-content-muted">
                  <Calendar size={11} />
                  Mis à jour le{' '}
                  {new Date(article.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </header>

            <hr className="border-line mb-8" />

            {/* Content */}
            <article className="prose-docs">{renderMarkdown(article.content)}</article>

            {/* Prev / next dans la catégorie */}
            {(prevArticle || nextArticle) && (
              <nav className="mt-12 grid sm:grid-cols-2 gap-3" aria-label="Articles adjacents">
                {prevArticle ? (
                  <Link
                    href={`/docs/${prevArticle.slug}`}
                    className="group rounded-xl border border-line bg-surface-card p-4 hover:border-violet-500/40 hover:bg-surface-elevated transition"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-content-muted mb-1">
                      ← Précédent
                    </p>
                    <p className="text-sm font-semibold text-content-primary group-hover:text-violet-500 dark:group-hover:text-violet-300 transition">
                      {prevArticle.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
                {nextArticle && (
                  <Link
                    href={`/docs/${nextArticle.slug}`}
                    className="group rounded-xl border border-line bg-surface-card p-4 hover:border-violet-500/40 hover:bg-surface-elevated transition sm:text-right"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-content-muted mb-1">
                      Suivant →
                    </p>
                    <p className="text-sm font-semibold text-content-primary group-hover:text-violet-500 dark:group-hover:text-violet-300 transition">
                      {nextArticle.title}
                    </p>
                  </Link>
                )}
              </nav>
            )}

            {/* Contact footer */}
            <DocsContactFooter />
          </div>
        </div>
      </main>

      <ReaderFooter />
    </div>
  );
}
