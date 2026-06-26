// ─────────────────────────────────────────────────────────────────────
// scripts/one-phase0.mjs — Volia One, Phase 0 (preuve, backend pur)
// ─────────────────────────────────────────────────────────────────────
// But : prouver que « domaine → ICP → 20 leads FR (email/tél) → email perso »
// fonctionne, AVANT d'investir dans l'UI.
//
// Reproduit fidèlement les appels prod :
//   - Google Places searchText  (cf. api/places/route.js + lib/constants FIELD_MASK)
//   - Scraping email + scoring   (cf. api/enrich/route.js)
//   - Claude Sonnet 4.6          (cf. parse-search + autopilot/claude-writer)
//
// Usage : node scripts/one-phase0.mjs <domaine>
//   ex : node scripts/one-phase0.mjs staenk.com
//
// Lit les clés depuis .env.local (jamais affichées). Aucune écriture DB.
// ─────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── .env.local loader (valeurs jamais loggées) ───────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(m[1] in process.env)) process.env[m[1]] = val;
    }
  } catch {
    console.warn('⚠️  .env.local introuvable — on compte sur les env vars du shell.');
  }
}
loadEnv();

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SERPER_KEY = process.env.SERPER_API_KEY;

// Compteurs de coût (proxy unit economics)
const cost = { places: 0, scrapeFetch: 0, serper: 0, claude: 0 };

// ─── Constantes calquées sur la prod ──────────────────────────────────
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount';

const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'hotmail.com', 'hotmail.fr', 'yahoo.com', 'yahoo.fr', 'outlook.com',
  'outlook.fr', 'live.fr', 'live.com', 'free.fr', 'orange.fr', 'wanadoo.fr',
  'sfr.fr', 'laposte.net', 'icloud.com', 'me.com', 'aol.com', 'gmx.fr', 'bbox.fr',
]);
const BLOCKED_DOMAINS = new Set([
  'example.com', 'sentry.io', 'wixpress.com', 'googleapis.com', 'schema.org',
  'w3.org', 'gravatar.com', 'wordpress.org', 'cloudflare.com', 'google.com',
  'gstatic.com', 'facebook.com', 'twitter.com', 'placeholder.com', 'email.com',
  'domain.com', 'yoursite.com', 'test.com', 'sample.com', 'sentry-next.wixpress.com',
]);
const BLOCKED_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js', '.json', '.xml', '.pdf'];
const EMAIL_REGEX = /(?<![/\w])[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const COMMON_PATHS = ['/contact', '/contactez-nous', '/nous-contacter', '/mentions-legales', '/a-propos'];

// ─── Helpers HTTP ─────────────────────────────────────────────────────
async function fetchUrl(url, timeout = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    cost.scrapeFetch++;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);
}

// ─── Claude (REST, calqué sur parse-search / claude-writer) ───────────
async function claude(system, user, maxTokens = 700) {
  cost.claude++;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ─── Étape A : domaine → ICP (scrape du site client + Claude) ─────────
async function inferIcp(domain) {
  const home = (await fetchUrl(`https://${domain}`)) || (await fetchUrl(`http://${domain}`));
  let siteText = home ? htmlToText(home) : '';
  if (siteText.length < 300) {
    const about = await fetchUrl(`https://${domain}/a-propos`);
    if (about) siteText += ' ' + htmlToText(about);
  }
  if (!siteText) {
    throw new Error(`Impossible de scraper https://${domain} (site injoignable ?)`);
  }

  const system = `Tu es un expert en prospection B2B en France. À partir du texte du site d'une entreprise, tu déduis son ICP (à qui elle peut vendre) pour préparer du cold outreach. Réponds UNIQUEMENT en JSON valide, sans aucune explication.`;
  const user = `Voici le texte du site de l'entreprise (domaine ${domain}) :
"""${siteText}"""

Déduis :
- "activite" : ce que vend l'entreprise, 1 phrase
- "value_prop" : sa proposition de valeur, 1 phrase orientée bénéfice client
- "ton" : "chaleureux" | "professionnel" | "direct"
- "ville" : la ville française où elle est basée (déduis-la ; sinon "Paris")
- "cibles" : 2 à 4 types de clients B2B concrets qu'elle pourrait démarcher (ex: "restaurant", "garage automobile", "cabinet dentaire", "agence immobilière")
- "places_terms" : 2 à 4 termes de recherche Google Places (en France) pour TROUVER ces clients potentiels près de sa ville. Termes courts type métier/établissement.

JSON attendu :
{"activite":"...","value_prop":"...","ton":"...","ville":"...","cibles":["..."],"places_terms":["..."]}`;

  const raw = await claude(system, user, 500);
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('ICP : pas de JSON dans la réponse Claude');
  return JSON.parse(m[0]);
}

// ─── Étape B : Places searchText (calqué sur api/places) ──────────────
async function searchPlaces(term, ville) {
  cost.places++;
  const res = await fetch(PLACES_API_URL, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textQuery: `${term} ${ville}`, maxResultCount: 20 }),
  });
  if (!res.ok) {
    console.warn(`  ⚠️  Places "${term} ${ville}" → ${res.status}`);
    return [];
  }
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
}

