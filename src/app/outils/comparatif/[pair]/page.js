import { notFound, redirect } from 'next/navigation';
import { getAllPairs, parsePairSlug } from '@/lib/competitors';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ToolVsToolPage from '@/components/ToolVsToolPage';

// 14 outils → C(14, 2) = 91 paires uniques (ordre alphabétique normalisé)
export async function generateStaticParams() {
  return getAllPairs().map((p) => ({ pair: p.slug }));
}

export async function generateMetadata({ params }) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) return {};
  const { a, b } = parsed;

  const cheaper = a.pricing <= b.pricing ? a : b;
  const expensive = cheaper === a ? b : a;
  const savingsPct = Math.round(((expensive.pricing - cheaper.pricing) / expensive.pricing) * 100);

  return {
    title: `${a.name} vs ${b.name} : comparatif 2026 — prix, avis, alternatives`,
    description: `${a.name} (${a.pricing} ${a.pricingUnit}) ou ${b.name} (${b.pricing} ${b.pricingUnit}) en 2026 ? Comparatif détaillé : prix, fonctionnalités, couverture France, RGPD, verdict par profil.${savingsPct > 0 ? ` ${cheaper.name} est ${savingsPct}% moins cher.` : ''}`,
    keywords: [
      `${a.name.toLowerCase()} vs ${b.name.toLowerCase()}`,
      `${b.name.toLowerCase()} vs ${a.name.toLowerCase()}`,
      `${a.name.toLowerCase()} ou ${b.name.toLowerCase()}`,
      `comparatif ${a.name.toLowerCase()} ${b.name.toLowerCase()}`,
      'comparatif outils prospection',
    ],
    alternates: { canonical: `https://prospectia.cloud/outils/comparatif/${pair}` },
    openGraph: {
      title: `${a.name} vs ${b.name} en 2026 — Comparatif`,
      description: `Prix, fonctionnalités, couverture France, RGPD. ${cheaper.name} est le moins cher (${cheaper.pricing} ${cheaper.pricingUnit}).`,
      url: `https://prospectia.cloud/outils/comparatif/${pair}`,
      type: 'article',
    },
  };
}

export default async function ComparatifPairPage({ params }) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) notFound();

  // Si l'utilisateur arrive avec un slug non normalisé (ex: hunter-vs-apollo
  // au lieu de apollo-vs-hunter), redirige 308 vers la version canonique
  // pour éviter le contenu dupliqué.
  if (parsed.canonical !== pair) {
    redirect(`/outils/comparatif/${parsed.canonical}`);
  }

  const { a, b } = parsed;
  const cheaper = a.pricing <= b.pricing ? a : b;
  const expensive = cheaper === a ? b : a;
  const savingsPct = Math.max(0, Math.round(((expensive.pricing - cheaper.pricing) / expensive.pricing) * 100));

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Outils', href: '/outils' },
    { label: 'Comparatifs', href: '/outils/comparatif' },
    { label: `${a.name} vs ${b.name}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'Article',
        headline: `${a.name} vs ${b.name} : comparatif 2026`,
        description: `Comparatif détaillé ${a.name} vs ${b.name} pour la prospection B2B : prix, fonctionnalités, couverture France, RGPD, verdict.`,
        datePublished: '2026-05-21',
        dateModified: '2026-05-21',
        author: { '@type': 'Person', name: 'Anthony Malartre' },
        publisher: {
          '@type': 'Organization',
          name: 'Prospectia',
          url: 'https://prospectia.cloud',
          logo: { '@type': 'ImageObject', url: 'https://prospectia.cloud/icon.svg' },
        },
        url: `https://prospectia.cloud/outils/comparatif/${pair}`,
        mainEntityOfPage: `https://prospectia.cloud/outils/comparatif/${pair}`,
        inLanguage: 'fr-FR',
      },
      // Les 2 outils comparés, chacun avec leur offer
      ...[a, b].map((tool) => ({
        '@type': 'SoftwareApplication',
        name: tool.name,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'SalesIntelligence',
        operatingSystem: 'Web',
        url: `https://${tool.domain}`,
        description: tool.description,
        offers: {
          '@type': 'Offer',
          price: String(tool.pricing),
          priceCurrency: tool.pricingUnit.includes('€') ? 'EUR' : 'USD',
        },
      })),
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Quel est le moins cher entre ${a.name} et ${b.name} en 2026 ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: savingsPct > 0
                ? `${cheaper.name} est le moins cher à ${cheaper.pricing} ${cheaper.pricingUnit}, soit ${savingsPct}% moins cher que ${expensive.name} (${expensive.pricing} ${expensive.pricingUnit}).`
                : `${a.name} et ${b.name} sont au même prix (${a.pricing} ${a.pricingUnit}).`,
            },
          },
          {
            '@type': 'Question',
            name: `Quelle alternative française à ${a.name} et ${b.name} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Prospectia est l'alternative française aux deux : 19 €/mois, combine découverte d'entreprises (Google Places, 150+ catégories, 101 départements) + enrichissement email + conformité RGPD-by-design.`,
            },
          },
          {
            '@type': 'Question',
            name: `${a.name} et ${b.name} sont-ils adaptés au marché français ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${a.name} : ${a.bestFor}. ${b.name} : ${b.bestFor}.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ToolVsToolPage a={a} b={b} />
    </>
  );
}
