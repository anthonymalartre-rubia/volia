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
import { enrichDecisionMaker } from '@/lib/decision-maker-core';
import { isEmailDeliverable } from '@/lib/email-verify';
import { inferIcp } from '@/lib/one/icp';
import { draftEmail } from '@/lib/one/draft';

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// TLD "normaux" pour lesquels un guess contact@domaine est plausible. Exclut les
// brand-gTLD bizarres (ex. e.leclerc → TLD "leclerc") qui donnaient des emails faux.
const GUESS_TLDS = new Set([
  'fr', 'com', 'net', 'org', 'eu', 'info', 'biz', 'io', 'co',
  're', 'mq', 'gp', 'gf', 'yt', 'pm', 'nc', 'pf', 'wf',
  'be', 'ch', 'lu', 'paris',
]);

function guessEmail(siteWeb) {
  const h = hostOf(siteWeb);
  if (!h || !h.includes('.')) return { email: '', method: 'none' };
  const tld = h.split('.').pop().toLowerCase();
  if (!GUESS_TLDS.has(tld)) return { email: '', method: 'none' };
  return { email: `contact@${h}`, method: 'guess' };
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

// Boîtes qui atteignent un décideur (leadership) vs réception générique.
const DM_INBOXES = new Set([
  'direction', 'gerance', 'gerant', 'dirigeant', 'presidence', 'pdg', 'ceo', 'president',
]);
const GENERIC_INBOXES = new Set([
  'contact', 'info', 'hello', 'bonjour', 'accueil', 'sav', 'support', 'service',
  'commercial', 'communication', 'marketing', 'rdv', 'devis', 'clients', 'client',
  'secretariat', 'administration', 'contactez', 'noreply', 'no-reply',
]);
function localPart(email) {
  return String(email || '').split('@')[0].toLowerCase();
}

function fitScore(l) {
  let s = 0;
  // Décideur vérifié (email nominatif zéro-bounce) = le meilleur contact possible.
  if (l.email && l.method === 'decision_maker') s += 60;
  else if (l.email && l.method === 'scrape') s += 50;
  else if (l.email && l.method === 'serper') s += 40;
  else if (l.email) s += 15;
  // Bonus "décideur" : on remonte les boîtes de direction et les emails
  // nominatifs (prenom.nom@) au-dessus des contact@/info@ génériques.
  if (l.email) {
    const lp = localPart(l.email);
    if (DM_INBOXES.has(lp)) s += 14;
    else if (/^[a-zà-ÿ]+[.\-][a-zà-ÿ]+/.test(lp) && !GENERIC_INBOXES.has(lp)) s += 12;
    else if (!GENERIC_INBOXES.has(lp)) s += 4;
  }
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
  const {
    enrichLimit = 12,
    draftLimit = 5,
    maxResults = 20,
    // Découverte décideur (Serper LinkedIn + email vérifié zéro-bounce). COÛTEUX
    // (1 Serper + jusqu'à 2 vérifs / lead) → réservé aux appels connectés (cf.
    // /api/one/run), jamais sur le chemin anonyme gratuit.
    findDecisionMakers = false,
    dmRole = 'direction',
  } = opts;

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
  // dédup par place_id + garde ceux avec site web, puis ÉQUILIBRE par cible
  // (round-robin entre les termes) pour ne pas que le 1er terme mange tout le quota.
  const seen = new Set();
  const perTermWithSite = perTerm.map((arr) =>
    arr.filter((c) => {
      if (!c.place_id || !c.site_web || seen.has(c.place_id)) return false;
      seen.add(c.place_id);
      return true;
    })
  );
  const withSite = [];
  for (let row = 0; withSite.length < enrichLimit; row++) {
    let addedThisRow = false;
    for (const arr of perTermWithSite) {
      if (arr[row]) {
        withSite.push(arr[row]);
        addedThisRow = true;
        if (withSite.length >= enrichLimit) break;
      }
    }
    if (!addedThisRow) break;
  }

  // ③ Enrichissement email (parallèle ; réutilise la waterfall prod)
  await Promise.allSettled(
    withSite.map(async (c) => {
      try {
        const r = await enrichWaterfall(c.nom, c.site_web);
        if (r?.email) {
          c.email = r.email;
          c.method = r.method;
        } else {
          Object.assign(c, guessEmail(c.site_web));
        }
      } catch {
        Object.assign(c, guessEmail(c.site_web));
      }

      // ③bis Upgrade décideur (connectés uniquement) : si on trouve un décideur
      // nominatif avec email VÉRIFIÉ (zéro-bounce), il remplace l'email générique.
      // Best-effort : en cas d'échec, on garde l'email normal trouvé ci-dessus.
      if (findDecisionMakers) {
        const host = hostOf(c.site_web);
        if (host) {
          try {
            const dm = await enrichDecisionMaker({
              companyName: c.nom,
              domain: host,
              role: dmRole,
              verifyEmail: isEmailDeliverable,
              maxToVerify: 2,
            });
            if (dm?.email) {
              c.email = dm.email;
              c.method = 'decision_maker';
              c.contact_name = dm.fullName;
              c.contact_role = dm.title || dm.role;
              c.linkedin = dm.linkedinUrl || null;
            }
          } catch {
            /* best-effort : on conserve l'email normal */
          }
        }
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
    email_verified: ranked.filter(
      (l) => l.method === 'scrape' || l.method === 'serper' || l.method === 'decision_maker'
    ).length,
    email_guessed: ranked.filter((l) => l.method === 'guess').length,
    with_phone: ranked.filter((l) => l.telephone).length,
    decision_makers: ranked.filter((l) => l.method === 'decision_maker').length,
  };

  return { icp, leads: ranked, counts };
}
