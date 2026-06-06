// POST /api/v1/search
// Lance une recherche d'entreprises (Google Places) ET persiste les résultats
// comme prospects de l'utilisateur. Endpoint d'ÉCRITURE.
//
// Auth : clé API Bearer pk_ avec scope 'write' ou 'full' (une clé 'read' est refusée).
// Garde-fous coûts :
//   - décompté sur le quota MENSUEL du forfait de l'utilisateur (checkLimit 'searches')
//   - 1 appel Google Places (max 20 résultats), borné par le quota restant
//   - téléphones attribués dans la limite du quota 'phones' restant
//
// Body : { query|category: string, dept: string, limit?: number }
//   - dept : code département FR ("75", "13", "2A"…) ou zone multi-pays gérée par getDeptData
//   - query/category : terme de recherche (ex "restaurant", "agence immobilière")

import { NextResponse } from 'next/server';
import { authenticateApiRequest, apiCorsHeaders } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { getDeptData, PLACES_API_URL, FIELD_MASK } from '@/lib/constants';
import { trackApiCall } from '@/lib/apiCosts';

const FR_DEPT_RE = /^(0[1-9]|[1-8][0-9]|9[0-5]|2[AB]|97[1-6])$/;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiCorsHeaders() });
}

export async function POST(request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: apiCorsHeaders() });
  }

  // Scope d'écriture obligatoire (une clé lecture seule ne peut rien dépenser)
  const scopes = auth.scopes || ['full'];
  if (!scopes.includes('full') && !scopes.includes('write')) {
    return NextResponse.json(
      { error: 'Scope insuffisant : cette action nécessite une clé API avec le scope "write".' },
      { status: 403, headers: apiCorsHeaders() }
    );
  }

  const { userId } = auth;
  const supabase = getSupabaseAdmin();

  // Quota forfait
  const limitCheck = await checkLimit(supabase, userId, 'searches');
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: 'Quota de recherche atteint pour ce mois. Passe à un plan supérieur pour continuer.', limitReached: true, ...limitCheck },
      { status: 429, headers: apiCorsHeaders() }
    );
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const query = String(body.query || body.category || '').trim();
  const dept = String(body.dept || '').trim();
  const reqLimit = Math.min(20, Math.max(1, parseInt(body.limit, 10) || 20));

  if (!query || query.length > 200) {
    return NextResponse.json({ error: 'Champ "query" (ou "category") requis, < 200 caractères.' }, { status: 400, headers: apiCorsHeaders() });
  }
  if (!dept) {
    return NextResponse.json({ error: 'Champ "dept" requis (code département FR, ex "75").' }, { status: 400, headers: apiCorsHeaders() });
  }
  const deptData = getDeptData(dept);
  if (!deptData) {
    return NextResponse.json({ error: `Zone introuvable : ${dept}` }, { status: 400, headers: apiCorsHeaders() });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Recherche indisponible (config serveur).' }, { status: 500, headers: apiCorsHeaders() });
  }

  // Borne le nombre de résultats au quota mensuel restant
  const remaining = limitCheck.limit === -1 ? reqLimit : Math.max(1, Math.min(reqLimit, limitCheck.remaining));

  // ─── Appel Google Places ──────────────────────────────────────────
  let data;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(PLACES_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: remaining,
        locationBias: { circle: { center: { latitude: deptData.lat, longitude: deptData.lng }, radius: deptData.r } },
      }),
    });
    clearTimeout(timeout);
    trackApiCall('google_places', userId, 'searchText');
    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: `Google Places: ${resp.status} ${t.slice(0, 150)}` }, { status: 502, headers: apiCorsHeaders() });
    }
    data = await resp.json();
  } catch (err) {
    return NextResponse.json({ error: `Recherche échouée : ${err?.message || 'timeout'}` }, { status: 502, headers: apiCorsHeaders() });
  }

  const rawPlaces = (data.places || []).slice(0, remaining);
  if (rawPlaces.length === 0) {
    return NextResponse.json({ ok: true, found: 0, saved: 0, session_id: null, prospects: [] }, { headers: apiCorsHeaders() });
  }

  // Téléphones : attribués dans la limite du quota restant
  const phonesCheck = await checkLimit(supabase, userId, 'phones');
  let phonesBudget = phonesCheck.limit === -1 ? Infinity : Math.max(0, phonesCheck.remaining);
  let phonesAttributed = 0;

  const departement = FR_DEPT_RE.test(dept) ? dept : null;

  // Crée la session de recherche
  const { data: session } = await supabase
    .from('search_sessions')
    .insert({ departments: [dept], categories: { query }, query_count: 1, results_count: rawPlaces.length, status: 'completed' })
    .select('id')
    .single();

  const rows = rawPlaces.map((p) => {
    const rawPhone = p.nationalPhoneNumber || p.internationalPhoneNumber || '';
    let telephone = '';
    if (rawPhone && phonesBudget > 0) { telephone = rawPhone; phonesBudget -= 1; phonesAttributed += 1; }
    return {
      place_id: p.id || '',
      nom: p.displayName?.text || '',
      adresse: p.formattedAddress || '',
      telephone,
      email: null,
      email_method: null,
      site_web: p.websiteUri || '',
      note: p.rating || null,
      nb_avis: p.userRatingCount || 0,
      type: 'custom',
      departement,
      search_session_id: session?.id || null,
      user_id: userId,
    };
  }).filter((r) => r.place_id);

  // Upsert idempotent (pas de doublon, pas de crash si déjà vu).
  // ⚠️ onConflict DOIT matcher l'index unique réel = (user_id, place_id).
  // 'place_id' seul → erreur 42P10 (aucune contrainte unique sur place_id seul).
  const { data: inserted } = await supabase
    .from('prospects')
    .upsert(rows, { onConflict: 'user_id,place_id', ignoreDuplicates: true })
    .select('id, nom, telephone, site_web, departement');

  const saved = inserted?.length || 0;
  if (saved > 0) {
    await incrementUsage(supabase, userId, 'searches', saved);
    if (phonesAttributed > 0) {
      incrementUsage(supabase, userId, 'phones', phonesAttributed).catch(() => {});
    }
  }

  return NextResponse.json(
    {
      ok: true,
      session_id: session?.id || null,
      found: rawPlaces.length,
      saved,
      duplicates: rawPlaces.length - saved,
      quota_remaining: limitCheck.limit === -1 ? -1 : Math.max(0, limitCheck.remaining - saved),
      prospects: (inserted || []).slice(0, 10).map((p) => ({ nom: p.nom, telephone: p.telephone || null, site_web: p.site_web || null })),
    },
    { headers: apiCorsHeaders() }
  );
}
