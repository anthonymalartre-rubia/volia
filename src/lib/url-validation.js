/**
 * Validate and sanitize URLs to prevent SSRF attacks.
 * Only allows http/https to public domains.
 *
 * NB : `node:dns` est importé DYNAMIQUEMENT dans assertPublicUrl() (et pas au
 * top-level) pour que ce module reste importable côté client (validateUrl est
 * une fonction pure utilisable dans les composants de validation de formulaire).
 */

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  '::1',
  'metadata.google.internal',
];

const BLOCKED_IP_RANGES = [
  /^127\./,                          // 127.0.0.0/8 (loopback)
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^169\.254\./,                     // Link-local (AWS/GCP metadata)
  /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-7])\./,  // Carrier-grade NAT
  /^0\./,                            // 0.0.0.0/8
  /^fc[0-9a-f]{2}:/i,               // IPv6 ULA
  /^fe80:/i,                         // IPv6 link-local
  /^::1$/,                           // IPv6 loopback
  /^::ffff:(10|127)\./i,            // IPv4-mapped IPv6 (10.x / 127.x)
];

function isBlockedAddress(host) {
  const lower = String(host).toLowerCase();
  if (BLOCKED_HOSTS.includes(lower)) return true;
  return BLOCKED_IP_RANGES.some((re) => re.test(lower));
}

export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Ensure protocol
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Only allow http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
  }

  // Block known internal hosts + IP-based URLs that resolve to private ranges
  const hostname = parsed.hostname.toLowerCase();
  if (isBlockedAddress(hostname)) {
    return { valid: false, error: 'Internal / private hosts are not allowed' };
  }

  // Block URLs with auth info (user:pass@host)
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URLs with credentials are not allowed' };
  }

  // Block non-standard ports commonly used for internal services
  if (parsed.port && !['80', '443', ''].includes(parsed.port)) {
    return { valid: false, error: 'Non-standard ports are not allowed' };
  }

  return { valid: true, url: normalized };
}

/**
 * Anti-SSRF FORTE (WS9) : en plus des checks syntaxiques de validateUrl(),
 * RÉSOUT le DNS et vérifie que TOUTES les IP résolues sont publiques. Bloque
 * le DNS-rebinding — un domaine public contrôlé par l'attaquant qui résout
 * vers une IP privée (169.254.169.254, 10.x, 127.x…). À utiliser sur TOUT
 * fetch sortant d'une URL fournie par l'utilisateur (ex. scrape du site client).
 * Async (résolution réseau) → l'appelant doit await.
 *
 * @returns {Promise<{valid:boolean, url?:string, error?:string}>}
 */
export async function assertPublicUrl(url) {
  const base = validateUrl(url);
  if (!base.valid) return base;

  let hostname;
  try {
    hostname = new URL(base.url).hostname.toLowerCase();
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  let addresses;
  try {
    // Import dynamique (server-only) → ne pollue pas le bundle client.
    // { all: true } → toutes les IP (A + AAAA) ; on rejette dès qu'UNE est privée.
    const { lookup } = await import('node:dns/promises');
    addresses = await lookup(hostname, { all: true });
  } catch {
    return { valid: false, error: 'DNS resolution failed' };
  }
  if (!addresses || addresses.length === 0) {
    return { valid: false, error: 'No DNS record' };
  }
  for (const { address } of addresses) {
    if (isBlockedAddress(address)) {
      return { valid: false, error: 'URL resolves to a private/internal IP' };
    }
  }
  return { valid: true, url: base.url };
}
