// ─────────────────────────────────────────────────────────────────────
// enrich-waterfall-core.js — Cœur de la cascade waterfall, réutilisable serveur
// ─────────────────────────────────────────────────────────────────────
// Extrait de /api/enrich-waterfall pour être appelé par le cron d'enrichissement
// en arrière-plan (qui utilisait auparavant enrich-core = scrape + guess contact@).
//
// Ordre : scrape site (gratuit) → Serper.dev (Google, PAYANT). S'arrête au 1er
// email VÉRIFIÉ. PAS de fallback "guess" → on ne renvoie jamais contact@ deviné.
// Retour : { email, method } avec method ∈ 'scrape' | 'serper' | '' (rien trouvé).
// ─────────────────────────────────────────────────────────────────────

import { PERSONAL_DOMAINS } from '@/lib/constants';
import { trackApiCall } from '@/lib/apiCosts';

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function isPersonalEmail(email) {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return PERSONAL_DOMAINS.has(domain);
}

const EMAIL_REGEX = /(?<![/\w])[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const BLOCKED_DOMAINS = new Set([
  'example.com', 'sentry.io', 'wixpress.com', 'googleapis.com',
  'schema.org', 'w3.org', 'gravatar.com', 'wordpress.org',
  'cloudflare.com', 'google.com', 'gstatic.com', 'facebook.com',
  'twitter.com', 'placeholder.com', 'email.com', 'domain.com',
  'yoursite.com', 'test.com', 'sample.com',
]);
const COMMON_PATHS = [
  '/contact', '/contactez-nous', '/nous-contacter', '/mentions-legales',
  '/cgv', '/a-propos', '/equipe', '/politique-de-confidentialite',
];

function extractEmails(html) {
  const emails = new Set();
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) emails.add(match[1].toLowerCase());
  for (const m of html.matchAll(EMAIL_REGEX)) emails.add(m[0].toLowerCase());
  return Array.from(emails).filter((e) => {
    const [local, domain] = e.split('@');
    if (!local || !domain) return false;
    if (BLOCKED_DOMAINS.has(domain)) return false;
    if (PERSONAL_DOMAINS.has(domain)) return false;
    if (local.includes('noreply') || local.includes('mailer-daemon')) return false;
    if (/\.(png|jpg|jpeg|gif|css|js|svg|pdf)$/i.test(local)) return false;
    return true;
  });
}

function scoreEmail(email, domain) {
  const [local, emailDomain] = email.split('@');
  if (!local || !emailDomain) return 0;
  let score = 0;
  const domainMatches = emailDomain.toLowerCase().includes(domain.toLowerCase()) ||
    domain.toLowerCase().includes(emailDomain.toLowerCase().replace(/^www\./, ''));
  if (domainMatches) score += 200; else score -= 100;
  if (['contact', 'info', 'support', 'hello', 'business', 'accueil', 'reception'].some((p) => local.toLowerCase().startsWith(p))) score += 50;
  if (PERSONAL_DOMAINS.has(emailDomain.toLowerCase())) return -Infinity;
  return score;
}

async function fetchPage(url, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
  finally { clearTimeout(timeoutId); }
}

export function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
}

async function scrapeForEmail(url) {
  const domain = extractDomain(url);
  if (!domain) return null;

  let html = await fetchPage(url);
  let emails = html ? extractEmails(html) : [];

  if (emails.length === 0) {
    for (const path of COMMON_PATHS) {
      const pathUrl = url.replace(/\/+$/, '') + path;
      html = await fetchPage(pathUrl);
      if (html) {
        emails = extractEmails(html);
        if (emails.length > 0) break;
      }
    }
  }

  if (emails.length > 0) {
    const scored = emails.map((e) => ({ email: e, score: scoreEmail(e, domain) }));
    scored.sort((a, b) => b.score - a.score);
    if (scored[0].score > 0) return { email: scored[0].email, source: 'scrape' };
    const bestNonPersonal = scored.find((e) => e.score > -100 && !isPersonalEmail(e.email));
    if (bestNonPersonal) return { email: bestNonPersonal.email, source: 'scrape' };
  }
  return null;
}

async function serperEnrich(name, domain) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;
  try {
    if (!domain && !name) return null;
    const emailQuery = domain
      ? `"${name}" "${domain}" email contact @${domain}`
      : `"${name}" email contact professionnel`;
    const res = await fetchWithTimeout('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ q: emailQuery, num: 10 }),
    });
    trackApiCall('serper', null, 'search');
    if (!res.ok) return null;
    const data = await res.json();
    const allText = (data.organic || []).map((r) => `${r.title || ''} ${r.snippet || ''}`).join(' ');
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = [...new Set((allText.match(emailRegex) || []).map((e) => e.toLowerCase()))];
    const domainEmails = domain ? foundEmails.filter((e) => e.includes(domain)) : [];
    const bestEmail = domainEmails[0] || foundEmails.find((e) => {
      const emailDomain = e.split('@')[1];
      return !PERSONAL_DOMAINS.has(emailDomain) && emailDomain !== 'example.com';
    });
    if (bestEmail) return { email: bestEmail, source: 'serper' };
  } catch { /* serper best-effort */ }
  return null;
}

/**
 * Cascade waterfall : scrape (gratuit) → Serper (payant). Arrêt au 1er email.
 * Aucun guess. Retourne { email, method } ; method '' si rien trouvé.
 * @param {string} name  Nom de l'entreprise (pour la requête Serper)
 * @param {string} url   URL du site (validée en amont)
 */
export async function enrichWaterfall(name, url) {
  const domain = extractDomain(url);
  // 1) Scraping du site (gratuit)
  try {
    const s = await scrapeForEmail(url);
    if (s?.email) return { email: s.email, method: 'scrape' };
  } catch { /* continue */ }
  // 2) Serper.dev (Google — PAYANT, uniquement si le scrape échoue)
  try {
    const r = await serperEnrich(name, domain);
    if (r?.email) return { email: r.email, method: 'serper' };
  } catch { /* continue */ }
  return { email: '', method: '' };
}
