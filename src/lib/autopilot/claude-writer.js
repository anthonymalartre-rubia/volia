// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/claude-writer.js — Phase 2 body generation
// ─────────────────────────────────────────────────────────────────────
// Génère le body complet d'un email Autopilot via Claude Sonnet 4.
// Personnalise selon le prospect (nom société, secteur, ville, téléphone),
// en respectant le ton du template (provocateur, sympathique, etc.) et
// le brief résumé dans step.body_summary.
//
// Garde-fous DGCCRF / brand (CLAUDE.md) :
//   - JAMAIS "0 humain" / "100 % autonome" / "remplace les humains"
//   - JAMAIS "Bordeaux/Lyon/Paris" comme lieu (utiliser Marseille)
//   - JAMAIS "12 mois pour construire", "287 000 entreprises"
//   - PAS de storytelling ("1 founder + IA")
// → On les passe en system prompt + on filtre la sortie.
//
// Fallback : si Claude API down ou erreur, on retourne le body_summary
// du template (Phase 1 behavior). Le stepper continue.
//
// Coût : 1 appel Claude par email composé. Le coût total est borné par
// le quota mensuel par workflow (stepper.js CLAUDE_WRITES_PER_WORKFLOW_PER_MONTH).
// En cas d'échec d'envoi (rare, Resend transient), le body est régénéré au
// retry suivant — acceptable car le quota cap plafonne le coût total.
// ─────────────────────────────────────────────────────────────────────

import { getAnthropic } from '../anthropic';

// Aligné sur le reste du repo prod (parse-search, blog-writer, etc.).
// ⚠️ NE PAS utiliser 'claude-sonnet-4-5' (string invalide → 404 silencieux
// → fallback systématique sur body_summary).
const CLAUDE_MODEL = 'claude-sonnet-4-6';

const FORBIDDEN_PATTERNS = [
  // DGCCRF — génériques, s'appliquent à TOUS les tenants.
  // (Les anciens bans "marque Volia" — Bordeaux/Lyon/Paris, 287 000, 12 mois,
  //  1 founder+IA — ont été retirés : ils rejetaient à tort les emails
  //  légitimes des clients Autopilot mentionnant leur vraie ville / leurs
  //  vrais chiffres. Autopilot est multi-tenant, pas un canal Volia-only.)
  /\b0\s*humain\b/i,
  /\b100\s*%?\s*autonome\b/i,
  /\bsans\s*humain\b/i,
  /\bremplace\s*les\s*humains?\b/i,
];

function sanitizeOutput(text) {
  if (!text) return text;
  let cleaned = text.trim();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(cleaned)) {
      // Si patterns interdits détectés, fallback → on n'utilise pas ce body
      return null;
    }
  }
  // Strip markdown formatting que Claude pourrait introduire
  cleaned = cleaned.replace(/^```\w*\n?/gm, '').replace(/\n?```$/gm, '');
  return cleaned;
}

// Persona multi-tenant : l'Autopilot écrit au nom du CLIENT, pas de Volia.
// L'identité vient de senderIdentity (workflow.config / expéditeur vérifié).
// Repli neutre si non fournie — JAMAIS "Anthony Malartre / Volia" en dur.
function buildSystemPrompt(senderIdentity) {
  const who = senderIdentity?.personaName || senderIdentity?.company || null;
  const company = senderIdentity?.company || null;
  const identity = who
    ? `Tu écris au nom de ${who}${company && company !== who ? ` (${company})` : ''}, dans le cadre de sa prospection commerciale B2B.`
    : `Tu écris un email cold B2B professionnel au nom de l'expéditeur (une entreprise B2B qui prospecte).`;
  return `${identity}

Tu écris UN email cold B2B en français pour une séquence outbound. Le destinataire est un prospect B2B.

RÈGLES INVIOLABLES (conformité DGCCRF + délivrabilité) :
- JAMAIS dire "0 humain", "100% autonome", "sans humain", "remplace les humains"
- Ne JAMAIS inventer de chiffres, de lieux, de références clients ou de faits non fournis dans le brief
- Tutoiement OU vouvoiement selon le ton du template (précisé plus bas)
- Pas d'emoji dans le sujet (max 1 dans le body si ton sympathique)
- DÉLIVRABILITÉ : éviter les déclencheurs de spam → pas de "gratuit", "urgent",
  "gagnez", "cliquez ici", "offre limitée", "garanti", pas de MAJUSCULES sur
  des mots entiers, pas de "!!!" ni de €€/$$. Ton humain, pas promotionnel.
- Toujours mentionner la base RGPD (intérêt légitime B2B) si CTA présent

STRUCTURE :
- 90-140 mots MAX
- 3 paragraphes : accroche perso (1 ligne) → corps (2-4 lignes) → CTA implicite/explicite
- Si lien form ou Cal.com fourni, le mentionner naturellement, pas avec un placeholder

SORTIE : uniquement le body texte de l'email. Pas de "Subject:", pas de salutation, pas de signature (gérées par le template). Juste les paragraphes du corps.`;
}

/**
 * Génère le body d'un email Autopilot via Claude.
 *
 * @param {object} args
 * @param {object} args.template - Template autopilot complet
 * @param {number} args.stepIndex - Index dans template.sequence (0/1/2)
 * @param {object} args.prospect - { nom, first_name, telephone, email, departement, ... }
 * @param {object} [args.senderIdentity] - { personaName, company } pour le persona multi-tenant
 * @returns {Promise<string|null>} body texte ou null si fallback nécessaire
 */
export async function generateEmailBody({ template, stepIndex, prospect, senderIdentity }) {
  // Factory getAnthropic (finding M8) : timeout court + 1 retry — évite le
  // 504 quand le stepper (cron) enchaîne les appels Claude en boucle.
  const client = getAnthropic({ timeout: 20_000 });
  if (!client) return null;

  const step = template.sequence?.[stepIndex];
  if (!step) return null;

  const firstName = prospect.first_name || prospect.nom?.split(' ')[0] || 'lecteur';
  const company = prospect.nom || 'votre société';
  const dept = prospect.departement || '';

  const toneHint = template.tagline?.toLowerCase().includes('chaleureux')
    ? 'Ton chaleureux, tutoiement, première personne, empathique.'
    : template.tagline?.toLowerCase().includes('provocat')
      ? 'Ton direct factuel, vouvoiement, sans agressivité gratuite, démontre les contradictions du marché.'
      : 'Ton professionnel direct, vouvoiement par défaut.';

  const userPrompt = `Template : "${template.name}"
${toneHint}
Brief du step ${stepIndex + 1}/3 (jour J+${step.day}) :
"${step.body_summary}"

Prospect à contacter :
- Société : ${company}
- Département : ${dept}
- Prénom détecté : ${firstName}
${step.includes_form_link ? '- Un lien form de qualification sera ajouté automatiquement après ton texte, mentionne-le naturellement.' : ''}
${step.includes_calcom ? '- Un lien Cal.com (15 min) sera ajouté automatiquement après ton texte, mentionne-le naturellement.' : ''}

Écris UNIQUEMENT le corps de l'email (90-140 mots). Pas de salutation, pas de signature.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: buildSystemPrompt(senderIdentity),
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content?.[0]?.text;
    if (!text) return null;

    const cleaned = sanitizeOutput(text);
    if (!cleaned) {
      console.warn('[autopilot/claude-writer] sanitize failed — forbidden pattern detected', {
        templateId: template.id,
        stepIndex,
      });
      return null;
    }
    return cleaned;
  } catch (err) {
    console.warn('[autopilot/claude-writer] Claude API error', err.message);
    return null;
  }
}
