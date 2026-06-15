// ─────────────────────────────────────────────────────────────────────
// /pour/immobilier-entreprise — Landing verticale "immobilier d'entreprise"
// ─────────────────────────────────────────────────────────────────────
// Page autonome (PAS via le système /pour/[persona], qui injecte des
// témoignages placeholder). Ici : zéro faux témoignage, uniquement des
// preuves réelles (outil gratuit, étude, find-rate mesuré, RGPD).
// Cible : agents / conseils en immobilier d'ENTREPRISE (B2B). Honnête sur
// le périmètre : Volia trouve et contacte les ENTREPRISES, pas les biens,
// et n'est PAS un outil de pige résidentielle (B2C).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  ArrowRight, Building2, MapPin, Phone, ShieldCheck, Search, Users, Repeat, CheckCircle2,
} from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

const BASE_URL = 'https://volia.fr';
const PAGE_URL = `${BASE_URL}/pour/immobilier-entreprise`;

export const metadata = {
  title: "Volia pour l'immobilier d'entreprise — trouve les entreprises à prospecter",
  description:
    "Conseils en immobilier d'entreprise : identifiez les sociétés d'une zone, obtenez l'email pro + le téléphone du décideur, contactez-les et suivez tout dans un CRM. Données B2B vérifiées, conforme RGPD, gratuit pour démarrer puis dès 19 €/mois.",
  alternates: { canonical: PAGE_URL },
  keywords: [
    'prospection immobilier entreprise',
    'logiciel prospection immobilier commercial',
    'trouver entreprises locaux bureaux',
    'fichier entreprises par ville',
    'CRM immobilier entreprise',
    'prospection B2B immobilier',
  ],
  openGraph: {
    title: "Volia pour l'immobilier d'entreprise",
    description:
      "Identifiez les entreprises d'une zone, obtenez l'email pro + le téléphone du décideur, prospectez et suivez tout dans un CRM. Conforme RGPD, gratuit pour démarrer puis dès 19 €/mois.",
    url: PAGE_URL,
    type: 'website',
  },
};

const PAINS = [
  "Identifier les entreprises d'une zone susceptibles de chercher des bureaux ou des locaux, c'est des heures sur LinkedIn, les annuaires et le terrain.",
  "Tu as le bien, mais pas le bon contact : joindre le dirigeant ou le responsable des locaux sans son email ni son téléphone direct, c'est le mur.",
  "Ton réseau d'apporteurs (notaires, syndics, experts-comptables, gestionnaires) se construit à la main, un café à la fois.",
];

const USE_CASES = [
  {
    icon: MapPin,
    title: "Cartographie des entreprises d'une zone",
    desc: "Choisis un secteur + une ville ou un département → la liste des entreprises locales, avec email professionnel et téléphone. Ton vivier de preneurs, de propriétaires et de prescripteurs.",
  },
  {
    icon: Phone,
    title: 'Joindre le bon décideur',
    desc: "Email pro vérifié + téléphone à chaque ligne. Jamais d'email deviné — 100 % sont trouvés sur le site de l'entreprise ou via une recherche, donc tes prises de contact ne bouncent pas.",
  },
  {
    icon: Users,
    title: "Ton réseau d'apporteurs en quelques clics",
    desc: "Notaires, syndics, experts-comptables, gestionnaires de patrimoine de ta zone : trouve-les, contacte-les, entretiens la relation. Le référencement croisé qui nourrit ton pipeline.",
  },
  {
    icon: Repeat,
    title: 'Relances + CRM intégrés',
    desc: "Séquences email, suivi des échanges et pipeline commercial natif — sans empiler trois outils. Tu gardes la main, l'outil fait la corvée.",
  },
];

const PROOF = [
  { value: '0', label: "email deviné — 100 % vérifiés" },
  { value: '~46 %', label: "d'email pro trouvé (entreprises avec site)" },
  { value: '150+', label: 'secteurs ciblables · 101 départements' },
  { value: '19 €', label: "par mois (Prospection) · démarrage gratuit sans CB" },
];

const FAQ = [
  {
    q: "C'est pour l'immobilier résidentiel aussi ?",
    a: "Non, et on préfère être clairs : Volia est un outil de prospection B2B. Il trouve et contacte des entreprises (preneurs, propriétaires, prescripteurs), pas des particuliers vendeurs. Pour la pige résidentielle, ce n'est pas le bon outil. Pour l'immobilier d'entreprise et le réseau de partenaires pros, oui.",
  },
  {
    q: "Est-ce conforme au RGPD ?",
    a: "Oui, par conception. Volia cible des emails professionnels (prospection B2B encadrée par l'intérêt légitime), filtre les emails personnels, propose une page d'opt-out publique et un opt-out 1 clic. Vous restez responsable de l'usage — l'outil ne lance aucun envoi à votre place.",
  },
  {
    q: "D'où viennent les données ?",
    a: "De sources publiques (Google Places + le web). À chaque recherche, on interroge en direct puis on enrichit l'email pro quand il est trouvable. On ne revend pas de base figée : les coordonnées sont fraîches, jamais devinées.",
  },
  {
    q: "Combien ça coûte ?",
    a: "Le plan Gratuit donne accès à toute la suite (prospection + campagnes + CRM + formulaires) avec des limites, sans carte bancaire. Le plan Prospection est à 19 €/mois (500 emails + 500 téléphones/mois). Pour la suite illimitée + l'Autopilot, le plan MAX est à 179 €/mois — code MAX99 : les 3 premiers mois à 99 €. À l'inscription, tu as 14 jours de MAX offerts sans carte bancaire.",
  },
];

