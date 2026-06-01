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
 * Récupère le contenu d'un fichier depuis un branch GitHub.
 * Retourne { content, sha, encoding } — sha nécessaire pour update ensuite.
 */
export async function getFileContent({ path, branch = 'main' }) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `GitHub /contents ${res.status} : ${body.slice(0, 200)}` };
    }
    const data = await res.json();
    const decoded = data.encoding === 'base64'
      ? Buffer.from(data.content, 'base64').toString('utf-8')
      : data.content;
    return {
      ok: true,
      content: decoded,
      sha: data.sha,
      path: data.path,
      size: data.size,
      encoding: data.encoding,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Crée une nouvelle branche à partir d'une branche source.
 */
export async function createBranch({ name, fromBranch = 'main' }) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  try {
    // 1. Récupère le SHA du HEAD de fromBranch
    const refRes = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/git/refs/heads/${fromBranch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
    );
    if (!refRes.ok) {
      return { ok: false, error: `GitHub /git/refs/heads/${fromBranch} ${refRes.status}` };
    }
    const refData = await refRes.json();
    const baseSha = refData.object.sha;

    // 2. Crée la nouvelle branche
    const createRes = await fetch(`${GITHUB_API_BASE}/repos/${repo}/git/refs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${name}`,
        sha: baseSha,
      }),
    });
    if (!createRes.ok) {
      const body = await createRes.text();
      return { ok: false, error: `GitHub /git/refs POST ${createRes.status} : ${body.slice(0, 200)}` };
    }
    return { ok: true, branch: name, base_sha: baseSha };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Update le contenu d'un fichier sur une branche (commit).
 * Nécessite le SHA actuel du fichier (récupéré via getFileContent).
 */
export async function updateFileContent({ path, content, branch, message, sha }) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message || `chore(auto-fix): update ${path}`,
          content: Buffer.from(content, 'utf-8').toString('base64'),
          sha,
          branch,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `GitHub /contents PUT ${res.status} : ${body.slice(0, 200)}` };
    }
    const data = await res.json();
    return { ok: true, commit_sha: data.commit?.sha, commit_url: data.commit?.html_url };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Crée une Pull Request (draft par défaut).
 */
export async function createPullRequest({
  head,
  base = 'main',
  title,
  body,
  draft = true,
}) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ head, base, title, body, draft }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return { ok: false, error: `GitHub /pulls POST ${res.status} : ${errBody.slice(0, 300)}` };
    }
    const data = await res.json();
    return {
      ok: true,
      number: data.number,
      html_url: data.html_url,
      head_sha: data.head?.sha,
      state: data.state,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Liste les issues open avec un label donné — utilisé par auto-fix-bugs
 * pour trouver les issues volia-autonomy à fixer.
 */
export async function listOpenIssuesWithLabel({ label = 'volia-autonomy', perPage = 20 } = {}) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  try {
    const params = new URLSearchParams({
      state: 'open',
      labels: label,
      per_page: String(perPage),
      sort: 'created',
      direction: 'desc',
    });
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
        body: i.body || '',
        html_url: i.html_url,
        labels: i.labels.map((l) => l.name),
        created_at: i.created_at,
      })),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Liste les N derniers commits sur la branche main (pour changelog auto).
 *
 * @param {object} opts
 * @param {string} [opts.branch='main']
 * @param {number} [opts.perPage=50]
 * @param {string} [opts.sinceSha] - si fourni, ne retourne que les commits APRÈS ce SHA
 * @returns {Promise<{ok, commits?, error?}>}
 */
export async function listRecentCommits({ branch = 'main', perPage = 50, sinceSha = null } = {}) {
  const { token, repo } = getRepoConfig();
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configuré' };

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/commits?sha=${branch}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `GitHub /commits ${res.status} : ${body.slice(0, 200)}` };
    }
    const data = await res.json();

    // Filtre incrémental : ne garde que les commits APRÈS sinceSha (si fourni)
    let commits = data.map((c) => ({
      sha: c.sha,
      short_sha: c.sha.slice(0, 7),
      message: c.commit.message,
      title: c.commit.message.split('\n')[0],
      author: c.commit.author?.name,
      date: c.commit.author?.date,
      url: c.html_url,
    }));

    if (sinceSha) {
      const idx = commits.findIndex((c) => c.sha === sinceSha);
      if (idx >= 0) {
        commits = commits.slice(0, idx); // garde uniquement les commits PLUS RÉCENTS
      }
      // Si sinceSha pas trouvé dans les 50 derniers : le retourne tout (peut-être 1er run ou gap important)
    }

    return { ok: true, commits };
  } catch (err) {
    return { ok: false, error: err.message };
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
