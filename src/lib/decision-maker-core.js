// ─────────────────────────────────────────────────────────────────────
// decision-maker-core.js — Moteur de recherche de décideur (Business+)
// ─────────────────────────────────────────────────────────────────────
// Surcouche d'enrichissement : à partir d'un domaine + nom de boîte + rôle,
// trouve un décideur nominatif (Serper LinkedIn /in/), dérive l'email pro par
// pattern, et ne renvoie QUE des emails VÉRIFIÉS (zéro-bounce) — la vérif est
// injectée (verifyEmail) pour ne pas coupler ce module à la route de vérif.
//
// PUR & autonome : pas de Supabase, pas de cascade. Se câble plus tard dans
// la cascade (cf. docs/scope-enrichissement-decideur.md, Étape B).
//
// Rôles supportés : direction | marketing | commercial | rse | rh
// Décisions produit (2026-06) : 5 rôles, vérifiés uniquement, Serper seul.
// ─────────────────────────────────────────────────────────────────────

import { PERSONAL_DOMAINS } from '@/lib/constants';

// Mots-clés LinkedIn par rôle (FR + EN). Sert à cibler la recherche Serper.
export const ROLE_KEYWORDS = {
  direction: ['CEO', 'Fondateur', 'Co-fondateur', 'Gérant', 'Président', 'Directeur général', 'Dirigeant'],
  marketing: ['CMO', 'Directeur marketing', 'Responsable marketing', 'Head of Marketing', 'Growth'],
  commercial: ['Directeur commercial', 'Head of Sales', 'Responsable commercial', 'Business Developer', 'Sales'],
  rse: ['RSE', 'Responsable RSE', 'Développement durable', 'Sustainability', 'QSE'],
  rh: ['DRH', 'Directeur des ressources humaines', 'Responsable RH', 'People', 'Talent'],
};

export const SUPPORTED_ROLES = Object.keys(ROLE_KEYWORDS);

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Retire accents + caractères non alphanumériques pour construire un local-part propre.
function slugifyName(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // accents → base
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * Dérive les emails candidats les plus probables pour une personne sur un domaine.
 * Ordre = probabilité décroissante (B2B FR/EU).
 * @returns {string[]} ex ['jean.dupont@acme.fr', 'jdupont@acme.fr', ...]
 */
export function deriveEmailPatterns(firstName, lastName, domain) {
  const f = slugifyName(firstName);
  const l = slugifyName(lastName);
  const d = String(domain || '').toLowerCase().replace(/^www\./, '').trim();
  if (!d || (!f && !l)) return [];
  const fi = f ? f[0] : '';
  const li = l ? l[0] : '';
  const cands = [];
  if (f && l) {
    cands.push(`${f}.${l}`, `${fi}${l}`, `${f}${l}`, `${f}-${l}`, `${f}_${l}`, `${l}.${f}`, `${f}.${li}`);
  }
  if (f) cands.push(f);
  if (l) cands.push(l);
  // Uniques, en emails complets
  return [...new Set(cands)].filter(Boolean).map((lp) => `${lp}@${d}`);
}

/**
 * Parse "Prénom Nom - Titre - Entreprise | LinkedIn" depuis un résultat Serper.
 * Heuristique simple : le titre LinkedIn commence souvent par "Prénom Nom".
 */
function parsePersonFromResult(r) {
  const title = (r.title || '').replace(/\s*\|\s*LinkedIn\s*$/i, '').trim();
  // Format fréquent : "Prénom Nom - Poste - Boîte"
  const namePart = title.split(/[-–|·]/)[0].trim();
  const tokens = namePart.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return null;
  const firstName = tokens[0];
  const lastName = tokens[tokens.length - 1];
  // Filtre anti-bruit (évite "Profils", "Découvrez", etc.)
  if (firstName.length < 2 || lastName.length < 2) return null;
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    title: title,
    linkedinUrl: r.link || null,
  };
}

/**
 * Cherche un décideur via Serper (LinkedIn /in/). PUR (clé passée en param).
 * @returns {Promise<{firstName,lastName,fullName,title,linkedinUrl}|null>}
 */
export async function findDecisionMakerCandidate({ companyName, domain, role, apiKey, trackApiCall }) {
  const key = apiKey || process.env.SERPER_API_KEY;
  if (!key) return null;
  const kws = ROLE_KEYWORDS[role];
  if (!kws || (!companyName && !domain)) return null;
  const roleClause = `(${kws.map((k) => `"${k}"`).join(' OR ')})`;
  const company = companyName || domain;
  const q = `site:linkedin.com/in ${roleClause} "${company}"`;
  try {
    const res = await fetchWithTimeout('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
      body: JSON.stringify({ q, num: 10, gl: 'fr', hl: 'fr' }),
    });
    if (typeof trackApiCall === 'function') { try { trackApiCall('serper', null, 'search/decision-maker'); } catch { /* */ } }
    if (!res.ok) return null;
    const data = await res.json();
    for (const r of (data.organic || [])) {
      if (!/linkedin\.com\/in\//i.test(r.link || '')) continue;
      const person = parsePersonFromResult(r);
      if (person) return person;
    }
  } catch { /* best-effort */ }
  return null;
}

/**
 * Pipeline décideur complet : trouve la personne → dérive emails → vérifie.
 * Ne renvoie QUE des emails vérifiés (zéro-bounce). `verifyEmail` est injectée
 * (async (email) => boolean) pour découpler de la route de vérif.
 *
 * @returns {Promise<{email,method:'decision_maker',role,fullName,title,linkedinUrl,confidence}|null>}
 */
export async function enrichDecisionMaker({ companyName, domain, role, verifyEmail, apiKey, trackApiCall, maxToVerify = 3 }) {
  const d = String(domain || '').toLowerCase().replace(/^www\./, '').trim();
  if (!d || PERSONAL_DOMAINS.has(d)) return null; // pas de décideur sur un domaine perso
  if (!SUPPORTED_ROLES.includes(role)) return null;

  const person = await findDecisionMakerCandidate({ companyName, domain: d, role, apiKey, trackApiCall });
  if (!person) return null;

  const candidates = deriveEmailPatterns(person.firstName, person.lastName, d).slice(0, maxToVerify);
  if (typeof verifyEmail !== 'function') return null; // politique zéro-bounce : vérif obligatoire

  for (let i = 0; i < candidates.length; i++) {
    const email = candidates[i];
    let ok = false;
    try { ok = await verifyEmail(email); } catch { ok = false; }
    if (ok) {
      return {
        email,
        method: 'decision_maker',
        role,
        fullName: person.fullName,
        title: person.title,
        linkedinUrl: person.linkedinUrl,
        confidence: Math.max(50, 95 - i * 15), // 1er pattern vérifié = + confiant
      };
    }
  }
  return null; // personne trouvée mais aucun email vérifié → on ne sert rien (zéro-bounce)
}
