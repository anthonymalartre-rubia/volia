// ─────────────────────────────────────────────────────────────────────
// src/lib/feedback-classifier.js — Claude classifie un email entrant
// ─────────────────────────────────────────────────────────────────────
// Sprint 3 Phase 2 — Feedback mining contact@volia.fr
//
// Pour chaque email reçu :
//   - Catégorise : bug | feature_request | question | sales_inquiry | spam | other
//   - Priorité : low | medium | high | urgent
//   - Résumé 1 phrase
//   - Suggestion d'action
//
// Sortie utilisée par /api/inbound/contact pour décider quelle action
// autonomy déclencher (queue approval ou exécution directe).
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `Tu es l'assistant de classification d'emails de Volia.fr (SaaS B2B prospection + CRM + campagnes email + forms).

Pour chaque email reçu sur contact@volia.fr, tu détermines :

1. CATEGORY (obligatoire) :
   - "bug" : utilisateur signale un dysfonctionnement (page cassée, erreur, fonctionnalité qui ne marche pas)
   - "feature_request" : utilisateur demande une nouvelle feature ou amélioration ("ça serait cool si...")
   - "question" : utilisateur cherche de l'aide ("comment faire X ?", "où trouver Y ?")
   - "sales_inquiry" : prospect intéressé par Volia (demande démo, tarifs, comparatif)
   - "spam" : email non sollicité, pitch agence SEO, services, etc.
   - "other" : ni les catégories ci-dessus (ex: opt-out RGPD, candidature, partenariat)

2. PRIORITY (obligatoire) :
   - "urgent" : bug bloquant en prod, problème de paiement, incident sécurité
   - "high" : bug qui dérange l'usage normal, question d'un client payant
   - "medium" : feature request d'un client, question d'un trial
   - "low" : question générale, feature lointaine

3. SUMMARY : 1 phrase qui résume l'email (max 100 chars)

4. SUGGESTED_ACTION : 1 phrase courte sur le next step ("Créer issue GitHub", "Répondre que la feature X existe déjà", "Forwarder à sales", etc.)

5. SPAM SCORE (0-100) : seuil 70+ → marquer category="spam"
   Indicateurs de spam : pitch agence/SEO/social media, lien suspect, lecture en anglais d'une boîte FR avec "blast email", offre de backlinks/dofollow

Réponds UNIQUEMENT en JSON :
{
  "category": "bug" | "feature_request" | "question" | "sales_inquiry" | "spam" | "other",
  "priority": "low" | "medium" | "high" | "urgent",
  "summary": "1 phrase résumé",
  "suggested_action": "1 phrase action",
  "spam_score": 0-100,
  "reasoning": "1-2 phrases : pourquoi cette classification"
}`;

/**
 * Classifie un email via Claude.
 *
 * @param {object} email
 * @param {string} email.from_email
 * @param {string} email.from_name
 * @param {string} email.subject
 * @param {string} email.body - texte brut (preview suffisant)
 * @returns {Promise<{category, priority, summary, suggested_action, spam_score, reasoning}>}
 */
export async function classifyEmail(email) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userContent = `# Email à classifier

**From :** ${email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
**Subject :** ${email.subject || '(pas de subject)'}

---

${(email.body || '').slice(0, 4000)}`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 512,
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

  // Validation
  const VALID_CATEGORIES = ['bug', 'feature_request', 'question', 'sales_inquiry', 'spam', 'other'];
  const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
  if (!VALID_CATEGORIES.includes(parsed.category)) {
    parsed.category = 'other';
  }
  if (!VALID_PRIORITIES.includes(parsed.priority)) {
    parsed.priority = 'medium';
  }
  if (typeof parsed.spam_score !== 'number') {
    parsed.spam_score = 0;
  }

  // Override : si spam_score élevé, forcer category=spam
  if (parsed.spam_score >= 70 && parsed.category !== 'spam') {
    parsed.category = 'spam';
    parsed.priority = 'low';
  }

  return parsed;
}
