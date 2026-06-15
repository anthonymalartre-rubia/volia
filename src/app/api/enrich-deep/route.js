import dns from 'dns';
import { promisify } from 'util';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';

const resolveMx = promisify(dns.resolveMx);

// ─── Config ──────────────────────────────────────────────

const TEAM_PATHS = [
  '/equipe', '/team', '/about', '/a-propos',
  '/notre-equipe', '/our-team',
];

const CONTACT_PATHS = [
  '/contact', '/contactez-nous',
  '/mentions-legales',
];

const ALL_PATHS = [...CONTACT_PATHS, ...TEAM_PATHS];

// Look-behind négatif (?<![/\w]) pour éviter les faux positifs dans des URLs (P2 audit).
const EMAIL_REGEX = /(?<![/\w])[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const BLOCKED_DOMAINS = new Set([
  'example.com', 'sentry.io', 'wixpress.com', 'googleapis.com',
  'schema.org', 'w3.org', 'gravatar.com', 'wordpress.org',
  'cloudflare.com', 'google.com', 'gstatic.com', 'facebook.com',
  'twitter.com', 'placeholder.com', 'email.com', 'domain.com',
  'yoursite.com', 'test.com', 'sample.com',
]);

const GENERIC_PREFIXES = new Set([
  'contact', 'info', 'support', 'hello', 'admin', 'webmaster',
  'noreply', 'no-reply', 'postmaster', 'mailer-daemon',
  'newsletter', 'marketing', 'sales', 'commercial',
  'direction', 'accueil', 'reception', 'service', 'bureau',
]);

const FRENCH_NAME_REGEX = /(?:^|[\s,;|>])([A-ZÀ-Ü][a-zà-ü]{2,})\s+([A-ZÀ-Ü][a-zà-ü]{2,})(?=[\s,;|<]|$)/g;

// ─── Helpers ─────────────────────────────────────────────

async function fetchUrl(url, timeout = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
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
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function normalizeUrl(url) {
  if (!url.startsWith('http')) url = 'https://' + url;
  return url.replace(/\/+$/, '');
}

// ─── Email extraction ────────────────────────────────────

function extractEmailsFromHtml(html) {
  const emails = new Set();

  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    emails.add(match[1].toLowerCase());
  }

  for (const m of html.matchAll(EMAIL_REGEX)) {
    emails.add(m[0].toLowerCase());
  }

  const obfuscated = /([a-zA-Z0-9._%+\-]+)\s*[\[\(\{]\s*(?:at|arobase|@)\s*[\]\)\}]\s*([a-zA-Z0-9.\-]+)\s*[\[\(\{]\s*(?:dot|point|\.)\s*[\]\)\}]\s*([a-zA-Z]{2,})/gi;
  while ((match = obfuscated.exec(html)) !== null) {
    emails.add(`${match[1]}@${match[2]}.${match[3]}`.toLowerCase());
  }

  return Array.from(emails);
}

function isValidEmail(email) {
  if (!email) return false;
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return false;
  if (BLOCKED_DOMAINS.has(domain.toLowerCase())) return false;
  if (localPart.toLowerCase().includes('noreply')) return false;
  if (localPart.toLowerCase().includes('mailer-daemon')) return false;
  if (/\.(png|jpg|jpeg|gif|css|js|svg|pdf)$/i.test(localPart)) return false;
  return true;
}

function isPersonalEmail(email) {
  if (!email) return false;
  const localPart = email.split('@')[0].toLowerCase();
  if (GENERIC_PREFIXES.has(localPart)) return false;
  if (/[.\-_]/.test(localPart) && localPart.length > 4) return true;
  return false;
}

// ─── Name extraction from HTML ───────────────────────────

// Very broad skip list — common French words that are NOT names
const SKIP_WORDS = new Set([
  // Determiners, pronouns, prepositions
  'Les', 'Des', 'Une', 'Notre', 'Votre', 'Tous', 'Dans', 'Pour',
  'Avec', 'Sans', 'Plus', 'Très', 'Nous', 'Vous', 'Leur', 'Bien',
  'Tout', 'Cela', 'Cette', 'Chez', 'Depuis', 'Entre', 'Vers',
  'Selon', 'Ses', 'Son', 'Qui', 'Que', 'Quoi', 'Dont',
  // Navigation / UI
  'Merci', 'Lire', 'Voir', 'Site', 'Page', 'Plan', 'Mon',
  'Accueil', 'Menu', 'Haut', 'Bas', 'Suite', 'Retour', 'Rechercher',
  'Suivez', 'Découvrez', 'Contactez', 'Réservez', 'Consultez',
  'Connexion', 'Inscription', 'Fermer', 'Ouvrir', 'Envoyer',
  // Legal
  'Droit', 'Droits', 'Code', 'Prix', 'Date', 'Offre', 'Offres',
  'Conditions', 'Mentions', 'Politique', 'Données', 'Cookies',
  'Copyright', 'Légales', 'Confidentialité',
  // Business / generic
  'Hotel', 'Hôtel', 'Hôtels', 'Hotels', 'Restaurant', 'Restaurants',
  'France', 'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse',
  'Groupe', 'Service', 'Services', 'Agence', 'Cabinet', 'Bureau',
  'Nos', 'Spa', 'Espace', 'English', 'Français', 'Projet',
  'Piscine', 'Piscines', 'Plage', 'Chambre', 'Chambres',
  'Réunion', 'Réunions', 'Salle', 'Salles', 'Bar', 'Club',
  'Sainte', 'Saint', 'Nord', 'Sud', 'Est', 'Ouest',
  'Résidence', 'Résidences', 'Villa', 'Villas', 'Maison',
  // Real estate specific
  'Acheter', 'Louer', 'Vendre', 'Gestion', 'Syndic', 'Location',
  'Appartement', 'Studio', 'Terrain', 'Immeuble', 'Bail', 'Bailleur',
  'Copropriété', 'Exclusivité', 'Estimer', 'Estimation', 'Mandat',
  'Actualités', 'Actus', 'Dossier', 'Faites', 'Lagon', 'Bleu',
]);

// Common French first names to help validate (non-exhaustive, top ~200)
const COMMON_FIRST_NAMES = new Set([
  'Jean', 'Pierre', 'Michel', 'André', 'Philippe', 'Jacques', 'Bernard',
  'Alain', 'René', 'Daniel', 'Christian', 'Roger', 'Robert', 'Marcel',
  'François', 'Louis', 'Patrick', 'Claude', 'Henri', 'Paul', 'Gérard',
  'Marie', 'Jeanne', 'Françoise', 'Monique', 'Catherine', 'Nathalie',
  'Isabelle', 'Sylvie', 'Christine', 'Martine', 'Nicole', 'Anne',
  'Sophie', 'Sandrine', 'Valérie', 'Stéphanie', 'Céline', 'Véronique',
  'Laurent', 'Olivier', 'Thierry', 'Nicolas', 'Christophe', 'David',
  'Frédéric', 'Éric', 'Sébastien', 'Stéphane', 'Alexandre', 'Antoine',
  'Thomas', 'Julien', 'Maxime', 'Hugo', 'Lucas', 'Léo', 'Gabriel',
  'Arthur', 'Louis', 'Jules', 'Adam', 'Raphaël', 'Nathan', 'Mathis',
  'Emma', 'Jade', 'Louise', 'Alice', 'Léa', 'Chloé', 'Lina', 'Rose',
  'Anna', 'Inès', 'Sarah', 'Manon', 'Camille', 'Juliette', 'Eva',
  'Marc', 'Yves', 'Pascal', 'Vincent', 'Didier', 'Dominique',
  'Bruno', 'Serge', 'Arnaud', 'Fabrice', 'Guillaume', 'Benoît',
  'Emmanuel', 'Jérôme', 'Romain', 'Matthieu', 'Damien', 'Kevin',
  'Aurélie', 'Caroline', 'Julie', 'Laura', 'Virginie', 'Delphine',
  'Laetitia', 'Emilie', 'Marine', 'Pauline', 'Charlotte', 'Mélanie',
]);

function extractNamesFromHtml(html) {
  const names = [];

  // Strip tags
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');

  let match;
  while ((match = FRENCH_NAME_REGEX.exec(text)) !== null) {
    const firstName = match[1];
    const lastName = match[2];
    if (SKIP_WORDS.has(firstName) || SKIP_WORDS.has(lastName)) continue;
    if (firstName.length < 2 || lastName.length < 2) continue;
    // Only accept if first name looks like a real first name
    if (!COMMON_FIRST_NAMES.has(firstName)) continue;
    names.push({ firstName, lastName });
  }

  // JSON-LD structured data
  const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      extractNamesFromJsonLd(data, names);
    } catch {
      // ignore
    }
  }

  // Deduplicate
  const seen = new Set();
  return names.filter(({ firstName, lastName }) => {
    const key = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractNamesFromJsonLd(data, names) {
  if (!data) return;
  if (Array.isArray(data)) {
    for (const item of data) extractNamesFromJsonLd(item, names);
    return;
  }
  if (typeof data !== 'object') return;

  if (data['@type'] === 'Person' && data.name) {
    const parts = data.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      names.push({ firstName: parts[0], lastName: parts.slice(1).join(' ') });
    }
  }

  for (const key of ['employee', 'member', 'founder', 'author', 'employees', 'members']) {
    if (data[key]) extractNamesFromJsonLd(data[key], names);
  }
}

// ─── Pattern detection ───────────────────────────────────

const PATTERNS = {
  'first.last':   (f, l) => `${f}.${l}`,
  'f.last':       (f, l) => `${f[0]}.${l}`,
  'flast':        (f, l) => `${f[0]}${l}`,
  'firstlast':    (f, l) => `${f}${l}`,
  'first':        (f)    => `${f}`,
  'last.first':   (f, l) => `${l}.${f}`,
  'lastf':        (f, l) => `${l}${f[0]}`,
  'last':         (f, l) => `${l}`,
  'first_last':   (f, l) => `${f}_${l}`,
  'first-last':   (f, l) => `${f}-${l}`,
  'f-last':       (f, l) => `${f[0]}-${l}`,
};

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function detectPattern(matchedEmails) {
  const patternCounts = {};

  for (const { email, firstName, lastName } of matchedEmails) {
    if (!firstName || !lastName) continue;
    const localPart = email.split('@')[0].toLowerCase();
    const f = normalize(firstName);
    const l = normalize(lastName);

    for (const [patternName, fn] of Object.entries(PATTERNS)) {
      if (localPart === fn(f, l)) {
        patternCounts[patternName] = (patternCounts[patternName] || 0) + 1;
        break;
      }
    }
  }

  if (Object.keys(patternCounts).length === 0) return null;

  const sorted = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
  return { pattern: sorted[0][0], confidence: sorted[0][1] };
}

function generateEmail(firstName, lastName, domain, pattern) {
  const f = normalize(firstName);
  const l = normalize(lastName);
  const fn = PATTERNS[pattern];
  if (!fn) return `${f}.${l}@${domain}`;
  return `${fn(f, l)}@${domain}`;
}

// ─── MX verification (domain-level only) ─────────────────

async function verifyDomainMX(domain) {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

// ─── Main enrichment logic ───────────────────────────────

async function deepEnrich(url) {
  const baseUrl = normalizeUrl(url);
  const domain = extractDomain(baseUrl);
  if (!domain) return { scrapedEmails: [], names: [], pattern: null, generatedEmails: [], pagesScanned: 0 };

  const allEmails = new Set();
  const allNames = [];
  const pageResults = [];

  // Crawl homepage + paths in parallel (batches of 3), stop early if enough data
  const urls = [baseUrl, ...ALL_PATHS.map((p) => `${baseUrl}${p}`)];

  // Fetch homepage first
  const homepageHtml = await fetchUrl(baseUrl);
  if (homepageHtml) {
    const emails = extractEmailsFromHtml(homepageHtml).filter(isValidEmail);
    emails.forEach((e) => allEmails.add(e));
    const names = extractNamesFromHtml(homepageHtml);
    allNames.push(...names);
    if (emails.length > 0 || names.length > 0) {
      pageResults.push({ url: baseUrl, emails, names });
    }
  }

  // Then fetch remaining paths in parallel (all at once, 4s timeout handles slow ones)
  const remainingUrls = ALL_PATHS.map((p) => `${baseUrl}${p}`);
  const results = await Promise.all(remainingUrls.map(async (u) => {
    const html = await fetchUrl(u);
    return { url: u, html };
  }));

  for (const { url: pageUrl, html } of results) {
    if (!html) continue;
    const emails = extractEmailsFromHtml(html).filter(isValidEmail);
    emails.forEach((e) => allEmails.add(e));
    const names = extractNamesFromHtml(html);
    allNames.push(...names);
    if (emails.length > 0 || names.length > 0) {
      pageResults.push({ url: pageUrl, emails, names });
    }
  }

  // Categorize emails
  const emailList = Array.from(allEmails);
  const personalEmails = emailList.filter(isPersonalEmail);

  // Deduplicate names
  const seenNames = new Set();
  const uniqueNames = allNames.filter(({ firstName, lastName }) => {
    const key = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  // Match personal emails to names for pattern detection
  const matchedEmails = [];
  for (const email of personalEmails) {
    const emailDomain = email.split('@')[1];
    if (!emailDomain.includes(domain.split('.')[0])) continue;

    const localPart = email.split('@')[0].toLowerCase();
    for (const { firstName, lastName } of uniqueNames) {
      const f = normalize(firstName);
      const l = normalize(lastName);
      if (localPart.includes(f) || localPart.includes(l)) {
        matchedEmails.push({ email, firstName, lastName });
        break;
      }
    }
  }

  // Detect pattern
  const patternResult = detectPattern(matchedEmails);

  // Generate emails for other names using detected pattern
  const generated = [];
  if (patternResult && uniqueNames.length > 0) {
    const existingLocalParts = new Set(emailList.map((e) => e.split('@')[0].toLowerCase()));

    // Verify domain accepts emails (once)
    const hasMX = await verifyDomainMX(domain);

    for (const { firstName, lastName } of uniqueNames.slice(0, 10)) {
      const candidateEmail = generateEmail(firstName, lastName, domain, patternResult.pattern);
      const candidateLocal = candidateEmail.split('@')[0];

      if (existingLocalParts.has(candidateLocal)) continue;

      generated.push({
        email: candidateEmail,
        firstName,
        lastName,
        pattern: patternResult.pattern,
        verified: hasMX,
        verifyReason: hasMX ? 'mx_valid' : 'no_mx',
      });
    }
  }

  // If no pattern but we have names, use most common pattern (first.last) with MX check
  if (!patternResult && uniqueNames.length > 0) {
    const hasMX = await verifyDomainMX(domain);
    if (hasMX) {
      const defaultPattern = 'first.last';
      for (const { firstName, lastName } of uniqueNames.slice(0, 5)) {
        const candidateEmail = generateEmail(firstName, lastName, domain, defaultPattern);
        generated.push({
          email: candidateEmail,
          firstName,
          lastName,
          pattern: defaultPattern,
          verified: false,
          verifyReason: 'pattern_guess',
        });
      }
    }
  }

  return {
    domain,
    scrapedEmails: emailList.map((e) => ({
      email: e,
      type: isPersonalEmail(e) ? 'personal' : 'generic',
      source: 'scrape',
    })),
    names: uniqueNames.slice(0, 20),
    pattern: patternResult,
    generatedEmails: generated,
    pagesScanned: pageResults.length,
  };
}

// ─── API Route ───────────────────────────────────────────

import { validateUrl } from '@/lib/url-validation';

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return Response.json({ error: 'Non autorise' }, { status: 401 });

    const limitCheck = await checkLimit(supabase, user.id, 'enrichments');
    if (!limitCheck.allowed) {
      return Response.json(
        { error: "Limite de crédits atteinte. Passez à Prospection (19€/mois — 500 crédits) ou prenez un pack de crédits dès 9€.", limitReached: true, ...limitCheck },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    // SSRF validation
    const validation = validateUrl(url);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const result = await deepEnrich(validation.url);
    await incrementUsage(supabase, user.id, 'enrichments');
    return Response.json(result);
  } catch (error) {
    console.error('Deep enrich error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
