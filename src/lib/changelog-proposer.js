// ─────────────────────────────────────────────────────────────────────
// src/lib/changelog-proposer.js — Auto-changelog depuis commits GitHub
// ─────────────────────────────────────────────────────────────────────
// Sprint Marketing Compound Phase 1.
//
// Pipeline (mardi 7h CET) :
//   1. Lit last_changelog_commit_sha depuis app_settings
//   2. listRecentCommits(sinceSha=last_sha) via GitHub API
//   3. Filtre commits user-facing (skip chore/docs/test/refactor purs)
//   4. Si ≥3 commits "intéressants" → Claude propose 1 entrée changelog
//   5. logAutonomousAction action_type='changelog_entry'
//   6. Founder approve dans /admin/auto-queue
//   7. publish-actions :
//      - INSERT auto_changelog_proposals (status='published')
//      - UPDATE app_settings last_changelog_commit_sha = SHA du commit le + récent
//
// La page /changelog merge static array CHANGELOG + DB published rows.
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import { listRecentCommits } from './github-api';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  enforceQuotaOrThrow,
} from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MIN_COMMITS_FOR_ENTRY = 3;

// Préfixes commits user-facing (worth a changelog mention)
const USERFACING_PREFIXES = ['feat', 'fix', 'perf', 'security', 'style'];

// Préfixes à skip (internes, pas user-facing)
const INTERNAL_PREFIXES = ['chore', 'docs', 'test', 'refactor', 'ci', 'build', 'deps'];

const SYSTEM_PROMPT = `Tu es responsable du changelog public de Volia.fr (SaaS B2B suite : Prospection + Campagnes + CRM + Forms).

Tu reçois une liste de commits Git récents. Tu génères UNE entrée de changelog qui regroupe les changements user-facing en quelques bullets actionnables.

CONTEXTE :
- Le changelog est lu par : prospects qui évaluent Volia, clients existants, journalistes, candidats devs
- Il doit être : factuel, concis, axé bénéfice utilisateur
- Pas de jargon dev. Pas de "refactor", pas de "DRY", pas de "fixed regression"
- Privilégier les verbes d'action et le bénéfice client : "vous pouvez maintenant…", "nouveau…", "fix d'un bug qui…"

FORMAT items (jsonb array) :
[
  { "type": "feature" | "improvement" | "fix" | "security", "tag": "SEO" | "Conversion" | "UX" | "Produit" | "Tech" | etc., "text": "phrase 12-25 mots" }
]

RÈGLES :
- 3 à 7 items max (regroupe les petits trucs, sépare les gros)
- type :
  * "feature" = nouvelle fonctionnalité (commits feat: principaux)
  * "improvement" = amélioration d'existant (commits feat: secondaires + perf:)
  * "fix" = bug fix (commits fix:)
  * "security" = patch sécurité (commits security: ou patch important)
- tag : 1 mot pour catégoriser visuellement (SEO/Conversion/UX/Produit/Tech/Acquisition/Brand/Autonomy)
- text : court, bénéfice client, pas de "we now" ni "fixed"
  ❌ "Refactor du dispatch handler dans publish-actions" → trop tech
  ✅ "Nouveau pipeline auto-publish LinkedIn : valider en 1 clic depuis l'admin" → user-facing
  ❌ "Fix bug" → vide
  ✅ "Correction d'un bug qui empêchait le wizard onboarding de s'afficher pour les utilisateurs Trial" → précis

VERSION :
- Auto-incrémente la version mineure (ex: si dernière était 4.2 → propose 4.3)
- Si la liste contient un commit feat majeur → propose une version majeure (4.x → 5.0)
- Tu reçois la dernière version connue en contexte

TITLE : 4-6 mots, accroche le thème principal de l'entrée
  Ex: "Self-healing & safety net" — "Mode autonomy Niveau 2 live"
  Ex: "Lead magnets + Resources" — "Bridges Prospection × Campagnes"

Réponds UNIQUEMENT en JSON :
{
  "should_publish": true | false,
  "skip_reason": "..." (si false, ex: "Seulement des chores internes"),
  "entry_date": "YYYY-MM-DD",
  "version": "X.Y" | "X.Y.Z",
  "title": "...",
  "items": [ { type, tag, text }, ... ]
}`;

/**
 * Filtre les commits selon préfixe Conventional Commits.
 * Garde uniquement les commits avec préfixe user-facing.
 */
function filterUserFacingCommits(commits) {
  return commits.filter((c) => {
    const lowerTitle = c.title.toLowerCase();
    // Match "type(scope): subject" OR "type: subject"
    const match = lowerTitle.match(/^(\w+)(?:\([^)]+\))?:/);
    if (!match) return false; // skip si pas de préfixe conventional
    const prefix = match[1];
    if (INTERNAL_PREFIXES.includes(prefix)) return false;
    return USERFACING_PREFIXES.includes(prefix);
  });
}

