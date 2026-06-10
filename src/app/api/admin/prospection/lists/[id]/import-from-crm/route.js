// POST /api/app/campagnes/lists/[id]/import-from-crm
//
// Body : { contact_ids: string[] }
//
// Importe des crm_contacts dans la liste prospect_contacts. Dedup sur
// (list_id, email). Gating CRM (plan Business) côté API.
//
// Réponse : { inserted, skipped, total }

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { checkCrmAccess } from '@/lib/crm';

const CHUNK_SIZE = 500;
const MAX_CONTACTS = 5000;

function splitName(fullName) {
  if (!fullName || typeof fullName !== 'string') return { first: null, last: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first: null, last: null };
  const first = parts[0] || null;
  const last = parts.slice(1).join(' ') || null;
  return { first, last };
}

function mapCrmContactToProspect(c, listId) {
  if (!c) return null;
  const email = c.email ? String(c.email).trim().toLowerCase() : null;
  const phone = c.phone ? String(c.phone).trim() : null;
  if (!email && !phone) return null;
  const { first, last } = splitName(c.name);
  return {
    list_id: listId,
    email,
    phone,
    first_name: first,
    last_name: last,
    company: c.company || null,
    position_title: c.position || null,
    custom_fields: {
      source: 'volia-crm',
      crm_contact_id: c.id,
      tags: c.tags || null,
    },
  };
}

export async function POST(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id: listId } = await params;

  const body = await request.json().catch(() => ({}));
  const contactIds = Array.isArray(body.contact_ids) ? body.contact_ids : [];

  if (contactIds.length === 0) {
    return NextResponse.json({ error: 'contact_ids requis' }, { status: 400 });
  }
  if (contactIds.length > MAX_CONTACTS) {
    return NextResponse.json(
      { error: `Trop de contacts : max ${MAX_CONTACTS} par import` },
      { status: 413 }
    );
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

  // 2. Gating CRM
  const hasCrm = await checkCrmAccess(supabase, user.id);
  if (!hasCrm) {
    return NextResponse.json(
      { error: 'CRM réservé au plan Business', code: 'crm_not_allowed' },
      { status: 403 }
    );
  }

  // 3. Récupère les contacts CRM (vérifie ownership en filtrant user_id)
  const { data: contacts, error: cErr } = await supabase
    .from('crm_contacts')
    .select('id, name, email, phone, company, position, tags')
    .eq('user_id', user.id)
    .in('id', contactIds);

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const total = contacts?.length || 0;
  if (total === 0) {
    return NextResponse.json({ inserted: 0, skipped: 0, total: 0 });
  }

  // 4. Mapping + bulk upsert
  const mapped = contacts.map((c) => mapCrmContactToProspect(c, listId)).filter(Boolean);

  let inserted = 0;
  const insertErrors = [];

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
        console.error('[import-from-crm] upsert email error', error);
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
        console.error('[import-from-crm] upsert phone error', error);
        insertErrors.push(error.message);
      } else {
        inserted += data?.length || 0;
      }
    }
  }

  // Si AUCUN insert n'a réussi alors qu'il y avait des contacts ET qu'on a des
  // erreurs DB → ce n'est PAS un doublon, c'est une vraie erreur. On la remonte
  // au lieu de la maquiller en "skipped/doublon".
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
