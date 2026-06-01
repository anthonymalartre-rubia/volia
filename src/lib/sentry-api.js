// ─────────────────────────────────────────────────────────────────────
// src/lib/sentry-api.js — Lit les erreurs depuis l'API Sentry
// ─────────────────────────────────────────────────────────────────────
//
// Utilisé par /api/cron/sentry-digest pour auto-générer des GitHub
// issues à partir des erreurs récurrentes en prod.
//
// Env vars requises :
//   SENTRY_API_TOKEN   ← User Auth Token avec scope "project:read" + "event:read"
//                        À créer sur sentry.io → Settings → Account → API → Auth Tokens
//   SENTRY_ORG         ← défaut "volia" (cf. next.config.js)
//   SENTRY_PROJECT     ← défaut "volia-prod"
//
// Différence avec SENTRY_AUTH_TOKEN existant : ce dernier est pour
// l'upload de sourcemaps lors du build (scope plus restreint). Pour lire
// l'API, on a besoin d'un Auth Token utilisateur avec scope "project:read".
// ─────────────────────────────────────────────────────────────────────

const SENTRY_API_BASE = 'https://sentry.io/api/0';

/**
 * Récupère le top des issues Sentry des N derniers jours.
 *
 * @param {object} opts
 * @param {number} [opts.days=7] - fenêtre temporelle
 * @param {number} [opts.minCount=3] - skip les erreurs avec <X occurrences
 * @param {number} [opts.limit=25] - cap nombre d'issues à examiner
 * @returns {Promise<Array<{id, shortId, title, culprit, count, userCount, level, permalink, lastSeen, firstSeen, metadata}>>}
 */
export async function fetchTopSentryErrors(opts = {}) {
  const { days = 7, minCount = 3, limit = 25 } = opts;

  const token = process.env.SENTRY_API_TOKEN;
  const org = process.env.SENTRY_ORG || 'volia';
  const project = process.env.SENTRY_PROJECT || 'volia-prod';

  if (!token) {
    return { ok: false, error: 'SENTRY_API_TOKEN non configurée (cf. settings Sentry → API → Auth Tokens, scopes project:read + event:read)' };
  }

  const url = `${SENTRY_API_BASE}/projects/${org}/${project}/issues/?statsPeriod=${days}d&query=is:unresolved&sort=freq&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Sentry API ${res.status} : ${body.slice(0, 200)}` };
    }
    const issues = await res.json();

    // Filtre les flukes (low count) + normalise les champs utiles
    const filtered = (Array.isArray(issues) ? issues : [])
      .filter((i) => parseInt(i.count, 10) >= minCount)
      .map((i) => ({
        id: i.id,
        shortId: i.shortId,
        title: i.title,
        culprit: i.culprit,
        count: parseInt(i.count, 10) || 0,
        userCount: i.userCount || 0,
        level: i.level,
        status: i.status,
        permalink: i.permalink,
        lastSeen: i.lastSeen,
        firstSeen: i.firstSeen,
        platform: i.platform,
        metadata: i.metadata, // { type, value, filename, function }
      }));

    return { ok: true, issues: filtered, count: filtered.length };
  } catch (err) {
    return { ok: false, error: `Fetch error : ${err.message}` };
  }
}

/**
 * Récupère le stacktrace + tags + breadcrumbs d'une issue Sentry précise.
 * Utilisé pour donner du contexte à Claude pour suggérer un fix.
 *
 * @param {string} issueId - Sentry issue ID (numérique ou shortId)
 * @returns {Promise<{ok, event?, error?}>}
 */
export async function fetchSentryIssueDetails(issueId) {
  const token = process.env.SENTRY_API_TOKEN;
  if (!token) return { ok: false, error: 'SENTRY_API_TOKEN missing' };

  try {
    // Get latest event for this issue (contains full stack trace)
    const url = `${SENTRY_API_BASE}/issues/${issueId}/events/latest/`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { ok: false, error: `Sentry /issues/${issueId}/events/latest ${res.status}` };
    }
    const event = await res.json();
    return {
      ok: true,
      event: {
        title: event.title,
        message: event.message,
        platform: event.platform,
        tags: event.tags, // [{key, value}]
        exception: event.entries?.find((e) => e.type === 'exception')?.data,
        breadcrumbs: event.entries?.find((e) => e.type === 'breadcrumbs')?.data?.values?.slice(-5), // last 5
        contexts: event.contexts, // browser, os, runtime, etc.
        user: event.user,
        environment: event.environment,
      },
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
