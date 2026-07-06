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
  // Audit de clôture 06/07 : descriptions alignées sur la copy rendue — plus
  // de montants d'économie non sourcés (~316 €/~137 €) dans les partages.
  openGraph: {
    title: 'Tarifs Volia — 0 € pour voir. 19 € pour prospecter. 179 € pour ne plus y penser.',
    description:
      'Gratuit pour voir tes leads (email + téléphone). Prospection 19 €/mois : 500 crédits. MAX 179 €/mois : Volia One en pilote automatique 24/7, selon tes règles. Sans engagement, annulable en 2 clics.',
    type: 'website',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Volia — trois plans, zéro piège',
    description: '0 € pour voir. 19 €/mois pour prospecter. 179 €/mois pour ne plus y penser. Sans engagement.',
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
        description: 'Essaie Volia One : tape ton domaine, vois tes leads et leurs emails complets. 25 crédits Prospection, les 5 modules (Prospection + Campagnes + CRM + Formulaires + Project) avec quotas. Sans carte bancaire.',
      },
      {
        '@type': 'Offer',
        name: 'Prospection',
        price: '19',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=prospection`,
        availability: 'https://schema.org/InStock',
        description: 'Volia One en solo : 500 crédits par mois, email + téléphone + score de confiance (Vérifié / Google / Probable), cascade de sources (site web → recherche Google → formats classiques), warmup progressif. Sans engagement, annulable en 2 clics. Packs de crédits ponctuels disponibles.',
      },
      {
        '@type': 'Offer',
        name: 'MAX',
        price: '179',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/signup?plan=max`,
        availability: 'https://schema.org/InStock',
        description: "Volia One en pilote automatique 24/7 selon tes règles (Autopilot : ton ton, tes secteurs, tes exclusions, tes plafonds) + toute la suite (Prospection, Campagnes, CRM, Formulaires, Project), 2 000 crédits par mois. Code MAX99 : 3 premiers mois à 99 € au lieu de 179 €.",
      },
    ],
  },
};

const BREADCRUMB_JSON_LD = breadcrumbSchema([
  { label: 'Accueil', href: '/' },
  { label: 'Tarifs', href: '/pricing' },
]);

// FAQPage — miroir des 8 Q/R rendues dans PricingContent (copy source :
// audit-prive/copy-one-pricing-volia.md, « FAQ tarifaire »). À garder
// synchronisé avec le tableau FAQ_PRICING du composant.
const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '« Sans engagement », c\'est vraiment sans engagement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Abonnement mensuel, annulable en 2 clics depuis ton compte. Pas de préavis, pas d\'email à envoyer, personne à convaincre au téléphone. Tu gardes l\'accès jusqu\'à la fin du mois payé. Tu annules, ça s\'arrête. C\'est tout.',
      },
    },
    {
      '@type': 'Question',
      name: 'Un crédit, c\'est quoi exactement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'L\'unité qui paie le travail de recherche d\'un prospect : l\'entreprise, l\'email, le téléphone, le score de confiance. On cherche d\'abord sur leur site. Pas trouvé ? On fouille Google. Toujours rien ? On teste les formats classiques — et on te marque « Probable ». 25 crédits en Gratuit, 500 par mois en Prospection, 2 000 par mois en MAX.',
      },
    },
    {
      '@type': 'Question',
      name: 'Il me faut plus de crédits ce mois-ci. Je fais quoi ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tu ajoutes un pack ponctuel. Paiement unique, pas un deuxième abonnement. Ton plan ne bouge pas, ton prix mensuel non plus. Le prix du pack est affiché au moment de l\'achat.',
      },
    },
    {
      '@type': 'Question',
      name: 'MAX99, où est l\'entourloupe ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Il n\'y en a pas, et voilà les termes complets : 3 premiers mois de MAX à 99 € au lieu de 179 €. Au 4e mois, 179 €/mois, le prix normal. Tu peux annuler avant, pendant, après — en 2 clics. On te le dit ici pour que tu ne le découvres jamais sur une facture.',
      },
    },
    {
      '@type': 'Question',
      name: 'Prospection ou MAX : la vraie différence ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le pilote. Avec Prospection, tu lances One quand tu veux : il trouve, il rédige, tu valides. Avec MAX, l\'Autopilot fait tourner One 24/7 selon tes règles — ton, secteurs, exclusions, plafonds. Plus 2 000 crédits au lieu de 500, et toute la suite. Si tu as le temps de piloter chaque semaine, Prospection te suffit. On te le dit franchement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Et si le gratuit me suffit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Alors reste gratuit, sans culpabilité. Ce plan n\'est pas un appât, c\'est notre argument commercial : voir avant de croire. Le jour où tes 25 crédits ne suffisent plus, tu sauras exactement pourquoi tu passes à 19 €/mois. Et si ce jour n\'arrive pas, tu n\'auras rien payé pour l\'apprendre.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment je paie ? Comment j\'annule ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Carte bancaire, paiement sécurisé par Stripe — on ne voit jamais ton numéro. Tes factures sont dans ton espace. Pour annuler : ton compte, 2 clics, à tout moment. Tu changes de plan dans les deux sens, quand tu veux. Pas de rétention déguisée, pas de « appelez-nous pour résilier ».',
      },
    },
    {
      '@type': 'Question',
      name: 'Et le RGPD, concrètement ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prospection B2B est légale en France (base : intérêt légitime). Volia est construit pour rester dans les clous : données professionnelles uniquement, filtre automatique des emails personnels, page d\'opt-out publique, DPA téléchargeable. Ton juriste veut vérifier ? Le DPA se télécharge, il n\'y a rien à nous demander. Quel que soit ton plan.',
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
