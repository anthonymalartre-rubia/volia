import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import { getAllCategories } from '@/lib/slugs';
import { getAllCantonsCH, getCantonBySlugCH } from '@/lib/slugs-ch';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import { getCantonData } from '@/lib/dept-data-ch';

const SITE_URL = 'https://volia.fr';

export async function generateStaticParams() {
  return getAllCantonsCH().map((c) => ({ slug: c.slug }));
}

// [1er juin 2026] noindex + follow appliqué (cf. Option C SEO).
// Cette route programmatique tail-of-tail (overview canton CH) génère
// trop de pages à valeur SEO faible vs Google's quality threshold —
// GSC les classait "Explorée actuellement non indexée" pour 2 630 URLs.
// On garde follow: true pour préserver la transmission PageRank vers
// les pages core (hubs + catégories) qui restent indexables.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const canton = getCantonBySlugCH(slug);
  if (!canton) return {};
  const title = `Prospection B2B dans le canton ${canton.name} (Suisse) — Volia`;
  const description = `Trouvez les emails B2B des entreprises du canton ${canton.name} (Suisse romande). 150 secteurs couverts. À partir de 19 €/mois.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/prospection-ch/canton/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/prospection-ch/canton/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function CantonChPage({ params }) {
  const { slug } = await params;
  const canton = getCantonBySlugCH(slug);
  if (!canton) notFound();

  const allCats = getAllCategories();
  const otherCantons = getAllCantonsCH()
    .filter((c) => c.slug !== slug)
    .map((c) => ({ label: c.name, href: `/prospection-ch/canton/${c.slug}` }));

  const popularCats = ['restaurant', 'hotel', 'boulangerie-patisserie', 'avocat', 'garage-automobile', 'pharmacie', 'agence-immobiliere', 'salon-de-coiffure', 'plombier', 'electricien', 'expert-comptable', 'cabinet-de-conseil'];
  const catLinks = allCats
    .filter((c) => popularCats.includes(c.slug))
    .map((c) => ({
      label: `${c.labelCapitalized} ${canton.name}`,
      href: `/prospection-ch/${c.slug}/${slug}`,
    }));

  const title = `Prospection B2B dans le canton ${canton.name}`;
  const intro = `Le canton ${canton.name} (Suisse romande) regroupe des milliers d'entreprises B2B premium : restaurants, commerces, artisans, professions libérales, services aux entreprises. Volia vous permet de trouver leur email professionnel en quelques secondes via Google Places + scraping intelligent.`;

  const faq = [
    { question: `Combien d'entreprises dans le canton ${canton.name} ?`, answer: `Volia couvre toutes les entreprises géolocalisées par Google Places dans le canton ${canton.name}.` },
    { question: `Quels secteurs disponibles ?`, answer: `Les 150 catégories B2B : hôtellerie, restauration, commerce, automobile, santé, BTP, services aux entreprises, immobilier, industrie, finance, éducation, technologie, agriculture.` },
    { question: `Prix pour prospecter dans ${canton.name} ?`, answer: `Gratuit pour démarrer (25 crédits/mois), puis 19 €/mois (500 crédits/mois). Tous les pays inclus dans tous les plans.` },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Suisse romande', href: '/prospection-ch' },
    { label: canton.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebPage',
        name: title,
        description: intro,
        url: `${SITE_URL}/prospection-ch/canton/${slug}`,
        inLanguage: 'fr-CH',
      },
      {
        '@type': 'Place',
        name: canton.name,
        address: { '@type': 'PostalAddress', addressRegion: canton.name, addressCountry: 'CH' },
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

  const cantonAsDept = { code: canton.code, name: canton.name, region: 'Suisse romande' };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProspectionSeoPage
        title={title}
        intro={intro}
        category={null}
        department={cantonAsDept}
        stats={{ total: '8 500', avgRating: '4.4', withEmail: '~46%', withPhone: '92%' }}
        faq={faq}
        relatedCategories={catLinks}
        relatedDepartments={otherCantons}
        breadcrumbs={breadcrumbs}
        deptData={getCantonData(canton.code)}
        deptOverviewCategories={catLinks}
        country="ch"
      />
    </>
  );
}
