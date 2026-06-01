// ─────────────────────────────────────────────────────────────────────
// src/lib/content-proposer.js — Génération autonome de brouillons sociaux
// ─────────────────────────────────────────────────────────────────────
//
// 1er cron "intelligent" du Sprint 1 Phase B (cf. docs/autonomy/00-PLAN.md).
//
// Pipeline :
//   gatherRecentEvents()  ← changelog + blog + signups business + métriques
//        ↓
//   shouldPropose()       ← throttle (1 post/2j max) + autonomy_enabled check
//        ↓
//   generateDrafts()      ← Claude API → 2 brouillons (LinkedIn + X)
//        ↓
//   logAutonomousAction() ← atterrit dans /admin/auto-queue (medium-risk)
//        ↓
//   Founder valide en 1 clic → un autre cron publiera (Buffer/LinkedIn API
//   plus tard, Sprint 1 Phase B.2). En attendant, le founder copie-colle.
//
// Garde-fous prompt-side :
//   - Interdiction "0 humain" / "100% autonome" (DGCCRF + brand)
//   - Marseille pas Bordeaux
//   - 6 semaines pas 12 mois
//   - Si AUCUN event détecté → on n'invente pas, on skip
//
// Coût Claude : ~$0.015 par appel × ~3 appels/sem = $2.4/an. Négligeable.
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  countRecentActions,
} from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MIN_HOURS_BETWEEN_POSTS = 48; // 1 brouillon proposé / 2 jours max
const EVENTS_LOOKBACK_DAYS = 7;

// ─────────────────────────────────────────────────────────────────────
// 1. COLLECTE D'ÉVÉNEMENTS BUSINESS RÉCENTS
// ─────────────────────────────────────────────────────────────────────

/**
 * Détecte ce qui vaut la peine d'être raconté dans les 7 derniers jours.
 * Retourne un objet structuré (pas du texte) pour pouvoir filtrer/itérer.
 *
 * Sources :
 *   - changelog.js : derniers items typés (feature/improvement/fix)
 *   - blog.js : articles publiés < 7 jours
 *   - user_profiles : nouveaux signups business
 *   - autonomous_actions : actions remarquables exécutées (méta-récit)
 */
export async function gatherRecentEvents() {
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - EVENTS_LOOKBACK_DAYS * 86400 * 1000);

  // Lazy import pour ne pas bundler les MB de blog/changelog dans tous les routes
  const [{ CHANGELOG }, { BLOG_POSTS }] = await Promise.all([
    import('./changelog').then((m) => ({ CHANGELOG: m.CHANGELOG || m.default || [] })),
    import('./blog').then((m) => ({ BLOG_POSTS: m.BLOG_POSTS || m.default || [] })),
  ]).catch(() => [{ CHANGELOG: [] }, { BLOG_POSTS: [] }]);

  // Changelog : entrées récentes (< 7j)
  const recentChangelog = (CHANGELOG || [])
    .filter((entry) => {
      if (!entry.date) return false;
      return new Date(entry.date) >= since;
    })
    .slice(0, 3)
    .map((entry) => ({
      date: entry.date,
      version: entry.version,
      title: entry.title,
      highlights: (entry.items || [])
        .slice(0, 5)
        .map((item) => `[${item.type}${item.tag ? '/' + item.tag : ''}] ${item.text}`),
    }));

  // Blog : articles publiés récemment
  const recentBlog = (BLOG_POSTS || [])
    .filter((post) => {
      const d = post.publishedAt || post.date;
      if (!d) return false;
      return new Date(d) >= since;
    })
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || post.tldr || '',
      url: `https://volia.fr/blog/${post.slug}`,
    }));

  // Nouveaux clients Business (7 derniers jours)
  let businessSignupsCount = 0;
  let totalBusinessActive = 0;
  try {
    const { count: weekCount } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('plan', 'business')
      .gte('created_at', since.toISOString());
    businessSignupsCount = weekCount || 0;

    const { count: totalCount } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('plan', 'business');
    totalBusinessActive = totalCount || 0;
  } catch (err) {
    console.warn('[content-proposer] business signups count failed', err.message);
  }

  // Actions autonomes notables exécutées récemment (méta : "l'IA a fait X")
  let autonomousActionsCount = 0;
  try {
    autonomousActionsCount = await countRecentActions(
      'linkedin_post',
      24 * 7,
      ['executed', 'approved']
    );
  } catch {
    /* non bloquant */
  }

  return {
    windowStart: since.toISOString(),
    windowEnd: new Date().toISOString(),
    changelog: recentChangelog,
    blog: recentBlog,
    businessSignupsThisWeek: businessSignupsCount,
    totalBusinessActive,
    autonomousActionsThisWeek: autonomousActionsCount,
    hasNotableEvents:
      recentChangelog.length > 0 ||
      recentBlog.length > 0 ||
      businessSignupsCount > 0,
  };
}

