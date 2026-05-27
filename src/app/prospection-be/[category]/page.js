import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import { getAllCategories, getCategoryBySlug } from '@/lib/slugs';
import { getAllProvincesBE } from '@/lib/slugs-be';
import { breadcrumbSchema, productSchema } from '@/lib/seo-helpers';
import { getCategoryData } from '@/lib/category-data';
import { getCrossSectorSlugs } from '@/lib/cross-sector';

const SITE_URL = 'https://volia.fr';

export async function generateStaticParams() {
  return getAllCategories().map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }) {
  const { category: catSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  if (!category) return {};
  const title = `Trouver l'email des ${category.labelPlural} en Belgique francophone — Volia`;
  const description = `Email professionnel des ${category.labelPlural} en Wallonie et Bruxelles (6 provinces). Scraping intelligent + recherche Google. À partir de 19 €/mois — RGPD européen.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/prospection-be/${catSlug}`,
      languages: {
        'fr-FR': `${SITE_URL}/prospection/${catSlug}`,
        'fr-BE': `${SITE_URL}/prospection-be/${catSlug}`,
        'fr-CH': `${SITE_URL}/prospection-ch/${catSlug}`,
        'x-default': `${SITE_URL}/prospection/${catSlug}`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/prospection-be/${catSlug}` },
  };
}

export default async function CategoryBePage({ params }) {
  const { category: catSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  if (!category) notFound();

  const allCats = getAllCategories();
  const allProvinces = getAllProvincesBE();

  // Maillage : provinces BE pour cette catégorie + cross-sector
  const provinceLinks = allProvinces.map((p) => ({
    label: `${category.labelCapitalized} en ${p.name}`,
    href: `/prospection-be/${catSlug}/${p.slug}`,
  }));

  const crossSlugs = getCrossSectorSlugs(catSlug);
  const crossSectorCats = crossSlugs
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6)
    .map((c) => ({ label: c.labelCapitalized, href: `/prospection-be/${c.slug}` }));
  const sameGroupCats = allCats
    .filter((c) => c.group === category.group && c.slug !== catSlug && !crossSlugs.includes(c.slug))
    .slice(0, 6)
    .map((c) => ({ label: c.labelCapitalized, href: `/prospection-be/${c.slug}` }));
  const relatedCategories = [...crossSectorCats, ...sameGroupCats];

  const title = `Trouver l'email des ${category.labelPlural} en Belgique francophone`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} en Belgique ? Volia agrège les ${category.labelPlural} de Wallonie et de Bruxelles-Capitale et trouve leur email professionnel grâce à notre moteur de scraping et recherche Google. Exportez les contacts en CSV en quelques clics, conforme RGPD européen.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} sont référencés en Belgique francophone ?`,
      answer: `Volia couvre tous les ${category.labelPlural} géolocalisés par Google Places dans les 6 provinces francophones (Wallonie + Bruxelles).`,
    },
    {
      question: `Comment Volia trouve-t-il les emails en Belgique ?`,
      answer: `Le moteur scrape le site web de chaque entreprise belge, puis effectue une recherche Google ciblée. Taux de couverture moyen : 70-85 %.`,
    },
    {
      question: `La prospection B2B en Belgique est-elle conforme au RGPD ?`,
      answer: `Oui. La Belgique est soumise au même RGPD européen que la France. Volia filtre automatiquement les emails personnels et respecte les opt-out.`,
    },
    {
      question: `Puis-je exporter les contacts en CSV ?`,
      answer: `Oui, l'export CSV est inclus dans tous les plans. Compatible avec n'importe quel CRM (HubSpot, Salesforce, Zoho, Pipedrive...).`,
    },
    {
      question: `Quel est le prix pour prospecter en Belgique ?`,
      answer: `À partir de 19 €/mois (1 000 prospects). Les plans Pro à 49 € (5 000) et Business à 149 € (10 000) couvrent tous les pays sans supplément.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Belgique francophone', href: '/prospection-be' },
    { label: category.labelCapitalized },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebPage',
        name: title,
        description: intro,
        url: `${SITE_URL}/prospection-be/${catSlug}`,
        inLanguage: 'fr-BE',
      },
      productSchema({
        name: `Recherche email ${category.labelPlural} Belgique`,
        description: intro,
        url: `${SITE_URL}/prospection-be/${catSlug}`,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProspectionSeoPage
        title={title}
        intro={intro}
        category={category}
        department={null}
        stats={{ total: '2 500', avgRating: '4.3', withEmail: '76%', withPhone: '91%' }}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={provinceLinks}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
        country="be"
      />
    </>
  );
}
