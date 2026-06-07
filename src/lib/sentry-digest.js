// ─────────────────────────────────────────────────────────────────────
// src/lib/sentry-digest.js — Sentry → Claude → GitHub issues proposal
// ─────────────────────────────────────────────────────────────────────
//
// Pipeline hebdo (lundi 11h CET) :
//   1. fetchTopSentryErrors(7j, minCount=3)
//   2. Filtre les issues qu'on a déjà processées (via payload.sentry_id)
//   3. Filtre les issues déjà en GitHub (via label volia-autonomy + title fuzzy)
//   4. Pour chaque issue restante (max 5/run) :
//      - Fetch stacktrace + breadcrumbs détaillés
//      - Claude analyse : likely_cause + suggested_fix + repro + priority
//      - logAutonomousAction({ action_type: 'github_issue_create', ... })
//   5. Founder valide dans /admin/auto-queue
//   6. publish-actions cron étendu : crée l'issue via GitHub API
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import { fetchTopSentryErrors, fetchSentryIssueDetails } from './sentry-api';
import { listRecentGithubIssues } from './github-api';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  enforceQuotaOrThrow,
} from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const MAX_ISSUES_PER_RUN = 5; // anti-spam
const MIN_OCCURRENCES = 3;
const LOOKBACK_DAYS = 7;

const SYSTEM_PROMPT = `Tu es un ingénieur senior de Volia (SaaS Next.js 14 + Supabase). Tu analyses une erreur prod Sentry pour proposer une GitHub issue actionnable.

CONTEXTE TECHNIQUE :
- Frontend : Next.js 14 App Router, React 18, Tailwind, JS (pas TS)
- Backend : API routes Next.js (serverless Vercel)
- DB : Supabase Postgres avec RLS
- Auth : Supabase Auth + custom emails Resend
- Stripe pour billing
- Anthropic + Resend + Twilio APIs

TON ANALYSE DOIT :
1. Identifier la CAUSE LA PLUS PROBABLE (basée sur stack + breadcrumbs + tags)
2. Proposer un FIX précis (fichier + ligne approximatif si possible, ou pattern code)
3. Indiquer si REPRODUCIBLE facilement
4. Évaluer la PRIORITÉ (low/medium/high) selon impact users + fréquence

GARDE-FOUS :
- Ne JAMAIS inventer un fix non-justifié. Si tu doutes, dis "Investigation nécessaire" et liste 2-3 hypothèses à vérifier.
- Si l'erreur ressemble à un bug client (ex: extension navigateur, ad blocker), marque-le "wont-fix".
- Si le stack trace pointe vers du code de bibliothèque tierce, suggère un workaround pas une réécriture.

Réponds UNIQUEMENT en JSON :
{
  "should_create_issue": true | false,
  "wont_fix_reason": "..." (si false),
  "title": "[Auto-detect] short title",
  "priority": "low" | "medium" | "high",
  "labels": ["bug", "..."] (suggested labels for the issue),
  "body_markdown": "## Cause probable\\n...\\n\\n## Fix suggéré\\n...\\n\\n## Repro\\n...\\n\\n## Stack Sentry\\n..."
}`;

/**
 * Vérifie si on a déjà proposé/traité cette Sentry issue dans la queue.
 */
async function alreadyProcessed(sentryId) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('autonomous_actions')
    .select('id, status')
    .eq('action_type', 'github_issue_create')
    .filter('payload->>sentry_id', 'eq', sentryId)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Vérifie si une issue GitHub existante traite déjà cette erreur (fuzzy match sur title).
 */
function similarTitleExists(title, githubIssues) {
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(title).slice(0, 60);
  return githubIssues.some((i) => {
    const candidate = normalize(i.title).slice(0, 60);
    return candidate.includes(target) || target.includes(candidate);
  });
}

/**
 * Analyse 1 Sentry issue via Claude → renvoie le JSON de décision.
 */
