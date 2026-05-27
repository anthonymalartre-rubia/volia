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
    title: `Volia vs ${c.name} : comparatif 2026 (prix, fonctionnalités, FR)`,
    description: `Volia vs ${c.name} : lequel choisir ? Comparatif honnête prix, fonctionnalités, couverture France. Volia est ${Math.round((c.pricing - 49) / c.pricing * 100)}% moins cher. Tu fais le calcul.`,
    alternates: { canonical: `https://volia.fr/vs/${slug}` },
    openGraph: {
      title: `Volia vs ${c.name} — Lequel choisir, vraiment ?`,
      description: `Comparatif honnête : prix, fonctionnalités, couverture France. Volia ${Math.round((c.pricing - 49) / c.pricing * 100)}% moins cher.`,
      url: `https://volia.fr/vs/${slug}`,
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
    name: `Volia vs ${c.name}`,
    description: `Comparatif Volia vs ${c.name} pour la prospection B2B en France.`,
    url: `https://volia.fr/vs/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompetitorVsPage competitor={c} />
    </>
  );
}
