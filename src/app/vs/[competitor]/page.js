import { notFound } from 'next/navigation';
import CompetitorVsPage from '@/components/CompetitorVsPage';
import { getCompetitor, getAllCompetitors } from '@/lib/competitors';

export async function generateStaticParams() {
  return getAllCompetitors().map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({ params }) {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) return {};

  return {
    title: `Prospectia vs ${c.name} : comparatif 2026 (prix, fonctionnalités)`,
    description: `Prospectia vs ${c.name} : qui gagne en 2026 ? Comparatif détaillé prix, fonctionnalités, couverture France. Prospectia est ${Math.round((c.pricing - 49) / c.pricing * 100)}% moins cher.`,
    alternates: { canonical: `https://prospectia.cloud/vs/${slug}` },
    openGraph: {
      title: `Prospectia vs ${c.name} — Lequel choisir en 2026 ?`,
      description: `Comparatif détaillé : prix, fonctionnalités, couverture France. Prospectia ${Math.round((c.pricing - 49) / c.pricing * 100)}% moins cher.`,
      url: `https://prospectia.cloud/vs/${slug}`,
    },
  };
}

export default async function VsCompetitor({ params }) {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Prospectia vs ${c.name}`,
    description: `Comparatif Prospectia vs ${c.name} pour la prospection B2B en France.`,
    url: `https://prospectia.cloud/vs/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompetitorVsPage competitor={c} />
    </>
  );
}
