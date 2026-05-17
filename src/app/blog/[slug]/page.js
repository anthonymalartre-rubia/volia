import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Zap } from 'lucide-react';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://prospectia.cloud/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://prospectia.cloud/blog/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

// Tiny inline markdown renderer (h2, h3, lists, paragraphs, bold, code, links, tables)
function renderMarkdown(md) {
  if (!md) return null;
  const lines = md.split('\n');
  const blocks = [];
  let currentList = null;
  let currentCodeBlock = null;
  let currentTable = null;
  let key = 0;

  const flushList = () => {
    if (currentList) {
      blocks.push(<ul key={key++} className="list-disc list-inside space-y-2 mb-4 text-zinc-300">{currentList}</ul>);
      currentList = null;
    }
  };

  const flushCodeBlock = () => {
    if (currentCodeBlock) {
      blocks.push(
        <pre key={key++} className="rounded-xl bg-zinc-900 border border-white/[0.06] p-4 overflow-x-auto mb-4 text-xs text-zinc-300">
          <code>{currentCodeBlock.join('\n')}</code>
        </pre>
      );
      currentCodeBlock = null;
    }
  };

  const flushTable = () => {
    if (currentTable && currentTable.length > 1) {
      const [header, , ...rows] = currentTable;
      blocks.push(
        <div key={key++} className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.1]">
                {header.map((h, i) => <th key={i} className="text-left p-2 text-violet-400 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {row.map((cell, j) => <td key={j} className="p-2 text-zinc-300">{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    } else {
      currentTable = null;
    }
  };

  const renderInline = (text) => {
    if (!text) return text;
    // Bold **text**
    const parts = [];
    let lastIdx = 0;
    const regex = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    let i = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
      if (m[1]) parts.push(<strong key={`b${i++}`} className="text-white font-semibold">{m[1]}</strong>);
      else if (m[2]) parts.push(<code key={`c${i++}`} className="px-1.5 py-0.5 rounded bg-zinc-800 text-violet-300 text-[0.9em]">{m[2]}</code>);
      else if (m[3] && m[4]) parts.push(<Link key={`l${i++}`} href={m[4]} className="text-violet-400 hover:underline">{m[3]}</Link>);
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
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (!currentTable) currentTable = [];
      currentTable.push(cells);
      continue;
    } else if (currentTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith('## ')) {
      flushList();
      blocks.push(<h2 key={key++} className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-white">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      flushList();
      blocks.push(<h3 key={key++} className="text-xl font-bold mt-6 mb-3 text-white">{renderInline(line.slice(4))}</h3>);
    }
    // List items
    else if (/^[-*]\s/.test(line)) {
      if (!currentList) currentList = [];
      currentList.push(<li key={key++}>{renderInline(line.replace(/^[-*]\s/, ''))}</li>);
    }
    // Empty line
    else if (!line.trim()) {
      flushList();
    }
    // Paragraph
    else {
      flushList();
      blocks.push(<p key={key++} className="text-zinc-300 leading-relaxed mb-4">{renderInline(line)}</p>);
    }
  }

  flushList();
  flushCodeBlock();
  flushTable();
  return blocks;
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const otherPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Prospectia',
      url: 'https://prospectia.cloud',
    },
    url: `https://prospectia.cloud/blog/${slug}`,
    mainEntityOfPage: `https://prospectia.cloud/blog/${slug}`,
  };

  return (
    <div className="dark min-h-screen bg-[#08080c] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
        {/* Back to blog */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Tous les articles
          </Link>
        </div>

        {/* Article header */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300">{post.category}</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {post.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <User size={11} />
              {post.author}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
            {post.title}
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-12 pb-8 border-b border-white/[0.06]">
            {post.description}
          </p>

          {/* Article content */}
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(post.content)}
          </div>

          {/* CTA after article */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Trouvez vos prospects en quelques clics</h2>
            <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
              Prospectia trouve les emails B2B que vos concurrents ratent. 49€/mois, recherches illimitées.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              <Zap size={16} />
              Démarrer gratuitement
            </Link>
          </div>
        </article>

        {/* Related posts */}
        {otherPosts.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
            <h2 className="text-xl font-bold mb-6">À lire aussi</h2>
            <div className="space-y-3">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/30 transition p-4 group"
                >
                  <h3 className="font-semibold mb-1 group-hover:text-violet-400 transition">{p.title}</h3>
                  <p className="text-sm text-zinc-500">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
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
