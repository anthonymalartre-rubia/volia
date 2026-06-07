// ─────────────────────────────────────────────────────────────────────
// src/lib/product-hunt-launcher.js — Wave 3.1 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Product Hunt launch est rare (1-2 fois /an). Cette lib offre les helpers
// pour générer rapidement les assets + copy via Claude le jour J.
//
// Pas de cron : workflow manuel piloté depuis /admin/ph-launch.
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

export const LAUNCH_CHECKLIST = [
  { id: 'tagline_ready', label: 'Tagline finalisé (≤60 caractères)', phase: 'J-14' },
  { id: 'description_ready', label: 'Description finalisée (≤260 caractères)', phase: 'J-14' },
  { id: 'gallery_5_images', label: 'Galerie 5 images (1280×720 minimum)', phase: 'J-10' },
  { id: 'gif_demo_30s', label: 'GIF/video démo 30 sec', phase: 'J-10' },
  { id: 'product_logo_240', label: 'Logo carré 240×240 PNG', phase: 'J-14' },
  { id: 'maker_comment_draft', label: 'Maker comment rédigé (≤2000 caractères)', phase: 'J-7' },
  { id: 'hunters_list_built', label: 'Liste 50 hunters cibles compilée', phase: 'J-10' },
  { id: 'hunters_dm_warmup', label: 'DM warmup envoyés aux 50 hunters', phase: 'J-7' },
  { id: 'network_email_drafted', label: 'Email network rédigé (relais le jour J)', phase: 'J-3' },
  { id: 'social_posts_scheduled', label: 'Posts LinkedIn/Twitter J-1, J, J+1 schedulés', phase: 'J-3' },
  { id: 'ph_post_submitted', label: 'Post Product Hunt soumis (00:01 PST)', phase: 'JOUR J' },
  { id: 'maker_comment_posted', label: '1er commentaire maker posté dans les 5 min', phase: 'JOUR J' },
  { id: 'network_email_sent', label: 'Email network envoyé à 100 amis', phase: 'JOUR J' },
  { id: 'live_engagement_4h', label: '4h de live engagement (réponses commentaires)', phase: 'JOUR J' },
  { id: 'recap_metrics_logged', label: 'Recap metrics : votes, rank, signups attribués', phase: 'J+1' },
];

export const TEMPLATES = {
  taglineSeeds: [
    'La suite SaaS B2B qui a 16 boucles d\'agents IA en production',
    'Prospection + Campagnes + CRM + Forms — Volia, à partir de 19€/mois',
    'L\'alternative française à Apollo + Lemlist + HubSpot + Typeform',
    'Une suite B2B où l\'IA exécute et l\'humain décide',
  ],
  descriptionSeed:
    'Volia est la suite SaaS B2B française qui combine Prospection (Google Places + enrichissement waterfall), Campagnes (email auto), CRM (pipeline) et Forms (no-code). 16 boucles d\'agents IA orchestrent le marketing, le code, la vente, le support — 24/7. À partir de 19 €/mois. RGPD natif, hébergement UE.',
  makerCommentTemplate: `Hey Hunters 👋

Je suis Anthony, fondateur de Volia.

Il y a 6 semaines je voulais tester une hypothèse simple : et si l'entreprise du XXIe siècle n'était plus une équipe, mais un founder augmenté par des agents IA autonomes ?

Volia est la réponse. C'est une suite SaaS B2B française qui combine 4 modules :
→ Prospection (Google Places, 101 départements FR + BE + CH)
→ Campagnes (email auto avec séquences)
→ CRM (pipeline drag-drop)
→ Forms (no-code multi-step)

Le truc unique : 16 boucles d'agents IA tournent 24/7 en production :
✦ Rédaction de posts LinkedIn (Claude, validé en 1 clic)
✦ Articles blog SEO hebdo
✦ Auto-fix bugs : Sentry détecte → Claude lit le code → PR draft
✦ Dogfood-outreach : Volia génère ses propres prospects chaque semaine
✦ Méta-autonomie : chaque mardi, Claude m'envoie 3 recos d'optimisation
✦ ... 11 autres

À partir de 19 €/mois (Solo) — 5× moins cher que la stack US équivalente.
Hébergement Frankfurt, RGPD natif.

Trial 14 jours sans CB : volia.fr

Curieux de vos questions et retours 🙏
Anthony`,
  networkEmailTemplate: `Salut [Prénom],

C'est le grand jour : Volia est en live sur Product Hunt !

→ https://www.producthunt.com/posts/volia

Si tu as 30 secondes pour upvote + commenter, ça change vraiment tout
(top 5 du jour = visibilité énorme et plein de signups derrière).

Pas besoin de te connecter : ton compte LinkedIn fait le job.

Merci à mort 🙏
Anthony`,
};

/**
 * Génère via Claude une variante de maker comment personnalisée.
 */
export async function generateMakerComment({ tagline, description, vibe = 'authentic-founder' }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'anthropic_not_configured', fallback: TEMPLATES.makerCommentTemplate };
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `Tu rédiges le 1er commentaire maker d'un launch Product Hunt pour Volia (SaaS B2B français).

CONTRAINTES :
- Max 2000 caractères
- En anglais (audience PH internationale)
- Ton : ${vibe === 'authentic-founder' ? 'founder authentique, légèrement vulnérable, factuel' : vibe}
- Inclure : l'angle "l'IA exécute, l'humain décide", 4 modules, prix 19€/mois, RGPD natif, lien volia.fr
- Pas de superlatives marketing creux ("revolutionary", "best ever")
- Doit donner envie de tester sans pousser

FORMAT : commentaire complet prêt à coller, pas de meta-commentary.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Tagline: ${tagline}\nDescription: ${description}\n\nRédige le 1er maker comment.`,
      }],
    });
    return { ok: true, comment: response.content[0]?.text || TEMPLATES.makerCommentTemplate };
  } catch (err) {
    return { ok: false, error: err.message, fallback: TEMPLATES.makerCommentTemplate };
  }
}
