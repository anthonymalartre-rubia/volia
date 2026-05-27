import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import {
  getAllCategories,
  getAllDepartments,
  getCategoryBySlug,
  getDepartmentBySlug,
} from '@/lib/slugs';
import { breadcrumbSchema, estimateStats, serviceSchema } from '@/lib/seo-helpers';
import { getCategoryData } from '@/lib/category-data';
import { getDeptData } from '@/lib/dept-data';
import { getCrossSectorSlugs } from '@/lib/cross-sector';
import { getCitiesByDept } from '@/lib/cities';

// IMPORTANT: This generates 150 × 101 = ~15 000 static pages at build time.
// To keep build times reasonable, we use Next.js ISR (dynamicParams + revalidate)
// for less popular combinations.
export const dynamicParams = true; // allow on-demand generation
export const revalidate = 86400;   // revalidate every 24h

export async function generateStaticParams() {
  // Pre-build only the most popular category × dept combinations at build time.
  // Other combinations will be generated on first request (ISR).
  const popularCats = [
    'restaurant', 'hotel', 'boulangerie-patisserie', 'pharmacie', 'avocat',
    'garage-automobile', 'agence-immobiliere', 'salon-de-coiffure',
    'plombier', 'electricien', 'expert-comptable', 'concessionnaire-automobile',
  ];
  const popularDepts = [
    '75-paris', '13-bouches-du-rhone', '69-rhone', '31-haute-garonne',
    '06-alpes-maritimes', '33-gironde', '59-nord', '44-loire-atlantique',
    '67-bas-rhin', '38-isere', '34-herault', '92-hauts-de-seine',
  ];

  const params = [];
  for (const cat of popularCats) {
    for (const dept of popularDepts) {
      params.push({ category: cat, department: dept });
    }
  }
  return params; // ~144 pages prebuilt, others ISR
}

