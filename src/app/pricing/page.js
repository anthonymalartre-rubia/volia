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
  title: 'Tarifs Volia — Suite B2B de prospection, campagnes & CRM à partir de 19 €',
  description:
    "Plans tarifaires Volia : Starter gratuit, Solo 19 €/mo, Pro 49 €/mo, Business 149 €/mo (3 modules inclus). 5× moins cher qu'Apollo + Lemlist + HubSpot. Sans engagement, RGPD France.",
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
    title: 'Tarifs Volia — La suite B2B 5× moins chère',
    description:
      "Prospection + Campagnes + CRM dès 19 €/mo. Économisez ~210 €/mo vs Apollo + Lemlist + HubSpot. Starter gratuit, sans engagement.",
    type: 'website',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Volia — La suite B2B 5× moins chère',
    description: 'Prospection + Campagnes + CRM dès 19 €/mo. -210 €/mo vs Apollo+Lemlist+HubSpot.',
  },
};

// ─── JSON-LD ─────────────────────────────────────────────────────
// Product schema avec 4 offers (Starter, Solo, Pro, Business) +
// BreadcrumbList + FAQPage pour rich snippets.
const PRODUCT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Volia — Suite B2B Prospection + Campagnes + CRM',
  description:
    'Suite SaaS française tout-en-un : prospection B2B (287k+ entreprises FR), cold email avec warmup auto, CRM intégré. À partir de 0 €/mois.',
  url: PAGE_URL,
  brand: { '@type': 'Brand', name: 'Volia' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '99',
    offerCount: 4,
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '0',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=free`,
        availability: 'https://schema.org/InStock',
        description: '14 jours de Pro inclus (sans CB) puis 100 prospects/mois, 20 enrichissements, 5 exports, 3 dossiers.',
      },
      {
        '@type': 'Offer',
        name: 'Solo',
        price: '19',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=solo`,
        availability: 'https://schema.org/InStock',
        description: '1 000 prospects/mois, exports illimités, cascade waterfall — pour freelances.',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '49',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=pro`,
        availability: 'https://schema.org/InStock',
        description: '5 000 prospects + cold email + warmup + vérif email — pour PME et agences.',
      },
      {
        '@type': 'Offer',
        name: 'Business',
        price: '99',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=business`,
        availability: 'https://schema.org/InStock',
        description: '10 000 prospects + Campagnes + CRM intégré + API — la suite complète.',
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
      name: 'Y a-t-il un essai gratuit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui : à l\'inscription, vous bénéficiez de 14 jours d\'accès complet au plan Pro sans carte bancaire (5 000 prospects, cascade waterfall, campagnes). À l\'expiration, votre compte passe automatiquement sur le plan Starter gratuit (100 prospects/mois, à vie) — aucun prélèvement.',
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
        text: 'En annuel, vous payez 10 mois et accédez à 12 mois. Pro = 490 €/an au lieu de 588 €, soit 2 mois offerts.',
      },
    },
    {
      '@type': 'Question',
      name: 'Le CRM est-il vraiment inclus dans Business ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, intégralement : Kanban drag & drop, auto-création de deals depuis les replies, timeline 360°, activities (notes, calls, meetings).',
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
