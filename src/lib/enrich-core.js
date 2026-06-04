// ─────────────────────────────────────────────────────────────────────
// src/lib/enrich-core.js — Cœur d'enrichissement email réutilisable (serveur)
// ─────────────────────────────────────────────────────────────────────
// Logique identique à /api/enrich (scraping site + chemins communs + scoring).
// Extraite ici pour être appelée par le cron d'enrichissement en arrière-plan
// (/api/cron/process-enrichment) SANS dépendre d'un appel HTTP ni de l'auth.
// /api/enrich garde sa propre copie pour ne pas risquer le flux client en cours.
// ─────────────────────────────────────────────────────────────────────

import { PERSONAL_DOMAINS } from '@/lib/constants';

const BLOCKED_DOMAINS = [
  'example.com', 'sentry.io', 'wixpress.com', 'googleapis.com', 'schema.org',
  'w3.org', 'gravatar.com', 'wordpress.org', 'cloudflare.com', 'google.com',
  'gstatic.com', 'facebook.com', 'twitter.com', 'placeholder.com', 'email.com',
  'domain.com', 'yoursite.com', 'test.com', 'sample.com',
];

const BLOCKED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js', '.json',
  '.xml', '.pdf', '.doc', '.docx', '.xlsx', '.zip',
];

const EMAIL_REGEX = /(?<![/\w])[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const COMMON_PATHS = ['/contact', '/contactez-nous', '/nous-contacter', '/mentions-legales'];

function extractEmailsFromHtml(html) {
  const emails = new Set();
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) emails.add(match[1].toLowerCase());
  const matches = html.matchAll(EMAIL_REGEX);
  for (const m of matches) emails.add(m[0].toLowerCase());
  const obfuscatedRegex = /([a-zA-Z0-9._%+\-]+)\s*[\[\(\{](at|dot)[\]\)\}]\s*([a-zA-Z0-9.\-]+\s*[\[\(\{](com|fr|eu)[\]\)\}])/gi;
  while ((match = obfuscatedRegex.exec(html)) !== null) {
    const localPart = match[1];
    const domain = match[3].replace(/\s*[\[\(\{]|\s*[\]\)\}]/g, '');
    const tld = match[4];
    emails.add(`${localPart}@${domain}.${tld}`.toLowerCase());
  }
  return Array.from(emails);
}

function isValidEmail(email, filterPersonal = true) {
  if (!email) return false;
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return false;
  if (BLOCKED_DOMAINS.includes(domain.toLowerCase())) return false;
  if (filterPersonal && PERSONAL_DOMAINS.has(domain.toLowerCase())) return false;
  if (BLOCKED_EXTENSIONS.some((ext) => localPart.toLowerCase().endsWith(ext))) return false;
  if (localPart.toLowerCase().includes('noreply') || localPart.toLowerCase().includes('mailer-daemon')) return false;
  return true;
}

function scoreEmail(email, domain, filterPersonal = true) {
  if (!email) return 0;
  const [localPart, emailDomain] = email.split('@');
  if (!localPart || !emailDomain) return 0;
  let score = 0;
  const domainMatches = emailDomain.toLowerCase().includes(domain.toLowerCase()) ||
    domain.toLowerCase().includes(emailDomain.toLowerCase().replace(/^www\./, ''));
  if (domainMatches) score += 200; else score -= 100;
  const contactPrefixes = ['contact', 'info', 'support', 'hello', 'business', 'accueil', 'reception'];
  if (contactPrefixes.some((prefix) => localPart.toLowerCase().startsWith(prefix))) score += 50;
  if (filterPersonal && PERSONAL_DOMAINS.has(emailDomain.toLowerCase())) return -Infinity;
  return score;
}

async function fetchUrl(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
}

/**
 * Trouve le meilleur email pro pour une URL. Retourne { email, method } où
 * method ∈ 'scrape' | 'guess' | ''. Pur (pas d'auth, pas de quota).
 */
export async function enrichEmail(url, filterPersonal = true) {
  const domain = extractDomain(url);
  if (!domain) return { email: '', method: '' };

  let html = await fetchUrl(url);
  let emails = html ? extractEmailsFromHtml(html) : [];
  let validEmails = emails.filter((e) => isValidEmail(e, filterPersonal));

  if (validEmails.length === 0) {
    const pathUrls = COMMON_PATHS.map((path) =>
      url.endsWith('/') ? `${url}${path.slice(1)}` : `${url}${path}`
    );
    const results = await Promise.allSettled(pathUrls.map((u) => fetchUrl(u)));
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        emails = extractEmailsFromHtml(result.value);
        validEmails = emails.filter((e) => isValidEmail(e, filterPersonal));
        if (validEmails.length > 0) break;
      }
    }
  }

  if (validEmails.length > 0) {
    const scored = validEmails.map((email) => ({ email, score: scoreEmail(email, domain, filterPersonal) }));
    scored.sort((a, b) => b.score - a.score);
    if (scored[0].score > 0) return { email: scored[0].email, method: 'scrape' };
  }

  return { email: `contact@${domain}`, method: 'guess' };
}
