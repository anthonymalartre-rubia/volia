import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import { getAllCategories, getCategoryBySlug } from '@/lib/slugs';
import { getAllCantonsCH } from '@/lib/slugs-ch';
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
  const title = `Trouver l'email des ${category.labelPlural} en Suisse romande — Volia`;
  const description = `Email professionnel des ${category.labelPlural} en Suisse romande (6 cantons francophones). Scraping intelligent + Google. À partir de 19 €/mois — RGPD européen.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/prospection-ch/${catSlug}`,
      languages: {
        'fr-FR': `${SITE_URL}/prospection/${catSlug}`,
        'fr-BE': `${SITE_URL}/prospection-be/${catSlug}`,
        'fr-CH': `${SITE_URL}/prospection-ch/${catSlug}`,
        'x-default': `${SITE_URL}/prospection/${catSlug}`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/prospection-ch/${catSlug}` },
  };
}

export default async function CategoryChPage({ params }) {
  const { category: catSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  if (!category) notFound();

  const allCats = getAllCategories();
  const allCantons = getAllCantonsCH();

  const cantonLinks = allCantons.map((c) => ({
    label: `${category.labelCapitalized} en ${c.name}`,
    href: `/prospection-ch/${catSlug}/${c.slug}`,
  }));

  const crossSlugs = getCrossSectorSlugs(catSlug);
  const crossSectorCats = crossSlugs
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6)
    .map((c) => ({ label: c.labelCapitalized, href: `/prospection-ch/${c.slug}` }));
  const sameGroupCats = allCats
    .filter((c) => c.group === category.group && c.slug !== catSlug && !crossSlugs.includes(c.slug))
    .slice(0, 6)
    .map((c) => ({ label: c.labelCapitalized, href: `/prospection-ch/${c.slug}` }));
  const relatedCategories = [...crossSectorCats, ...sameGroupCats];

  const title = `Trouver l'email des ${category.labelPlural} en Suisse romande`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} en Suisse romande ? Volia agrège les ${category.labelPlural} de Genève, Vaud, Valais, Neuchâtel, Fribourg et Jura, et trouve leur email professionnel grâce à notre cascade waterfall (scraping + Google). Marché premium B2B au 1er PIB/habitant d'Europe.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} sont référencés en Suisse romande ?`,
      answer: `Volia couvre tous les ${category.labelPlural} géolocalisés par Google Places dans les 6 cantons romands.`,
    },
    {
      question: `Comment Volia trouve-t-il les emails en Suisse ?`,
      answer: `Le moteur scrape le site web de chaque entreprise suisse, puis effectue une recherche Google. Taux : ~46 %.`,
    },
    {
      question: `La prospection B2B en Suisse est-elle conforme RGPD ?`,
      answer: `La Suisse applique la nLPD (équivalent suisse du RGPD). Volia filtre les emails personnels et respecte les opt-out — compatible avec les 2 cadres.`,
    },
    {
      question: `Prix pour prospecter en Suisse romande ?`,
      answer: `À partir de 19 €/mois (1 000 prospects). Tous les pays inclus dans tous les plans.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Suisse romande', href: '/prospection-ch' },
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
        url: `${SITE_URL}/prospection-ch/${catSlug}`,
        inLanguage: 'fr-CH',
      },
      productSchema({
        name: `Recherche email ${category.labelPlural} Suisse romande`,
        description: intro,
        url: `${SITE_URL}/prospection-ch/${catSlug}`,
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
        stats={{ total: '1 800', avgRating: '4.4', withEmail: '~46%', withPhone: '92%' }}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={cantonLinks}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
        country="ch"
      />
    </>
  );
}
