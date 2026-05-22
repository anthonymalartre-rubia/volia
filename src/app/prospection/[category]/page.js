import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import {
  getAllCategories, getAllDepartments, getAllRegions, getCategoryBySlug,
} from '@/lib/slugs';
import { breadcrumbSchema, estimateStats, productSchema } from '@/lib/seo-helpers';
import { getCategoryData } from '@/lib/category-data';
import { getCrossSectorSlugs } from '@/lib/cross-sector';

// Generate static pages at build time (1 per category)
export async function generateStaticParams() {
  return getAllCategories().map((cat) => ({ category: cat.slug }));
}

// Per-page metadata
export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  const title = `Trouver l'email des ${category.labelPlural} en France — Prospectia`;
  const description = `Email professionnel de tous les ${category.labelPlural} en France. 101 départements couverts, scraping intelligent + recherche Google. À partir de 19 €/mois — le ticket d'entrée le moins cher du marché français.`;

  return {
    title,
    description,
    alternates: { canonical: `https://prospectia.cloud/prospection/${categorySlug}` },
    openGraph: {
      title,
      description,
      url: `https://prospectia.cloud/prospection/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const allDepartments = getAllDepartments();

  // Top 10 most populous departments for internal linking
  const popularDepts = [
    '75-paris', '13-bouches-du-rhone', '69-rhone', '31-haute-garonne',
    '06-alpes-maritimes', '33-gironde', '59-nord', '44-loire-atlantique',
    '67-bas-rhin', '38-isere',
  ];
  const popularDeptLinks = allDepartments
    .filter((d) => popularDepts.includes(d.slug))
    .map((d) => ({
      label: `${category.labelCapitalized} à ${d.name}`,
      href: `/prospection/${categorySlug}/${d.slug}`,
    }));

  // 14 régions = niveau intermédiaire entre /prospection/[cat] et /prospection/[cat]/[dept]
  // Inject d'abord les régions, puis les top départements (mix qui favorise le crawl).
  const regionLinks = getAllRegions().map((r) => ({
    label: `${category.labelCapitalized} en ${r.name}`,
    href: `/prospection/${categorySlug}/region/${r.slug}`,
  }));

  const relatedDepartments = [...regionLinks, ...popularDeptLinks];

  // Mix : 6 cross-sector (complémentaires) + 6 same-group (verticales)
  // pour un maillage plus naturel et plus large que le seul même-groupe.
  const allCats = getAllCategories();
  const crossSlugs = getCrossSectorSlugs(categorySlug);
  const crossSectorCats = crossSlugs
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6)
    .map((c) => ({
      label: c.labelCapitalized,
      href: `/prospection/${c.slug}`,
      _cross: true,
    }));
  const sameGroupCats = allCats
    .filter((c) => c.group === category.group && c.slug !== categorySlug && !crossSlugs.includes(c.slug))
    .slice(0, 6)
    .map((c) => ({
      label: c.labelCapitalized,
      href: `/prospection/${c.slug}`,
    }));
  const relatedCategories = [...crossSectorCats, ...sameGroupCats];

  const title = `Trouver l'email de tous les ${category.labelPlural} en France`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} en France ? Prospectia agrège les ${category.labelPlural} de tous les départements français et trouve leur email professionnel grâce à notre moteur de scraping et recherche Google. Plus besoin d'aller chercher manuellement sur Pages Jaunes, LinkedIn ou société.com — exportez les contacts en CSV en quelques clics.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} sont référencés sur Prospectia ?`,
      answer: `Notre base contient plusieurs milliers de ${category.labelPlural} répartis sur les 101 départements français. Le nombre exact dépend de votre zone géographique de recherche.`,
    },
    {
      question: `Comment Prospectia trouve-t-il l'email d'un ${category.label} ?`,
      answer: `Notre moteur scrape automatiquement le site web de chaque ${category.label}, puis effectue une recherche Google ciblée si l'email n'est pas trouvé. Pour les entreprises sans site web, nous découvrons leur domaine via Google avant d'extraire l'email.`,
    },
    {
      question: `Les emails des ${category.labelPlural} sont-ils vérifiés ?`,
      answer: `Oui. Chaque email reçoit un score de confiance : "Vérifié" (trouvé directement sur le site), "Trouvé" (via recherche Google), ou "Probable" (généré par pattern). Vous pouvez aussi lancer une vérification SMTP supplémentaire via MillionVerifier.`,
    },
    {
      question: `Puis-je exporter les contacts en CSV ?`,
      answer: `Oui, l'export CSV standard est inclus dans tous nos plans. Vous récupérez en quelques secondes la liste complète des ${category.labelPlural} avec nom, adresse, téléphone, email, note Google et site web — compatible avec n'importe quel CRM (HubSpot, Salesforce, Zoho, Pipedrive...) ou outil d'outreach.`,
    },
    {
      question: `La prospection des ${category.labelPlural} est-elle conforme au RGPD ?`,
      answer: `Oui. Prospectia filtre automatiquement les emails personnels (Gmail, Hotmail, etc.), respecte les demandes d'opt-out, et ne collecte que des données professionnelles publiques. Conforme à l'article 6 du RGPD (intérêt légitime).`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Prospection B2B', href: '/prospection' },
    { label: category.labelCapitalized },
  ];

  // JSON-LD ItemList + FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebPage',
        name: title,
        description: intro,
        url: `https://prospectia.cloud/prospection/${categorySlug}`,
        inLanguage: 'fr-FR',
      },
      productSchema({
        name: `Recherche email ${category.labelPlural} en France`,
        description: intro,
        url: `https://prospectia.cloud/prospection/${categorySlug}`,
      }),
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  const stats = estimateStats(null, category);
  // Inflate for category view (all France, not single dept)
  const inflatedStats = {
    ...stats,
    total: (parseInt(stats.total.replace(/\s/g, ''), 10) * 50).toLocaleString('fr-FR'),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProspectionSeoPage
        title={title}
        intro={intro}
        category={category}
        department={null}
        stats={inflatedStats}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={relatedDepartments}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
      />
    </>
  );
}
