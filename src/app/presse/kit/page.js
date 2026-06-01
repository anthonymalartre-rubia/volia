import KitImprimable from './KitImprimable';

// ─────────────────────────────────────────────────────────────────────
// /presse/kit — Press kit imprimable (one-pager → PDF via window.print)
// ─────────────────────────────────────────────────────────────────────
// Pattern Volia : pas de génération PDF serveur (Puppeteer trop lourd
// pour Vercel free tier — cf. /api/ressources/[slug]/pdf qui est désactivé).
// On rend une page longue print-optimized + un bouton "Télécharger PDF"
// qui appelle window.print(). Le navigateur génère le PDF nativement
// via la dialog "Enregistrer en PDF" (option de tous browsers modernes).
//
// Avantages :
//   - Zero dépendance externe (Puppeteer/Chromium)
//   - PDF de qualité native (sélection texte, liens, recherche)
//   - Pas de timeout serverless
//   - Le journaliste peut imprimer sur papier OU sauvegarder en PDF
//     selon son besoin
// ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Press kit Volia (PDF) — Téléchargeable | Volia',
  description:
    "Press kit complet Volia : boilerplate, bio founder, quotes prêtes à citer, chiffres clés, contact presse. Imprimable et exportable en PDF.",
  alternates: { canonical: 'https://volia.fr/presse/kit' },
  robots: { index: false, follow: true }, // page utilitaire, pas SEO
};

export default function KitImprimablePage() {
  return <KitImprimable />;
}
