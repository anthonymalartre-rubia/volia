// ─────────────────────────────────────────────────────────────────────
// src/lib/founder-post-proposer.js — Proposer de posts "founder / builder"
// ─────────────────────────────────────────────────────────────────────
//
// 2e source de posts LinkedIn (à côté de content-proposer.js qui fait le
// registre "valeur/pricing/mythe"). Celui-ci produit le registre PERSO
// du founder : story / builder (agents IA + MCP) / contrarian / anti-flex.
//
// Décision founder (juin 2026) : on AUTORISE désormais le storytelling
// founder en social, mais dans une FILE SÉPARÉE (action_type dédié) pour
// validation distincte. Cf. /admin/auto-queue.
//
// Pipeline :
//   pick archetype (rotation par jour)  →  generateFounderPost() via Claude
//        →  linter brand/DGCCRF  →  logAutonomousAction('linkedin_founder_post')
//        →  founder valide en 1 clic et copie-colle (pas d'auto-publication)
//
// Throttle : 1 post / 6 jours (MIN_HOURS) + quota perWeek:2 (autonomy.js).
// Garde-fous : pas de "0 humain"/"remplace les humains"/"100% autonome",
// pas de "287 000", pas de "12 mois"/"6 semaines" (durée build), pas de
// "1 founder + IA", pas de MRR/clients chiffrés inventés, Volia = Marseille
// (jamais Paris/Lyon/Bordeaux comme localisation). Marseille AUTORISÉ.
// Tous les chiffres produits doivent être VRAIS (bloc REAL_DATA ci-dessous).
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  countRecentActions,
  enforceQuotaOrThrow,
} from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const ACTION_TYPE = 'linkedin_founder_post';
const MIN_HOURS_BETWEEN_POSTS = 144; // 1 post founder / 6 jours max

// ─────────────────────────────────────────────────────────────────────
// DONNÉES RÉELLES — la seule matière chiffrée autorisée dans ces posts.
// (Étude sourcée + couverture mesurée Volia. Mis à jour si la base évolue.)
// ─────────────────────────────────────────────────────────────────────
const REAL_DATA = `
DONNÉES VRAIES — n'utilise QUE celles-ci comme chiffres (aucune invention) :
• Étude cold email (sources publiques Belkins / Instantly 2025) :
  - taux de réponse moyen 1-5 % (médian 3-6 %) ; top 10 % à 10-15 %.
  - 55-65 % des réponses arrivent sur les RELANCES, pas le 1er mail.
  - ouverture ~27 %, peu fiable (Apple Mail Privacy) → la réponse est la vraie métrique.
  - petits envois (<50) : 5,8 % de réponse vs 2,1 % pour les gros volumes.
• Couverture Volia (mesurée sur ~40 000 entreprises FR, 83 départements) :
  - 0 % d'emails devinés : 70 % scrapés sur le site, 30 % via recherche Google.
  - find-rate ~46 % d'email pro vérifié quand l'entreprise a un site web.
  - 95,6 % ont un téléphone public ; 75,3 % ont un site → ~1 sur 4 sans site (injoignable par email).
• Produit : outil gratuit volia.fr/outils/trouver-emails ; étude volia.fr/etude ;
  agents IA réels via MCP/Claude (enrichissement waterfall, recherche en langage
  naturel, scoring de leads, classement + brouillon des réponses entrantes,
  résumé d'appel → CRM). À partir de 19 €/mois. RGPD natif. Construit depuis Marseille.
`;

