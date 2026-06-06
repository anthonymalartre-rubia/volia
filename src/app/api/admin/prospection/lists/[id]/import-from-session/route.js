// POST /api/admin/prospection/lists/[id]/import-from-session
//
// Body : { session_id: string, include_emailless?: boolean (default false) }
//
// Importe les prospects (Volia Prospection) d'une search_session donnée dans
// la liste prospect_contacts. Dedup sur (list_id, email) via index unique.
//
// Réponse : { inserted, skipped, total }

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

const CHUNK_SIZE = 500;

// Extrait un "first_name" lisible depuis le nom de l'établissement Google Places.
// On garde le nom complet en `company` et on met le premier mot en `first_name`
// pour que le mail puisse personnaliser ({{first_name}}).
function extractFirstWord(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const first = trimmed.split(/\s+/)[0];
  return first ? first.slice(0, 80) : null;
}

function mapProspectToContact(p, listId) {
  if (!p) return null;
  const email = p.email ? String(p.email).trim().toLowerCase() : null;
  const phone = p.telephone ? String(p.telephone).trim() : null;
  if (!email && !phone) return null;
  return {
    list_id: listId,
    email,
    phone,
    first_name: extractFirstWord(p.nom),
    last_name: null,
    company: p.nom || null,
    position_title: null,
    custom_fields: {
      source: 'volia-prospection',
      prospect_id: p.id || null,
      place_id: p.place_id || null,
      departement: p.departement || null,
      site_web: p.site_web || null,
    },
  };
}

export async function POST(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id: listId } = await params;

  const body = await request.json().catch(() => ({}));
  const sessionId = body.session_id;
  const includeEmailless = !!body.include_emailless;

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'session_id requis' }, { status: 400 });
  }

  // 1. Valide ownership de la liste
  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .select('id')
    .eq('id', listId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (listErr || !list) {
    return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });
  }

  // 2. Valide que la session appartient au user
  const { data: session, error: sErr } = await supabase
    .from('search_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (sErr || !session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }

  // 3. Récupère les prospects de la session PAR PAGES, et importe au fil de
  //    l'eau.
  //    ⚠️ NE PAS faire un seul SELECT sans pagination : PostgREST plafonne à
  //    1000 lignes par défaut → l'ancien code n'importait QUE les 1000 premiers
  //    prospects, même pour une session de 30 000+ (perte de données
  //    silencieuse). On boucle en .range() jusqu'à épuisement.
  const PAGE_SIZE = 1000;

  let total = 0;
  let inserted = 0;
  const insertErrors = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    let query = supabase
      .from('prospects')
      .select('id, place_id, nom, telephone, email, site_web, departement')
      .eq('user_id', user.id)
      .eq('search_session_id', sessionId)
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (!includeEmailless) {
      query = query.not('email', 'is', null);
    }

    const { data: page, error: pErr } = await query;
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    const rows = page || [];
    if (rows.length === 0) break;
    total += rows.length;

    // 4. Mapping + bulk upsert (dedup sur list_id, email — phone-only à part)
    const mapped = rows.map((p) => mapProspectToContact(p, listId)).filter(Boolean);

    for (let start = 0; start < mapped.length; start += CHUNK_SIZE) {
      const chunk = mapped.slice(start, start + CHUNK_SIZE);
      const withEmail = chunk.filter((c) => c.email);
      const phoneOnly = chunk.filter((c) => !c.email && c.phone);

      if (withEmail.length > 0) {
        const { data, error } = await supabase
          .from('prospect_contacts')
          .upsert(withEmail, { onConflict: 'list_id,email', ignoreDuplicates: true })
          .select('id');
        if (error) {
          console.error('[import-from-session] upsert email error', error);
          insertErrors.push(error.message);
        } else {
          inserted += data?.length || 0;
        }
      }
      if (phoneOnly.length > 0) {
        const { data, error } = await supabase
          .from('prospect_contacts')
          .upsert(phoneOnly, { onConflict: 'list_id,phone', ignoreDuplicates: true })
          .select('id');
        if (error) {
          console.error('[import-from-session] upsert phone error', error);
          insertErrors.push(error.message);
        } else {
          inserted += data?.length || 0;
        }
      }
    }

    if (rows.length < PAGE_SIZE) break;
  }

  if (total === 0) {
    return NextResponse.json({ inserted: 0, skipped: 0, total: 0 });
  }

  // Vraie erreur DB ≠ doublon : on la remonte si rien n'a pu être inséré.
  if (inserted === 0 && insertErrors.length > 0) {
    return NextResponse.json(
      { error: `Échec de l'import : ${insertErrors[0]}` },
      { status: 500 }
    );
  }

  const skipped = total - inserted;

  // 5. Refresh des compteurs de la liste
  const { count: contactsCount } = await supabase
    .from('prospect_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('list_id', listId);
  const { count: emailCount } = await supabase
    .from('prospect_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('list_id', listId)
    .not('email', 'is', null);
  const { count: phoneCount } = await supabase
    .from('prospect_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('list_id', listId)
    .not('phone', 'is', null);

  await supabase
    .from('prospect_lists')
    .update({
      contacts_count: contactsCount || 0,
      email_count: emailCount || 0,
      phone_count: phoneCount || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId)
    .eq('owner_id', user.id);

  return NextResponse.json({
    inserted,
    skipped,
    total,
    errors: insertErrors.slice(0, 5),
  });
}
