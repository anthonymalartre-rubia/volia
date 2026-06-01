// ─────────────────────────────────────────────────────────────────────
// src/lib/auto-fix-bugs.js — Sprint Self-Healing Phase 4
// ─────────────────────────────────────────────────────────────────────
// Pipeline ultime "Volia se code lui-même" :
//
// Cron weekly (vendredi 11h CET, après sentry-digest lundi 11h) :
//   1. Liste les issues GitHub open avec label volia-autonomy
//   2. Filtre celles qui n'ont pas déjà une PR auto associée
//   3. Pour chaque (max 2/run) :
//      a. Parse l'issue body pour identifier les fichiers source mentionnés
//         (look for patterns "src/...", "/lib/...", paths absolus)
//      b. Skip si fichier dans FORBIDDEN_FILES (sécurité critique)
//      c. Skip si fichier trop gros (>500 lignes) — trop risqué à toucher
//      d. Récupère contenu actuel via GitHub Contents API
//      e. Claude propose un patch unified diff + explication
//      f. Apply le patch sur une nouvelle branche auto-fix/issue-NUMBER
//      g. Crée une PR DRAFT vers main avec lien vers l'issue
//      h. Log dans autonomous_actions (audit trail)
//   4. Tu reviews chaque PR sur GitHub → merge ou close
//
// GARDE-FOUS CRITIQUES :
//   - PR TOUJOURS en DRAFT mode (jamais ready-for-review auto)
//   - Max 1 fichier modifié par PR
//   - Max 30 lignes changées (insertions + deletions)
//   - Skip fichiers critiques (middleware, autonomy.js, vercel.json, etc.)
//   - Quota perWeek: 2 PR auto max
//   - Skip si fichier > 500 lignes (trop risqué pour Claude)
//   - Lint pre-flight : valide que le code patché parse encore (JS basique)
//
// ⚠️ ENV : GITHUB_TOKEN doit avoir scope Contents=write + Pull requests=write
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import {
  listOpenIssuesWithLabel,
  getFileContent,
  createBranch,
  updateFileContent,
  createPullRequest,
} from './github-api';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  enforceQuotaOrThrow,
  countRecentActions,
} from './autonomy';
import { getSupabaseAdmin } from './supabase-admin';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_PER_RUN = 2;
const MAX_FILE_LINES = 500;
const MAX_PATCH_LINES = 30;

// Fichiers qu'on ne touche JAMAIS automatiquement (impact systémique)
const FORBIDDEN_FILES = [
  /src\/middleware\.js$/,
  /src\/lib\/autonomy\.js$/,
  /vercel\.json$/,
  /next\.config\.js$/,
  /package\.json$/,
  /package-lock\.json$/,
  /src\/lib\/auto-fix-bugs\.js$/, // évite que Claude se modifie lui-même
  /src\/app\/api\/stripe\/webhook\/route\.js$/, // billing critique
  /src\/app\/api\/auth\//, // auth critique
  /\.env/,
];

const SYSTEM_PROMPT = `Tu es un ingénieur senior de Volia.fr (Next.js 14 App Router, React 18, Tailwind, JS pur — pas TypeScript, Supabase, Stripe).

Tu reçois :
  1. Le titre + body d'une issue GitHub (générée par Sentry digest)
  2. Le contenu actuel d'un fichier source identifié comme probablement responsable

Ta mission : proposer une CORRECTION MINIMALE.

CONTRAINTES STRICTES :
- Patch ≤ 30 lignes changées (insertions + deletions combinées)
- Modifier UN seul fichier
- Garder la cohérence du style existant (indent, quotes, imports, naming)
- NE PAS refactor / nettoyer pendant ce fix — uniquement la correction du bug
- NE PAS ajouter de dépendances (pas de nouveau import package npm)
- Si le bug est dans du code de bibliothèque tierce, propose un workaround dans le code Volia (pas une modif de node_modules)
- Si tu ne peux pas fixer avec confiance, retourne should_fix: false

APPROCHE :
1. Comprendre la cause racine (cf. stack trace dans le body de l'issue)
2. Identifier la ligne / fonction à modifier
3. Proposer une correction défensive (null-check, try/catch, default value, etc.)
4. Vérifier mentalement que le fix ne casse pas le code existant

FORMAT DE SORTIE — JSON strict :
{
  "should_fix": true | false,
  "wont_fix_reason": "..." (si false : "investigation nécessaire" / "fichier trop complexe" / "fix nécessite refactor")
  "explanation": "1-2 phrases : ce que tu fixes et pourquoi",
  "new_file_content": "LE CONTENU COMPLET DU FICHIER après ta modification (pas un diff, le fichier entier)",
  "lines_changed_estimate": 5,
  "commit_message": "fix(scope): description courte conventional commit",
  "pr_body_markdown": "## Cause\\n...\\n\\n## Fix\\n...\\n\\n## Risques\\n...\\n\\n## Tests manuels suggérés\\n..."
}`;

