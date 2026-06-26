// ─────────────────────────────────────────────────────────────────────
// lib/one/build.js — Volia One : orchestrateur "domaine → leads + emails"
// ─────────────────────────────────────────────────────────────────────
// Chaîne des briques EXISTANTES + le cerveau ICP :
//   inferIcp (nouveau) → Places searchText → enrichWaterfall (core, réutilisé)
//   → fit-score → draftEmail (nouveau, au nom du client)
// Enrichissement + rédaction parallélisés (tenir dans la limite Vercel).
// ─────────────────────────────────────────────────────────────────────

import { PLACES_API_URL, FIELD_MASK } from '@/lib/constants';
import { enrichWaterfall } from '@/lib/enrich-waterfall-core';
import { inferIcp } from '@/lib/one/icp';
import { draftEmail } from '@/lib/one/draft';

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

async function placesSearch(query) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(PLACES_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.places || []).map((p) => ({
      place_id: p.id || '',
      nom: p.displayName?.text || '',
      adresse: p.formattedAddress || '',
      telephone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
      site_web: p.websiteUri || '',
      note: p.rating || null,
      nb_avis: p.userRatingCount || 0,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

function fitScore(l) {
  let s = 0;
  if (l.email && l.method === 'scrape') s += 50;
  else if (l.email && l.method === 'serper') s += 40;
  else if (l.email) s += 15;
  if (l.telephone) s += 15;
  if (l.note) s += Math.min(20, l.note * 4);
  if (l.nb_avis) s += Math.min(15, Math.log10(l.nb_avis + 1) * 8);
  return Math.round(s);
}

/**
 * @param {string} domain  domaine du client (sa boîte)
 * @param {object} [opts]  { enrichLimit=12, draftLimit=5, maxResults=20 }
 * @returns {Promise<{icp, leads:Array}>}
 */
export async function buildFromDomain(domain, opts = {}) {
  const { enrichLimit = 12, draftLimit = 5, maxResults = 20 } = opts;

  // ① ICP
  const icp = await inferIcp(domain);

  // ② Recherche Places (1 appel / terme, cap 3 termes)
  const terms = (icp.places_terms || []).slice(0, 3);
  const perTerm = await Promise.all(
    terms.map(async (term) => {
      const found = await placesSearch(`${term} ${icp.ville}`);
      found.forEach((f) => (f.term = term));
      return found;
    })
  );
  // dédup par place_id, garde ceux avec site web (enrichissables)
  const seen = new Set();
  const candidates = perTerm.flat().filter((c) => {
    if (!c.place_id || seen.has(c.place_id)) return false;
    seen.add(c.place_id);
    return true;
  });
  const withSite = candidates.filter((c) => c.site_web).slice(0, enrichLimit);

  // ③ Enrichissement email (parallèle ; réutilise la waterfall prod)
  await Promise.allSettled(
    withSite.map(async (c) => {
      try {
        const r = await enrichWaterfall(c.nom, c.site_web);
        if (r?.email) {
          c.email = r.email;
          c.method = r.method;
        } else {
          const h = hostOf(c.site_web);
          c.email = h ? `contact@${h}` : '';
          c.method = h ? 'guess' : 'none';
        }
      } catch {
        const h = hostOf(c.site_web);
        c.email = h ? `contact@${h}` : '';
        c.method = h ? 'guess' : 'none';
      }
    })
  );

  // ④ Fit-score + ranking
  const ranked = withSite
    .map((c) => ({ ...c, fit: fitScore(c) }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, maxResults);

  // ⑤ Rédaction des emails (parallèle, top N)
  const toDraft = ranked.slice(0, draftLimit);
  await Promise.allSettled(
    toDraft.map(async (l) => {
      l.draft = await draftEmail(l, icp);
    })
  );

  const counts = {
    total: ranked.length,
    email_verified: ranked.filter((l) => l.method === 'scrape' || l.method === 'serper').length,
    email_guessed: ranked.filter((l) => l.method === 'guess').length,
    with_phone: ranked.filter((l) => l.telephone).length,
  };

  return { icp, leads: ranked, counts };
}