// ─────────────────────────────────────────────────────────────────────
// 2. DÉCISION : faut-il proposer un nouveau brouillon ?
// ─────────────────────────────────────────────────────────────────────

/**
 * Vérifie throttling + kill switch + présence d'events.
 * Retourne { allowed: bool, reason: string }
 */
export async function shouldProposeContent(events) {
  if (!isAutonomyEnabled()) {
    return { allowed: false, reason: 'autonomy_disabled' };
  }
  if (!events || !events.hasNotableEvents) {
    return {
      allowed: false,
      reason: 'no_events_to_share',
      detail: 'Aucun événement notable dans les 7 derniers jours (changelog/blog/signups).',
    };
  }

  // Throttle : pas plus d'1 brouillon proposé toutes les 48h
  const recentProposalsCount = await countRecentActions(
    'linkedin_post',
    MIN_HOURS_BETWEEN_POSTS,
    ['pending', 'approved', 'executed']
  );
  if (recentProposalsCount > 0) {
    return {
      allowed: false,
      reason: 'throttled',
      detail: `Déjà ${recentProposalsCount} brouillon(s) dans la fenêtre ${MIN_HOURS_BETWEEN_POSTS}h.`,
    };
  }

  return { allowed: true };
}

// ─────────────────────────────────────────────────────────────────────
// 3. GÉNÉRATION DES BROUILLONS via Claude API
// ─────────────────────────────────────────────────────────────────────

function buildEventsBrief(events) {
  const parts = [];
  if (events.changelog.length) {
    parts.push('## RELEASES RÉCENTES');
    events.changelog.forEach((c) => {
      parts.push(`- ${c.date} · v${c.version || '?'} · ${c.title}`);
      c.highlights.forEach((h) => parts.push(`  • ${h}`));
    });
  }
  if (events.blog.length) {
    parts.push('\n## ARTICLES PUBLIÉS');
    events.blog.forEach((b) => {
      parts.push(`- "${b.title}" (${b.url})`);
      if (b.excerpt) parts.push(`  → ${b.excerpt.slice(0, 200)}`);
    });
  }
  if (events.businessSignupsThisWeek > 0) {
    parts.push(
      `\n## MÉTRIQUES\n- ${events.businessSignupsThisWeek} nouveau(x) client(s) Business cette semaine (total actifs : ${events.totalBusinessActive}).`
    );
  }
  if (events.autonomousActionsThisWeek > 0) {
    parts.push(
      `\n## MÉTA AUTONOMIE\n- ${events.autonomousActionsThisWeek} actions autonomes (posts sociaux IA) approuvées cette semaine.`
    );
  }
  return parts.join('\n');
}

const SYSTEM_PROMPT = `Tu es le ghost-writer du founder Anthony Malartre, créateur de Volia.fr.

CONTEXTE PRODUIT :
Volia est une suite SaaS B2B française (volia.fr) qui regroupe 4 modules : Prospection (leads B2B 101 départements FR + BE + CH), Campagnes (email + warmup), CRM (pipeline), Forms (capture). Plan unique Business 179€/mois débloque les 4. Bâti en 6 semaines à Marseille en 2026.

POSITIONNEMENT NARRATIF (NE PAS DILUER) :
Volia est la première entreprise SaaS autonome au monde — pilotée par IA, augmentée par 1 founder. 1 humain décide, des agents exécutent (code, marketing, comm, support).

TON :
- Direct, transparent, anti-corporate. Founder qui partage les coulisses.
- Pas d'emojis sauf 1 max par post, jamais en début de phrase.
- Pas de buzzwords ("scalable", "innovant", "disruptif", "révolutionnaire", "unicorn").
- Phrases courtes. Concret. Chiffré quand possible. Cite des faits.
- Évite "Je suis fier de…", "Je suis ravi de…", "Heureux de partager…".
- Commence par un hook factuel ou une question piquante, pas par "Aujourd'hui je…".

GARDE-FOUS LÉGAUX + BRAND (CRITIQUES) :
- INTERDIT : "0 humain", "100% autonome", "sans humain", "remplace les humains", "no-code IA", "auto-magique"
- AUTORISÉ : "1 humain décide, des agents exécutent", "IA augmentée par 1 founder", "supervision humaine sur les décisions critiques"
- INTERDIT : "Bordeaux", "Lyon", "Paris" comme lieu de fondation (c'est Marseille)
- INTERDIT : "12 mois", "1 an" pour la durée de build (c'est 6 semaines)
- INTERDIT : claims chiffrés non vérifiés ("287 000 entreprises", "+30% conversion", "millions d'emails")
- AUTORISÉ : "scrape live Google Places", "1 founder + Claude", chiffres réels passés en contexte
- INTERDIT : tag/mention @Anthropic, @Claude, @Vercel sans rationnel
- AUTORISÉ : volia.fr/changelog (transparence preuves), volia.fr/notre-histoire

RÈGLES DE FORMAT :
- LinkedIn : 300-700 caractères. Hook factuel en 1ère ligne. 3-5 paragraphes courts séparés par lignes vides. Max 1 emoji.
- Twitter/X : 260 caractères max. Punchy. Peut être plus brut.
- Toujours basé sur les ÉVÉNEMENTS RÉELS fournis, jamais inventer.
- Si pas d'angle authentique, retourne un brouillon court et honnête plutôt qu'un truc gonflé.

Réponds UNIQUEMENT avec un JSON valide :
{
  "linkedin": "Texte du post LinkedIn",
  "twitter": "Texte du tweet",
  "rationale": "1 phrase : pourquoi ce sujet aujourd'hui, basé sur quel event",
  "main_topic": "1-3 mots clés pour identifier le sujet"
}`;

