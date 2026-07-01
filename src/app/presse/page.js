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
// Positionnement (juin 2026) : « Volia One — tu entres ton domaine,
// Volia trouve tes prospects (email + tél), écrit et envoie tes cold
// emails et remplit ton pipeline. En pilote automatique 24/7 (mode
// Autopilot) avec le plan MAX. L'humain choisit la cible, l'IA exécute
// la chaîne, sous supervision ».
//
// Style : light mode forcé (cohérence avec /produits/*), couleur
// dominante slate/zinc + accents violet (brand Volia). Premium feel.
// ─────────────────────────────────────────────────────────────────────

import PresseClientPage from './PresseClientPage';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/presse`;

export const metadata = {
  title: 'Volia presse — Volia One, le pipeline B2B automatisé | Press kit',
  description:
    "Press kit Volia : Volia One — entre ton domaine, l'IA trouve tes prospects (email + tél), écrit et envoie tes cold emails et remplit ton pipeline (cible → email IA → qualification → scoring → CRM). En pilote automatique 24/7 avec le mode Autopilot (plan MAX). L'humain valide, l'IA exécute. Suite SaaS française RGPD. Logos, chiffres, bio, quotes.",
  keywords: [
    'dossier presse Volia',
    'press kit Volia',
    'communiqué de presse Volia',
    'Volia presse',
    'Anthony Malartre presse',
    'entreprise SaaS nouvelle génération',
    'prospection B2B augmentée par IA',
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
    title: 'Volia presse — Volia One, le pipeline B2B automatisé',
    description:
      "Volia One : entre ton domaine, l'IA trouve tes prospects, écrit et envoie tes cold emails et remplit ton pipeline (cible → email IA → qualification → scoring → CRM). L'humain choisit la cible, l'IA exécute la chaîne, sous supervision — en pilote automatique 24/7 (mode Autopilot, plan MAX).",
    url: PAGE_URL,
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia presse — Volia One, le pipeline B2B automatisé',
    description:
      "Volia One : le pipeline B2B automatisé de bout en bout. L'humain valide, l'IA exécute. Logos HD, chiffres clés, bio founder, communiqués.",
  },
};

export default function PressePage() {
  return <PresseClientPage />;
}