// ─────────────────────────────────────────────────────────────────────
// ARCHÉTYPES — le registre founder/builder. Rotation par jour de l'année.
// ─────────────────────────────────────────────────────────────────────
const ARCHETYPES = [
  {
    key: 'story',
    name: 'Story / mission',
    brief: "Récit de conviction : la prospection est devenue un sport de riches (outils US chers, RGPD flou), les petits s'auto-excluent, et c'est injuste. Hook émotionnel, tension, une phrase mémorable. Volia = la réponse accessible et honnête. Marseille OK.",
  },
  {
    key: 'builder',
    name: 'Builder / agents IA',
    brief: "Tu as construit une douzaine d'agents IA (via MCP/Claude) pour faire la corvée commerciale. Liste concrète et nommée. Hook sur l'absurdité du travail manuel. 'L'IA fait la corvée, toi tu décides.' CTA : commenter 'MCP' pour le breakdown.",
  },
  {
    key: 'contrarian',
    name: 'Contrarian cold email',
    brief: "Démonter le mensonge du '8-15 % de réponse'. Donner les vrais chiffres sourcés (1-5 %, 55-65 % via relances, <50 envois = 5,8 %). Indignation utile, ton tranché. Renvoyer vers l'étude.",
  },
  {
    key: 'anti-flex',
    name: 'Anti-flex (honnêteté)',
    brief: "Contre les fondateurs qui flexent un faux MRR / 'vibe codé en 3 semaines'. Tu fais l'inverse : tu montres ce que tu as VRAIMENT (outil gratuit, 0 email deviné, étude honnête). Pas de chiffre de revenu inventé. Phrase choc sur l'honnêteté.",
  },
  {
    key: 'outil-gratuit',
    name: 'Outil gratuit',
    brief: "Tu as rendu gratuit un truc que les concurrents facturent ~99 $/mois (trouver des emails par secteur+ville). Hook un peu drôle/auto-dérision. Insister sur '0 email deviné, 100 % vérifié'. CTA vers volia.fr/outils/trouver-emails.",
  },
  {
    key: 'bon-ordre',
    name: 'Le bon ordre de l\'outbound',
    brief: "Framework : la plupart font l'outbound à l'envers (liste large → séquence générique). Le bon ordre : cibler serré (signal) → enrichir/qualifier avec l'IA → multicanal coordonné → 3-5 relances. Honnête : non, pas 25 % de réponse — ceux qui le promettent mentent. CTA : commenter 'OUTBOUND' pour le breakdown Claude+MCP.",
  },
];

const SYSTEM_PROMPT = `Tu es le ghost-writer du founder Anthony Malartre, créateur de Volia.fr.
Positionnement personnel : "builder d'agents IA & MCP" — celui qui dit la vérité
et rend la prospection B2B accessible, dans un marché qui gonfle tout.

OBJECTIF : un post LinkedIn perso (registre FOUNDER/BUILDER), taillé pour
l'attention : hook fort en 1ère ligne, émotion ou tension, une phrase mémorable,
rythme rapide (phrases courtes, lignes vides). Cible : fondateurs / commerciaux /
builders B2B FR.

${REAL_DATA}

TON :
- Direct, incarné, un peu clivant. Pas corporate, pas lisse.
- Hook qui claque en 1ère ligne (confession, statement, scène, chiffre vrai).
- Phrases courtes. Beaucoup de retours à la ligne. Aéré.
- Une signature qui revient : "l'IA fait la corvée, toi tu décides" / l'honnêteté.

INTERDIT (DGCCRF + brand — le linter REJETTE sinon) :
- "0 humain", "100% autonome", "sans humain", "remplace les humains / le commercial / ton SDR".
- "287 000" ou tout volume d'entreprises chiffré inventé.
- "12 mois" ou "6 semaines" comme durée de construction du produit.
- "1 founder + IA" comme accroche/storytelling de genèse.
- Présenter Volia comme basé à Paris/Lyon/Bordeaux (c'est MARSEILLE — Marseille est autorisé).
- Inventer un MRR, un nombre de clients, un revenu, ou un taux de réponse > au réel.
- Promettre "15-25 % de réponse" (le réel = 1-5 %, top 10-15 %).
- Buzzwords ("disruptif", "révolutionnaire", "game-changer", "10x").

AUTORISÉ :
- Identité "builder", MCP, Claude, agents IA (c'est son vrai métier).
- Marseille, RGPD, "à partir de 19 €/mois", comparaison factuelle de prix.
- Villes en EXEMPLE de recherche ("avocats à Lyon", "hôtels à Marseille").
- CTA : volia.fr, volia.fr/outils/trouver-emails, volia.fr/etude, ou
  "commente MCP/OUTBOUND/EMAIL" + "lien en commentaire".

FORMAT : 500-1100 caractères. Pas de hashtags (max 1). Max 1-2 emojis, jamais en début de ligne.

RÉPONSE — JSON valide UNIQUEMENT :
{
  "linkedin": "Texte LinkedIn complet, prêt à coller (sauts de ligne réels)",
  "rationale": "1 phrase : pourquoi ce hook/angle va engager",
  "main_topic": "2-4 mots-clés (ex: 'agents-mcp', 'cold-email-verite')"
}`;

export async function shouldProposeFounderPost() {
  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { allowed: false, reason: 'autonomy_disabled', detail: autonomyState.reason || `(source: ${autonomyState.source})` };
  }
  const recent = await countRecentActions(ACTION_TYPE, MIN_HOURS_BETWEEN_POSTS, ['pending', 'approved', 'executed']);
  if (recent > 0) {
    return { allowed: false, reason: 'throttled', detail: `Déjà ${recent} post founder dans la fenêtre ${MIN_HOURS_BETWEEN_POSTS}h.` };
  }
  return { allowed: true };
}

