import { notFound } from 'next/navigation';
import ProspectionSeoPage from '@/components/ProspectionSeoPage';
import {
  getAllCategories,
  getAllDepartments,
  getAllRegions,
  getCategoryBySlug,
  getRegionBySlug,
} from '@/lib/slugs';
import { breadcrumbSchema, estimateStats, serviceSchema } from '@/lib/seo-helpers';
import { getCategoryData } from '@/lib/category-data';
import { getRegionData } from '@/lib/region-data';

// Generate static pages : 14 régions × ~150 catégories ≈ 2 100 URLs
export async function generateStaticParams() {
  const cats = getAllCategories();
  const regions = getAllRegions();
  const params = [];
  for (const cat of cats) {
    for (const r of regions) {
      params.push({ category: cat.slug, region: r.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { category: catSlug, region: regionSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const region = getRegionBySlug(regionSlug);
  if (!category || !region) return {};

  const title = `Email des ${category.labelPlural} en ${region.name} — Volia`;
  const description = `Trouvez l'email professionnel de tous les ${category.labelPlural} situés en ${region.name} (${region.depts.length} départements couverts). Scraping intelligent + recherche Google. À partir de 19 €/mois — le ticket d'entrée le moins cher du marché français.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://volia.fr/prospection/${catSlug}/region/${regionSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://volia.fr/prospection/${catSlug}/region/${regionSlug}`,
    },
  };
}

export default async function CategoryRegionPage({ params }) {
  const { category: catSlug, region: regionSlug } = await params;
  const category = getCategoryBySlug(catSlug);
  const region = getRegionBySlug(regionSlug);
  if (!category || !region) notFound();

  const allCats = getAllCategories();
  const allDepts = getAllDepartments();

  // All departments inside this region — links to deeper combos
  const regionDepts = allDepts.filter((d) => region.depts.includes(d.code));
  const relatedDepartments = regionDepts.slice(0, 14).map((d) => ({
    label: `${category.labelCapitalized} ${d.name}`,
    href: `/prospection/${catSlug}/${d.slug}`,
  }));

  // Other categories in the same group, scoped to the region
  const relatedCategories = allCats
    .filter((c) => c.group === category.group && c.slug !== catSlug)
    .slice(0, 12)
    .map((c) => ({
      label: `${c.labelCapitalized} ${region.name}`,
      href: `/prospection/${c.slug}/region/${regionSlug}`,
    }));

  // Other regions for the same category — horizontal navigation
  const otherRegions = getAllRegions()
    .filter((r) => r.slug !== regionSlug)
    .slice(0, 13)
    .map((r) => ({
      label: `${category.labelCapitalized} ${r.name}`,
      href: `/prospection/${catSlug}/region/${r.slug}`,
    }));

  const title = `Email des ${category.labelPlural} en ${region.name}`;
  const intro = `Vous cherchez à contacter les ${category.labelPlural} situés en région ${region.name} ? Volia identifie automatiquement tous les ${category.labelPlural} géolocalisés dans les ${region.depts.length} départements de ${region.name} via Google Places, puis trouve leur email professionnel grâce à notre moteur de scraping et recherche Google. Exportez la liste complète en CSV en moins de 5 minutes, avec nom, adresse, téléphone, email vérifié, site web et note Google.`;

  const faq = [
    {
      question: `Combien de ${category.labelPlural} y a-t-il en ${region.name} ?`,
      answer: `La région ${region.name} regroupe ${region.depts.length} départements et plusieurs milliers à dizaines de milliers de ${category.labelPlural}, selon la densité économique locale. Volia couvre toutes les entreprises géolocalisées par Google Places dans la région.`,
    },
    {
      question: `Quels départements composent la région ${region.name} ?`,
      answer: `${region.name} comprend ${region.depts.length} départements : ${regionDepts.map((d) => `${d.name} (${d.code})`).join(', ')}. Volia couvre tous ces départements sans supplément.`,
    },
    {
      question: `Comment trouver l'email d'un ${category.label} en ${region.name} ?`,
      answer: `Sur Volia, sélectionnez la catégorie "${category.label}" et tous les départements de ${region.name} en un clic via le filtre région. Notre IA scrape ensuite le site web de chaque entreprise et complète avec une recherche Google ciblée. Vous récupérez en quelques minutes tous les emails professionnels disponibles.`,
    },
    {
      question: `Les emails des ${category.labelPlural} en ${region.name} sont-ils vérifiés ?`,
      answer: `Oui. Chaque email reçoit un score de confiance basé sur sa source : "Vérifié" (trouvé sur le site officiel), "Google" (trouvé via recherche), ou "Pattern" (généré). Une vérification SMTP supplémentaire est disponible.`,
    },
    {
      question: `Puis-je exporter les ${category.labelPlural} de ${region.name} en CSV ?`,
      answer: `Oui, exports illimités en CSV standard (nom, entreprise, email, téléphone, note Google, site web). Inclus dans tous les plans Volia. Compatible avec tous les CRM (HubSpot, Salesforce, Pipedrive…) et outils d'outreach (Lemlist, Apollo, Smartlead…).`,
    },
    {
      question: `Combien coûte la prospection des ${category.labelPlural} en ${region.name} ?`,
      answer: `À partir de 19 €/mois (plan Solo : 1 000 prospects + 400 enrichissements), 49 €/mois (plan Pro : 5 000 + 2 000) ou 149 €/mois (plan Business : 10 000 + 10 000). Tous les départements et catégories sont inclus dans chaque plan, sans supplément.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Prospection B2B', href: '/prospection' },
    { label: category.labelCapitalized, href: `/prospection/${catSlug}` },
    { label: region.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebPage',
        name: title,
        description: intro,
        url: `https://volia.fr/prospection/${catSlug}/region/${regionSlug}`,
        inLanguage: 'fr-FR',
        isPartOf: { '@id': 'https://volia.fr/#website' },
      },
      {
        '@type': 'Service',
        name: `Recherche email ${category.labelPlural} en ${region.name}`,
        provider: {
          '@type': 'Organization',
          name: 'Volia',
          url: 'https://volia.fr',
        },
        areaServed: {
          '@type': 'AdministrativeArea',
          name: region.name,
          containedInPlace: { '@type': 'Country', name: 'France' },
        },
        offers: {
          '@type': 'Offer',
          price: '19',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Place',
        name: region.name,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'FR',
          addressRegion: region.name,
        },
        containsPlace: regionDepts.map((d) => ({
          '@type': 'AdministrativeArea',
          name: d.name,
          identifier: d.code,
        })),
      },
      serviceSchema({
        name: `Recherche email ${category.labelPlural} en ${region.name}`,
        description: intro,
        url: `https://volia.fr/prospection/${catSlug}/region/${region.slug}`,
        areaName: region.name,
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

  // Estimated stats : sum of dept-level stats (rough but informative)
  const baseStats = estimateStats(null, category);
  const inflatedStats = {
    ...baseStats,
    total: Math.round(
      parseInt(baseStats.total.replace(/\s/g, ''), 10) * region.depts.length * 0.8
    ).toLocaleString('fr-FR'),
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
        region={{ slug: region.slug, name: region.name }}
        stats={inflatedStats}
        faq={faq}
        relatedCategories={relatedCategories}
        relatedDepartments={[...relatedDepartments, ...otherRegions]}
        breadcrumbs={breadcrumbs}
        categoryData={getCategoryData(category)}
        regionData={getRegionData(region.slug)}
        densityChart={(() => {
          // Top 8 dépts de la région (par taille estimée du marché cat)
          const depts = regionDepts.slice(0, 8);
          if (depts.length < 2) return null;
          const total = parseInt(inflatedStats.total.replace(/\s/g, ''), 10) || 5000;
          return {
            scopeLabel: `en ${region.name}`,
            items: depts.map((d) => ({
              label: `${d.code} · ${d.name}`,
              // Estim proportionnelle : tous les dépts d'une région ≈ pareil, sauf qq gros
              value: Math.round(total / depts.length * (['75','13','69','59','92','33','67','31','06','38'].includes(d.code) ? 2.5 : 1)),
            })),
          };
        })()}
      />
    </>
  );
}