// ─── Étape C : scrape email + scoring (calqué sur api/enrich) ─────────
function extractEmails(html) {
  const out = new Set();
  let m;
  const mailto = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  while ((m = mailto.exec(html)) !== null) out.add(m[1].toLowerCase());
  for (const x of html.matchAll(EMAIL_REGEX)) out.add(x[0].toLowerCase());
  return [...out];
}
function isValidEmail(email) {
  const [lp, dom] = email.split('@');
  if (!lp || !dom) return false;
  const d = dom.toLowerCase();
  if (PERSONAL_DOMAINS.has(d)) return false;
  // Blocage par suffixe (attrape les sous-domaines : sentry.wixpress.com, etc.)
  if ([...BLOCKED_DOMAINS].some((b) => d === b || d.endsWith('.' + b))) return false;
  if (/sentry|wixpress|cloudflare|\.wix\.|sentry-next/.test(d)) return false;
  if (lp.length < 2) return false; // local-part trop court = bruit (ex: "e@")
  if (BLOCKED_EXT.some((e) => lp.toLowerCase().endsWith(e))) return false;
  if (lp.includes('noreply') || lp.includes('mailer-daemon') || lp.includes('wix')) return false;
  return true;
}
function scoreEmail(email, domain) {
  const [lp, ed] = email.split('@');
  let s = 0;
  const match = ed.toLowerCase().includes(domain) || domain.includes(ed.toLowerCase().replace(/^www\./, ''));
  s += match ? 200 : -100;
  if (['contact', 'info', 'hello', 'accueil', 'reception', 'bonjour'].some((p) => lp.startsWith(p))) s += 50;
  return s;
}
function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}
// Serper (Google search) — calqué sur enrich-waterfall serperEnrich()
async function serperEnrich(name, domain) {
  if (!SERPER_KEY || (!name && !domain)) return null;
  try {
    cost.serper++;
    const q = domain ? `"${name}" "${domain}" email contact @${domain}` : `"${name}" email contact professionnel`;
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': SERPER_KEY },
      body: JSON.stringify({ q, num: 10 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.organic || []).map((r) => `${r.title || ''} ${r.snippet || ''}`).join(' ');
    const found = [...new Set((text.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase()))].filter(isValidEmail);
    if (!found.length) return null;
    const domMatch = found.filter((e) => domain && e.split('@')[1].includes(domain));
    return domMatch[0] || found[0] || null;
  } catch { return null; }
}

async function enrichEmail(siteWeb, name) {
  const domain = domainOf(siteWeb);
  if (!domain) return { email: '', method: 'none' };
  let html = await fetchUrl(siteWeb);
  let valid = html ? extractEmails(html).filter(isValidEmail) : [];
  if (valid.length === 0) {
    const base = siteWeb.endsWith('/') ? siteWeb.slice(0, -1) : siteWeb;
    const results = await Promise.allSettled(COMMON_PATHS.map((p) => fetchUrl(base + p)));
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        valid = extractEmails(r.value).filter(isValidEmail);
        if (valid.length) break;
      }
    }
  }
  if (valid.length) {
    const scored = valid.map((e) => ({ e, s: scoreEmail(e, domain) })).sort((a, b) => b.s - a.s);
    if (scored[0].s > 0) return { email: scored[0].e, method: 'scrape' };
  }
  // Couche 2 — Serper (Google) si le scrape n'a rien donné de fiable
  const viaSerper = await serperEnrich(name, domain);
  if (viaSerper) return { email: viaSerper, method: 'serper' };
  return { email: `contact@${domain}`, method: 'guess' };
}

