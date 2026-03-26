const BLOCKED_DOMAINS = [
  'example.com',
  'sentry.io',
  'wixpress.com',
  'googleapis.com',
  'schema.org',
  'w3.org',
  'gravatar.com',
  'wordpress.org',
  'cloudflare.com',
  'google.com',
  'gstatic.com',
  'facebook.com',
  'twitter.com',
  'placeholder.com',
  'email.com',
  'domain.com',
  'yoursite.com',
  'test.com',
  'sample.com',
];

const BLOCKED_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.css',
  '.js',
  '.json',
  '.xml',
  '.pdf',
  '.doc',
  '.docx',
  '.xlsx',
  '.zip',
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const COMMON_PATHS = [
  '/contact',
  '/contactez-nous',
  '/nous-contacter',
  '/mentions-legales',
];

function extractEmailsFromHtml(html) {
  const emails = new Set();

  // Extract from mailto: links
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    emails.add(match[1].toLowerCase());
  }

  // Extract from regex
  const matches = html.matchAll(EMAIL_REGEX);
  for (const m of matches) {
    emails.add(m[0].toLowerCase());
  }

  // Extract obfuscated patterns
  const obfuscatedRegex =
    /([a-zA-Z0-9._%+\-]+)\s*[\[\(\{](at|dot)[\]\)\}]\s*([a-zA-Z0-9.\-]+\s*[\[\(\{](com|fr|eu)[\]\)\}])/gi;
  while ((match = obfuscatedRegex.exec(html)) !== null) {
    const localPart = match[1];
    const domain = match[3].replace(/\s*[\[\(\{]|\s*[\]\)\}]/g, '');
    const tld = match[4];
    const email = `${localPart}@${domain}.${tld}`.toLowerCase();
    emails.add(email);
  }

  return Array.from(emails);
}

function isValidEmail(email) {
  if (!email) return false;

  const [localPart, domain] = email.split('@');

  // Check blocked domains
  if (BLOCKED_DOMAINS.includes(domain.toLowerCase())) {
    return false;
  }

  // Check blocked extensions in local part
  if (
    BLOCKED_EXTENSIONS.some((ext) =>
      localPart.toLowerCase().endsWith(ext)
    )
  ) {
    return false;
  }

  // Check noreply/mailer-daemon
  if (
    localPart.toLowerCase().includes('noreply') ||
    localPart.toLowerCase().includes('mailer-daemon')
  ) {
    return false;
  }

  return true;
}

function scoreEmail(email, domain) {
  if (!email) return 0;

  const [localPart, emailDomain] = email.split('@');
  let score = 0;

  // Domain match (highest priority)
  if (emailDomain.includes(domain)) {
    score += 100;
  }

  // Contact/info prefix
  const contactPrefixes = [
    'contact',
    'info',
    'support',
    'hello',
    'business',
  ];
  if (
    contactPrefixes.some((prefix) =>
      localPart.toLowerCase().startsWith(prefix)
    )
  ) {
    score += 80;
  }

  // Professional domain (not generic)
  const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  if (!genericDomains.includes(emailDomain.toLowerCase())) {
    score += 60;
  } else {
    score += 20; // Generic email gets some points but much lower
  }

  return score;
}

async function fetchUrl(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

async function enrichEmail(url) {
  const domain = extractDomain(url);
  if (!domain) {
    return { email: '', method: '' };
  }

  // Fetch homepage
  let html = await fetchUrl(url);
  let emails = html ? extractEmailsFromHtml(html) : [];
  let validEmails = emails.filter(isValidEmail);

  // If no valid emails, try common paths
  if (validEmails.length === 0) {
    for (const path of COMMON_PATHS) {
      const pathUrl = url.endsWith('/') ? `${url}${path.slice(1)}` : `${url}${path}`;
      html = await fetchUrl(pathUrl);
      if (html) {
        emails = extractEmailsFromHtml(html);
        validEmails = emails.filter(isValidEmail);
        if (validEmails.length > 0) {
          break;
        }
      }
    }
  }

  // Pick best email
  if (validEmails.length > 0) {
    const scoredEmails = validEmails.map((email) => ({
      email,
      score: scoreEmail(email, domain),
    }));

    scoredEmails.sort((a, b) => b.score - a.score);
    return { email: scoredEmails[0].email, method: 'scrape' };
  }

  // Generate probable email
  const probableEmail = `contact@${domain}`;
  return { email: probableEmail, method: 'guess' };
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    const result = await enrichEmail(url);
    return Response.json(result);
  } catch (error) {
    console.error('Enrich API route error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
