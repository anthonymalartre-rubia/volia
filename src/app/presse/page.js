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
// Positionnement (juin 2026) : « première entreprise SaaS autonome au
// monde — pilotée par IA, augmentée par 1 founder, construite en
// 6 semaines à Marseille ».
//
// Style : light mode forcé (cohérence avec /produits/*), couleur
// dominante slate/zinc + accents violet (brand Volia). Premium feel.
// ─────────────────────────────────────────────────────────────────────

import PresseClientPage from './PresseClientPage';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/presse`;

export const metadata = {
  title: 'Volia presse — Première entreprise SaaS autonome au monde | Press kit',
  description:
    "Press kit Volia : première entreprise SaaS autonome au monde, pilotée par IA et augmentée par 1 founder. Construite en 6 semaines à Marseille. Logos, chiffres, bio, quotes.",
  keywords: [
    'dossier presse Volia',
    'press kit Volia',
    'communiqué de presse Volia',
    'Volia presse',
    'Anthony Malartre presse',
    'entreprise SaaS autonome',
    'founder augmenté IA',
    'SaaS B2B français presse',
    'suite SaaS française',
    'IA agentique production',
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Volia presse — Première entreprise SaaS autonome au monde',
    description:
      "Première entreprise SaaS autonome d'un nouveau genre, pilotée par IA et augmentée par 1 founder. Construite en 6 semaines à Marseille.",
    url: PAGE_URL,
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia presse — Première entreprise SaaS autonome',
    description:
      "Pilotée par IA, augmentée par 1 founder, construite en 6 semaines à Marseille. Logos HD, chiffres clés, bio founder, communiqués.",
  },
};

export default function PressePage() {
  return <PresseClientPage />;
}
