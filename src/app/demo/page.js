// ─────────────────────────────────────────────────────────────────────
// /demo — Page dédiée booking démo (Google Calendar appointments)
// ─────────────────────────────────────────────────────────────────────
// Public landing for booking a 15-min discovery call with Anthony,
// founder of Volia. Google Calendar appointments ne propose pas d'embed
// iframe officiel : on présente un gros CTA visuel qui ouvre le booking
// dans un nouvel onglet (parité fonctionnelle avec /demo Cal.com d'avant).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  Check, ShieldCheck, Clock, Wallet, Users as UsersIcon, CalendarCheck,
} from 'lucide-react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/demo`;

const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  'https://calendar.app.google/AN4reEL1poDB6KmW8';

export const metadata = {
  title: 'Réserver une démo Volia — 15 min avec Anthony, founder',
  description:
    "Réservez 15 minutes avec Anthony, founder de Volia, pour voir si la suite (Prospection + Campagnes + CRM) répond à votre besoin. Gratuit, sans engagement, en français.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Réserver une démo Volia — 15 min avec le founder',
    description: "Démo perso de Volia : 15 min pour cadrer votre besoin et voir l'outil en live. Gratuit, sans engagement.",
    url: PAGE_URL,
    type: 'website',
  },
  robots: {
    // On indexe la page mais on évite le partage de l'iframe Cal.com par les
    // crawlers (l'embed n'a pas grand intérêt SEO).
    index: true,
    follow: true,
  },
};

const WHAT_WE_COVER = [
  {
    title: 'Votre besoin',
    desc: 'Vous me racontez ce que vous cherchez à prospecter (secteur, zone, volume).',
  },
  {
    title: 'Demo live',
    desc: 'Je vous montre Volia en action sur votre cas (recherche + enrichissement temps réel).',
  },
  {
    title: 'Le bon plan',
    desc: 'On identifie le plan adapté à votre volume. Pas de upsell, pas de pitch.',
  },
  {
    title: 'Vos questions',
    desc: 'RGPD, intégration CRM, déliverabilité, roadmap : tout est sur la table.',
  },
];

const TRUST_POINTS = [
  { icon: Clock, label: '15 minutes max' },
  { icon: Wallet, label: 'Gratuit, sans engagement' },
  { icon: ShieldCheck, label: 'Pas besoin de signup' },
  { icon: UsersIcon, label: 'Founder direct, pas un SDR' },
];

const FAQ = [
  {
    q: "Dois-je créer un compte Volia avant la démo ?",
    a: "Non. La démo est ouverte à tout le monde : prospects, curieux, comparaisons concurrentielles. Vous décidez si vous voulez créer un compte après.",
  },
  {
    q: "Combien ça coûte ?",
    a: "Rien. La démo est 100% gratuite, sans engagement. C'est moi (Anthony, founder) qui vous reçois — pas un commercial.",
  },
  {
    q: "Vous parlez français ?",
    a: "Oui, l'équipe et l'outil sont 100% français. La démo se fait en français (ou en anglais si vous préférez).",
  },
  {
    q: "Combien dure la démo ?",
    a: "15 minutes par défaut. Si on a besoin de plus de temps pour couvrir votre cas, on programme un second call.",
  },
  {
    q: "Que faut-il préparer ?",
    a: "Idéalement : votre cible (secteur + zone géo) et le volume mensuel de prospects que vous visez. Mais on peut aussi démarrer à blanc.",
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function DemoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-surface-base text-content-primary">
        <ReaderHeader />

        <main className="pt-24 pb-20">
          {/* ─── HERO ──────────────────────────────────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-5">
              <Check size={12} /> Gratuit · Sans engagement
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
              Réservez 15 minutes avec{' '}
              <span className="bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Anthony, founder de Volia
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-content-secondary max-w-2xl mx-auto leading-relaxed">
              Une démo perso pour voir si Volia (Prospection + Campagnes + CRM)
              répond à votre cas. Pas de pitch commercial, pas d&apos;SDR — c&apos;est
              le founder qui vous reçoit.
            </p>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-content-tertiary">
              {TRUST_POINTS.map((p) => {
                const Icon = p.icon;
                return (
                  <span key={p.label} className="inline-flex items-center gap-1.5">
                    <Icon size={14} className="text-emerald-600" />
                    {p.label}
                  </span>
                );
              })}
            </div>
          </section>

          {/* ─── CTA BOOKING GOOGLE CALENDAR ───────────────── */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
            <div className="relative rounded-3xl border border-line bg-gradient-to-br from-violet-50 to-indigo-50 shadow-2xl shadow-violet-500/10 overflow-hidden p-8 sm:p-12 text-center">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white mb-5 shadow-xl shadow-violet-500/30">
                  <CalendarCheck size={28} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-content-primary mb-3">
                  Choisissez votre créneau
                </h2>
                <p className="text-content-secondary text-base mb-7 max-w-md mx-auto">
                  Le calendrier s&apos;ouvre dans un nouvel onglet. Sélectionnez
                  l&apos;horaire qui vous va, recevez la confirmation par email.
                </p>

                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all"
                  data-cta="book-demo"
                  data-cta-source="demo_page_main"
                >
                  <CalendarCheck size={18} />
                  Voir les créneaux disponibles
                </a>

                <p className="mt-5 text-xs text-content-tertiary">
                  Propulsé par Google Calendar · Gratuit, 15 minutes
                </p>
              </div>
            </div>
          </section>

          {/* ─── CE QU'ON COUVRE ──────────────────────────── */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">
                Au programme
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Ce qu&apos;on va voir ensemble
              </h2>
              <p className="text-content-tertiary text-base max-w-xl mx-auto">
                15 minutes structurées, pas de blabla.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WHAT_WE_COVER.map((item, idx) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl border border-line bg-surface-card hover:border-violet-200 hover:shadow-md transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center mb-3 shadow-md">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-semibold text-content-primary mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-content-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── FAQ ──────────────────────────────────────── */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Questions fréquentes
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-line bg-surface-card open:border-violet-200 transition"
                >
                  <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-content-primary list-none flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-content-tertiary text-xs group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-5 pb-4 -mt-1">
                    <p className="text-sm text-content-secondary leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ─── ALTERNATIVE : signup direct ──────────────── */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-line bg-surface-card p-6 sm:p-8 text-center">
              <p className="text-sm text-content-tertiary mb-3">
                Pas envie d&apos;attendre une démo ?
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-content-primary mb-4">
                Testez Volia tout de suite — 14 jours de MAX offerts, sans CB.
              </h3>
              <Link
                href="/signup?plan=pro&source=demo_page"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
              >
                Démarrer gratuitement
              </Link>
              <p className="mt-3 text-xs text-content-tertiary">
                Sans CB · Annulation 1 clic · RGPD France
              </p>
            </div>
          </section>
        </main>

        <ReaderFooter />
      </div>
    </>
  );
}
