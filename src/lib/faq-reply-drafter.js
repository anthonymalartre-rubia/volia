// ─────────────────────────────────────────────────────────────────────
// src/lib/faq-reply-drafter.js — Claude génère un brouillon de réponse FAQ
// ─────────────────────────────────────────────────────────────────────
// Sprint 3 Phase 2.1 — Ferme la boucle "feedback mining".
//
// Pipeline complet :
//   1. /api/inbound/contact reçoit email user
//   2. Si category='question' → draftFaqReply()
//   3. Brouillon stocké dans action_type='faq_reply_proposal' payload
//   4. Founder review/approve dans /admin/auto-queue
//   5. publish-actions envoie l'email via Resend
//
// Ton : amical mais factuel, signature "Anthony · Volia".
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `Tu rédiges un brouillon d'email de réponse à une question reçue sur contact@volia.fr.

CONTEXTE PRODUIT VOLIA :
- Suite SaaS B2B française (volia.fr)
- 4 modules : Prospection (leads B2B FR + BE + CH), Campagnes (email + warmup), CRM (pipeline), Forms (capture leads)
- Plan UNIQUE Business 179€/mois (debloque les 4 modules) — ou 1690€/an en yearly (-2 mois offerts) — promo -30€/mois 12 mois pour les early adopters
- Trial 14 jours sans CB pour le plan Pro existant (Solo et Pro disponibles aussi)
- Hébergement 100% UE, conforme RGPD
- 1 founder + agents IA pour l'exécution (Marseille, 6 semaines de build)

LIENS UTILES (à intégrer naturellement si pertinent) :
- volia.fr/pricing : tarifs
- volia.fr/comparatif/apollo-vs-volia : vs Apollo
- volia.fr/etude : étude prospection B2B FR 2026
- volia.fr/docs : help center
- volia.fr/changelog : roadmap publique
- volia.fr/demo : booking Cal.com 8min
- volia.fr/parrainage : programme parrainage

TON DE LA RÉPONSE :
- Amical mais factuel (founder qui répond perso, pas chatbot corporate)
- Direct, concis (max 12 lignes)
- Tutoiement OK si l'email user est en tutoiement, sinon vouvoiement
- Pas de "Cher Monsieur/Madame", pas de "Je vous remercie pour votre intérêt"
- Si question vague → poser 1 question de clarification + proposer un slot Cal.com
- Si tu ne sais pas, dis-le honnêtement et propose le help center ou un email follow-up

SIGNATURE OBLIGATOIRE (toujours en fin) :
"\\n\\nAnthony\\nFondateur · Volia\\nvolia.fr"

GARDE-FOUS :
- JAMAIS de promesse non vérifiable ("on ajoute ça la semaine prochaine") → préférer "je note pour le backlog"
- JAMAIS dénigrer un concurrent par email perso (vs un post LinkedIn c'est OK)
- JAMAIS d'engagement contractuel hors devis officiel
- Si question juridique/RGPD/sécurité → réponse prudente + propose un call
- Si question sur prix custom → propose un call (pas de discount par email)

Réponds UNIQUEMENT en JSON :
{
  "subject": "Re: <original subject>",
  "body_markdown": "...",
  "body_text": "version plain text propre",
  "should_send": true | false,
  "wont_send_reason": "..." (si false, ex: "question trop sensible, founder devrait répondre perso"),
  "rationale": "1 phrase : pourquoi cette réponse"
}`;

/**
 * Génère un brouillon de réponse FAQ via Claude.
 *
 * @param {object} email - l'email original
 * @param {string} email.from_email
 * @param {string} email.from_name
 * @param {string} email.subject
 * @param {string} email.body
 * @param {object} classification - résultat de feedback-classifier
 * @returns {Promise<{subject, body_markdown, body_text, should_send, wont_send_reason?, rationale}>}
 */
export async function draftFaqReply(email, classification) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userContent = `# Email à répondre

**From :** ${email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
**Subject :** ${email.subject || '(pas de subject)'}

---

${(email.body || '').slice(0, 4000)}

---

# Classification IA

- Catégorie : ${classification.category}
- Priorité : ${classification.priority}
- Résumé : ${classification.summary}
- Action suggérée : ${classification.suggested_action}

# Demande

Rédige une réponse email amicale, concise et utile. Signature founder obligatoire.`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = message.content[0]?.text || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Pas de JSON dans la réponse Claude');

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error('JSON invalide : ' + err.message);
  }

  // Validation minimale
  if (parsed.should_send && (!parsed.subject || !parsed.body_text)) {
    throw new Error('Réponse incomplète (subject ou body_text manquant)');
  }

  return parsed;
}

/**
 * Convertit Markdown simple en HTML basique pour Resend.
 * Pour V1 minimal — pas d'inclusion de markdown-it pour pas alourdir.
 */
export function markdownToBasicHtml(md) {
  if (!md) return '';
  return md
    .split(/\n\n+/)
    .map((p) => {
      const escaped = p
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const withLinks = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color:#6366f1;">$1</a>'
      );
      const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return `<p style="margin:0 0 12px;line-height:1.6;color:#374151;font-size:14px;">${withBold.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}