// ─── Étape D : fit-score + ranking ────────────────────────────────────
function fitScore(lead) {
  let s = 0;
  if (lead.email && lead.method === 'scrape') s += 50;       // email vérifié sur le site
  else if (lead.email && lead.method === 'serper') s += 40;   // email trouvé via Google
  else if (lead.email) s += 15;                               // email deviné
  if (lead.telephone) s += 15;                                // joignable tél
  if (lead.note) s += Math.min(20, lead.note * 4);           // qualité (note Google)
  if (lead.nb_avis) s += Math.min(15, Math.log10(lead.nb_avis + 1) * 8); // notoriété
  return Math.round(s);
}

// ─── Étape E : email perso (calqué sur claude-writer, garde-fous) ─────
async function draftEmail(lead, icp) {
  const system = `Tu écris UN cold email B2B en français, au nom d'une entreprise qui vend : "${icp.activite}" (proposition de valeur : "${icp.value_prop}").
RÈGLES (DGCCRF + délivrabilité) :
- Ton ${icp.ton}, naturel, humain — pas promotionnel.
- 70-120 mots, 3 paragraphes courts : accroche perso → bénéfice concret → CTA léger (un échange de 15 min).
- Pas de "gratuit", "urgent", "cliquez ici", "garanti", pas de MAJUSCULES, pas de "!!!".
- Mentionne la base RGPD (intérêt légitime B2B) en 1 demi-phrase si CTA.
SORTIE : "Objet: ...\\n\\n" puis le corps. Pas de signature.`;
  const user = `Destinataire : ${lead.nom}${lead.adresse ? ' — ' + lead.adresse.split(',').slice(-2).join(',').trim() : ''}.
Type d'entreprise : un(e) ${lead.term || 'entreprise locale'}.
Écris l'email.`;
  try {
    return (await claude(system, user, 500)).trim();
  } catch (e) {
    return `(échec rédaction : ${e.message})`;
  }
}

