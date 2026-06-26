// ─────────────────────────────────────────────────────────────────────
// lib/one/icp.js — Volia One : domaine → ICP (le seul "cerveau" nouveau)
// ─────────────────────────────────────────────────────────────────────
// Scrape le site DU client + Claude pour déduire : ce qu'il vend, à qui,
// dans quelle zone → termes Google Places pour trouver ses clients.
// Modèle aligné sur le reste du repo (parse-search, claude-writer).
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

async function fetchSiteText(url, timeout = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VoliaBot/1.0; +https://volia.fr)' },
      signal: controller.signal,
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
  } catch {
    return '';
  } finally {
    clearTimeout(t);
  }
}

/**
 * Déduit l'ICP d'une entreprise à partir de son domaine.
 * @param {string} domain  ex "agence-web-bordeaux.fr" (avec ou sans https://)
 * @returns {Promise<{domain,activite,value_prop,ton,ville,cibles:string[],places_terms:string[]}>}
 */
export async function inferIcp(domain) {
  const clean = String(domain || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  if (!clean) throw new Error('Domaine vide');

  let text = await fetchSiteText(`https://${clean}`);
  if (text.length < 300) {
    const more = await fetchSiteText(`https://${clean}/a-propos`);
    if (more) text += ' ' + more;
  }
  if (!text) throw new Error(`Site injoignable : ${clean}`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY non configurée');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    system:
      "Tu es un expert de la prospection B2B en France. À partir du texte du site d'une entreprise, tu déduis son ICP (à quels clients B2B elle peut vendre) pour préparer du cold outreach. Réponds UNIQUEMENT en JSON valide, sans aucune explication.",
    messages: [
      {
        role: 'user',
        content: `Texte du site de l'entreprise (domaine ${clean}) :
"""${text}"""

Déduis :
- "activite" : ce que vend l'entreprise, 1 phrase
- "value_prop" : sa proposition de valeur orientée bénéfice client, 1 phrase
- "ton" : "chaleureux" | "professionnel" | "direct"
- "ville" : la ville française où elle est basée (déduis-la ; sinon "Paris")
- "cibles" : 2 à 4 types de clients B2B concrets qu'elle pourrait démarcher (ex: "restaurant", "garage automobile", "cabinet dentaire", "agence immobilière")
- "places_terms" : 2 à 4 termes de recherche Google Places (France) pour TROUVER ces clients potentiels près de sa ville. Termes courts type métier/établissement.

JSON attendu (rien d'autre) :
{"activite":"...","value_prop":"...","ton":"...","ville":"...","cibles":["..."],"places_terms":["..."]}`,
      },
    ],
  });

  const raw = message.content?.[0]?.text || '';
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Inférence ICP : réponse Claude non parsable');
  const icp = JSON.parse(m[0]);
  if (!Array.isArray(icp.places_terms) || icp.places_terms.length === 0) {
    throw new Error('Inférence ICP : aucun terme de recherche déduit');
  }
  icp.domain = clean;
  icp.ville = icp.ville || 'Paris';
  return icp;
}
