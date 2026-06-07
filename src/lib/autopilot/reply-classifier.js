// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/reply-classifier.js
// ─────────────────────────────────────────────────────────────────────
// Quand un prospect RÉPOND à un email de campagne/Autopilot (webhook inbound
// Resend), on demande à Claude de :
//   1. CLASSIFIER la réponse (interested / question / objection / not_interested
//      / unsubscribe / auto_reply / other)
//   2. RÉSUMER en 1 phrase (pour la queue + le CRM)
//   3. RÉDIGER un brouillon de réponse FR (uniquement si la catégorie le
//      justifie : interested / question / objection)
//
// Le brouillon n'est JAMAIS envoyé automatiquement : il part dans la file
// d'approbation (lib/autonomy → /admin/auto-queue). L'humain valide en 1 clic,
// PUIS le cron publish-approved-actions l'envoie depuis le domaine VÉRIFIÉ de
// l'utilisateur (jamais hello@volia.fr). Garde-fou "l'humain valide, l'IA exécute".
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { cleanEnv } from '@/lib/envClean';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

// Catégories pour lesquelles on génère un brouillon de réponse.
// not_interested / unsubscribe / auto_reply → AUCUN brouillon (on ne relance
// pas quelqu'un qui dit non / se désinscrit / est en absence auto).
export const DRAFTABLE_CATEGORIES = ['interested', 'question', 'objection'];
const ALL_CATEGORIES = [
  'interested',
  'question',
  'objection',
  'not_interested',
  'unsubscribe',
  'auto_reply',
  'other',
];

// Mêmes garde-fous DGCCRF/marque que claude-writer : si le brouillon contient
// un terme interdit, on le jette (pas de brouillon plutôt qu'un brouillon risqué).
const FORBIDDEN_PATTERNS = [
  /\b0\s*humain\b/i,
  /\b100\s*%?\s*autonome\b/i,
  /\bsans\s*humain\b/i,
  /\bremplace\s*les\s*humains?\b/i,
  /\bbordeaux\b/i,
  /\blyon\b/i,
  /\b(à|de|sur)\s*paris\b/i,
  /\b12\s*mois\b/i,
  /\b287[\s.,]000\b/i,
];

function draftIsSafe(text) {
  if (!text) return false;
  return !FORBIDDEN_PATTERNS.some((p) => p.test(text));
}

const SYSTEM_PROMPT = `Tu es l'assistant commercial de Volia (volia.fr), suite SaaS B2B française.

Un PROSPECT vient de RÉPONDRE à un email outbound. Ta mission :
1. CLASSIFIER sa réponse dans EXACTEMENT une catégorie :
   - "interested"     : montre de l'intérêt, veut en savoir plus, demande un RDV/démo/tarif
   - "question"        : pose une question concrète (fonctionnalité, prix, RGPD, intégration…)
   - "objection"       : intéressé mais avec un frein (pas le moment, budget, déjà un outil, doute)
   - "not_interested"  : refus clair, pas concerné, "non merci"
   - "unsubscribe"     : demande explicite d'arrêt / désinscription / "ne plus me contacter"
   - "auto_reply"      : réponse automatique (absence, congés, "out of office", bounce, accusé)
   - "other"           : hors-sujet, spam, illisible
2. RÉSUMER la réponse du prospect en 1 phrase courte en français (max 140 caractères).
3. Si catégorie ∈ {interested, question, objection} : RÉDIGER un brouillon de réponse en français.

RÈGLES DU BROUILLON (si applicable) :
- 40-110 mots, ton pro chaleureux, vouvoiement par défaut (tutoie seulement si le prospect tutoie).
- Réponds VRAIMENT au message : si question → réponds ; si objection → traite-la ; si intérêt → propose un prochain pas concret (répondre à 2-3 questions, ou caler 15 min).
- Pas de signature (gérée à l'envoi), pas de "Objet:".
- INTERDIT : "0 humain", "100% autonome", "sans humain", "remplace les humains", mentionner Bordeaux/Lyon/Paris comme localisation, "12 mois", "287 000".
- Honnête et factuel : ne promets rien d'invérifiable, pas de chiffres de résultats inventés.
- Si tu n'as pas l'info pour répondre précisément, propose un échange court plutôt que d'inventer.

SORTIE : un objet JSON STRICT, rien d'autre, au format :
{"category":"<catégorie>","confidence":<0..1>,"summary":"<1 phrase FR>","draft_subject":"<objet ou null>","draft_body":"<corps du mail ou null>"}
Si la catégorie n'est pas draftable, mets draft_subject et draft_body à null.`;

