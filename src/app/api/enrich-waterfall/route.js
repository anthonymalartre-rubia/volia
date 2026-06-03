import { validateUrl } from '@/lib/url-validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { PERSONAL_DOMAINS } from '@/lib/constants';
import { trackApiCall } from '@/lib/apiCosts';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Client admin réutilisé via le singleton de lib/supabase-admin (P1 perf
// + immunité aux \n dans les env vars).
const getAdminSupabase = getSupabaseAdmin;

// ─── Timeout helper for external API calls ──────────────
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

// ─── Scraping (free) ────────────────────────────────────

// Look-behind négatif (?<![/\w]) pour éviter de matcher des chaînes comme
// /news/article@2024-01-01 dans des URLs (faux positifs P2 audit).
const EMAIL_REGEX = /(?<![/\w])[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const BLOCKED_DOMAINS = new Set([
  'example.com', 'sentry.io', 'wixpress.com', 'googleapis.com',
  'schema.org', 'w3.org', 'gravatar.com', 'wordpress.org',
  'cloudflare.com', 'google.com', 'gstatic.com', 'facebook.com',
  'twitter.com', 'placeholder.com', 'email.com', 'domain.com',
  'yoursite.com', 'test.com', 'sample.com',
]);
// Pages qui portent souvent un VRAI email (pas de guess → pas de bounce).
// Ordre = probabilité décroissante ; le scrape s'arrête au 1er hit.
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

  // Domain match is the most important signal
  const domainMatches = emailDomain.toLowerCase().includes(domain.toLowerCase()) ||
    domain.toLowerCase().includes(emailDomain.toLowerCase().replace(/^www\./, ''));

  if (domainMatches) {
    score += 200;
  } else {
    score -= 100; // Penalize emails from other domains (e.g. contact@pierreetvacances.com)
  }

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

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
}

async function scrapeForEmail(url) {
  const domain = extractDomain(url);
  if (!domain) return null;

  // Try homepage
  let html = await fetchPage(url);
  let emails = html ? extractEmails(html) : [];

  // Try common paths
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
    // Accept the best email if score > 0 (domain match),
    // or if it's a professional email found on the site (score >= -50)
    if (scored[0].score > 0) {
      return { email: scored[0].email, source: 'scrape' };
    }
    // Accept non-personal emails even without exact domain match
    // (e.g. hotel uses a different email domain than their website)
    const bestNonPersonal = scored.find(e => e.score > -100 && !isPersonalEmail(e.email));
    if (bestNonPersonal) {
      return { email: bestNonPersonal.email, source: 'scrape' };
    }
  }
  return null;
}

// ─── Serper.dev — email search + LinkedIn matching ──────

async function serperEnrich(name, domain) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  try {
    // Search for email addresses associated with the company
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

    // Extract emails from snippets and titles
    const allText = (data.organic || [])
      .map((r) => `${r.title || ''} ${r.snippet || ''}`)
      .join(' ');
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = [...new Set((allText.match(emailRegex) || []).map((e) => e.toLowerCase()))];

    // Filter: prefer emails matching the domain
    const domainEmails = foundEmails.filter((e) => e.includes(domain));
    const bestEmail = domainEmails[0] || foundEmails.find((e) => {
      const emailDomain = e.split('@')[1];
      return !PERSONAL_DOMAINS.has(emailDomain) && emailDomain !== 'example.com';
    });

    if (bestEmail) {
      return { email: bestEmail, source: 'serper' };
    }
  } catch {}
  return null;
}

async function serperLinkedinMatch(name, domain) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  try {
    const query = `site:linkedin.com/company "${name}" ${domain || ''}`.trim();
    const res = await fetchWithTimeout('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ q: query, num: 3 }),
    });
    trackApiCall('serper', null, 'search/linkedin');
    if (!res.ok) return null;
    const data = await res.json();
    const linkedinUrl = data.organic?.find((r) =>
      r.link?.includes('linkedin.com/company/')
    )?.link;
    return linkedinUrl || null;
  } catch { return null; }
}

// ─── Serper Domain Discovery ───────────────────────────
// For prospects without a website, discover their domain via Google search

const SKIP_DOMAINS = new Set([
  // Social media
  'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com',
  'tiktok.com', 'pinterest.com', 'x.com', 'threads.net',
  // Travel / booking
  'tripadvisor.com', 'tripadvisor.fr', 'booking.com', 'airbnb.com', 'airbnb.fr',
  'hotels.com', 'expedia.com', 'expedia.fr', 'hostelworld.com', 'trivago.com',
  'lafourchette.com', 'thefork.com', 'opentable.com',
  // Directories / aggregators
  'pagesjaunes.fr', 'societe.com', 'infogreffe.fr', 'verif.com', 'kompass.com',
  'mappy.com', 'yelp.com', 'yelp.fr', 'horaires.lefigaro.fr', 'linternaute.com',
  'cylex.fr', 'europages.fr', 'manageo.fr', 'score3.fr',
  // Platforms / marketplaces
  'google.com', 'google.fr', 'apple.com', 'maps.google.com',
  'wikipedia.org', 'wikidata.org', 'amazon.com', 'amazon.fr',
  'leboncoin.fr', 'indeed.fr', 'indeed.com', 'glassdoor.com',
  // Chain / franchise sites (not the business's own domain)
  'zenitude-hotel-residences.com', 'accor.com', 'ibis.com', 'novotel.com',
  'bestwestern.com', 'bestwestern.fr', 'marriott.com', 'hilton.com',
  'adopt.com', 'mcdonalds.fr', 'carrefour.fr', 'leclerc.com',
]);

