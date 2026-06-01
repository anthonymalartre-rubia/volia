// ─────────────────────────────────────────────────────────────────────
// /presse/cp/[slug] — Page communiqué de presse (HTML print-friendly)
// ─────────────────────────────────────────────────────────────────────
// Rendu sobre, structure officielle CP français (eyebrow, lieu+date,
// titre, lead, corps, citation, boilerplate, contact).
// CSS optimisée pour impression — les journalistes peuvent imprimer en
// PDF via leur navigateur (Cmd+P → Sauvegarder en PDF) sans qualité dégradée.
// ─────────────────────────────────────────────────────────────────────

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowLeft, Printer, Globe } from 'lucide-react';
import { PRESS_RELEASES_FULL, PRESS_CONTACT } from '@/lib/press-kit';

export async function generateStaticParams() {
  return Object.keys(PRESS_RELEASES_FULL).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const cp = PRESS_RELEASES_FULL[params.slug];
  if (!cp) return { title: 'Communiqué introuvable' };
  return {
    title: `${cp.title} | Communiqué de presse Volia`,
    description: cp.lead.slice(0, 160),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: cp.title,
      description: cp.lead.slice(0, 200),
      type: 'article',
      publishedTime: cp.date,
    },
  };
}

export default function PressReleasePage({ params }) {
  const cp = PRESS_RELEASES_FULL[params.slug];
  if (!cp) notFound();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden border-b border-slate-200 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
          <Link href="/presse" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium">
            <ArrowLeft size={14} /> Espace presse
          </Link>
          <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 font-semibold text-xs"
          >
            <Printer size={12} /> Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <article className="max-w-3xl mx-auto px-6 py-12 print:py-6 print:max-w-none print:px-12">
        {/* Header officiel */}
        <header className="mb-10 print:mb-8">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-violet-700">
                {cp.eyebrow}
              </div>
              <div className="text-2xl font-bold mt-1 tracking-tight">Volia</div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="font-semibold">{cp.location}</div>
              <div>{cp.dateLabel}</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-slate-900 mb-6 print:text-2xl">
            {cp.title}
          </h1>

          <p className="text-base leading-relaxed text-slate-800 font-medium border-l-4 border-violet-500 pl-4">
            {cp.lead}
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-8 print:space-y-6">
          {cp.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                {section.heading}
              </h2>
              <div className="space-y-3 text-[15px] leading-relaxed text-slate-800">
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Citation founder */}
        {cp.quote && (
          <aside className="my-10 print:my-6 p-6 bg-violet-50 border-l-4 border-violet-500 rounded-r print:bg-white print:border-slate-400">
            <blockquote className="text-base italic leading-relaxed text-slate-900 mb-3">
              « {cp.quote.text} »
            </blockquote>
            <footer className="text-xs text-slate-700">
              <span className="font-semibold">{cp.quote.author}</span>
              {cp.quote.authorRole && <span>, {cp.quote.authorRole}</span>}
            </footer>
          </aside>
        )}

        {/* Boilerplate à propos */}
        <section className="mt-10 pt-6 border-t border-slate-300 print:mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
            À propos de Volia
          </h2>
          <p className="text-[13px] leading-relaxed text-slate-700">
            {cp.boilerplate}
          </p>
        </section>

        {/* Contact presse */}
        <section className="mt-8 pt-6 border-t border-slate-300">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
            Contact presse
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <div className="flex items-start gap-2">
              <Mail size={14} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{PRESS_CONTACT.founderEmail}</div>
                <div className="text-xs text-slate-600">Anthony Malartre — Fondateur</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail size={14} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{PRESS_CONTACT.email}</div>
                <div className="text-xs text-slate-600">Délai de réponse : {PRESS_CONTACT.responseTime}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{PRESS_CONTACT.city}</div>
                <div className="text-xs text-slate-600">France</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe size={14} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">volia.fr</div>
                <div className="text-xs text-slate-600">Press kit complet : volia.fr/presse</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer print */}
        <footer className="mt-10 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 print:mt-6">
          Communiqué de presse Volia — {cp.dateLabel} — volia.fr/presse/cp/{cp.slug}
        </footer>
      </article>

      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1.5cm;
            size: A4;
          }
          body {
            font-size: 11pt;
            line-height: 1.5;
          }
          aside, section {
            page-break-inside: avoid;
          }
          h1, h2 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
