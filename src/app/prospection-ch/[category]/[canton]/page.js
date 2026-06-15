import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import { getAllCategories, getCategoryBySlug } from '@/lib/slugs';
import { getAllCantonsCH, getCantonBySlugCH } from '@/lib/slugs-ch';
import { breadcrumbSchema, serviceSchema } from '@/lib/seo-helpers';
import { getCategoryData } from '@/lib/category-data';
import { getCantonData } from '@/lib/dept-data-ch';
import { getCrossSectorSlugs } from '@/lib/cross-sector';

const SITE_URL = 'https://volia.fr';

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  const popularCats = [
    'restaurant', 'hotel', 'boulangerie-patisserie', 'pharmacie', 'avocat',
    'garage-automobile', 'agence-immobiliere', 'salon-de-coiffure',
    'plombier', 'electricien', 'expert-comptable',
  ];
  const cantons = getAllCantonsCH().map((c) => c.slug);
  const params = [];
  for (const cat of popularCats) {
    for (const canton of cantons) {
      params.push({ category: cat, canton });
    }
  }
  return params; // 11 × 6 = 66 prebuilt
}

// [1er juin 2026] noindex + follow appliqué (cf. Option C SEO).
// Cette route programmatique tail-of-tail (catégorie × canton CH) génère
// trop de pages à valeur SEO faible vs Google's quality threshold —
// GSC les classait "Explorée actuellement non indexée" pour 2 630 URLs.
// On garde follow: true pour préserver la transmission PageRank vers
// les pages core (hubs + catégories) qui restent indexables.
export async function generateMetadata({ params }) {
  const { category: catSlug, canton: cantonSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const canton = getCantonBySlugCH(cantonSlug);
  if (!category || !canton) return {};
  const title = `Email des ${category.labelPlural} dans le canton ${canton.name} (Suisse) — Volia`;
  const description = `Trouvez l'email professionnel des ${category.labelPlural} du canton ${canton.name}. Scraping intelligent + Google. À partir de 19 €/mois — RGPD européen.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/prospection-ch/${catSlug}/${cantonSlug}` },
    openGraph: { title, description, url: `${SITE_URL}/prospection-ch/${catSlug}/${cantonSlug}` },
    robots: { index: false, follow: true },
  };
}

export default async function CategoryCantonChPage({ params }) {
  const { category: catSlug, canton: cantonSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const canton = getCantonBySlugCH(cantonSlug);
  if (!category || !canton) notFound();

  const allCats = getAllCategories();
  const allCantons = getAllCantonsCH();

  const otherCantons = allCantons
    .filter((c) => c.slug !== cantonSlug)
    .map((c) => ({
      label: `${category.labelCapitalized} ${c.name}`,
      href: `/prospection-ch/${catSlug}/${c.slug}`,
    }));

  const crossSlugs = getCrossSectorSlugs(catSlug);
  const crossSectorCats = crossSlugs
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter(Boolean)
    .slice(0, 6)
    .map((c) => ({ label: `${c.labelCapitalized} ${canton.name}`, href: `/prospection-ch/${c.slug}/${cantonSlug}` }));
  const sameGroupCats = allCats
    .filter((c) => c.group === category.group && c.slug !== catSlug && !crossSlugs.includes(c.slug))
    .slice(0, 6)
    .map((c) => ({ label: `${c.labelCapitalized} ${canton.name}`, href: `/prospection-ch/${c.slug}/${cantonSlug}` }));
  const relatedCategories = [...crossSectorCats, ...sameGroupCats];

  const title = `Email des ${category.labelPlural} dans le canton ${canton.name}`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} situés dans le canton ${canton.name} (Suisse romande) ? Volia identifie automatiquement tous les ${category.labelPlural} via Google Places, puis trouve leur email professionnel. Marché premium B2B avec un fort pouvoir d'achat.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} dans le canton ${canton.name} ?`,
      answer: `Le canton ${canton.name} regroupe plusieurs centaines à plusieurs milliers de ${category.labelPlural} selon sa taille.`,
    },
    {
      question: `Comment trouver l'email d'un ${category.label} en ${canton.name} ?`,
      answer: `Sélectionnez "${category.label}" et le canton "${canton.name}" sur Volia. Notre IA scrape les sites et complète avec Google.`,
    },
    {
      question: `La prospection en Suisse romande est-elle conforme à la nLPD ?`,
      answer: `Oui. La nouvelle Loi sur la Protection des Données (nLPD) suisse est alignée avec le RGPD européen. Volia respecte les deux cadres.`,
    },
    {
      question: `Combien coûte la prospection en ${canton.name} ?`,
      answer: `Gratuit pour démarrer (25 crédits/mois), puis 19 €/mois (500 crédits/mois). Tous les pays inclus.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Suisse romande', href: '/prospection-ch' },
    { label: category.labelCapitalized, href: `/prospection-ch/${catSlug}` },
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
        url: `${SITE_URL}/prospection-ch/${catSlug}/${cantonSlug}`,
        inLanguage: 'fr-CH',
      },
      serviceSchema({
        name: `Recherche email ${category.labelPlural} canton ${canton.name}`,
        description: intro,
        url: `${SITE_URL}/prospection-ch/${catSlug}/${cantonSlug}`,
        areaName: canton.name,
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

  const cantonSizeMultiplier = {
    'CH-VD': 2.5, 'CH-GE': 2, 'CH-VS': 1.2, 'CH-FR': 1, 'CH-NE': 0.7, 'CH-JU': 0.3,
  }[canton.code] || 1;
  const total = Math.round(500 * cantonSizeMultiplier);

  const cantonAsDept = { code: canton.code, name: canton.name, region: 'Suisse romande' };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProspectionSeoPage
        title={title}
        intro={intro}
        category={category}
        department={cantonAsDept}
        stats={{ total: total.toLocaleString('fr-FR'), avgRating: '4.4', withEmail: '~46%', withPhone: '92%' }}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={otherCantons}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
        deptData={getCantonData(canton.code)}
        country="ch"
      />
    </>
  );
}