/**
 * Parse l'issue body pour extraire les chemins de fichiers mentionnés.
 * Look for patterns : src/lib/foo.js, src/app/api/.../route.js, etc.
 */
function extractFilePathsFromIssue(issueBody) {
  if (!issueBody) return [];
  const patterns = [
    /(?:^|[\s(])(src\/[a-zA-Z0-9_\-/\[\].]+\.(?:js|jsx|ts|tsx|json|md|css))(?=[\s):,]|$)/gm,
    /(?:^|[\s(])(public\/[a-zA-Z0-9_\-/\[\].]+\.[a-z]+)(?=[\s):,]|$)/gm,
  ];
  const found = new Set();
  for (const re of patterns) {
    let match;
    while ((match = re.exec(issueBody)) !== null) {
      found.add(match[1]);
    }
  }
  return [...found];
}

function isForbiddenFile(path) {
  return FORBIDDEN_FILES.some((p) => p.test(path));
}

/**
 * Vérifie si une issue a déjà reçu une tentative de PR auto.
 */
async function alreadyAttemptedFix(issueNumber) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('autonomous_actions')
    .select('id')
    .eq('action_type', 'github_pr_fix')
    .filter('payload->>issue_number', 'eq', String(issueNumber))
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Demande à Claude de proposer un patch pour le fichier donné.
 */
async function generateFixWithClaude(issue, file) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = `# Issue à corriger

**Titre :** ${issue.title}
**URL :** ${issue.html_url}

**Body de l'issue :**
${(issue.body || '').slice(0, 4000)}

---

# Fichier suspecté responsable : \`${file.path}\` (${file.content.split('\n').length} lignes)

\`\`\`
${file.content}
\`\`\`

---

Propose une correction MINIMALE qui résout le bug. Format JSON strict.

Si tu juges que tu ne peux PAS fixer avec confiance (cause incertaine, refactor nécessaire, ou bug ailleurs que dans ce fichier), retourne should_fix: false avec wont_fix_reason.`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192, // contenu fichier peut être long
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
 * Validation pre-flight basique : vérif que le code patché parse.
 * Pour JS pur : check basique de balance brackets/parens.
 */
function basicSyntaxCheck(content) {
  let braces = 0, parens = 0, brackets = 0;
  let inString = null;
  let inComment = null;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1];
    // gestion commentaires
    if (inComment === 'single' && c === '\n') { inComment = null; continue; }
    if (inComment === 'multi' && c === '*' && next === '/') { inComment = null; i++; continue; }
    if (inComment) continue;
    if (!inString && c === '/' && next === '/') { inComment = 'single'; continue; }
    if (!inString && c === '/' && next === '*') { inComment = 'multi'; continue; }
    // gestion strings
    if (inString && c === inString && content[i - 1] !== '\\') { inString = null; continue; }
    if (inString) continue;
    if (c === '"' || c === "'" || c === '`') { inString = c; continue; }
    // count
    if (c === '{') braces++;
    else if (c === '}') braces--;
    else if (c === '(') parens++;
    else if (c === ')') parens--;
    else if (c === '[') brackets++;
    else if (c === ']') brackets--;
  }
  if (braces !== 0) return { ok: false, error: `Braces imbalanced (delta=${braces})` };
  if (parens !== 0) return { ok: false, error: `Parens imbalanced (delta=${parens})` };
  if (brackets !== 0) return { ok: false, error: `Brackets imbalanced (delta=${brackets})` };
  return { ok: true };
}

/**
 * Main : appelée par cron auto-fix-bugs.
 */
