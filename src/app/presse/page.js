// ─────────────────────────────────────────────────────────────────────
// /presse — Espace presse Volia (press kit)
// ─────────────────────────────────────────────────────────────────────
// Page publique destinée aux journalistes tech FR (Maddyness, Frenchweb,
// Les Echos, Forbes FR, Welcome to the Jungle, BFM Tech, ActuIA…) et aux
// podcasts/newsletters business. Centralise tout le matériel presse :
//   - Boilerplate (3 longueurs prêtes à copier-coller)
//   - Chiffres clés (cards)
//   - Founder bio + photo + quote
//   - 3 angles de pitch
//   - Assets téléchargeables (logos, screenshots, photos, PDF)
//   - Quotes prêtes à citer
//   - Communiqués de presse récents
//   - Contact presse
//   - Apparitions médias (placeholder)
//
// Style : light mode forcé (cohérence avec /produits/*), couleur
// dominante slate/zinc + accents violet (brand Volia). Premium feel.
// ─────────────────────────────────────────────────────────────────────

import PresseClientPage from './PresseClientPage';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/presse`;

export const metadata = {
  title: 'Espace presse — Dossier de presse Volia, suite SaaS B2B française | Volia',
  description:
    "Press kit Volia : logos HD, chiffres clés, bio founder, communiqués, quotes prêtes à citer. Suite SaaS B2B française co-construite par IA agentique.",
  keywords: [
    'dossier presse Volia',
    'press kit Volia',
    'communiqué de presse Volia',
    'Volia presse',
    'Anthony Malartre presse',
    'SaaS B2B français presse',
    'suite SaaS française',
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Espace presse Volia — Press kit suite SaaS B2B française',
    description:
      "Tout ce dont les journalistes ont besoin pour parler de Volia : logos, chiffres, bio founder, communiqués, quotes.",
    url: PAGE_URL,
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espace presse Volia — Press kit',
    description:
      "Press kit suite SaaS B2B française. Logos HD, chiffres clés, bio founder, communiqués.",
  },
};

export default function PressePage() {
  return <PresseClientPage />;
}