/**
 * Classe une réponse entrante + (si pertinent) rédige un brouillon.
 *
 * @param {object} args
 * @param {string} args.body        - corps texte de la réponse du prospect
 * @param {string} [args.subject]   - sujet du mail entrant
 * @param {string} [args.contactName]
 * @param {string} [args.campaignName]
 * @returns {Promise<{ok:boolean, category:string, confidence:number, summary:string|null, draftSubject:string|null, draftBody:string|null, error?:string}>}
 */
export async function classifyAndDraftReply({ body, subject, contactName, campaignName }) {
  const fallback = {
    ok: false,
    category: 'other',
    confidence: 0,
    summary: null,
    draftSubject: null,
    draftBody: null,
  };

  const apiKey = cleanEnv(process.env.ANTHROPIC_API_KEY);
  if (!apiKey) return { ...fallback, error: 'no_anthropic_key' };
  if (!body || typeof body !== 'string' || body.trim().length < 2) {
    return { ...fallback, error: 'empty_body' };
  }

  const anthropic = new Anthropic({ apiKey });

  const userContent = [
    campaignName ? `Campagne d'origine : ${campaignName}` : null,
    contactName ? `Nom du prospect : ${contactName}` : null,
    subject ? `Objet du mail entrant : ${subject}` : null,
    '',
    'Réponse du prospect :',
    '"""',
    body.slice(0, 4000),
    '"""',
  ]
    .filter((l) => l !== null)
    .join('\n');

  let raw;
  try {
    const resp = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 700,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });
    raw = resp?.content?.[0]?.text || '';
  } catch (err) {
    return { ...fallback, error: `anthropic_error: ${err.message || err}` };
  }

  // Parse JSON tolérant (Claude peut entourer de ```json … ```)
  let parsed;
  try {
    const jsonStr = raw.replace(/^```\w*\n?/gm, '').replace(/\n?```$/gm, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    parsed = JSON.parse(start >= 0 ? jsonStr.slice(start, end + 1) : jsonStr);
  } catch {
    return { ...fallback, error: 'parse_error' };
  }

  let category = String(parsed.category || 'other').toLowerCase().trim();
  if (!ALL_CATEGORIES.includes(category)) category = 'other';

  const summary =
    typeof parsed.summary === 'string' ? parsed.summary.slice(0, 200).trim() : null;

  let draftSubject = null;
  let draftBody = null;
  if (DRAFTABLE_CATEGORIES.includes(category)) {
    const candidateBody =
      typeof parsed.draft_body === 'string' ? parsed.draft_body.trim() : null;
    // On ne garde le brouillon QUE s'il passe les garde-fous marque/DGCCRF.
    if (candidateBody && draftIsSafe(candidateBody)) {
      draftBody = candidateBody;
      const rawSubj =
        typeof parsed.draft_subject === 'string' ? parsed.draft_subject.trim() : '';
      const baseSubj = (subject || '').replace(/^\s*(re|ré|tr|fwd)\s*:\s*/i, '').trim();
      draftSubject = rawSubj || (baseSubj ? `Re: ${baseSubj}` : 'Re: votre message');
    }
  }

  return {
    ok: true,
    category,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    summary,
    draftSubject,
    draftBody,
  };
}
