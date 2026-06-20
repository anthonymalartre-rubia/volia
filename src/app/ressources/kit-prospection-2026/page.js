// /ressources/kit-prospection-2026 — Landing « lead magnet » dédiée.
// Regroupe 4 ressources existantes en un seul point d'entrée + 1 CTA propre,
// pour les posts LinkedIn (lien unique, message clair). Chaque pièce renvoie
// vers sa page /ressources/[slug] où se fait la capture email.

import Link from 'next/link';
import { Mail, ShieldCheck, Phone, TrendingUp, Check, ArrowRight, Download, Sparkles } from 'lucide-react';
import { getResource } from '@/lib/resources';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

const KIT_SLUGS = [
  { slug: 'templates-cold-email-b2b-fr', icon: Mail },
  { slug: 'checklist-rgpd-cold-email', icon: ShieldCheck },
  { slug: 'script-cold-call-b2b-fr', icon: Phone },
  { slug: 'calculateur-roi-prospection-b2b', icon: TrendingUp },
];

export const metadata = {
  title: 'Kit Prospection B2B 2026 — gratuit (templates, checklist RGPD, scripts, calculateur)',
  description:
    'Le kit gratuit pour prospecter proprement en 2026 : 20 templates cold email RGPD, checklist RGPD 47 points, 5 scripts d\'appel à froid et un calculateur de ROI. Made in France, l\'IA fait la corvée, tu gardes la main.',
  alternates: { canonical: 'https://volia.fr/ressources/kit-prospection-2026' },
  keywords: [
    'kit prospection b2b gratuit',
    'templates cold email gratuit',
    'checklist rgpd cold email',
    'scripts cold call',
    'calculateur roi prospection',
    'prospection b2b 2026',
  ],
  openGraph: {
    title: 'Kit Prospection B2B 2026 — gratuit',
    description: '20 templates cold email + checklist RGPD + scripts d\'appel + calculateur ROI. Gratuit, Made in France.',
    type: 'website',
    url: 'https://volia.fr/ressources/kit-prospection-2026',
  },
};

export default function KitProspection2026Page() {
  const pieces = KIT_SLUGS.map(({ slug, icon }) => ({ ...getResource(slug), slug, Icon: icon })).filter((p) => p.title);

  const breadcrumb = breadcrumbSchema([
    { name: 'Accueil', url: 'https://volia.fr' },
    { name: 'Ressources', url: 'https://volia.fr/ressources' },
    { name: 'Kit Prospection B2B 2026', url: 'https://volia.fr/ressources/kit-prospection-2026' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <ReaderHeader />
      <main id="main-content" className="bg-surface-base text-content-primary">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-1.5 text-xs font-semibold text-violet-500">
            <Sparkles className="h-3.5 w-3.5" /> 100 % gratuit · sans engagement
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Le Kit Prospection B2B{' '}
            <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">2026</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-content-secondary">
            Tout ce qu'on aurait aimé avoir quand on a commencé la prospection B2B.
            Pas de promesse magique — juste les outils des TPE/PME qui prospectent proprement.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-content-tertiary">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Made in France</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> RGPD natif</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> L'IA fait la corvée, tu décides</span>
          </div>
          <a
            href="#pieces"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-95"
          >
            <Download className="h-5 w-5" /> Récupérer le kit (gratuit)
          </a>
        </section>

        {/* Les 4 pièces */}
        <section id="pieces" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h2 className="text-center text-2xl font-bold">Ce qu'il y a dans le kit</h2>
          <p className="mx-auto mt-2 mb-8 max-w-md text-center text-sm text-content-tertiary">
            4 ressources, téléchargeables une par une. Clique pour récupérer celle qui t'intéresse.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {pieces.map((p) => (
              <Link
                key={p.slug}
                href={`/ressources/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-surface-raised p-6 transition hover:border-violet-500/40 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <p.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-content-secondary">{p.shortDesc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-500">
                  Télécharger <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA produit */}
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
            <h2 className="text-2xl font-bold">Et si tu automatisais tout ça ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-content-secondary">
              Volia trouve les entreprises, récupère l'email pro vérifié, rédige un 1ᵉʳ jet personnalisé
              et range dans le CRM. <strong>L'IA fait la corvée, tu gardes la main.</strong>
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                Essayer Volia gratuitement <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ressources"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 font-medium text-content-secondary transition hover:bg-surface-base"
              >
                Voir toutes les ressources
              </Link>
            </div>
            <p className="mt-4 text-xs text-content-tertiary">
              Gratuit pour démarrer · sans carte bancaire · 🇫🇷 RGPD natif
            </p>
          </div>
        </section>
      </main>
      <ReaderFooter />
    </>
  );
}
