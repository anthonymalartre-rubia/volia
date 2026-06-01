import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import { getAllCategories } from '@/lib/slugs';
import { getAllProvincesBE, getProvinceBySlugBE } from '@/lib/slugs-be';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import { getProvinceData } from '@/lib/dept-data-be';

const SITE_URL = 'https://volia.fr';

export async function generateStaticParams() {
  return getAllProvincesBE().map((p) => ({ slug: p.slug }));
}

// [1er juin 2026] noindex + follow appliqué (cf. Option C SEO).
// Cette route programmatique tail-of-tail (overview province BE) génère
// trop de pages à valeur SEO faible vs Google's quality threshold —
// GSC les classait "Explorée actuellement non indexée" pour 2 630 URLs.
// On garde follow: true pour préserver la transmission PageRank vers
// les pages core (hubs + catégories) qui restent indexables.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const province = getProvinceBySlugBE(slug);
  if (!province) return {};
  const title = `Prospection B2B en ${province.name} (Belgique) — Volia`;
  const description = `Trouvez les emails B2B des entreprises de la province ${province.name} (Belgique francophone). 150 secteurs couverts. À partir de 19 €/mois.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/prospection-be/province/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/prospection-be/province/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function ProvinceBePage({ params }) {
  const { slug } = await params;
  const province = getProvinceBySlugBE(slug);
  if (!province) notFound();

  const allCats = getAllCategories();
  const otherProvinces = getAllProvincesBE()
    .filter((p) => p.slug !== slug)
    .map((p) => ({ label: p.name, href: `/prospection-be/province/${p.slug}` }));

  // 12 catégories phares dans cette province (pour le bloc DeptOverview)
  const popularCats = ['restaurant', 'hotel', 'boulangerie-patisserie', 'avocat', 'garage-automobile', 'pharmacie', 'agence-immobiliere', 'salon-de-coiffure', 'plombier', 'electricien', 'expert-comptable', 'cabinet-de-conseil'];
  const catLinks = allCats
    .filter((c) => popularCats.includes(c.slug))
    .map((c) => ({
      label: `${c.labelCapitalized} ${province.name}`,
      href: `/prospection-be/${c.slug}/${slug}`,
    }));

  const title = `Prospection B2B en ${province.name}`;
  const intro = `La province ${province.name} (Belgique francophone) regroupe des milliers d'entreprises B2B : restaurants, commerces, artisans du BTP, professions libérales, services aux entreprises. Volia vous permet de trouver leur email professionnel en quelques secondes grâce à notre moteur de scraping et recherche Google, puis d'exporter en CSV.`;

  const faq = [
    {
      question: `Combien d'entreprises en ${province.name} ?`,
      answer: `Volia couvre toutes les entreprises géolocalisées par Google Places dans la province ${province.name}.`,
    },
    {
      question: `Quels secteurs sont disponibles ?`,
      answer: `Les 150 catégories B2B : hôtellerie, restauration, commerce, automobile, santé, BTP, services aux entreprises, immobilier, industrie, finance, éducation, technologie, agriculture.`,
    },
    {
      question: `Prix pour prospecter en ${province.name} ?`,
      answer: `À partir de 19 €/mois (1 000 prospects). Tous les pays inclus dans tous les plans.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Belgique', href: '/prospection-be' },
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
        url: `${SITE_URL}/prospection-be/province/${slug}`,
        inLanguage: 'fr-BE',
      },
      {
        '@type': 'Place',
        name: province.name,
        address: {
          '@type': 'PostalAddress',
          addressRegion: province.name,
          addressCountry: 'BE',
        },
      },
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

  const provinceAsDept = { code: province.code, name: province.name, region: 'Belgique francophone' };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProspectionSeoPage
        title={title}
        intro={intro}
        category={null}
        department={provinceAsDept}
        stats={{ total: '12 500', avgRating: '4.3', withEmail: '76%', withPhone: '91%' }}
        faq={faq}
        relatedCategories={catLinks}
        relatedDepartments={otherProvinces}
        breadcrumbs={breadcrumbs}
        deptData={getProvinceData(province.code)}
        deptOverviewCategories={catLinks}
        country="be"
      />
    </>
  );
}
