// ─────────────────────────────────────────────────────────────────────
// src/lib/blog-writer.js — Claude rédige un article SEO long-form (~1500 mots)
// ─────────────────────────────────────────────────────────────────────
// Sprint Marketing Compound Phase 2.
//
// Pipeline (mercredi 8h CET, 1 article/semaine max) :
//   1. Pick un topic depuis le pool TOPICS_BACKLOG (rotation date-based)
//   2. Skip si topic déjà traité récemment (fuzzy match sur titles BLOG_POSTS + auto_blog_posts)
//   3. Claude rédige draft complet :
//      { title, slug, description, keywords, category, tldr, content_markdown }
//   4. logAutonomousAction action_type='blog_post_draft'
//   5. Founder review (peut editer le content_markdown directement avant approve)
//   6. publish-actions INSERT auto_blog_posts status='published'
//   7. /blog page et /blog/[slug] mergent BLOG_POSTS static + DB published
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  enforceQuotaOrThrow,
} from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

// Pool topics evergreen B2B SEO — Claude pioche un sujet par rotation date-based
const TOPICS_BACKLOG = [
  {
    angle: 'Apollo vs Volia — combien tu paies vraiment',
    keywords: ['apollo prix', 'apollo coût', 'apollo vs volia', 'alternative apollo france'],
    category: 'Comparatif',
  },
  {
    angle: 'HubSpot Starter à 90€/mois : ce qu\'on ne te dit pas',
    keywords: ['hubspot prix', 'hubspot caché', 'hubspot vs alternative', 'crm pme france'],
    category: 'Comparatif',
  },
  {
    angle: 'Le warmup email est mort. Voici pourquoi.',
    keywords: ['warmup email', 'mailwarm', 'lemwarm', 'deliverability cold email'],
    category: 'Guide',
  },
  {
    angle: '7 erreurs qui détruisent ta deliverability cold email (et comment les éviter)',
    keywords: ['deliverability cold email', 'spam cold email', 'cold email gmail spam'],
    category: 'Guide',
  },
  {
    angle: 'Cold email RGPD : ce que la CNIL accepte vraiment en 2026',
    keywords: ['cold email rgpd', 'cnil cold email b2b', 'cold email legal france'],
    category: 'RGPD',
  },
  {
    angle: 'Combien ça coûte vraiment de prospecter un lead B2B en France ?',
    keywords: ['coût prospection b2b', 'cac france pme', 'budget prospection b2b'],
    category: 'Étude',
  },
  {
    angle: 'Pourquoi tes templates cold email Lemlist ressemblent à 10 000 autres',
    keywords: ['templates cold email', 'lemlist templates', 'personnalisation cold email'],
    category: 'Guide',
  },
  {
    angle: 'Le stack B2B "standard" en 2026 te coûte 2 000€/mois. Voici la même chose pour 179€.',
    keywords: ['stack b2b', 'outils prospection', 'stack saas startup', 'économies saas'],
    category: 'Comparatif',
  },
  {
    angle: 'Fraîcheur des données B2B : pourquoi les bases mondiales sont souvent moins à jour sur les PME françaises, et comment l\'éviter.',
    keywords: ['données apollo qualité', 'base donnees b2b fraiche', 'données prospects qualité'],
    category: 'Étude',
  },
  {
    angle: '90% des fondateurs payent un CRM qu\'ils utilisent à 20%. Si tu fais partie des 90%, lis ça.',
    keywords: ['crm pour pme', 'crm simple founder', 'crm minimaliste'],
    category: 'Guide',
  },
  {
    angle: 'Cold email vs LinkedIn : quel canal pour la prospection B2B FR en 2026 ?',
    keywords: ['cold email vs linkedin', 'prospection b2b canal', 'meilleur canal prospection'],
    category: 'Guide',
  },
  {
    angle: 'L\'IA va-t-elle remplacer ton SDR ? La vraie réponse en 2026.',
    keywords: ['ia sdr', 'ia prospection b2b', 'automatisation sales'],
    category: 'Tendance',
  },
];

