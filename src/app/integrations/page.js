import Link from 'next/link';
import { ArrowLeft, Zap, Layers, Code, Webhook, ExternalLink, ArrowRight, Plug, Sparkles } from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'Intégrations Volia — Zapier, Make, API & Webhooks',
  description:
    "Connectez Volia à 5000+ apps via Zapier, Make, webhooks signés ou l'API REST. Synchronisez prospects, deals CRM et campagnes avec votre stack en quelques clics.",
  alternates: { canonical: 'https://volia.fr/integrations' },
  keywords: [
    'intégrations volia',
    'zapier prospection b2b',
    'make integromat crm',
    'webhooks crm',
    'api prospection france',
    'connecter crm slack hubspot',
  ],
  openGraph: {
    title: 'Intégrations Volia — Zapier, Make, Webhooks & API',
    description: 'Connectez Volia à votre stack en quelques clics. Compatible Zapier, Make, n8n + API REST.',
    url: 'https://volia.fr/integrations',
  },
};

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Intégrations' },
];

const CHANNELS = [
  {
    id: 'zapier',
    title: 'Zapier',
    tagline: 'Connectez Volia à 5000+ apps',
    desc: "Envoyez vos nouveaux prospects vers Slack, créez automatiquement un contact HubSpot quand un deal Volia est gagné, déclenchez une notification Discord à chaque reply. Setup sans code en 2 minutes via les Webhooks Premium de Zapier.",
    href: '/integrations/zapier',
    icon: Zap,
    accent: 'orange',
    badge: '5 000+ apps',
  },
  {
    id: 'make',
    title: 'Make (ex-Integromat)',
    tagline: '4000+ apps + scénarios visuels avancés',
    desc: "Mappez les events Volia vers des scénarios visuels complexes (branchements, filtres, transformations JSON). Idéal pour orchestrer des workflows multi-étapes : Volia → Google Sheets → HubSpot → Slack.",
    href: '/integrations/make',
    icon: Layers,
    accent: 'violet',
    badge: '4 000+ apps',
  },
  {
    id: 'webhooks',
    title: 'Webhooks signés',
    tagline: 'Pour n8n, app custom, scripts internes',
    desc: "Recevez les events Volia (prospect créé, deal won, reply reçu…) en temps réel sur n'importe quelle URL HTTPS. Signature HMAC-SHA256 pour vérifier l'authenticité. 21 events disponibles, retry automatique.",
    href: '/settings/webhooks',
    icon: Webhook,
    accent: 'emerald',
    badge: '21 events',
  },
  {
    id: 'api',
    title: 'API REST publique',
    tagline: 'Contrôle total via cURL, Node, Python',
    desc: "Listez vos prospects, créez des deals CRM, déclenchez des campagnes par programmation. Authentification par clé API (pk_), pagination, filtres, JSON propre. Compatible toutes plateformes.",
    href: '/api',
    icon: Code,
    accent: 'blue',
    badge: 'REST + JSON',
  },
];

const POPULAR_ZAPS = [
  { from: 'Nouveau lead Volia', to: 'Slack message', desc: 'Notifie ton équipe sales à chaque nouveau prospect qualifié.' },
  { from: 'Form Typeform', to: 'Contact CRM Volia', desc: 'Ajoute automatiquement les leads inbound dans ton pipeline.' },
  { from: 'Deal won Volia', to: 'Invoice Stripe', desc: 'Crée la facture en un clic dès qu\'un deal passe en won.' },
  { from: 'Reply received Volia', to: 'Notification Discord', desc: 'Alerte temps réel sur les réponses prospects chaudes.' },
  { from: 'Email opened Volia', to: 'HubSpot timeline', desc: 'Synchronise l\'engagement campagne avec ton CRM principal.' },
  { from: 'Campaign completed', to: 'Google Sheets', desc: 'Logge automatiquement les stats finales de chaque campagne.' },
];

function accentClasses(accent) {
  const map = {
    orange: {
      icon: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
    },
    violet: {
      icon: 'text-violet-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      badge: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
    },
    emerald: {
      icon: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    },
    blue: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    },
  };
  return map[accent] || map.violet;
}

export default function IntegrationsHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'TechArticle',
        headline: 'Intégrations Volia : Zapier, Make, Webhooks et API',
        description: metadata.description,
        author: { '@type': 'Organization', name: 'Volia' },
        publisher: { '@type': 'Organization', name: 'Volia', url: 'https://volia.fr' },
        url: 'https://volia.fr/integrations',
        inLanguage: 'fr-FR',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} /> Accueil
          </Link>
        </div>

        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 inline-flex items-center gap-1">
              <Plug size={11} /> Intégrations
            </span>
            <span>·</span>
            <span>Écosystème ouvert</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Connectez Volia à <span className="text-violet-400">vos outils favoris</span>
          </h1>

          <p className="text-lg text-content-secondary leading-relaxed mb-12 max-w-3xl">
            Volia s&apos;intègre nativement avec 9 000+ applications via Zapier et Make, supporte les webhooks
            signés HMAC pour vos apps custom, et expose une API REST publique pour les intégrations sur mesure.
            Aucun lock-in : vos données restent les vôtres, où vous voulez.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {CHANNELS.map((c) => {
              const cl = accentClasses(c.accent);
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  href={c.href}
                  className={`group rounded-2xl border ${cl.border} bg-surface-card p-6 hover:bg-surface-elevated transition`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${cl.bg}`}>
                      <Icon size={22} className={cl.icon} />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${cl.badge}`}>
                      {c.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-content-primary mb-1">{c.title}</h2>
                  <p className={`text-sm font-medium mb-3 ${cl.icon}`}>{c.tagline}</p>
                  <p className="text-sm text-content-secondary leading-relaxed mb-4">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-400 group-hover:gap-2 transition-all">
                    Voir la doc <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Popular Zaps */}
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-violet-400" />
              <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Exemples de workflows populaires</p>
            </div>
            <h2 className="text-2xl font-bold mb-6">Les 6 Zaps les plus utilisés par nos clients</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {POPULAR_ZAPS.map((z, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface-card p-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-content-secondary mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{z.from}</span>
                    <ArrowRight size={12} className="text-content-tertiary flex-shrink-0" />
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">{z.to}</span>
                  </div>
                  <p className="text-xs text-content-tertiary leading-relaxed">{z.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Plug size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Prêt à brancher Volia à votre stack ?</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              Créez votre première clé API en 30 secondes, puis configurez vos webhooks ou votre premier Zap.
              Disponible sur tous les plans payants (Solo 19€/mois et +).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/settings#api"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
              >
                Créer une clé API
              </Link>
              <Link
                href="/integrations/zapier"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-card hover:bg-surface-elevated border border-line text-sm font-semibold transition"
              >
                Doc Zapier <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