export async function generateMetadata({ params }) {
  const { category: catSlug, department: deptSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const dept = getDepartmentBySlug(deptSlug);
  if (!category || !dept) return {};

  const title = `Email des ${category.labelPlural} dans le ${dept.name} (${dept.code}) — Volia`;
  const description = `Trouvez l'email professionnel de tous les ${category.labelPlural} situés dans le ${dept.name} (${dept.code}). Scraping intelligent + recherche Google. À partir de 19 €/mois — le ticket d'entrée le moins cher du marché français.`;

  return {
    title,
    description,
    alternates: { canonical: `https://volia.fr/prospection/${catSlug}/${deptSlug}` },
    openGraph: {
      title,
      description,
      url: `https://volia.fr/prospection/${catSlug}/${deptSlug}`,
    },
  };
}

export default async function CategoryDepartmentPage({ params }) {
  const { category: catSlug, department: deptSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const dept = getDepartmentBySlug(deptSlug);
  if (!category || !dept) notFound();

  const allCats = getAllCategories();
  const allDepts = getAllDepartments();

  // Same category in other departments
  const popularDepts = [
    '75-paris', '13-bouches-du-rhone', '69-rhone', '31-haute-garonne',
    '06-alpes-maritimes', '33-gironde', '59-nord', '44-loire-atlantique',
    '67-bas-rhin', '38-isere', '34-herault', '92-hauts-de-seine',
  ];
  const relatedDepartments = allDepts
    .filter((d) => popularDepts.includes(d.slug) && d.slug !== deptSlug)
    .slice(0, 12)
    .map((d) => ({
      label: `${category.labelCapitalized} ${d.name}`,
      href: `/prospection/${catSlug}/${d.slug}`,
    }));

  // Mix : 6 cross-sector localisés au dept + 6 same-group localisés au dept
  const crossSlugs = getCrossSectorSlugs(catSlug);
  const crossSectorCats = crossSlugs
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6)
    .map((c) => ({
      label: `${c.labelCapitalized} ${dept.name}`,
      href: `/prospection/${c.slug}/${deptSlug}`,
    }));
  const sameGroupCats = allCats
    .filter((c) => c.group === category.group && c.slug !== catSlug && !crossSlugs.includes(c.slug))
    .slice(0, 6)
    .map((c) => ({
      label: `${c.labelCapitalized} ${dept.name}`,
      href: `/prospection/${c.slug}/${deptSlug}`,
    }));
  const relatedCategories = [...crossSectorCats, ...sameGroupCats];

  const title = `Email des ${category.labelPlural} dans le ${dept.name} (${dept.code})`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} situés dans le département ${dept.name} (${dept.code}) ? Volia identifie automatiquement tous les ${category.labelPlural} géolocalisés dans le ${dept.name} via Google Places, puis trouve leur email professionnel grâce à notre moteur de scraping et recherche Google. Exportez la liste complète en CSV en moins de 5 minutes, avec nom, adresse, téléphone, email vérifié, site web et note Google.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} y a-t-il dans le ${dept.name} ?`,
      answer: `Le département ${dept.name} (${dept.code}) regroupe plusieurs centaines à plusieurs milliers de ${category.labelPlural} selon sa taille. Volia couvre toutes les entreprises géolocalisées par Google Places.`,
    },
    {
      question: `Comment trouver l'email d'un ${category.label} dans le ${dept.name} ?`,
      answer: `Sur Volia, sélectionnez la catégorie "${category.label}" et le département ${dept.code} (${dept.name}). Notre IA scrape ensuite le site web de chaque entreprise et complète avec une recherche Google ciblée. Vous récupérez en quelques secondes tous les emails professionnels disponibles.`,
    },
    {
      question: `Les emails des ${category.labelPlural} du ${dept.name} sont-ils vérifiés ?`,
      answer: `Oui. Chaque email reçoit un score de confiance basé sur sa source : "Vérifié" (trouvé sur le site officiel), "Google" (trouvé via recherche), ou "Pattern" (généré). Une vérification SMTP supplémentaire est disponible via MillionVerifier.`,
    },
    {
      question: `Puis-je exporter les ${category.labelPlural} du ${dept.name} en CSV ?`,
      answer: `Oui, exports illimités en CSV standard (Last Name, Company, Email, Phone). Inclus dans tous les plans Volia.`,
    },
    {
      question: `Le démarchage des ${category.labelPlural} du ${dept.name} est-il légal ?`,
      answer: `Oui, dans le cadre du RGPD (article 6 - intérêt légitime). Volia filtre automatiquement les emails personnels, respecte les opt-out, et ne collecte que des données professionnelles publiques. Vous restez responsable de l'usage des données collectées.`,
    },
    {
      question: `Combien coûte la prospection des ${category.labelPlural} dans le ${dept.name} ?`,
      answer: `À partir de 19 €/mois (plan Solo : 1 000 prospects + 400 enrichissements), 49 €/mois (plan Pro : 5 000 + 2 000) ou 149 €/mois (plan Business : 10 000 + 10 000). Tous les départements et catégories sont inclus dans chaque plan, sans supplément.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Prospection B2B', href: '/prospection' },
    { label: category.labelCapitalized, href: `/prospection/${catSlug}` },
    ...(dept.region
      ? [{ label: dept.region.name, href: `/prospection/${catSlug}/region/${dept.region.slug}` }]
      : []),
    { label: dept.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebPage',
        name: title,
        description: intro,
        url: `https://volia.fr/prospection/${catSlug}/${deptSlug}`,
        inLanguage: 'fr-FR',
        isPartOf: { '@id': 'https://volia.fr/#website' },
      },
      serviceSchema({
        name: `Recherche email ${category.labelPlural} ${dept.name}`,
        description: intro,
        url: `https://volia.fr/prospection/${catSlug}/${deptSlug}`,
        areaName: dept.name,
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

  // Real-looking stats based on dept size + category density
  const stats = estimateStats(dept, category);

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
        department={dept}
        stats={stats}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={relatedDepartments}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
        deptData={getDeptData(dept.code)}
        densityChart={(() => {
          // Top 6 villes du dept (par population) avec volume estimé proportionnel.
          const cities = getCitiesByDept(dept.code).sort((a, b) => (b.pop || 0) - (a.pop || 0)).slice(0, 6);
          if (cities.length < 2) return null;
          const total = parseInt(stats.total.replace(/\s/g, ''), 10) || 1000;
          const popTotal = cities.reduce((s, c) => s + (c.pop || 0), 0) || 1;
          return {
            scopeLabel: `dans le ${dept.name}`,
            items: cities.map((c) => ({
              label: c.name,
              value: Math.round(total * ((c.pop || 0) / popTotal)),
            })),
          };
        })()}
      />
    </>
  );
}
