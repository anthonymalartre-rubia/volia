// ─────────────────────────────────────────────────────────────────────
// src/lib/fireflies.js — client minimal de l'API Fireflies (GraphQL).
// ─────────────────────────────────────────────────────────────────────
// Sert à importer automatiquement les transcripts d'appel dans Volia (au lieu
// du collage manuel) → alimente le résumé d'appel CRM (/api/crm/summarize-call).
// Auth : Bearer <apiKey> (clé perso du user, stockée chiffrée-au-repos par
// Supabase, lisible par lui seul via RLS).
// ─────────────────────────────────────────────────────────────────────

const FIREFLIES_GQL = 'https://api.fireflies.ai/graphql';

async function gql(apiKey, query, variables = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(FIREFLIES_GQL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    clearTimeout(t);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.errors) {
      const msg = json?.errors?.[0]?.message || `HTTP ${res.status}`;
      return { ok: false, error: msg, status: res.status };
    }
    return { ok: true, data: json.data };
  } catch (err) {
    clearTimeout(t);
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
}

/** Valide une clé API (requête légère). */
export async function validateFirefliesKey(apiKey) {
  const r = await gql(apiKey, `query { transcripts(limit: 1) { id } }`);
  return r.ok;
}

/** Liste les transcripts récents. */
export async function listRecentTranscripts(apiKey, limit = 15) {
  const r = await gql(apiKey, `query L($limit: Int) { transcripts(limit: $limit) { id title date } }`, { limit });
  if (!r.ok) return { ok: false, error: r.error };
  const items = (r.data?.transcripts || []).map((t) => ({
    id: t.id,
    title: t.title || 'Réunion sans titre',
    date: t.date || null,
  }));
  return { ok: true, items };
}

/** Récupère le texte complet d'un transcript (sentences → texte). */
export async function getTranscriptText(apiKey, id) {
  const r = await gql(
    apiKey,
    `query T($id: String!) { transcript(id: $id) { id title sentences { speaker_name text } } }`,
    { id }
  );
  if (!r.ok) return { ok: false, error: r.error };
  const t = r.data?.transcript;
  if (!t) return { ok: false, error: 'transcript_not_found' };
  const lines = (t.sentences || [])
    .map((s) => (s.speaker_name ? `${s.speaker_name}: ${s.text}` : s.text))
    .filter(Boolean);
  return { ok: true, title: t.title || '', text: lines.join('\n').slice(0, 12000) };
}
