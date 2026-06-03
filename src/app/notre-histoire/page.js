// ─────────────────────────────────────────────────────────────────────
// /notre-histoire — page manifeste Volia (une entreprise d'un nouveau genre)
// ─────────────────────────────────────────────────────────────────────
// Angle : "Volia est construit autrement : l'IA exécute le travail
// répétitif, l'humain décide. Une suite de prospection B2B française,
// accessible et RGPD, depuis Marseille."
//
// Garde-fous (DGCCRF + marque) :
//   - JAMAIS "entreprise autonome", "0 humain", "100% autonome",
//     "remplace les humains/l'équipe", "1 founder + IA", "1000 agents".
//   - JAMAIS "6 semaines"/"12 mois" comme durée de construction.
//   - Principe conforme : "l'IA exécute, l'humain décide" (supervision).
//   - Marseille OK. Light mode only, accent violet/indigo.
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
  title: "Volia, une entreprise d'un nouveau genre — l'IA exécute, l'humain décide",
  description:
    "Volia est construit autrement : l'IA exécute le travail répétitif, l'humain décide. Suite de prospection B2B française, 4 modules connectés, RGPD natif, à partir de 19 €/mois. Depuis Marseille.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
  keywords: [
    'entreprise nouvelle génération',
    'entreprise augmentée par IA',
    'AI-augmented company',
    'Volia manifeste',
    'Anthony Malartre',
    'agents IA entreprise',
    'prospection B2B IA',
    'SaaS prospection B2B France',
    'nouvelle catégorie entreprise',
    'orchestrateur agents IA',
    'futur des entreprises',
    'alternative HubSpot française',
  ],
  openGraph: {
    title: "Volia — Une entreprise d'un nouveau genre",
    description:
      "Construit autrement : l'IA exécute le travail répétitif, l'humain décide. 4 modules connectés, RGPD natif, depuis Marseille.",
    url: PAGE_URL,
    type: 'article',
    siteName: 'Volia',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Volia — Une entreprise d'un nouveau genre",
    description: "L'IA exécute, l'humain décide. Prospection B2B française, RGPD, 4 modules. Depuis Marseille.",
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
  headline: "Volia — Une entreprise d'un nouveau genre : l'IA exécute, l'humain décide",
  description:
    "Volia, suite de prospection B2B française construite autrement : l'IA exécute le travail répétitif, l'humain garde la vision et les décisions. 4 modules connectés (Prospection, Campagnes, CRM, Forms), RGPD natif, depuis Marseille.",
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