export default function ImmobilierEntreprisePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([
        { label: 'Accueil', href: '/' },
        { label: 'Pour', href: '/' },
        { label: "Immobilier d'entreprise" },
      ]),
      {
        '@type': 'WebPage',
        name: metadata.title,
        description: metadata.description,
        url: PAGE_URL,
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-5">
            <Building2 size={12} /> Pour l'immobilier d'entreprise
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
            Les bureaux, tu les as.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Trouve les entreprises à qui les louer.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-content-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
            Volia identifie les entreprises d'une zone, te donne l'email pro et le téléphone du décideur,
            et te laisse prospecter puis tout suivre dans un CRM. Données B2B vérifiées, conformes RGPD,
            gratuit pour démarrer, dès 19 €/mois pour passer à l'échelle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup?plan=pro"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              Démarrer (sans carte bancaire) <ArrowRight size={16} />
            </Link>
            <Link
              href="/outils/trouver-emails"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-line text-content-primary text-sm font-semibold hover:bg-surface-elevated transition"
            >
              <Search size={16} /> Tester l'outil gratuitement
            </Link>
          </div>
          <p className="text-xs text-content-tertiary mt-4">
            Ex. : « <strong className="text-content-secondary">PME industrielles à Marseille</strong> » ou
            « <strong className="text-content-secondary">cabinets de conseil à Lyon</strong> » → la liste, avec contacts.
          </p>
        </section>

        {/* PROBLÈME */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-xl font-bold mb-6">Le vrai goulot, ce n'est pas le bien. C'est le contact.</h2>
          <div className="space-y-3">
            {PAINS.map((p, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-line bg-surface-elevated/40 p-4">
                <span className="text-rose-400 mt-0.5 flex-shrink-0 font-bold">✕</span>
                <p className="text-sm text-content-secondary leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* USE CASES */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-xl font-bold mb-6">Ce que Volia fait pour toi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USE_CASES.map((u) => {
              const Icon = u.icon;
              return (
                <div key={u.title} className="rounded-2xl border border-line bg-surface-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-3">
                    <Icon size={18} />
                  </div>
                  <div className="font-semibold mb-1.5">{u.title}</div>
                  <p className="text-sm text-content-secondary leading-relaxed">{u.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PREUVES (réelles, pas de témoignages inventés) */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-xl font-bold mb-2">Pourquoi des conseils en immobilier d'entreprise choisissent Volia</h2>
          <p className="text-sm text-content-secondary mb-6">Pas de promesse magique — des faits.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {PROOF.map((p) => (
              <div key={p.label} className="rounded-xl border border-line bg-surface-card p-4 text-center">
                <div className="text-2xl font-bold text-violet-300">{p.value}</div>
                <div className="text-[11px] text-content-tertiary mt-1 leading-snug">{p.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-surface-elevated/40 p-5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-content-secondary leading-relaxed">
              <strong className="text-content-primary">Périmètre, sans flou :</strong> Volia trouve et contacte les{' '}
              <strong className="text-content-primary">entreprises</strong> (preneurs, propriétaires, prescripteurs) — pas les biens,
              et ce n'est pas un outil de pige résidentielle. Pour l'immobilier d'entreprise et ton réseau de partenaires pros,
              c'est exactement fait pour ça.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-xl font-bold mb-6">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <details key={i} className="group rounded-xl border border-line bg-surface-elevated/40 p-4">
                <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between gap-2">
                  {f.q}
                  <span className="text-content-tertiary group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="text-sm text-content-secondary leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
          <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Teste sur ta zone, gratuitement</h2>
            <p className="text-sm text-content-secondary mb-5 max-w-xl mx-auto">
              Lance une recherche sur ton secteur cible et vois ce que Volia remonte — avant même de créer un compte.
              Plan Prospection à 19 €/mois pour passer à l'échelle, MAX à 179 €/mois pour la suite illimitée (code MAX99 : 3 mois à 99 €).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/outils/trouver-emails"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
              >
                <Search size={16} /> Tester l'outil gratuit
              </Link>
              <Link
                href="/signup?plan=pro"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 text-sm font-semibold transition"
              >
                Créer mon compte <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-5 text-xs text-content-tertiary flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link href="/etude" className="hover:text-content-secondary inline-flex items-center gap-1"><CheckCircle2 size={11} /> Notre étude prospection B2B</Link>
              <Link href="/produits/prospection" className="hover:text-content-secondary">Volia Prospection</Link>
              <Link href="/pricing" className="hover:text-content-secondary">Tarifs</Link>
            </div>
          </div>
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