/**
 * Génère une proposition d'entrée changelog via Claude.
 */
async function generateChangelogEntry(commits, lastKnownVersion) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const commitsBrief = commits
    .map((c) => `  - [${c.short_sha}] ${c.title}`)
    .join('\n');

  const userMessage = `# Commits récents à analyser (${commits.length} commits user-facing)

${commitsBrief}

# Dernière version connue dans le changelog
${lastKnownVersion || '4.2'}

# Date du jour
${new Date().toISOString().split('T')[0]}

Génère 1 entrée changelog regroupant ces commits. Si la liste est composée uniquement de petits fixes mineurs / patches internes / ne mérite pas une entrée publique, renvoie should_publish: false avec une skip_reason claire.`;

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

  // Validation minimale
  if (parsed.should_publish && (!parsed.title || !Array.isArray(parsed.items) || parsed.items.length === 0)) {
    throw new Error('Réponse Claude incomplète (title ou items manquants)');
  }

  return parsed;
}

/**
 * Récupère la dernière version connue (dans DB ou dans le static array).
 * Pour V1 on lit juste depuis DB published rows. Fallback "4.2" si vide.
 */
async function getLastKnownVersion() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('auto_changelog_proposals')
    .select('version')
    .eq('status', 'published')
    .order('entry_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.version || '4.2'; // fallback à la dernière du fichier static
}

async function getLastProcessedSha() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'last_changelog_commit_sha')
    .maybeSingle();
  const raw = data?.value;
  if (typeof raw === 'string' && raw) return raw;
  return null;
}

/**
 * Main : appelée par cron auto-changelog-proposer.
 */
export async function runChangelogProposer() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  // Quota : max 2 entrées changelog par semaine (anti-spam)
  try {
    await enforceQuotaOrThrow('auto_changelog_entry', { perWeek: 2 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message, startedAt };
  }

  // 1. Récup dernière SHA processée
  const lastSha = await getLastProcessedSha();

  // 2. Fetch commits depuis last SHA
  const commitsRes = await listRecentCommits({ branch: 'main', perPage: 100, sinceSha: lastSha });
  if (!commitsRes.ok) {
    return { ok: false, error: 'github_fetch_failed', detail: commitsRes.error, startedAt };
  }

  const allCommits = commitsRes.commits || [];
  if (allCommits.length === 0) {
    return { ok: true, skipped: true, reason: 'no_new_commits', startedAt };
  }

  // 3. Filtre user-facing
  const userFacingCommits = filterUserFacingCommits(allCommits);
  if (userFacingCommits.length < MIN_COMMITS_FOR_ENTRY) {
    return {
      ok: true,
      skipped: true,
      reason: 'not_enough_userfacing_commits',
      detail: `${userFacingCommits.length}/${allCommits.length} commits user-facing (min ${MIN_COMMITS_FOR_ENTRY} requis)`,
      newest_sha: allCommits[0]?.sha,
      startedAt,
    };
  }

  // 4. Génère proposition via Claude
  const lastVersion = await getLastKnownVersion();
  let proposal;
  try {
    proposal = await generateChangelogEntry(userFacingCommits, lastVersion);
  } catch (err) {
    return { ok: false, error: 'claude_failed', detail: err.message, startedAt };
  }

  if (!proposal.should_publish) {
    return {
      ok: true,
      skipped: true,
      reason: 'claude_decided_skip',
      detail: proposal.skip_reason || 'Pas de raison fournie',
      startedAt,
    };
  }

  // 5. Log dans queue
  const itemsPreview = (proposal.items || [])
    .slice(0, 3)
    .map((i) => `• ${i.text.slice(0, 60)}`)
    .join('\n');
  const preview = `Changelog v${proposal.version} — ${proposal.title}\n${itemsPreview}`;

  const action = await logAutonomousAction({
    actionType: 'changelog_entry',
    source: 'cron/auto-changelog-proposer',
    riskLevel: 'medium',
    payload: {
      entry_date: proposal.entry_date,
      version: proposal.version,
      title: proposal.title,
      items: proposal.items,
      source_commits: userFacingCommits.map((c) => c.sha),
      newest_commit_sha: allCommits[0].sha, // pour update last_sha après publication
    },
    preview,
    rationale: `${userFacingCommits.length} commits user-facing depuis dernière entrée. Claude propose v${proposal.version} : ${proposal.title}`,
    autoExecute: false,
    expiresInHours: 168, // 7 jours
  });

  return {
    ok: true,
    actionId: action.id,
    proposal: {
      version: proposal.version,
      title: proposal.title,
      items_count: proposal.items.length,
    },
    commits_analyzed: userFacingCommits.length,
    startedAt,
  };
}
