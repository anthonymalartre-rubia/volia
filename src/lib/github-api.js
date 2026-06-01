// ─────────────────────────────────────────────────────────────────────
// src/lib/github-api.js — Wrapper API GitHub pour issues + PR auto
// ─────────────────────────────────────────────────────────────────────
//
// Env vars requises :
//   GITHUB_TOKEN  ← Personal Access Token (fine-grained recommended)
//                   Repository access : volia repo only
//                   Permissions : Issues (write) + Pull Requests (write) + Contents (read)
//   GITHUB_REPO   ← défaut "anthonymalartre-rubia/volia"
//
// Créer un token : https://github.com/settings/tokens?type=beta
// ─────────────────────────────────────────────────────────────────────

const GITHUB_API_BASE = 'https://api.github.com';

function getRepoConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'anthonymalartre-rubia/volia';
  return { token, repo };
}

/**
 * Crée une issue GitHub.
 *
 * @param {object} payload
 * @param {string} payload.title
 * @param {string} payload.body - Markdown
 * @param {string[]} [payload.labels] - ex: ['bug', 'auto-generated', 'priority:medium']
 * @param {string[]} [payload.assignees]
 * @returns {Promise<{ok, html_url?, number?, error?}>}
 */
export async function createGithubIssue({ title, body, labels = [], assignees = [] }) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };
  if (!title || !body) return { ok: false, error: 'title et body requis' };

  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['volia-autonomy', ...labels],
        assignees,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return { ok: false, error: `GitHub /issues ${res.status} : ${errBody.slice(0, 300)}` };
    }
    const data = await res.json();
    return {
      ok: true,
      html_url: data.html_url,
      number: data.number,
      node_id: data.node_id,
    };
  } catch (err) {
    return { ok: false, error: `Fetch error : ${err.message}` };
  }
}

/**
 * Liste les issues récentes (pour déduplication avant création).
 * Utile pour ne pas créer 2× la même issue depuis Sentry.
 *
 * @param {object} opts
 * @param {string[]} [opts.labels] - filtre par labels (ex: ['volia-autonomy'])
 * @param {string} [opts.state='open']
 * @param {number} [opts.perPage=30]
 */
export async function listRecentGithubIssues({ labels = [], state = 'open', perPage = 30 } = {}) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  const params = new URLSearchParams({
    state,
    per_page: String(perPage),
    sort: 'created',
    direction: 'desc',
  });
  if (labels.length) params.set('labels', labels.join(','));

  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/issues?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) return { ok: false, error: `GitHub /issues GET ${res.status}` };
    const issues = await res.json();
    return {
      ok: true,
      issues: issues.map((i) => ({
        number: i.number,
        title: i.title,
        html_url: i.html_url,
        labels: i.labels.map((l) => l.name),
        body: i.body?.slice(0, 500),
        state: i.state,
        created_at: i.created_at,
      })),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