export async function generateDrafts(events) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const eventsBrief = buildEventsBrief(events);

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Voici les événements réels de Volia sur les ${EVENTS_LOOKBACK_DAYS} derniers jours :\n\n${eventsBrief}\n\nGénère 1 brouillon LinkedIn + 1 tweet pertinent. Choisis L'UN des événements (le plus storytelable), ne mixe pas tout. Si rien n'est vraiment intéressant, fais court et honnête.`,
      },
    ],
  });

  const text = message.content[0]?.text || '{}';

  // Parse JSON (peut être encadré par ```json …```)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Pas de JSON parsable dans la réponse Claude : ' + text.slice(0, 200));
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error('JSON invalide : ' + err.message);
  }

  // Validation minimale
  if (!parsed.linkedin || !parsed.twitter) {
    throw new Error('Réponse incomplète (linkedin ou twitter manquant)');
  }

  // Garde-fou linter côté serveur (defense in depth, même si prompt l'interdit)
  const BANNED_PATTERNS = [
    /\b0\s+humain\b/i,
    /\b100\s*%\s+autonome\b/i,
    /\bsans\s+humain\b/i,
    /\bBordeaux\b/i,
    /\b12\s+mois\b/i,
    /\b287[\s ]?000\b/,
  ];
  const combinedText = `${parsed.linkedin}\n${parsed.twitter}`;
  const flagged = BANNED_PATTERNS.find((p) => p.test(combinedText));
  if (flagged) {
    throw new Error(`Linter blocked draft (pattern ${flagged}). Brouillon rejeté avant queue.`);
  }

  return {
    linkedin: parsed.linkedin.trim(),
    twitter: parsed.twitter.trim().slice(0, 280),
    rationale: parsed.rationale || '',
    main_topic: parsed.main_topic || '',
    model: CLAUDE_MODEL,
    generated_at: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────
// 4. ORCHESTRATION : la fonction publique appelée par le cron
// ─────────────────────────────────────────────────────────────────────

/**
 * Fonction principale appelée par /api/cron/auto-content-proposer.
 * Retourne un summary qui sera renvoyé au cron (utile pour debug Vercel logs).
 */
export async function runContentProposer() {
  const startedAt = new Date().toISOString();

  // Étape 1 : check autonomy + collecte events
  const events = await gatherRecentEvents();

  // Étape 2 : faut-il proposer ?
  const decision = await shouldProposeContent(events);
  if (!decision.allowed) {
    return {
      ok: true,
      skipped: true,
      reason: decision.reason,
      detail: decision.detail || null,
      startedAt,
    };
  }

  // Étape 3 : génération via Claude
  let drafts;
  try {
    drafts = await generateDrafts(events);
  } catch (err) {
    console.error('[content-proposer] generation failed', err);
    return {
      ok: false,
      error: 'generation_failed',
      message: err.message,
      startedAt,
    };
  }

  // Étape 4 : log dans approval queue
  const preview = `LinkedIn : "${drafts.linkedin.slice(0, 100)}…"`;
  const action = await logAutonomousAction({
    actionType: 'linkedin_post',
    source: 'cron/auto-content-proposer',
    riskLevel: 'medium',
    payload: {
      linkedin: drafts.linkedin,
      twitter: drafts.twitter,
      main_topic: drafts.main_topic,
      model: drafts.model,
      events_summary: {
        changelog_count: events.changelog.length,
        blog_count: events.blog.length,
        business_signups: events.businessSignupsThisWeek,
      },
    },
    preview,
    rationale: drafts.rationale || `Auto-généré depuis ${events.changelog.length} entrées changelog + ${events.blog.length} articles + ${events.businessSignupsThisWeek} signups Business`,
    autoExecute: false,
    expiresInHours: 48, // si pas approuvé en 2j, l'actualité est obsolète
  });

  return {
    ok: true,
    skipped: false,
    actionId: action.id,
    status: action.status,
    preview,
    main_topic: drafts.main_topic,
    startedAt,
  };
}