async function analyzeIssueWithClaude(sentryIssue, sentryDetails) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const eventBrief = sentryDetails.ok
    ? `\n\n## Stack trace (event le plus récent)\n${JSON.stringify(sentryDetails.event?.exception?.values?.[0]?.stacktrace?.frames?.slice(-8) || 'N/A', null, 2)}\n\n## Tags\n${JSON.stringify(sentryDetails.event?.tags || [], null, 2)}\n\n## Breadcrumbs récents\n${JSON.stringify(sentryDetails.event?.breadcrumbs || [], null, 2)}`
    : '\n(Détails event indisponibles)';

  const userMessage = `# Issue Sentry à analyser

**Titre :** ${sentryIssue.title}
**Culprit :** ${sentryIssue.culprit}
**Niveau :** ${sentryIssue.level}
**Occurrences (7 derniers jours) :** ${sentryIssue.count}
**Users impactés :** ${sentryIssue.userCount}
**Première vue :** ${sentryIssue.firstSeen}
**Dernière vue :** ${sentryIssue.lastSeen}
**Permalink :** ${sentryIssue.permalink}
**Metadata :** ${JSON.stringify(sentryIssue.metadata, null, 2)}${eventBrief}

Analyse cette erreur. Si elle vaut une issue GitHub, propose-la. Sinon explique pourquoi (wont-fix, déjà connu, bug user).`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
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
  return parsed;
}

/**
 * Main : appelée par le cron sentry-digest.
 */
export async function runSentryDigest() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled' };
  }

  // Quota safety net (max 10 issues GitHub par semaine pour pas spammer)
  try {
    await enforceQuotaOrThrow('github_issue_create', { perWeek: 10 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message };
  }

  // 1. Fetch top errors
  const sentryRes = await fetchTopSentryErrors({ days: LOOKBACK_DAYS, minCount: MIN_OCCURRENCES, limit: 25 });
  if (!sentryRes.ok) {
    return { ok: false, error: 'sentry_fetch_failed', detail: sentryRes.error, startedAt };
  }
  if (sentryRes.issues.length === 0) {
    return { ok: true, processed: 0, message: 'Aucune erreur Sentry au-dessus du seuil', startedAt };
  }

  // 2. Get existing GitHub auto-issues pour déduplication
  const ghRes = await listRecentGithubIssues({ labels: ['volia-autonomy'], state: 'open' });
  const existingGithub = ghRes.ok ? ghRes.issues : [];

  // 3. Process up to MAX_ISSUES_PER_RUN nouvelles
  const proposed = [];
  const skipped = [];

  for (const sentryIssue of sentryRes.issues) {
    if (proposed.length >= MAX_ISSUES_PER_RUN) break;

    // Skip si déjà processed (queue interne)
    if (await alreadyProcessed(sentryIssue.id)) {
      skipped.push({ id: sentryIssue.id, reason: 'already_in_queue' });
      continue;
    }

    // Skip si déjà une issue GitHub similaire
    if (similarTitleExists(sentryIssue.title, existingGithub)) {
      skipped.push({ id: sentryIssue.id, reason: 'similar_github_issue_exists' });
      continue;
    }

    // Fetch détails (stack + breadcrumbs) + analyser
    const details = await fetchSentryIssueDetails(sentryIssue.id);
    let analysis;
    try {
      analysis = await analyzeIssueWithClaude(sentryIssue, details);
    } catch (err) {
      console.error('[sentry-digest] Claude analysis failed', err);
      skipped.push({ id: sentryIssue.id, reason: 'claude_failed', detail: err.message });
      continue;
    }

    if (!analysis.should_create_issue) {
      skipped.push({ id: sentryIssue.id, reason: 'wont_fix', detail: analysis.wont_fix_reason });
      continue;
    }

    // Log dans la queue d'approval
    const preview = `GitHub issue ${analysis.priority}: "${analysis.title.slice(0, 90)}"`;
    const action = await logAutonomousAction({
      actionType: 'github_issue_create',
      source: 'cron/sentry-digest',
      riskLevel: 'medium',
      payload: {
        sentry_id: sentryIssue.id,
        sentry_short_id: sentryIssue.shortId,
        sentry_permalink: sentryIssue.permalink,
        sentry_count: sentryIssue.count,
        sentry_user_count: sentryIssue.userCount,
        title: analysis.title,
        body: analysis.body_markdown,
        labels: [...(analysis.labels || []), `priority:${analysis.priority || 'medium'}`, 'sentry-auto'],
      },
      preview,
      rationale: `Sentry : ${sentryIssue.count} occurrences, ${sentryIssue.userCount} users impactés sur 7j. Priorité IA : ${analysis.priority}`,
      autoExecute: false,
      expiresInHours: 168, // 7 jours pour valider une issue
    });

    proposed.push({
      id: sentryIssue.id,
      action_id: action.id,
      title: analysis.title,
      priority: analysis.priority,
    });
  }

  return {
    ok: true,
    startedAt,
    sentry_top_count: sentryRes.issues.length,
    proposed: proposed.length,
    skipped: skipped.length,
    proposed_list: proposed,
    skipped_list: skipped,
  };
}
