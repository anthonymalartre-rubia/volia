// ─────────────────────────────────────────────────────────────────────
// lib/one/draft.js — Volia One : rédaction d'un cold email AU NOM DU CLIENT
// ─────────────────────────────────────────────────────────────────────
// ⚠️ Différent de lib/autopilot/claude-writer.js : celui-là écrit "au nom de
// Volia". Ici on écrit au nom de l'entreprise de l'utilisateur (son ICP), vers
// un prospect (PME locale). Garde-fous DGCCRF + délivrabilité conservés.
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

const FORBIDDEN = [
  /\b0\s*humain\b/i,
  /\b100\s*%?\s*autonome\b/i,
  /\bsans\s*humain\b/i,
  /cliquez\s*ici/i,
  /\bgaranti\b/i,
];

function cityOf(lead, icp) {
  const m = (lead.adresse || '').match(/\d{5}\s+([^,]+)/);
  return (m && m[1] ? m[1].trim() : '') || icp.ville || '';
}

/**
 * Écrit un cold email perso (objet + corps) pour un lead, au nom de l'entreprise (icp).
 * @returns {Promise<string|null>} "Objet: ...\n\n<corps>" ou null si échec/pattern interdit
 */
export async function draftEmail(lead, icp) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `Tu écris UN cold email B2B en français, au nom d'une entreprise qui vend : "${icp.activite}" (proposition de valeur : "${icp.value_prop}").

RÈGLES (DGCCRF + délivrabilité) :
- Ton ${icp.ton || 'professionnel'}, naturel et humain — jamais promotionnel.
- 70 à 120 mots, 3 paragraphes courts : accroche personnalisée → bénéfice concret pour le destinataire → CTA léger (proposer un échange de 15 min).
- Interdits : "gratuit", "urgent", "cliquez ici", "garanti", "offre limitée", pas de MAJUSCULES sur des mots entiers, pas de "!!!".
- Si CTA, mentionne en une demi-phrase la base RGPD (intérêt légitime B2B).
- Écris à la personne qui DÉCIDE (dirigeant·e / gérant·e / responsable), pas à un service. Si tu n'as pas son nom, ne l'invente pas et n'ouvre pas par un « Madame, Monsieur » générique : attaque par une accroche directe et personnalisée.
- L'objet (≤ 55 caractères) doit être SPÉCIFIQUE au destinataire : cite le nom de son entreprise OU un bénéfice concret pour lui. JAMAIS un objet générique réutilisable tel quel pour une autre boîte (évite "… à {ville}").

SORTIE : commence par "Objet: ..." puis une ligne vide puis le corps. Pas de signature.`;

  const ville = cityOf(lead, icp);
  const who = lead.contact_name
    ? ` Adresse-toi nommément à ${lead.contact_name}${lead.contact_role ? ` (${lead.contact_role})` : ''}.`
    : ' Adresse-toi au dirigeant ou à la dirigeante de cette entreprise.';
  const user = `Destinataire : ${lead.nom}${ville ? ` (${ville})` : ''} — un(e) ${lead.term || 'entreprise locale'}.${who}
Écris l'email.`;

  try {
    const res = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: user }],
    });
    let text = (res.content?.[0]?.text || '').trim();
    if (!text) return null;
    if (FORBIDDEN.some((p) => p.test(text))) return null;
    text = text.replace(/^```\w*\n?/gm, '').replace(/\n?```$/gm, '');
    return text;
  } catch {
    return null;
  }
}
