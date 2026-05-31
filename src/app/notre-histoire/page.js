// ─────────────────────────────────────────────────────────────────────
// /notre-histoire — page storytelling Volia (founder + Claude)
// ─────────────────────────────────────────────────────────────────────
// Angle : "Première suite SaaS B2B française co-construite par 1 founder
// solo augmenté d'une IA agentique (Claude / Anthropic), en 12 mois,
// avec un repo public et 370+ commits visibles."
//
// Garde-fous :
//   - Anthony reste le héros, Claude est l'enabler. Pas de "0 humain".
//   - "founder + Claude", "human-in-the-loop", "co-construit", jamais "autonome".
//   - Tonalité B2B premium, factuelle, anti-survente IA. Pas de "cocorico".
//   - Light mode only (cohérent rebrand mai 2026 — cf use-force-light-theme.js).
//   - Accent violet/indigo (cohérent module Prospection + suite Volia).
//
// Pattern : server page (metadata + JSON-LD) + client content. Voir
// /produits/prospection/page.js qui suit exactement la même structure.
// ─────────────────────────────────────────────────────────────────────

import { breadcrumbSchema } from '@/lib/seo-helpers';
import NotreHistoireContent from './NotreHistoireContent';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/notre-histoire`;

// ─────────────────────────────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────────────────────────────
export const metadata = {
  title: 'Notre histoire — La première suite SaaS B2B française co-construite avec une IA | Volia',
  description:
    "1 founder solo, Claude comme co-pilote agentique, 12 mois, 370+ commits publics : comment Volia est devenue la première suite B2B française augmentée par l'IA.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  keywords: [
    'Volia histoire',
    'Anthony Malartre Volia',
    'founder solo SaaS B2B',
    'IA agentique Claude',
    'suite B2B française',
    'SaaS co-construit avec IA',
    'Volia coulisses',
    'human-in-the-loop SaaS',
    'développement augmenté par IA',
    'alternative HubSpot française',
  ],
  openGraph: {
    title: 'Notre histoire — Volia, la première suite SaaS B2B FR co-construite avec une IA',
    description:
      "1 founder + Claude (Anthropic), 12 mois, 4 modules livrés, 370+ commits publics. La méthode de construction radicalement transparente derrière Volia.",
    url: PAGE_URL,
    type: 'article',
    siteName: 'Volia',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notre histoire — Volia',
    description: '1 founder, 1 IA, 12 mois, 4 produits. Code public, méthode transparente.',
  },
  robots: { index: true, follow: true },
};

// ─────────────────────────────────────────────────────────────────────
// JSON-LD STRUCTURED DATA
// ─────────────────────────────────────────────────────────────────────
const breadcrumbs = breadcrumbSchema([
  { label: 'Accueil', href: '/' },
  { label: 'Notre histoire' },
]);

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Notre histoire — Volia, la première suite SaaS B2B française co-construite avec une IA',
  description:
    "Anthony Malartre a construit Volia (suite B2B Prospection + Campagnes + CRM + Forms) en 12 mois, en solo, avec Claude (Anthropic) comme co-pilote agentique. Le code est public, la méthode aussi.",
  url: PAGE_URL,
  mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  datePublished: '2026-06-01',
  dateModified: '2026-06-01',
  inLanguage: 'fr-FR',
  author: {
    '@type': 'Person',
    name: 'Anthony Malartre',
    url: `${SITE_URL}/notre-histoire`,
    jobTitle: 'Founder',
    worksFor: { '@type': 'Organization', name: 'Volia', url: SITE_URL },
  },
  publisher: {
    '@type': 'Organization',
    name: 'Volia',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
  },
  about: { '@type': 'Organization', name: 'Volia', url: SITE_URL },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Anthony Malartre',
  jobTitle: 'Founder, Volia',
  worksFor: { '@type': 'Organization', name: 'Volia', url: SITE_URL },
  url: PAGE_URL,
  email: 'mailto:anthony@volia.fr',
  nationality: 'FR',
};

// ─────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function NotreHistoirePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <NotreHistoireContent />
    </>
  );
}
