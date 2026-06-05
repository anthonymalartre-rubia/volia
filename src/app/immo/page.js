import ImmoLandingContent from '@/components/ImmoLandingContent';

const SITE_URL = 'https://volia.fr';

export const metadata = {
  title: 'Volia Immo — Rentre plus de mandats, sans éplucher Leboncoin | Liste fondateur',
  description:
    "Volia Immo surveille les portails immobiliers en temps réel et te sort chaque matin les biens de particuliers à appeler en priorité, classés par probabilité de mandat. Rejoins la liste fondateur (-50 % à vie).",
  alternates: { canonical: `${SITE_URL}/immo` },
  openGraph: {
    title: 'Volia Immo — Rentre plus de mandats, sans éplucher Leboncoin',
    description:
      'La pige intelligente + le tunnel de conversion pour agents et mandataires. Liste fondateur ouverte — places limitées.',
    url: `${SITE_URL}/immo`,
    siteName: 'Volia',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function ImmoPage() {
  return <ImmoLandingContent />;
}
