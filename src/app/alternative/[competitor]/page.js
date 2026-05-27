import { notFound, redirect } from 'next/navigation';
import { getCompetitor, getAllCompetitors } from '@/lib/competitors';
import CompetitorVsPage from '@/components/CompetitorVsPage';

export async function generateStaticParams() {
  return getAllCompetitors().map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({ params }) {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) return {};

  const savingsPct = Math.max(0, Math.round((c.pricing - 19) / c.pricing * 100));
  return {
    title: `Alternative à ${c.name} en 2026 — Volia (à partir de 19€/mois)`,
    description: `Tu cherches une alternative à ${c.name} ? Volia : 19€/mois (${savingsPct}% moins cher), scraping intelligent + Google Places, RGPD natif. Tu fais le calcul.`,
    alternates: {
      canonical: `https://volia.fr/alternative/${slug}`,
      // Lien croisé vers le comparatif neutre /vs/X — Google comprend que
      // les 2 URLs visent 2 intents distincts (alternative vs comparaison)
      // mais sur le même outil, et qu'elles sont liées.
    },
    openGraph: {
      title: `Alternative à ${c.name} en 2026 — Volia`,
      description: `L'alternative française à ${c.name} : 19€/mois, scraping + Google Places, RGPD natif.`,
      url: `https://volia.fr/alternative/${slug}`,
    },
    other: {
      'See also': `https://volia.fr/vs/${slug}`,
    },
  };
}

export default async function AlternativeCompetitor({ params }) {
  const { competitor: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) notFound();

  // Reuse the comparison component (same content, different keyword target)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Alternative à ${c.name}`,
    description: `Volia est l'alternative française à ${c.name} pour la prospection B2B.`,
    url: `https://volia.fr/alternative/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompetitorVsPage competitor={c} intent="alternative" />
    </>
  );
}
