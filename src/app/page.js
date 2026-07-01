import LandingContent from '@/components/LandingContent';
import { getTrustpilotData, TRUSTPILOT_PROFILE_URL } from '@/lib/trustpilot-data';

const SITE_URL = 'https://volia.fr';

// aggregateRating Trustpilot — injecté uniquement si configuré + au moins
// 1 avis. Sinon vaut undefined et est omis du schema (Object.assign skip).
const trustpilotData = getTrustpilotData();
const trustpilotAggregateRating = trustpilotData
  ? {
      '@type': 'AggregateRating',
      ratingValue: String(trustpilotData.rating),
      reviewCount: String(trustpilotData.reviewCount),
      bestRating: '5',
      worstRating: '1',
    }
  : null;

export const metadata = {
  title: 'Volia One — ton pipeline B2B en pilote auto · prospection + cold email France',
  description: 'Volia One : entre ton domaine → Volia trouve tes prospects (email + tél), écrit et envoie tes cold emails, et remplit ton pipeline. Sous le capot : 5 modules (Prospection, Campagnes, CRM, Formulaires, Project) via Google Places → email personnalisé → qualification → scoring → push CRM. Prospection B2B France (emails + téléphones, 101 départements), alternative Apollo. Made in France, RGPD. Gratuit pour démarrer · Prospection 19 €/mois · MAX 179 €/mois (mode Autopilot 24/7).',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'en-US': `${SITE_URL}/en`,
      'en-GB': `${SITE_URL}/en`,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    title: 'Volia One — ton pipeline B2B en pilote auto · prospection + cold email France',
    description: 'Volia One : entre ton domaine → Volia trouve tes prospects (email + tél), écrit et envoie tes cold emails, et remplit ton pipeline. 5 modules sous le capot (Prospection, Campagnes, CRM, Formulaires, Project). Prospection B2B France, alternative Apollo. Made in France, RGPD. Mode Autopilot 24/7 au plan MAX.',
    url: SITE_URL,
    siteName: 'Volia',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia One — ton pipeline B2B en pilote auto (prospection + cold email France)',
    description: 'Entre ton domaine → Volia trouve tes prospects (email + tél), écrit et envoie tes cold emails, et remplit ton pipeline. Prospection B2B France, alternative Apollo. RGPD. Autopilot 24/7 au plan MAX.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SaaS product (SoftwareApplication + offers + ratings)
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Volia',
  alternateName: ['Volia.fr', 'Volia.fr'],
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'SalesIntelligence',
  operatingSystem: 'Web',
  description: 'Volia One : entre ton domaine → Volia trouve tes prospects (email + tél), écrit et envoie tes cold emails, et remplit ton pipeline. 5 modules sous le capot (Prospection, Campagnes, CRM, Formulaires, Project) : recherche d\'entreprises via Google Places (150+ catégories, 101 départements) + enrichissement email en cascade avec scoring de confiance → email personnalisé → qualification → scoring → push CRM. Gratuit pour démarrer, Prospection dès 19 €/mois, mode Autopilot 24/7 inclus dans MAX à 179 €/mois.',
  url: SITE_URL,
  inLanguage: 'fr-FR',
  countriesSupported: 'FR',
  featureList: [
    'Recherche d\'entreprises B2B via Google Places',
    'Couverture des 101 départements français (métropole + DROM)',
    '150+ catégories d\'activité',
    'Enrichissement email en cascade (waterfall)',
    'Scraping intelligent des sites web',
    'Scoring de confiance par email',
    'Export CSV compatible tous CRM',
    'Recherche en langage naturel (IA Claude)',
    'Conformité RGPD (filtre emails personnels, opt-out public)',
    'Pas d\'engagement, annulation à tout moment',
  ],
  // AggregateOffer (résumé) sur la homepage — le détail complet des 3 plans
  // (Gratuit / Prospection / MAX) vit sur /pricing (page dédiée), avec son
  // propre JSON-LD Offer détaillé.
  //
  // [31 mai 2026] Migration `Offer[]` → `AggregateOffer` pour éliminer la
  // duplication massive de contenu pricing entre `/` et `/pricing`. Google
  // Search Console signalait "Page en double : Google n'a pas choisi la même
  // URL canonique que l'utilisateur" sur la homepage — 56% du vocabulaire de
  // /pricing était également présent sur /. Cette simplification rend la
  // homepage clairement différente du sujet "pricing".
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '179',
    offerCount: '3',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/pricing`,
  },
  // aggregateRating Trustpilot — injecté conditionnellement via le spread
  // ci-dessous. Sans collecteur tiers vérifié, aucune note publiée
  // (DGCCRF art L.121-2 + Google "Manipulative review snippets").
  ...(trustpilotAggregateRating ? { aggregateRating: trustpilotAggregateRating } : {}),
  publisher: {
    '@type': 'Organization',
    name: 'Volia',
    url: SITE_URL,
    // Lien vers Trustpilot pour permettre à Google de vérifier la source
    ...(trustpilotData ? { sameAs: [TRUSTPILOT_PROFILE_URL] } : {}),
  },
};

// Note : le schema FAQPage et la section FAQ ont été déplacés sur /faq
// (page dédiée). Garder le markup FAQPage ici sans contenu Q/R visible
// violerait les règles structured-data de Google.

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <LandingContent />
    </>
  );
}
