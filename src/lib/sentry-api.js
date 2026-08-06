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
//   SENTRY_ORG         ← OBLIGATOIRE, aucun défaut. Slug lisible dans l'URL
//                        Sentry : sentry.io/organizations/<slug>/
//   SENTRY_PROJECT     ← OBLIGATOIRE, aucun défaut.
//
// Ces deux variables avaient un repli codé en dur ("volia"/"volia-prod") qui
// ne correspondait à rien : chaque appel partait en 404 et le digest se
// terminait sans rien dire. Une config manquante doit crier.
//
// L'URL d'API est déduite de la région du DSN (cf. resolveSentryApiBase) :
// une org européenne répond sur de.sentry.io, pas sur sentry.io.
//
// Différence avec SENTRY_AUTH_TOKEN existant : ce dernier est pour
// l'upload de sourcemaps lors du build (scope plus restreint). Pour lire
// l'API, on a besoin d'un Auth Token utilisateur avec scope "project:read".
// ─────────────────────────────────────────────────────────────────────

const SENTRY_API_DEFAULT_BASE = 'https://sentry.io/api/0';

/**
 * Déduit l'URL d'API à partir de la région portée par le DSN.
 *
 * Une organisation Sentry européenne ingère sur `…ingest.de.sentry.io` et
 * répond sur `https://de.sentry.io/api/0`. L'URL était figée sur l'instance US,
 * donc chaque lecture partait dans le vide — sans erreur visible, puisque le
 * digest se contente de renvoyer `{ ok: false }`.
 *
 * On la déduit du DSN plutôt que d'ajouter une énième variable : impossible
 * qu'elle diverge de l'endroit où les événements sont réellement envoyés.
 */
export function resolveSentryApiBase(dsn) {
  if (!dsn || typeof dsn !== 'string') return SENTRY_API_DEFAULT_BASE;
  // Région = segment unique entre `.ingest.` et `.sentry.io` (ex. « de », « us »).
  const m = dsn.match(/\.ingest\.([a-z0-9-]+)\.sentry\.io/i);
  if (!m) return SENTRY_API_DEFAULT_BASE;
  return `https://${m[1].toLowerCase()}.sentry.io/api/0`;
}

const SENTRY_API_BASE = resolveSentryApiBase(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
);

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
  // Plus de repli deviné : « volia »/« volia-prod » étaient faux (le slug réel
  // est « ezdrive »), donc chaque appel partait en 404 et le digest se taisait.
  // Une variable manquante doit crier, pas produire un silence plausible.
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;

  if (!token) {
    return { ok: false, error: 'SENTRY_API_TOKEN non configurée (cf. settings Sentry → API → Auth Tokens, scopes project:read + event:read)' };
  }
  if (!org || !project) {
    return {
      ok: false,
      error: `Configuration Sentry incomplète : ${!org ? 'SENTRY_ORG ' : ''}${!project ? 'SENTRY_PROJECT ' : ''}manquante(s) sur Vercel. Le slug se lit dans l'URL Sentry : sentry.io/organizations/<SENTRY_ORG>/projects/<SENTRY_PROJECT>/`,
    };
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