function pickArchetype() {
  // Pas de Math.random() (Workflow-safe) : rotation déterministe par jour de l'année.
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return ARCHETYPES[dayOfYear % ARCHETYPES.length];
}

const BANNED_PATTERNS = [
  /\b0\s+humain\b/i,
  /\b100\s*%\s+autonome\b/i,
  /\bsans\s+humain\b/i,
  /\bremplace[rz]?\s+(?:les\s+|le\s+|ton\s+|tes\s+|un\s+)?(?:humains?|commerciaux?|commercial|sdr)\b/i,
  /\b287[\s.,]?000\b/,
  /\b12\s+mois\b/i,
  /\b6\s+semaines\b/i,
  /\b1\s+founder\s*\+\s*(?:ia|claude|agents?)\b/i,
  // Volia présenté comme basé ailleurs qu'à Marseille
  /\b(?:basé|bas[ée]e|fondé|fond[ée]e|install[ée]e?|situé|situ[ée]e|siège|depuis)\s+(?:à\s+)?(?:Paris|Lyon|Bordeaux)\b/i,
  /\bVolia[^.\n]{0,40}\b(?:à\s+)?(?:Paris|Lyon|Bordeaux)\b/i,
  // MRR / nombre de clients inventé présenté comme un fait
  /\bMRR\s*(?:de\s*)?[:=]?\s*\d/i,
  /\b\d+\s*(?:k€|€)\s*(?:de\s+)?MRR\b/i,
  /\b\d{2,}\s+clients?\s+(?:sign[ée]s|payants|B2B|actifs)\b/i,
];

export async function generateFounderPost(archetype) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = `Écris UN post LinkedIn dans le registre founder/builder.

ARCHÉTYPE IMPOSÉ : ${archetype.name}
${archetype.brief}

Rappels :
- Hook ultra-fort en 1ère ligne (c'est 80 % du job).
- N'utilise que les chiffres VRAIS du bloc DONNÉES. Aucune invention.
- Phrase mémorable + CTA discret (lien en commentaire ou "commente X").
- Réponds en JSON strict.`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1100,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = message.content[0]?.text || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Pas de JSON parsable : ' + text.slice(0, 200));

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error('JSON invalide : ' + err.message);
  }
  if (!parsed.linkedin) throw new Error('Réponse incomplète (linkedin manquant)');

  const flagged = BANNED_PATTERNS.find((p) => p.test(parsed.linkedin));
  if (flagged) {
    throw new Error(`Linter blocked founder draft (pattern ${flagged}). Rejeté avant queue.`);
  }

  return {
    linkedin: parsed.linkedin.trim(),
    archetype: archetype.key,
    rationale: parsed.rationale || '',
    main_topic: parsed.main_topic || archetype.key,
    model: CLAUDE_MODEL,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Orchestration appelée par /api/cron/founder-post-proposer.
 */
export async function runFounderPostProposer() {
  const startedAt = new Date().toISOString();

  const decision = await shouldProposeFounderPost();
  if (!decision.allowed) {
    return { ok: true, skipped: true, reason: decision.reason, detail: decision.detail || null, startedAt };
  }

  try {
    await enforceQuotaOrThrow(ACTION_TYPE);
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: quotaErr.code === 'QUOTA_EXCEEDED' ? 'quota_exceeded' : 'unknown', detail: quotaErr.message, startedAt };
  }

  const archetype = pickArchetype();

  let draft;
  try {
    draft = await generateFounderPost(archetype);
  } catch (err) {
    console.error('[founder-post-proposer] generation failed', err);
    return { ok: false, error: 'generation_failed', message: err.message, startedAt };
  }

  const preview = `[${archetype.name}] "${draft.linkedin.slice(0, 90)}…"`;
  const action = await logAutonomousAction({
    actionType: ACTION_TYPE,
    source: 'cron/founder-post-proposer',
    riskLevel: 'medium',
    payload: {
      linkedin: draft.linkedin,
      archetype: draft.archetype,
      main_topic: draft.main_topic,
      model: draft.model,
    },
    preview,
    rationale: draft.rationale || `Post founder auto-généré (archétype : ${archetype.name})`,
    autoExecute: false,
    expiresInHours: 120, // 5j : si pas validé, on régénère la semaine suivante
  });

  return {
    ok: true,
    skipped: false,
    actionId: action.id,
    status: action.status,
    archetype: archetype.key,
    preview,
    startedAt,
  };
}