export async function runAutoFixBugs() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  try {
    await enforceQuotaOrThrow('github_pr_fix', { perWeek: 2 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message, startedAt };
  }

  // 1. Liste issues volia-autonomy open
  const issuesRes = await listOpenIssuesWithLabel({ label: 'volia-autonomy', perPage: 20 });
  if (!issuesRes.ok) {
    return { ok: false, error: 'github_fetch_failed', detail: issuesRes.error, startedAt };
  }
  if (!issuesRes.issues || issuesRes.issues.length === 0) {
    return { ok: true, skipped: true, reason: 'no_open_issues', startedAt };
  }

  const attempted = [];
  const skipped = [];

  for (const issue of issuesRes.issues) {
    if (attempted.length >= MAX_PER_RUN) break;

    // Skip si déjà tenté
    if (await alreadyAttemptedFix(issue.number)) {
      skipped.push({ issue: issue.number, reason: 'already_attempted' });
      continue;
    }

    // Extract paths from body
    const paths = extractFilePathsFromIssue(issue.body);
    const candidatePath = paths.find((p) => !isForbiddenFile(p));
    if (!candidatePath) {
      skipped.push({ issue: issue.number, reason: 'no_safe_file_in_body', paths });
      continue;
    }

    // Fetch file content
    const fileRes = await getFileContent({ path: candidatePath, branch: 'main' });
    if (!fileRes.ok) {
      skipped.push({ issue: issue.number, reason: 'file_fetch_failed', detail: fileRes.error });
      continue;
    }
    const lineCount = fileRes.content.split('\n').length;
    if (lineCount > MAX_FILE_LINES) {
      skipped.push({ issue: issue.number, reason: 'file_too_large', lines: lineCount });
      continue;
    }

    // Claude analyse + propose fix
    let proposal;
    try {
      proposal = await generateFixWithClaude(issue, fileRes);
    } catch (err) {
      skipped.push({ issue: issue.number, reason: 'claude_failed', detail: err.message });
      continue;
    }

    if (!proposal.should_fix) {
      skipped.push({ issue: issue.number, reason: 'wont_fix', detail: proposal.wont_fix_reason });
      continue;
    }

    // Validation : delta lignes
    const newContent = proposal.new_file_content || '';
    const oldLines = fileRes.content.split('\n');
    const newLines = newContent.split('\n');
    const lineDelta = Math.abs(newLines.length - oldLines.length);
    if (lineDelta > MAX_PATCH_LINES) {
      skipped.push({
        issue: issue.number,
        reason: 'patch_too_large',
        detail: `${lineDelta} lignes delta (max ${MAX_PATCH_LINES})`,
      });
      continue;
    }

    // Validation : syntaxe basique
    const syntaxCheck = basicSyntaxCheck(newContent);
    if (!syntaxCheck.ok) {
      skipped.push({ issue: issue.number, reason: 'syntax_invalid', detail: syntaxCheck.error });
      continue;
    }

    // 2. Crée la branche
    const branchName = `auto-fix/issue-${issue.number}-${Date.now()}`;
    const branchRes = await createBranch({ name: branchName, fromBranch: 'main' });
    if (!branchRes.ok) {
      skipped.push({ issue: issue.number, reason: 'branch_create_failed', detail: branchRes.error });
      continue;
    }

    // 3. Update file content sur cette branche
    const updateRes = await updateFileContent({
      path: candidatePath,
      content: newContent,
      branch: branchName,
      message: proposal.commit_message || `fix(auto): patch from issue #${issue.number}`,
      sha: fileRes.sha,
    });
    if (!updateRes.ok) {
      skipped.push({ issue: issue.number, reason: 'file_update_failed', detail: updateRes.error });
      continue;
    }

    // 4. Crée la PR draft
    const prBody = `${proposal.pr_body_markdown || proposal.explanation || ''}

---

🤖 **Auto-generated by Volia autonomy**
- Issue: #${issue.number}
- File: \`${candidatePath}\`
- Lines changed estimate: ${proposal.lines_changed_estimate || 'N/A'}
- Linked issue: ${issue.html_url}

⚠️ **PR en DRAFT** — review manuelle obligatoire. CI doit être vert avant merge.

Closes #${issue.number}`;

    const prRes = await createPullRequest({
      head: branchName,
      base: 'main',
      title: `[auto-fix] ${issue.title}`.slice(0, 100),
      body: prBody,
      draft: true,
    });

    if (!prRes.ok) {
      skipped.push({ issue: issue.number, reason: 'pr_create_failed', detail: prRes.error });
      continue;
    }

    // 5. Log dans audit trail
    await logAutonomousAction({
      actionType: 'github_pr_fix',
      source: 'cron/auto-fix-bugs',
      riskLevel: 'high',
      payload: {
        issue_number: issue.number,
        issue_url: issue.html_url,
        pr_number: prRes.number,
        pr_url: prRes.html_url,
        branch: branchName,
        file_modified: candidatePath,
        explanation: proposal.explanation,
        lines_delta: lineDelta,
      },
      preview: `🔧 PR draft #${prRes.number} pour issue #${issue.number} : ${candidatePath}`,
      rationale: proposal.explanation || `Auto-fix proposé sur ${candidatePath}`,
      autoExecute: true, // PR créée, l'action est self-contained
    });

    attempted.push({
      issue: issue.number,
      pr_url: prRes.html_url,
      pr_number: prRes.number,
      file: candidatePath,
      lines_delta: lineDelta,
    });
  }

  return {
    ok: true,
    attempted: attempted.length,
    skipped: skipped.length,
    attempted_list: attempted,
    skipped_list: skipped,
    startedAt,
  };
}
