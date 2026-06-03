// ─────────────────────────────────────────────────────────────────────
// POST /api/onboarding/first-run
// ─────────────────────────────────────────────────────────────────────
// "Premier run guidé" : montre la magie en < 5 min à un nouvel inscrit.
// Reçoit { cat, city } (la cible choisie) et renvoie :
//   - quelques VRAIS leads (Google Places, non anonymisés — user connecté)
//   - 1 email perso d'EXEMPLE généré par l'IA Autopilot (claude-writer)
//
// But : que l'utilisateur voie immédiatement des prospects réels + un email
// écrit pour eux, avant de payer → activation. Lecture seule (rien stocké).
// Auth requise. 1 appel Places + 1 appel Claude.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateEmailBody } from '@/lib/autopilot/claude-writer';
import { getTemplate } from '@/lib/autopilot/templates';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.websiteUri',
].join(',');

function interpolate(text, { company, firstName }) {
  return String(text || '')
    .replace(/\{\{\s*company\s*\}\}/gi, company || 'votre société')
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName || '')
    .replace(/^\s*,\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function POST(request) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cat = typeof body.cat === 'string' ? body.cat.trim().slice(0, 80) : '';
  const city = typeof body.city === 'string' ? body.city.trim().slice(0, 80) : '';
  if (!cat || !city) {
    return NextResponse.json({ success: false, error: 'cat et city requis' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Recherche indisponible' }, { status: 503 });
  }

  // ─── Google Places (vrais résultats, non anonymisés) ───
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let places = [];
  try {
    const resp = await fetch(PLACES_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textQuery: `${cat} à ${city}`, maxResultCount: 10, languageCode: 'fr', regionCode: 'FR' }),
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      return NextResponse.json({ success: false, error: 'Recherche temporairement indisponible' }, { status: 503 });
    }
    const data = await resp.json();
    places = Array.isArray(data.places) ? data.places : [];
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ success: false, error: 'Délai dépassé, réessaie' }, { status: 503 });
  }

  const leads = places.slice(0, 5).map((p) => ({
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    rating: p.rating || null,
    ratings_total: p.userRatingCount || 0,
    website: p.websiteUri || null,
  })).filter((l) => l.name);

  if (leads.length === 0) {
    return NextResponse.json({
      success: true,
      leads: [],
      example: null,
      message: 'Aucun résultat — essaie une autre cible (secteur + ville).',
    });
  }

  // ─── Email d'exemple sur le 1er lead (ton sympathique par défaut) ───
  const target = leads.find((l) => l.website) || leads[0];
  const template = getTemplate('cold_b2b_sympathique');
  let example = null;
  try {
    const prospect = { nom: target.name, first_name: '', departement: '', email: '', telephone: '' };
    let bodyText = null;
    if (template) {
      bodyText = await generateEmailBody({ template, stepIndex: 0, prospect });
    }
    const subjVariants = template?.sequence?.[0]?.subject;
    const subjRaw = Array.isArray(subjVariants) ? subjVariants[0]?.text : subjVariants;
    example = {
      company: target.name,
      subject: interpolate(subjRaw || 'Une idée pour {{company}}', { company: target.name }),
      body:
        bodyText ||
        `Bonjour,\n\nJe suis tombé sur ${target.name} et je pense qu'on peut vous aider à générer plus de rendez-vous qualifiés sans y passer vos journées.\n\nÇa vous dit qu'on en parle 15 minutes cette semaine ?\n\n(Vous pouvez vous désinscrire à tout moment — base légale : intérêt légitime B2B.)`,
    };
  } catch {
    // L'email d'exemple est best-effort : on renvoie les leads quoi qu'il arrive.
    example = null;
  }

  return NextResponse.json({ success: true, leads, total: places.length, example });
}