const SYSTEM_PROMPT = `Tu es le rédacteur SEO senior de Volia.fr (suite SaaS B2B prospection + campagnes + CRM + forms).

Tu rédiges un article de blog long-form (1200-1800 mots) optimisé pour le SEO B2B FR et la conversion.

LECTEUR CIBLE :
- Founder B2B FR / SDR / CMO PME (1-50 employés)
- En recherche d'infos pour prospecter mieux / moins cher / plus efficacement
- Cherche du concret, pas de la théorie

TON :
- Direct, factuel, sans bullshit
- Anti-corporate. Pas de "Dans un monde où…" / "Plus que jamais" / "À l'ère de…"
- Phrases courtes. Punchy. Cite des faits chiffrés.
- 1-2 emoji max, jamais en début de paragraphe
- Pas de buzzwords (scalable, disruptif, révolutionnaire, game-changer, 10x, unicorn)

STRUCTURE :
1. Titre H1 (déjà fourni par toi dans le JSON)
2. tldr : encadré 3-5 bullets de la valeur de l'article (lu en 10 sec par les pressés)
3. Introduction (~150 mots) : hook chiffré ou contrarian + promesse de l'article
4. 4-6 sections H2 numérotées ou non, avec H3 si besoin
5. Conclusion + CTA discret vers Volia (1 lien max contextuel)
6. Optionnel : FAQ (3-4 questions) en fin si pertinent pour le sujet

LIENS INTERNES À INSÉRER NATURELLEMENT (selon pertinence du sujet, 2-4 max) :
- volia.fr/pricing (tarifs)
- volia.fr/comparatif/apollo-vs-volia
- volia.fr/comparatif/lemlist-vs-volia
- volia.fr/comparatif/hubspot-vs-volia
- volia.fr/etude (étude prospection FR 2026)
- volia.fr/ressources (lead magnets : templates email, calculateurs)
- volia.fr/glossaire (termes sales/marketing définis)
- volia.fr/changelog (transparence produit)

CTA FINAL :
- Soft, contextuel au sujet de l'article
- 1 paragraphe court qui invite à essayer Volia OU à lire une ressource adjacente
- Pas "Inscrivez-vous maintenant et révolutionnez votre business !"
- Bon : "Si tu veux voir comment Volia traite ce sujet concrètement, regarde [link]"

GARDE-FOUS LÉGAUX :
- INTERDIT : "0 humain", "100% autonome", "Bordeaux" comme lieu, "12 mois" pour build
- INTERDIT : claims chiffrés non vérifiés ("287 000 entreprises", "+30% conversion", "moins cher du marché")
- Comparaison factuelle de prix concurrents autorisée (Apollo 800€/mois, HubSpot 890€/mois, etc.)
- Pas de dénigrement personnel d'un concurrent (OK de critiquer leur pricing factuellement)

SLUG :
- URL-friendly : lowercase, tirets, pas d'accents, max 60 chars
- Ex: "apollo-vs-volia-vrai-cout-pme-b2b-2026"

KEYWORDS :
- 5-10 keywords SEO long-tail, en français
- Mix de keywords concurrentielles (apollo, hubspot) et longue traîne

Réponds UNIQUEMENT en JSON valide :
{
  "should_publish": true | false,
  "skip_reason": "..." (si false),
  "title": "Titre H1 (60-80 chars idéal)",
  "slug": "url-friendly-slug-max-60",
  "description": "Meta description SEO 150-160 chars",
  "category": "Comparatif" | "Guide" | "Étude" | "Tendance" | "RGPD" | "Founder",
  "keywords": ["kw1", "kw2", ...],
  "tldr": "## En résumé\\n\\n- Point 1\\n- Point 2\\n- Point 3\\n- Point 4",
  "excerpt": "1-2 phrases preview (différent de description, plus narratif)",
  "content_markdown": "## Section 1\\n\\n...\\n\\n## Section 2\\n\\n...",
  "word_count": 1500,
  "estimated_read_minutes": 8
}`;

/**
 * Vérifie qu'on n'a pas déjà publié un article récent sur ce sujet (fuzzy title match).
 */
async function isDuplicateTopic(angleSummary) {
  const supabase = getSupabaseAdmin();
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(angleSummary).slice(0, 50);

  // Check DB auto posts
  const { data: dbPosts } = await supabase
    .from('auto_blog_posts')
    .select('title, slug')
    .order('created_at', { ascending: false })
    .limit(50);

  if (Array.isArray(dbPosts)) {
    for (const p of dbPosts) {
      const candidate = normalize(p.title).slice(0, 50);
      if (candidate.includes(target) || target.includes(candidate)) {
        return { duplicate: true, source: 'db', existing: p.slug };
      }
    }
  }

  // Check static BLOG_POSTS (lazy import)
  try {
    const { BLOG_POSTS } = await import('./blog');
    for (const p of BLOG_POSTS) {
      const candidate = normalize(p.title).slice(0, 50);
      if (candidate.includes(target) || target.includes(candidate)) {
        return { duplicate: true, source: 'static', existing: p.slug };
      }
    }
  } catch {
    /* non bloquant */
  }
  return { duplicate: false };
}

