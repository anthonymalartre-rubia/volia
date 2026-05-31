// ─────────────────────────────────────────────────────────────────────
// /notre-histoire — page manifeste Volia (entreprise autonome d'un nouveau genre)
// ─────────────────────────────────────────────────────────────────────
// Angle : "Volia est la première entreprise autonome d'un nouveau genre.
// Pilotée par IA, augmentée par 1 founder. Construite en 6 semaines de
// sprint intensif à Marseille, sans levée, sans salarié supplémentaire."
//
// Garde-fous :
//   - Vision-driven, polarisant, manifeste — pas un récit modeste.
//   - "1 founder + ∞ agents IA" ou "1 humain décide, 1000 agents exécutent".
//   - Mention DISCRÈTE (1 fois max) qu'Anthony reste responsable produit/sales/CS.
//   - Pas de "0 humain" en gros, pas de "100% autonome" non supervisé.
//   - DGCCRF safe : "supervisé par 1 founder", "0 salarié supplémentaire ajouté".
//   - Light mode only, accent violet/indigo.
//
// Pattern : server page (metadata + JSON-LD) + client content.
// ─────────────────────────────────────────────────────────────────────

import { breadcrumbSchema } from '@/lib/seo-helpers';
import NotreHistoireContent from './NotreHistoireContent';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/notre-histoire`;

// ─────────────────────────────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────────────────────────────
export const metadata = {
  title: "Volia, une entreprise d'un nouveau genre — Première entreprise autonome, pilotée par IA",
  description:
    "Volia est la première entreprise SaaS autonome au monde. Construite en 6 semaines à Marseille, pilotée par IA, augmentée par 1 founder. 4 modules connectés, 0 levée, 0 salarié supplémentaire.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  keywords: [
    'entreprise autonome',
    'entreprise pilotée par IA',
    'AI-native company',
    'Volia manifeste',
    'Anthony Malartre',
    'agents IA entreprise',
    'founder augmenté IA',
    'SaaS autonome',
    'nouvelle catégorie entreprise',
    'orchestrateur agents IA',
    'futur des entreprises',
    'alternative HubSpot française',
  ],
  openGraph: {
    title: "Volia — Une entreprise d'un nouveau genre, pilotée par IA",
    description:
      "Première entreprise autonome construite en 6 semaines à Marseille. 1 founder décide, 1000 agents exécutent. 4 modules, 0 levée, 0 salarié supplémentaire.",
    url: PAGE_URL,
    type: 'article',
    siteName: 'Volia',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Volia — Première entreprise autonome d'un nouveau genre",
    description: '1 founder. ∞ agents IA. 6 semaines. 4 modules. Le futur des entreprises commence à Marseille.',
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
  headline: "Volia — Une entreprise d'un nouveau genre, pilotée par IA, augmentée par 1 founder",
  description:
    "Volia est la première entreprise SaaS autonome au monde : 6 semaines de sprint intensif à Marseille, 4 modules connectés (Prospection, Campagnes, CRM, Forms), 0 levée, 0 salarié supplémentaire. Une nouvelle catégorie d'entreprise pilotée par IA et augmentée par un seul founder.",
  url: PAGE_URL,
  mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  datePublished: '2026-06-01',
  dateModified: '2026-06-01',
  inLanguage: 'fr-FR',
  author: {
    '@type': 'Person',
    name: 'Anthony Malartre',
    url: `${SITE_URL}/notre-histoire`,
    jobTitle: 'Founder & Orchestrator',
    worksFor: { '@type': 'Organization', name: 'Volia', url: SITE_URL },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Marseille',
      addressCountry: 'FR',
    },
  },
  publisher: {
    '@type': 'Organization',
    name: 'Volia',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Marseille',
      addressCountry: 'FR',
    },
  },
  about: { '@type': 'Organization', name: 'Volia', url: SITE_URL },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Anthony Malartre',
  jobTitle: 'Founder & Orchestrator, Volia',
  worksFor: { '@type': 'Organization', name: 'Volia', url: SITE_URL },
  url: PAGE_URL,
  email: 'mailto:anthony@volia.fr',
  nationality: 'FR',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Marseille',
    addressCountry: 'FR',
  },
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
