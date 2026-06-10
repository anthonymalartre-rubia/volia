// ─────────────────────────────────────────────────────────────────────
// src/lib/dogfood-outreach.js — Sprint Revenue Engine Phase 3
// ─────────────────────────────────────────────────────────────────────
// "Volia utilise Volia pour vendre Volia" — méta-démonstration.
//
// Cron weekly (lundi 14h CET) :
//   1. Pick ICP du week (rotation déterministe sur 12 combinaisons)
//   2. Call Google Places API : ~20 résultats max (API limit)
//   3. Filter via dogfood_outreach_history (dedup permanent par place_id)
//   4. Create prospect_list "Dogfood W{N} — {ICP label}" appartenant à l'admin
//   5. Insert les contacts (sans email — à enrichir manuellement via UI)
//   6. Log dans dogfood_outreach_history (UNIQUE constraint sur place_id)
//   7. Log dans autonomous_actions (audit trail)
//
// ⚠️ Pas d'auto-send. La liste est créée draft, le founder décide d'en
//    faire une campagne ou non via l'UI /app/campagnes existante.
//    Raison : réputation domaine + warmup + opt-out RGPD obligatoire.
//
// ENV : VOLIA_ADMIN_USER_ID optionnel (si absent, fetch via is_admin=true)
// QUOTAS : perWeek: 2 max (le cron tourne 1×/sem en théorie)
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { PLACES_API_URL, FIELD_MASK, getDeptData } from './constants';
import { isAutonomyEnabled, enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_LEADS_PER_RUN = 50;

// 12 combinations ICP — rotation déterministe par num_week % 12
// Cible : sociétés qui souffrent de la prospection B2B = besoin Volia
const ICP_ROTATION = [
  { category: 'agence marketing', dept: '75', label: 'Agences marketing Paris' },
  { category: 'agence web', dept: '13', label: 'Agences web Marseille' },
  { category: 'consultant marketing', dept: '69', label: 'Consultants marketing Lyon' },
  { category: 'cabinet de conseil', dept: '33', label: 'Cabinets conseil Bordeaux' },
  { category: 'agence de communication', dept: '31', label: 'Agences com Toulouse' },
  { category: 'agence digitale', dept: '59', label: 'Agences digitales Lille' },
  { category: 'agence SEO', dept: '67', label: 'Agences SEO Strasbourg' },
  { category: 'agence web', dept: '06', label: 'Agences web Nice' },
  { category: 'consultant business', dept: '44', label: 'Consultants business Nantes' },
  { category: 'cabinet recrutement', dept: '35', label: 'Cabinets recrutement Rennes' },
  { category: 'agence freelance', dept: '92', label: 'Agences freelance Hauts-de-Seine' },
  { category: 'agence inbound marketing', dept: '94', label: 'Inbound marketing Val-de-Marne' },
];

function getWeekOfYear() {
  // ISO week approximation (sans Date.now() volatile — basé sur new Date() ms)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
}

function pickRotationForCurrentWeek() {
  const week = getWeekOfYear();
  return { week, ...ICP_ROTATION[week % ICP_ROTATION.length] };
}

async function getAdminUserId(supabase) {
  // 1. ENV var prioritaire
  if (process.env.VOLIA_ADMIN_USER_ID) return process.env.VOLIA_ADMIN_USER_ID;
  // 2. Fallback : first is_admin=true profile
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('is_admin', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

async function searchGooglePlaces(category, dept) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { ok: false, error: 'GOOGLE_PLACES_API_KEY missing', places: [] };

  const deptData = getDeptData(dept);
  if (!deptData) return { ok: false, error: `Unknown dept: ${dept}`, places: [] };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(PLACES_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textQuery: `${category} ${deptData.name}`,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: deptData.lat, longitude: deptData.lng },
            radius: deptData.r || 25000,
          },
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `Places API ${res.status}: ${body.slice(0, 200)}`, places: [] };
    }
    const data = await res.json();
    return { ok: true, places: data.places || [] };
  } catch (err) {
    return { ok: false, error: err.message, places: [] };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runDogfoodOutreach() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  try {
    await enforceQuotaOrThrow('dogfood_outreach_run', { perWeek: 2 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const adminUserId = await getAdminUserId(supabase);
  if (!adminUserId) {
    return { ok: false, error: 'no_admin_user_found', startedAt };
  }

  const icp = pickRotationForCurrentWeek();

  // 1. Google Places search
  const searchRes = await searchGooglePlaces(icp.category, icp.dept);
  if (!searchRes.ok) {
    return { ok: false, error: 'places_search_failed', detail: searchRes.error, icp, startedAt };
  }
  const places = searchRes.places;
  if (!places || places.length === 0) {
    return { ok: true, found: 0, kept: 0, icp, reason: 'no_places_returned', startedAt };
  }

  // 2. Dedup vs history
  const placeIds = places.map((p) => p.id).filter(Boolean);
  const { data: alreadyIn } = await supabase
    .from('dogfood_outreach_history')
    .select('place_id')
    .in('place_id', placeIds);
  const alreadyInSet = new Set((alreadyIn || []).map((x) => x.place_id));
  const fresh = places
    .filter((p) => p.id && !alreadyInSet.has(p.id))
    .slice(0, MAX_LEADS_PER_RUN);

  if (fresh.length === 0) {
    return {
      ok: true,
      found: places.length,
      kept: 0,
      icp,
      reason: 'all_already_in_history',
      startedAt,
    };
  }

  // 3. Create prospect_list
  const listName = `Dogfood W${icp.week} — ${icp.label}`;
  const listDescription = [
    `Liste auto-générée par le cron dogfood-outreach (Sprint Revenue Engine Phase 3).`,
    ``,
    `ICP : ${icp.label} (categorie="${icp.category}", dept=${icp.dept})`,
    `${fresh.length} contacts ajoutés (sans email — Google Places ne fournit pas l'email).`,
    ``,
    `▸ Étape 1 : enrichir les emails via le bouton "Enrichir tous les emails" de l'UI /app/campagnes.`,
    `▸ Étape 2 : créer une campagne dessus depuis l'UI Volia (PAS d'envoi auto par sécurité réputation).`,
    `▸ Étape 3 : vérifier le sender configuré + RGPD opt-out dans l'email avant lancement.`,
  ].join('\n');

  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .insert({
      owner_id: adminUserId,
      name: listName,
      description: listDescription,
      source: 'cron:dogfood-outreach',
      legal_basis: 'interet_legitime_b2b',
      contacts_count: 0,
      email_count: 0,
      phone_count: 0,
      opt_out_count: 0,
    })
    .select('id')
    .maybeSingle();

  if (listErr || !list) {
    return {
      ok: false,
      error: 'list_create_failed',
      detail: listErr?.message,
      startedAt,
    };
  }

  // 4. Insert prospect_contacts
  const contactRows = fresh.map((p) => ({
    list_id: list.id,
    company: p.displayName?.text || p.name || 'Sans nom',
    phone: p.internationalPhoneNumber || p.nationalPhoneNumber || null,
    email: null,
    first_name: null,
    last_name: null,
    position_title: null,
    custom_fields: {
      place_id: p.id,
      address: p.formattedAddress || null,
      website: p.websiteUri || null,
      rating: p.rating || null,
      user_ratings_total: p.userRatingCount || null,
      source: 'dogfood-outreach',
      icp_category: icp.category,
      icp_dept: icp.dept,
    },
    opt_out: false,
    bounce_count: 0,
  }));

  const { error: contactsErr } = await supabase.from('prospect_contacts').insert(contactRows);
  if (contactsErr) {
    return {
      ok: false,
      error: 'contacts_insert_failed',
      detail: contactsErr.message,
      list_id: list.id,
      startedAt,
    };
  }

  // 5. Update list count
  const phoneCount = contactRows.filter((c) => c.phone).length;
  await supabase
    .from('prospect_lists')
    .update({
      contacts_count: fresh.length,
      phone_count: phoneCount,
      email_count: 0,
    })
    .eq('id', list.id);

  // 6. Insert dans history (dedupe future)
  const historyRows = fresh.map((p) => ({
    place_id: p.id,
    list_id: list.id,
    category: icp.category,
    dept: icp.dept,
    company_name: p.displayName?.text || p.name || null,
  }));
  await supabase.from('dogfood_outreach_history').insert(historyRows);

  // 7. Log autonomy
  await logAutonomousAction({
    actionType: 'dogfood_outreach_run',
    source: 'cron/dogfood-outreach',
    riskLevel: 'low',
    payload: {
      list_id: list.id,
      list_name: listName,
      icp,
      total_found: places.length,
      kept: fresh.length,
      skipped_already_seen: places.length - fresh.length,
    },
    preview: `📋 "${listName}" — ${fresh.length} leads dans /app/campagnes (à enrichir manuellement)`,
    rationale: `Cron weekly génère leads ICP-fit via Google Places. Pas d'auto-send : founder review + enrichit + envoie via UI.`,
    autoExecute: true,
  });

  return {
    ok: true,
    found: places.length,
    kept: fresh.length,
    skipped_already_seen: places.length - fresh.length,
    list_id: list.id,
    list_name: listName,
    icp,
    startedAt,
  };
}