async function serperDiscoverDomain(name) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || !name) return null;

  try {
    const res = await fetchWithTimeout('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ q: `"${name}" site officiel`, num: 5 }),
    });
    trackApiCall('serper', null, 'search/domain-discovery');
    if (!res.ok) return null;
    const data = await res.json();

    for (const result of (data.organic || [])) {
      try {
        const hostname = new URL(result.link).hostname.replace(/^www\./, '');
        if (!SKIP_DOMAINS.has(hostname) && hostname.includes('.')) {
          return hostname;
        }
      } catch {}
    }
  } catch {}
  return null;
}

// ─── Waterfall orchestrator ─────────────────────────────

const WATERFALL_STEPS = [
  { name: 'scrape', label: 'Scraping site web', fn: async (ctx) => scrapeForEmail(ctx.url) },
  { name: 'serper', label: 'Serper.dev', fn: async (ctx) => serperEnrich(ctx.name, ctx.domain) },
];

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthenticatedUser();

    if (!user) {
      return Response.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const limitCheck = await checkLimit(supabase, user.id, 'enrichments');
    if (!limitCheck.allowed) {
      return Response.json(
        { error: "Limite d'enrichissements atteinte. Passez au plan Pro.", limitReached: true, ...limitCheck },
        { status: 429 }
      );
    }

    const { url, name, method } = await request.json();

    if (!url && !name) {
      return Response.json({ error: 'url or name required' }, { status: 400 });
    }

    let validatedUrl = null;
    let domain = null;

    if (url) {
      const validation = validateUrl(url);
      if (validation.valid) {
        validatedUrl = validation.url;
        domain = extractDomain(validatedUrl);

        // If the URL is a third-party site (booking, tripadvisor, etc.), treat as no URL
        if (domain && SKIP_DOMAINS.has(domain)) {
          validatedUrl = null;
          domain = null;
        }
      }
      // If URL is invalid, continue with name-only (don't reject the request)
    }

    // If no URL/domain (or third-party URL), discover the real domain via Google search
    if (!domain && name) {
      const found = await serperDiscoverDomain(name);
      if (found) {
        domain = found;
        validatedUrl = `https://${found}`;
      }
    }

    const ctx = { url: validatedUrl, domain, name };
    const tried = [];

    console.log(`[waterfall] name="${name}" domain="${domain}" url="${validatedUrl}"`);

    // ─── Fetch user preference for personal email filtering ───
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('filter_personal_emails')
      .eq('id', user.id)
      .single();
    const filterPersonalEmails = userProfile?.filter_personal_emails !== false;

    // ─── Check opt-out list: never enrich emails that opted out ───
    async function isOptedOut(email) {
      if (!email) return false;
      try {
        const { data } = await getAdminSupabase()
          .from('opt_out_list')
          .select('email')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();
        return !!data;
      } catch { return false; }
    }

    // If a specific method is requested (Enterprise feature), only run that step
    const stepsToRun = method
      ? WATERFALL_STEPS.filter((s) => s.name === method)
      : WATERFALL_STEPS;

    for (const step of stepsToRun) {
      try {
        const result = await step.fn(ctx);
        if (filterPersonalEmails && result?.email && isPersonalEmail(result.email)) {
          tried.push({ step: step.name, label: step.label, found: true, skipped: 'email_personnel' });
          continue;
        }
        if (result?.email && await isOptedOut(result.email)) {
          tried.push({ step: step.name, label: step.label, found: true, skipped: 'opt_out' });
          continue;
        }
        tried.push({ step: step.name, label: step.label, found: !!result?.email });
        if (result?.email) {
          await incrementUsage(supabase, user.id, 'enrichments');
          return Response.json({
            email: result.email,
            source: result.source,
            extra: result.extra || null,
            linkedin_url: null,
            waterfall: tried,
          });
        }
      } catch (error) {
        tried.push({ step: step.name, label: step.label, found: false, error: true });
      }
    }

    // Serper LinkedIn (bonus, not for email but for data enrichment)
    let linkedinUrl = null;
    if (name && domain) {
      linkedinUrl = await serperLinkedinMatch(name, domain);
    }

    // No fallback guess — only return verified emails from real sources
    return Response.json({
      email: null,
      source: null,
      extra: null,
      linkedin_url: linkedinUrl,
      waterfall: tried,
    });
  } catch (error) {
    console.error('Waterfall enrichment error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