/**
 * Pick un topic dans le backlog selon la date du jour (rotation déterministe).
 */
function pickTopicForToday() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TOPICS_BACKLOG[dayOfYear % TOPICS_BACKLOG.length];
}

/**
 * Génère le draft article via Claude.
 */
async function generateBlogPostDraft(topic) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = `# Article à rédiger

**Angle proposé :** ${topic.angle}
**Catégorie suggérée :** ${topic.category}
**Keywords SEO cibles :** ${topic.keywords.join(', ')}
**Date du jour :** ${new Date().toISOString().split('T')[0]}

Rédige un article long-form (1200-1800 mots) optimisé SEO + conversion, dans le format JSON strict du system prompt.

Si l'angle te semble trop répétitif avec ce qui existe déjà dans le blog Volia, retourne should_publish: false avec une raison.`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192, // long-form
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
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
  if (parsed.should_publish) {
    if (!parsed.title || !parsed.slug || !parsed.content_markdown) {
      throw new Error('Réponse Claude incomplète (title/slug/content manquants)');
    }
    // Linter regex défense en profondeur
    const BANNED = [
      /\b0\s+humain\b/i,
      /\b100\s*%\s+autonome\b/i,
      /\bBordeaux\b/i,
      /\b12\s+mois\s+pour\s+(?:bâtir|coder|construire)/i,
      /\b287[\s ]?000\b/,
      /\bmoins\s+cher\s+du\s+march[ée]\b/i,
    ];
    const combined = `${parsed.title}\n${parsed.description}\n${parsed.content_markdown}`;
    const flagged = BANNED.find((p) => p.test(combined));
    if (flagged) {
      throw new Error(`Linter blocked draft (pattern ${flagged}). Brouillon rejeté avant queue.`);
    }
  }

  return parsed;
}

/**
 * Main : appelée par cron auto-blog-writer.
 */
export async function runBlogWriter() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  // Quota strict : max 2 articles/sem (anti-spam blog)
  try {
    await enforceQuotaOrThrow('blog_post_draft', { perWeek: 2 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message, startedAt };
  }

  // 1. Pick topic
  const topic = pickTopicForToday();

  // 2. Skip si déjà couvert récemment
  const dupCheck = await isDuplicateTopic(topic.angle);
  if (dupCheck.duplicate) {
    return {
      ok: true,
      skipped: true,
      reason: 'topic_already_covered',
      detail: `Topic "${topic.angle}" déjà couvert : ${dupCheck.source}/${dupCheck.existing}`,
      startedAt,
    };
  }

  // 3. Génère draft
  let draft;
  try {
    draft = await generateBlogPostDraft(topic);
  } catch (err) {
    return { ok: false, error: 'claude_failed', detail: err.message, startedAt };
  }

  if (!draft.should_publish) {
    return {
      ok: true,
      skipped: true,
      reason: 'claude_decided_skip',
      detail: draft.skip_reason || 'Pas de raison fournie',
      startedAt,
    };
  }

  // 4. Log dans queue
  const preview = `📝 ${draft.title}\n→ slug: ${draft.slug}\n→ ${draft.word_count || '~?'} mots, ${draft.estimated_read_minutes || '?'} min lecture`;

  const action = await logAutonomousAction({
    actionType: 'blog_post_draft',
    source: 'cron/auto-blog-writer',
    riskLevel: 'medium',
    payload: {
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      category: draft.category,
      keywords: draft.keywords || [],
      tldr: draft.tldr,
      excerpt: draft.excerpt,
      content_markdown: draft.content_markdown,
      word_count: draft.word_count,
      estimated_read_minutes: draft.estimated_read_minutes,
      topic_angle: topic.angle,
    },
    preview,
    rationale: `Topic du jour rotation : "${topic.angle}". ${draft.word_count || '~?'} mots. Catégorie : ${draft.category}.`,
    autoExecute: false,
    expiresInHours: 168, // 7 jours
  });

  return {
    ok: true,
    actionId: action.id,
    draft_preview: {
      title: draft.title,
      slug: draft.slug,
      word_count: draft.word_count,
      category: draft.category,
    },
    topic_picked: topic.angle,
    startedAt,
  };
}
