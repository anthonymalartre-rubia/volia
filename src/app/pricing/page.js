// ─────────────────────────────────────────────────────────────────────
// /pricing — page tarification standalone Volia
// ─────────────────────────────────────────────────────────────────────
// Remplace l'ancien redirect /pricing → /#pricing par une vraie page
// riche : SEO ciblé ("pricing volia", "tarifs"), CTA dédié pour blog/
// ads/footers, tableau comparatif détaillé, FAQ pricing.
//
// Architecture :
//   - Ce fichier = server component (export metadata + JSON-LD)
//   - PricingContent = client component (toggle Mensuel/Annuel, FAQ)
// ─────────────────────────────────────────────────────────────────────

import PricingContent from '@/components/PricingContent';
import { breadcrumbSchema } from '@/lib/seo-helpers';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/pricing`;

export const metadata = {
  title: 'Tarifs Volia — Gratuit · Prospection 19 € · MAX 179 €',
  description:
    "Volia One en 3 intensités : Gratuit (essaie — tape ton domaine, vois leads + emails), Prospection 19 €/mo (500 crédits, en solo), MAX 179 €/mo (Volia One en pilote automatique 24/7 + suite complète, 2 000 crédits/mois inclus — 3 mois à 99 € avec le code MAX99). Sans engagement, RGPD France.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': PAGE_URL,
      'en-US': `${SITE_URL}/en/pricing`,
      'en-GB': `${SITE_URL}/en/pricing`,
      'x-default': PAGE_URL,
    },
  },
  keywords: [
    'tarifs volia',
    'pricing volia',
    'prix volia',
    'volia abonnement',
    'comparatif plans saas b2b',
    'alternative apollo prix',
    'alternative hubspot pas cher',
    'tarif outil prospection b2b',
    'crm français pas cher',
    'cold email pas cher',
  ],
  openGraph: {
    title: 'Tarifs Volia — La suite B2B qui remplace votre stack',
    description:
      "Prospection + Campagnes + CRM gratuits pour démarrer. MAX à 179 €/mo remplace ~316 €/mo d'outils (Apollo + Lemlist + Smartlead + HubSpot + Hunter) : ~137 €/mo économisés. Sans engagement.",
    type: 'website',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Volia — La suite B2B qui remplace votre stack',
    description: 'Gratuit pour démarrer · Prospection 19 €/mo · MAX 179 €/mo (~137 €/mo économisés vs stack Apollo+Lemlist+HubSpot).',
  },
};

// ─── JSON-LD ─────────────────────────────────────────────────────
// Product schema avec 3 offers (Gratuit, Prospection, MAX) +
// BreadcrumbList + FAQPage pour rich snippets.
const PRODUCT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Volia One — Prospection + Campagnes + CRM + Formulaires + Project',
  description:
    'Volia One : tape ton domaine, Volia trouve tes prospects (email + tél), écrit et envoie tes cold emails et remplit ton pipeline. 5 modules sous le capot (Prospection, Campagnes, CRM, Formulaires, Project). À partir de 0 €/mois.',
  url: PAGE_URL,
  brand: { '@type': 'Brand', name: 'Volia' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '179',
    offerCount: 3,
    offers: [
      {
        '@type': 'Offer',
        name: 'Gratuit',
        price: '0',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup`,
        availability: 'https://schema.org/InStock',
        description: 'Essaie Volia One : tape ton domaine, vois tes premiers leads + emails. Les 5 modules (Prospection + Campagnes + CRM + Formulaires + Project) avec limites : 25 crédits/mois, 1 séquence, 1 pipeline. Sans carte bancaire, à vie.',
      },
      {
        '@type': 'Offer',
        name: 'Prospection',
        price: '19',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=prospection`,
        availability: 'https://schema.org/InStock',
        description: 'Volia One en solo : 500 crédits/mois (emails trouvés) + 500 téléphones, cascade waterfall 7 sources, exports illimités, API publique + Zapier/Make. Packs de crédits dès 9 €.',
      },
      {
        '@type': 'Offer',
        name: 'MAX',
        price: '179',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=max`,
        availability: 'https://schema.org/InStock',
        description: 'Volia One en pilote automatique 24/7 (mode Autopilot : 3 workflows, IF/ELSE, A/B testing) + suite complète, 2 000 crédits/mois inclus, 10 000 téléphones, équipes multi-utilisateurs, serveur MCP. Code MAX99 : 99 €/mois les 3 premiers mois.',
      },
    ],
  },
};

const BREADCRUMB_JSON_LD = breadcrumbSchema([
  { label: 'Accueil', href: '/' },
  { label: 'Tarifs', href: '/pricing' },
]);

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Y a-t-il un plan gratuit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui : un plan Gratuit à vie, sans carte bancaire, pour essayer Volia One. Vous accédez aux 5 modules (Prospection + Campagnes + CRM + Formulaires + Project) avec des limites : 25 crédits Prospection/mois, 1 séquence, 1 pipeline. Vous montez en intensité quand vous voulez (Prospection 19 €/mois en solo, ou MAX 179 €/mois en pilote automatique 24/7) — aucun prélèvement automatique.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je changer de plan à tout moment ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, l\'upgrade ou le downgrade se fait en 1 clic depuis les paramètres. Le pro-rata est calculé automatiquement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment fonctionne la facturation annuelle ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En annuel, vous payez moins et accédez à 12 mois. Prospection = 190 €/an au lieu de 228 € (2 mois offerts), MAX = 1 690 €/an au lieu de 2 148 €, soit 458 € économisés.',
      },
    },
    {
      '@type': 'Question',
      name: 'Le CRM est-il vraiment gratuit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, dès le plan Gratuit : Kanban drag & drop, auto-création de deals depuis les replies, timeline 360°, activities (notes, calls, meetings). 1 pipeline en Gratuit/Prospection, illimité en MAX.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment annuler mon abonnement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depuis vos paramètres > Plan, en 1 clic via le portail Stripe. L\'accès reste actif jusqu\'à la fin de la période payée.',
      },
    },
    {
      '@type': 'Question',
      name: 'Y a-t-il des frais cachés ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aucun. Le prix affiché TTC est le seul prélèvement. Pas de frais de mise en route, pas de surcharge à l\'export.',
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <PricingContent />
    </>
  );
}