// ─── Orchestrateur ────────────────────────────────────────────────────
async function buildFromDomain(domain, manualIcp) {
  const t0 = Date.now();
  console.log(`\n━━━ Volia One · Phase 0 ━━━  domaine = ${domain}\n`);

  let icp;
  if (manualIcp) {
    console.log('① ICP fourni à la main (Claude court-circuité — test moteur data)…');
    icp = manualIcp;
  } else {
    console.log('① Inférence ICP (scrape du site + Claude)…');
    icp = await inferIcp(domain);
  }
  console.log(`   Activité   : ${icp.activite}`);
  console.log(`   Value prop : ${icp.value_prop}`);
  console.log(`   Ville      : ${icp.ville}   ·   Ton : ${icp.ton}`);
  console.log(`   Cibles     : ${(icp.cibles || []).join(', ')}`);
  console.log(`   Termes     : ${(icp.places_terms || []).join(' | ')}\n`);

  console.log('② Recherche Google Places…');
  const terms = (icp.places_terms || []).slice(0, 3);
  let candidates = [];
  for (const term of terms) {
    const found = await searchPlaces(term, icp.ville);
    found.forEach((f) => (f.term = term));
    candidates.push(...found);
  }
  // dedupe par place_id, garde ceux avec site web (pour scraper l'email)
  const seen = new Set();
  candidates = candidates.filter((c) => {
    if (!c.place_id || seen.has(c.place_id)) return false;
    seen.add(c.place_id);
    return true;
  });
  const withSite = candidates.filter((c) => c.site_web).slice(0, 14);
  console.log(`   ${candidates.length} candidats (${withSite.length} avec site web → enrichissables)\n`);

  console.log(`③ Enrichissement email (scrape${SERPER_KEY ? ' + Serper' : ''})…`);
  for (const c of withSite) {
    const { email, method } = await enrichEmail(c.site_web, c.nom);
    c.email = email;
    c.method = method;
  }

  console.log('④ Scoring de fit + ranking…');
  const ranked = withSite
    .map((c) => ({ ...c, fit: fitScore(c) }))
    .sort((a, b) => b.fit - a.fit);
  const top = ranked.slice(0, 8);

  if (manualIcp) {
    console.log('⑤ Rédaction des emails — SAUTÉE (clé Claude locale invalide ; testée séparément).\n');
  } else {
    console.log('⑤ Rédaction des emails (top 2)…\n');
    for (let i = 0; i < Math.min(2, top.length); i++) {
      top[i].draft = await draftEmail(top[i], icp);
    }
  }

  // ─── Rapport ───
  const nScrape = ranked.filter((l) => l.method === 'scrape').length;
  const nSerper = ranked.filter((l) => l.method === 'serper').length;
  const nGuess = ranked.filter((l) => l.method === 'guess').length;
  console.log('═══════════════════ RÉSULTAT ═══════════════════\n');
  console.log(`Leads trouvés        : ${ranked.length}`);
  console.log(`Email vérifié (site) : ${nScrape}   ·   trouvé (Google) : ${nSerper}   ·   deviné : ${nGuess}`);
  console.log(`→ Email "fiable" (site+Google) : ${nScrape + nSerper}/${ranked.length} (${Math.round(((nScrape + nSerper) / ranked.length) * 100)}%)`);
  console.log(`Avec téléphone       : ${ranked.filter((l) => l.telephone).length}\n`);

  console.log('TOP LEADS :');
  console.log('fit | entreprise (ville) | tél | email [méthode]');
  for (const l of top) {
    const ville = (l.adresse.match(/\d{5}\s+([^,]+)/) || [])[1] || '';
    console.log(
      `${String(l.fit).padStart(3)} | ${l.nom}${ville ? ' (' + ville.trim() + ')' : ''} | ${l.telephone || '—'} | ${l.email || '—'} [${l.method}]`
    );
  }

  if (!manualIcp) {
    console.log('\n─── BROUILLONS D\'EMAILS (échantillon) ───');
    for (let i = 0; i < Math.min(2, top.length); i++) {
      console.log(`\n▼ Pour ${top[i].nom} :\n${top[i].draft}\n`);
    }
  }

  console.log('═════════════════════ COÛT ═════════════════════');
  console.log(`Appels Places : ${cost.places}  ·  fetch scraping : ${cost.scrapeFetch}  ·  appels Claude : ${cost.claude}`);
  console.log(`Durée : ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log('Note : enrichissement = scrape seul (pas de Serper/Apollo → coverage plancher).\n');
}

// ─── Entrée ───────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const domain = (argv[0] || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
function argVal(name) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; }

// Mode « ICP fourni » : court-circuite Claude pour tester le moteur data seul.
const villeArg = argVal('--ville');
const termsArg = argVal('--terms');
let manualIcp = null;
if (villeArg && termsArg) {
  const terms = termsArg.split(',').map((s) => s.trim()).filter(Boolean);
  manualIcp = {
    activite: '(fourni manuellement)',
    value_prop: 'un service utile aux entreprises locales',
    ton: 'professionnel',
    ville: villeArg,
    cibles: terms,
    places_terms: terms,
  };
}

if (!domain) {
  console.error('Usage : node scripts/one-phase0.mjs <domaine> [--ville "Nantes" --terms "restaurant,garage automobile"]');
  process.exit(1);
}
if (!PLACES_KEY) { console.error('❌ GOOGLE_PLACES_API_KEY manquante (.env.local)'); process.exit(1); }
if (!manualIcp && !ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY manquante (.env.local)'); process.exit(1); }

buildFromDomain(domain, manualIcp).catch((e) => {
  console.error('\n❌ Erreur :', e.message);
  process.exit(1);
});
