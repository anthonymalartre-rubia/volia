// ─────────────────────────────────────────────────────────────────────
// src/lib/attribution.js — Attribution marketing first-touch (pure, client+serveur)
// ─────────────────────────────────────────────────────────────────────
// Classe un visiteur en canal (linkedin-ads / linkedin / seo / referral / direct…)
// à partir des UTM + du referrer. Utilisé par AttributionTracker (client) et
// /api/attribution/capture (serveur, re-validation).
// ─────────────────────────────────────────────────────────────────────

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'qwant.', 'ecosia.', 'yahoo.', 'yandex.', 'baidu.', 'search.brave'];

/**
 * Dérive un canal lisible depuis l'attribution brute.
 * Priorité : UTM explicite > referrer connu > direct.
 */
export function classifyChannel({ utm_source = '', utm_medium = '', referrer = '' } = {}) {
  const s = String(utm_source || '').toLowerCase();
  const m = String(utm_medium || '').toLowerCase();
  const r = String(referrer || '').toLowerCase();
  const isPaid = /paid|cpc|ppc|\bads?\b|sponsored|display/.test(m) || /ads?$/.test(s);

  // LinkedIn (UTM ou referrer)
  if (s.includes('linkedin') || r.includes('linkedin') || r.includes('lnkd.in')) {
    return isPaid ? 'linkedin-ads' : 'linkedin';
  }
  // Source UTM explicite (twitter, newsletter, producthunt, etc.)
  if (s) return isPaid ? `${s}-ads` : s;
  // Moteurs de recherche → SEO
  if (SEARCH_ENGINES.some((e) => r.includes(e))) return 'seo';
  // Autre referrer → referral:<domaine>
  if (r) {
    try {
      const host = new URL(r.startsWith('http') ? r : `https://${r}`).hostname.replace(/^www\./, '');
      return host ? `referral:${host}` : 'referral';
    } catch {
      return 'referral';
    }
  }
  return 'direct';
}

const MAX = 300;
const clip = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, MAX) : undefined);

/**
 * Nettoie/valide une attribution reçue du client (anti-injection, longueurs),
 * et recalcule le canal côté serveur (ne jamais faire confiance au client).
 */
export function sanitizeAttribution(raw = {}) {
  const out = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer', 'landing_path', 'captured_at']) {
    const v = clip(raw[k]);
    if (v) out[k] = v;
  }
  if (Object.keys(out).length === 0) return null;
  out.channel = classifyChannel(out);
  return out;
}
