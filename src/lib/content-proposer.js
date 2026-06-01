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

  // Blog : articles publiés récemment — MAIS on EXCLUT explicitement le
  // contenu storytelling autoréférent (article "Comment j'ai bâti…",
  // founder story, etc). Cf. décision founder du 1er juin 2026 : la comm
  // sociale doit parler VALEUR CLIENT, pas coulisses de Volia. Le
  // storytelling reste réservé à /presse et /notre-histoire pour
  // journalistes.
  const STORYTELLING_KEYWORDS = [
    'bati', 'bâti', 'bâtir', 'batir', 'construit', 'construire', 'construction',
    'autonome', 'autonomy', 'autonomous',
    'marseille',
    'founder', 'fondateur',
    'comment j', 'mon histoire', 'notre histoire',
    'coulisse', 'behind-the-scenes', 'making-of',
    '6-semaines', '6 semaines', 'six semaines',
  ];
  const isStorytellingArticle = (post) => {
    const haystack = `${post.title || ''} ${post.slug || ''} ${post.excerpt || ''}`.toLowerCase();
    return STORYTELLING_KEYWORDS.some((kw) => haystack.includes(kw));
  };
  const recentBlog = (BLOG_POSTS || [])
    .filter((post) => {
      const d = post.publishedAt || post.date;
      if (!d) return false;
      if (new Date(d) < since) return false;
      if (isStorytellingArticle(post)) return false; // NE PAS shaper en post B2B
      return true;
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
  // NOTE — Plus de skip "no_events_to_share" : depuis le pivot ton
  // provocateur, la matière vient soit des events business soit du pool
  // evergreen (angles tournants type "Apollo facture 800€/mois pour…").
  // Donc on peut toujours générer.

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

// ─────────────────────────────────────────────────────────────────────
// EVERGREEN PROVOCATIVE ANGLES — pool tournant si pas d'events à shaper
// ─────────────────────────────────────────────────────────────────────
// Pas obligatoire d'utiliser ces angles, mais ils servent de matière si
// la semaine est calme. Claude pioche celui qui résonne avec le contexte.
const EVERGREEN_PROVOCATIVE_ANGLES = [
  {
    angle: 'Pricing concurrentiel choc',
    hook: 'Apollo facture 800€/mois pour des features que Volia fait à 179€/mois. Voici ce que tu paies réellement chez Apollo.',
  },
  {
    angle: 'Best practice démontée',
    hook: 'On t\'a vendu le "warmup à $20/mo" comme magique. Réalité : 87% des emails warmés finissent quand même en promotions Gmail. Pourquoi.',
  },
  {
    angle: 'Fact-bomb deliverability',
    hook: 'J\'ai analysé X cold emails B2B FR ce mois. Y% finissent en spam. Les 3 erreurs qu\'ils font tous.',
  },
  {
    angle: 'Stack overpriced',
    hook: 'Le stack B2B "standard" en 2026 : 800€ Apollo + 1200€ HubSpot + 400€ Lemlist + 200€ Calendly = 2600€/mois. Pour 179€ tu as 80% du même.',
  },
  {
    angle: 'Mythe IA tueuse de jobs',
    hook: 'Non, l\'IA va pas remplacer ton SDR. Elle va remplacer ton SDR qui copie-colle Apollo dans HubSpot manuellement.',
  },
  {
    angle: 'Manuel = perte de temps',
    hook: 'Si tu passes encore +4h/semaine à scraper LinkedIn manuellement, tu travailles pour ton outil. Pas l\'inverse.',
  },
  {
    angle: 'Données fiables vs vendues',
    hook: 'Les bases "vendues" comme Apollo te donnent 30% d\'emails morts. Pourquoi ? Parce qu\'ils achètent en gros et revendent froid.',
  },
  {
    angle: 'Compliance RGPD ignorée',
    hook: 'Les outils US oublient un détail : la CNIL. 80% des bases B2B importées violent le RGPD. Voici les 3 critères à vérifier.',
  },
];

const SYSTEM_PROMPT = `Tu es le ghost-writer du founder Anthony Malartre, créateur de Volia.fr.

═══════════════════════════════════════════════════════════════════════
MISSION DE CE POST
═══════════════════════════════════════════════════════════════════════
Faire passer un message qui VEND. Pas plaire à tout le monde — capter
l'attention de notre cible et faire venir des leads.

Cible : fondateurs B2B FR / SDR / commerciaux PME (1-50 personnes) qui
en ont marre du stack overpriced (Apollo + HubSpot + Lemlist = 2k€/mois).

KPI principal : commentaires, sauvegardes, clics vers volia.fr.
KPI secondaire : reach.

═══════════════════════════════════════════════════════════════════════
PROMESSE DE VALEUR VOLIA (à transmettre, jamais à expliquer)
═══════════════════════════════════════════════════════════════════════
"Tout ton stack prospection + campagnes + CRM pour 179€/mois (vs 2000€
chez Apollo+HubSpot+Lemlist), 100% conforme RGPD, scrape live de Google
Places sur 101 départements FR + Belgique + Suisse, données toujours
fraîches (pas une base vendue froide)."

PRODUITS (à mentionner si pertinent au sujet, pas exhaustif) :
- Prospection : scraping live Google Places, 101 dépts FR + BE + CH
- Campagnes : email + warmup intelligent multi-tenant
- CRM : pipeline natif
- Forms : capture leads

PLAN : Business 179€/mois (4 modules débloqués) — ou 149€/mois en
promo annuelle.

═══════════════════════════════════════════════════════════════════════
TON DU POST — IMPORTANT
═══════════════════════════════════════════════════════════════════════
PROVOCATEUR. Tu n'es PAS là pour plaire à tout le monde. Tu es là pour
faire RÉAGIR la bonne cible (et faire fuir les autres, c'est OK).

✅ FAIS :
- Opinion tranchée. Position assumée. Pas de "ça dépend".
- Hook qui claque en 1ère ligne (question piquante, fact-bomb, contrarian take).
- Démolir un mythe / best practice usée du B2B.
- Comparer factuellement avec un concurrent quand pertinent (Apollo, HubSpot,
  Lemlist sont fair game pour des comparaisons CHIFFRÉES — jamais d'insulte).
- Chiffres concrets. "+47% de réponse" > "boost ton taux de réponse".
- Anecdote vécue / observation > théorie.
- Phrase courte. Punch. Rythme.
- Finir par un appel à débat ou un mini-CTA discret vers volia.fr.

❌ ÉVITE :
- "Je suis fier de…", "Heureux de partager…", "Aujourd'hui…", "Petit thread 🧵".
- Hashtags spam (#startup #saas #b2b). Max 2 hashtags pertinents.
- Emojis décoratifs. Max 1 emoji symbolique, jamais en début de phrase.
- Buzzwords ("scalable", "disruptif", "révolutionnaire", "game-changer",
  "unicorn", "10x", "next-gen").
- Ton corporate, lisse, "pour tous". Faut qu'on sente le founder qui parle vrai.
- Storytelling autoréférent sur "comment Volia est fait" (les coulisses IA
  c'est pour les journalistes, PAS pour les leads B2B). Focus VALEUR client.

═══════════════════════════════════════════════════════════════════════
FRAMEWORKS DE POSTS PROVOCATEURS (pick UN par post)
═══════════════════════════════════════════════════════════════════════
1. **Démolition de mythe** : "On t'a vendu X comme magique. Voici la réalité."
2. **Pricing call-out** : "Tu paies 800€/mois pour Y. Voici ce que ça vaut vraiment."
3. **Fact-bomb chiffré** : "J'ai analysé 1000 X. 87% se trompent sur Z. Voici pourquoi."
4. **Contrarian take** : "Tout le monde dit X. C'est faux. Voici pourquoi."
5. **Anecdote founder** : "Un prospect m'a dit X la semaine dernière. Ma réponse l'a choqué."
6. **Comparaison cash** : "Apollo + HubSpot + Lemlist = 2000€/mois. Voici la même chose pour 179€."
7. **Pain point amplifié** : "Si tu fais encore X manuellement, tu travailles pour ton outil."
8. **Données vs intuition** : "Les SDR pensent que X marche. Les data disent l'inverse."

═══════════════════════════════════════════════════════════════════════
GARDE-FOUS LÉGAUX + BRAND (CRITIQUES — NE JAMAIS VIOLER)
═══════════════════════════════════════════════════════════════════════
INTERDIT :
- Insulter / dénigrer un concurrent personnellement (OK de comparer prix/features
  factuellement, JAMAIS de "Apollo c'est de la merde" ou similaire).
- Claim chiffré non vérifié ("287 000 entreprises", "millions d'emails", "+30%
  conversion garanti", "le moins cher du marché" sans benchmark). Si tu cites
  un chiffre, qu'il soit dans le contexte fourni OU clairement marqué "estimation".
- "0 humain", "100% autonome", "sans humain", "remplace les humains" (DGCCRF).
- "Bordeaux", "Lyon", "Paris" comme lieu de fondation (c'est Marseille).
- "12 mois", "1 an" pour durée de build (c'est 6 semaines).
- Tags @Anthropic, @Claude, @Vercel sans rationnel.
- Vulgarité grossière (mais provoc' est OK).
- Promesse irréaliste ("triplez vos leads en 24h").

AUTORISÉ ET ENCOURAGÉ :
- Comparaisons factuelles de prix avec Apollo, HubSpot, Lemlist, Hunter, Lusha
- "Volia 179€/mois" vs concurrents x 5-10
- "Scrape live Google Places" (USP technique réel)
- "1 founder + Claude" (mention discrète, pas central)
- Liens vers volia.fr/pricing, volia.fr/changelog, volia.fr/comparatif/apollo
- Tease "Demo 8min sur Cal" en CTA discret final

═══════════════════════════════════════════════════════════════════════
FORMAT
═══════════════════════════════════════════════════════════════════════
LinkedIn : 400-900 caractères. Structure type :
  Ligne 1 : HOOK FORT (factuel ou question piquante)
  Lignes 2-N : 3-5 paragraphes courts, 1-2 phrases chacun, séparés par
              lignes vides. Rythme rapide.
  Avant-dernière ligne : mini-CTA débat OU lien volia.fr/X
  Dernière ligne : optional 1 emoji thématique

Twitter/X : 240-275 caractères. Plus brut. Punch maximum.

═══════════════════════════════════════════════════════════════════════
RÉPONSE
═══════════════════════════════════════════════════════════════════════
Réponds UNIQUEMENT avec un JSON valide :
{
  "linkedin": "Texte LinkedIn complet",
  "twitter": "Texte tweet ≤ 280 car",
  "rationale": "1 phrase : quel angle/framework choisi et pourquoi il va engager",
  "main_topic": "2-4 mots clés (ex: 'apollo-pricing-bashing', 'warmup-mythe-debunk')"
}`;

export async function generateDrafts(events) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const eventsBrief = buildEventsBrief(events);

  // Pick 3 angles evergreen au hasard (rotation modulo) pour donner de la
  // matière à Claude si la semaine est calme côté events.
  // Pas de Math.random() (Workflow safe), on utilise un index basé sur la date.
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const angleSubset = [];
  for (let i = 0; i < 3; i++) {
    angleSubset.push(EVERGREEN_PROVOCATIVE_ANGLES[(dayOfYear + i) % EVERGREEN_PROVOCATIVE_ANGLES.length]);
  }
  const angleHints = angleSubset
    .map((a, i) => `  ${i + 1}. **${a.angle}** — exemple de hook : "${a.hook}"`)
    .join('\n');

  const userMessage = `## RÈGLE NUMÉRO 1 (NE PAS VIOLER)
Le SUJET de ce post N'EST PAS Volia ni son histoire ni comment il a été
construit. Le sujet est UNE DOULEUR / UN MYTHE / UNE INJUSTICE DE PRIX
de l'industrie B2B sales/marketing. Volia n'apparaît qu'à la fin comme
solution (CTA discret).

INTERDIT ABSOLU dans ce post :
- "X semaines pour bâtir/coder/monter SaaS"
- "1 founder + IA / + Claude / + agents"
- "Sans levée de fonds / sans équipe"
- "Retour d'expérience sur volia.fr/blog"
- "Marseille" en tant que lieu de fondation
- Tout storytelling sur la genèse de Volia

Si tu écris ça, le linter rejette ton brouillon AVANT la queue. Tu auras tout fait pour rien.

## CONTEXTE BUSINESS — FYI uniquement (PAS le sujet du post)
${eventsBrief || '(Aucun event business cette semaine)'}

## ANGLE OBLIGATOIRE — pick UN seul
Tu DOIS choisir UN des 8 frameworks provocateurs du system prompt
(démolition mythe, pricing call-out, fact-bomb, contrarian, anecdote
client, comparaison cash, pain amplifié, données vs intuition).

Inspiration angles tournants cette semaine :
${angleHints}

## CIBLE DU POST
- Founder B2B FR (1-50 employés) qui en a marre de payer 2000€/mois en stack
- SDR / commercial PME qui passe 4h/sem à scraper LinkedIn manuellement
- CEO solo qui jongle entre 8 outils différents

## CE QUE TU DOIS FAIRE RESSENTIR
- "Putain, c'est vrai, je perds du temps/argent pour rien"
- "J'avais jamais pensé à ce concurrent sous cet angle"
- "Faut que je teste/regarde Volia"

## CTA AUTORISÉS (mini, en dernière ligne max)
- volia.fr (générique)
- volia.fr/pricing (battle prix)
- volia.fr/comparatif/apollo (versus direct)
- volia.fr/etude (data B2B FR fraîche)
- "Curieux ? Réponds 'demo' en commentaire" (engagement bait)

## OBJECTIF
Engagement > reach. Commentaires + sauvegardes + clics. N'essaie pas
de plaire à tout le monde. Sois clivant.\`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
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
    // Storytelling autoréférent — bloqué en comm sociale lead-gen
    /\bLyon\b/i,
    /\b1\s+founder\s*\+\s*IA\b/i,
    /\b1\s+founder\s*\+\s*Claude\b/i,
    /\bClaude\s+comme\s+copilote\b/i,
    /\b6\s+semaines\s+pour\s+(?:bâtir|coder|construire|faire|monter)/i,
    /\bcodé\s+(?:en|depuis|à)\s+Marseille\b/i,
    /\btout\s+codé\b/i,
    /\bpas\s+(?:de\s+)?(?:levée|équipe|fonds)\b/i,
    /\bRetour\s+d'expérience\s+(?:complet|sur)/i,
    /\bbâti(?:r)?\s+(?:un|le|notre)\s+SaaS/i,
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
