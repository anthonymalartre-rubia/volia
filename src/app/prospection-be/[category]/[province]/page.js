import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import { getAllCategories, getCategoryBySlug } from '@/lib/slugs';
import { getAllProvincesBE, getProvinceBySlugBE } from '@/lib/slugs-be';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo-helpers';
import { getCategoryData } from '@/lib/category-data';
import { getProvinceData } from '@/lib/dept-data-be';
import { getCrossSectorSlugs } from '@/lib/cross-sector';

const SITE_URL = 'https://volia.fr';

// ISR : on prébuild les combos populaires, le reste à la demande.
export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  const popularCats = [
    'restaurant', 'hotel', 'boulangerie-patisserie', 'pharmacie', 'avocat',
    'garage-automobile', 'agence-immobiliere', 'salon-de-coiffure',
    'plombier', 'electricien', 'expert-comptable',
  ];
  const provinces = getAllProvincesBE().map((p) => p.slug);
  const params = [];
  for (const cat of popularCats) {
    for (const province of provinces) {
      params.push({ category: cat, province });
    }
  }
  return params; // 11 × 6 = 66 pages prebuilt
}

// [1er juin 2026] noindex + follow appliqué (cf. Option C SEO).
// Cette route programmatique tail-of-tail (catégorie × province BE) génère
// trop de pages à valeur SEO faible vs Google's quality threshold —
// GSC les classait "Explorée actuellement non indexée" pour 2 630 URLs.
// On garde follow: true pour préserver la transmission PageRank vers
// les pages core (hubs + catégories) qui restent indexables.
export async function generateMetadata({ params }) {
  const { category: catSlug, province: provSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const province = getProvinceBySlugBE(provSlug);
  if (!category || !province) return {};
  const title = `Email des ${category.labelPlural} en ${province.name} (Belgique) — Volia`;
  const description = `Trouvez l'email professionnel des ${category.labelPlural} de la province ${province.name}. Scraping intelligent + recherche Google. À partir de 19 €/mois — RGPD européen.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/prospection-be/${catSlug}/${provSlug}` },
    openGraph: { title, description, url: `${SITE_URL}/prospection-be/${catSlug}/${provSlug}` },
    robots: { index: false, follow: true },
  };
}

export default async function CategoryProvinceBePage({ params }) {
  const { category: catSlug, province: provSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const province = getProvinceBySlugBE(provSlug);
  if (!category || !province) notFound();

  const allCats = getAllCategories();
  const allProvinces = getAllProvincesBE();

  // Maillage : autres provinces (même catégorie) + cross-sector (même province)
  const otherProvinces = allProvinces
    .filter((p) => p.slug !== provSlug)
    .map((p) => ({
      label: `${category.labelCapitalized} ${p.name}`,
      href: `/prospection-be/${catSlug}/${p.slug}`,
    }));

  const crossSlugs = getCrossSectorSlugs(catSlug);
  const crossSectorCats = crossSlugs
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6)
    .map((c) => ({ label: `${c.labelCapitalized} ${province.name}`, href: `/prospection-be/${c.slug}/${provSlug}` }));
  const sameGroupCats = allCats
    .filter((c) => c.group === category.group && c.slug !== catSlug && !crossSlugs.includes(c.slug))
    .slice(0, 6)
    .map((c) => ({ label: `${c.labelCapitalized} ${province.name}`, href: `/prospection-be/${c.slug}/${provSlug}` }));
  const relatedCategories = [...crossSectorCats, ...sameGroupCats];

  const title = `Email des ${category.labelPlural} en ${province.name}`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} situés en province de ${province.name} (Belgique francophone) ? Volia identifie automatiquement tous les ${category.labelPlural} géolocalisés via Google Places, puis trouve leur email professionnel. Exportez en CSV en quelques minutes, conforme RGPD européen.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} en ${province.name} ?`,
      answer: `La province ${province.name} regroupe plusieurs centaines à plusieurs milliers de ${category.labelPlural}. Volia couvre toutes les entreprises géolocalisées par Google Places.`,
    },
    {
      question: `Comment trouver l'email d'un ${category.label} en ${province.name} ?`,
      answer: `Sélectionnez "${category.label}" et la province "${province.name}" sur Volia. Notre IA scrape les sites web et complète avec Google. Taux : 70-85 %.`,
    },
    {
      question: `La prospection en Belgique est-elle conforme au RGPD ?`,
      answer: `Oui, la Belgique applique le RGPD européen. Volia filtre les emails personnels et respecte les demandes d'opt-out.`,
    },
    {
      question: `Combien coûte la prospection en ${province.name} ?`,
      answer: `À partir de 19 €/mois (1 000 prospects/mois). Tous les pays sont inclus dans tous les plans sans supplément.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Belgique', href: '/prospection-be' },
    { label: category.labelCapitalized, href: `/prospection-be/${catSlug}` },
    { label: province.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebPage',
        name: title,
        description: intro,
        url: `${SITE_URL}/prospection-be/${catSlug}/${provSlug}`,
        inLanguage: 'fr-BE',
      },
      serviceSchema({
        name: `Recherche email ${category.labelPlural} ${province.name}`,
        description: intro,
        url: `${SITE_URL}/prospection-be/${catSlug}/${provSlug}`,
        areaName: province.name,
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

  // Stats déterministes basées sur la province
  const provinceSizeMultiplier = {
    'BE-BRU': 3, 'BE-WHT': 2, 'BE-WLG': 1.8, 'BE-WBR': 1.5, 'BE-WNA': 1, 'BE-WLX': 0.6,
  }[province.code] || 1;
  const baseTotal = 600;
  const total = Math.round(baseTotal * provinceSizeMultiplier);

  // Shape "department" pour ProspectionSeoPage
  const provinceAsDept = { code: province.code, name: province.name, region: 'Belgique francophone' };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProspectionSeoPage
        title={title}
        intro={intro}
        category={category}
        department={provinceAsDept}
        stats={{ total: total.toLocaleString('fr-FR'), avgRating: '4.3', withEmail: '76%', withPhone: '91%' }}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={otherProvinces}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
        deptData={getProvinceData(province.code)}
        country="be"
      />
    </>
  );
}
