// POST /api/prospection/send-to-campagne
//
// Pont Prospection → Campagnes : pousse une sélection de prospects (issus
// du Dashboard) dans une liste prospect_lists, prête à servir de cible
// à une campagne email/SMS — sans passer par l'export CSV manuel.
//
// Body :
//   {
//     prospects: [...],          // tableau de prospects (du dashboard)
//     list_name?: string,        // nom de la nouvelle liste (si create_new_list)
//     create_new_list: boolean,  // true = créer | false = utiliser existing_list_id
//     existing_list_id?: string  // UUID de la liste cible (si !create_new_list)
//   }
//
// Réponse :
//   { list_id, list_name, inserted, skipped, total }

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { emitWebhookEvent } from '@/lib/webhooks/emitter';

const CHUNK_SIZE = 500; // limite raisonnable pour bulk insert Supabase

// ─── Mapping prospect (Google Places) → prospect_contacts ─────────────
// Mêmes conventions que SendToCrmModal :
//   - nom = nom de l'entreprise (B2B Google Places)
//   - first_name = nom (pas de prénom dispo)
//   - source = 'prospection'
//   - source_ref_id = place_id (idempotence côté origine)
function mapProspectToContact(p, listId) {
  if (!p) return null;
  const email = p.email ? String(p.email).trim().toLowerCase() : null;
  const phone = p.telephone || p.phone || null;
  if (!email && !phone) return null; // un contact doit avoir au moins email OU phone
  return {
    list_id: listId,
    email,
    phone: phone ? String(phone).trim() : null,
    first_name: p.nom || p.name || null,
    last_name: null,
    company: p.nom || null,
    position_title: null,
    custom_fields: {
      source: 'prospection',
      source_ref_id: p.place_id || p.id || null,
      adresse: p.adresse || null,
      site_web: p.site_web || null,
      departement: p.departement || null,
      category: p.category || null,
    },
  };
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const prospects = Array.isArray(body.prospects) ? body.prospects : [];
  const createNewList = !!body.create_new_list;
  const listName = (body.list_name || '').trim();
  const existingListId = body.existing_list_id || null;

  if (prospects.length === 0) {
    return NextResponse.json({ error: 'Aucun prospect fourni' }, { status: 400 });
  }
  if (createNewList && (!listName || listName.length > 120)) {
    return NextResponse.json({ error: 'Nom de liste requis (1-120 caractères)' }, { status: 400 });
  }
  if (!createNewList && !existingListId) {
    return NextResponse.json({ error: 'existing_list_id requis si create_new_list=false' }, { status: 400 });
  }

  // ─── 1. Récup ou création de la liste ───────────────────────────
  let listId = existingListId;
  let resolvedName = listName;

  if (createNewList) {
    const { data: newList, error: createErr } = await supabase
      .from('prospect_lists')
      .insert({
        owner_id: user.id,
        name: listName,
        description: `Liste créée depuis la Prospection (${prospects.length} prospects)`,
        source: 'prospection',
        legal_basis: 'legitimate_interest',
      })
      .select('id, name')
      .single();
    if (createErr || !newList) {
      return NextResponse.json(
        { error: createErr?.message || 'Erreur création liste' },
        { status: 500 }
      );
    }
    listId = newList.id;
    resolvedName = newList.name;
  } else {
    // Vérifie que la liste existante appartient bien au user
    const { data: list, error: listErr } = await supabase
      .from('prospect_lists')
      .select('id, name')
      .eq('id', existingListId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (listErr || !list) {
      return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });
    }
    resolvedName = list.name;
  }

  // ─── 2. Mapping prospects → contacts ────────────────────────────
  const toInsert = prospects
    .map((p) => mapProspectToContact(p, listId))
    .filter(Boolean);

  const totalSubmitted = prospects.length;
  const totalMapped = toInsert.length;
  const skippedNoContact = totalSubmitted - totalMapped;

  if (toInsert.length === 0) {
    return NextResponse.json({
      list_id: listId,
      list_name: resolvedName,
      inserted: 0,
      skipped: totalSubmitted,
      total: totalSubmitted,
      message: 'Aucun prospect avec email ou téléphone exploitable.',
    });
  }

  // ─── 3. Bulk upsert par chunks (dedup sur (list_id, email)) ─────
  let inserted = 0;
  const insertErrors = [];

  for (let start = 0; start < toInsert.length; start += CHUNK_SIZE) {
    const chunk = toInsert.slice(start, start + CHUNK_SIZE);
    // Pour les contacts sans email (phone-only), on désactive l'upsert pour
    // ne pas confondre les nulls. On les insère séparément.
    const withEmail = chunk.filter((c) => c.email);
    const phoneOnly = chunk.filter((c) => !c.email && c.phone);

    if (withEmail.length > 0) {
      const { data, error } = await supabase
        .from('prospect_contacts')
        .upsert(withEmail, {
          onConflict: 'list_id,email',
          ignoreDuplicates: true,
        })
        .select('id');
      if (error) {
        console.error('[send-to-campagne] upsert email error', error);
        insertErrors.push(error.message);
      } else {
        inserted += data?.length || 0;
      }
    }

    if (phoneOnly.length > 0) {
      const { data, error } = await supabase
        .from('prospect_contacts')
        .upsert(phoneOnly, {
          onConflict: 'list_id,phone',
          ignoreDuplicates: true,
        })
        .select('id');
      if (error) {
        console.error('[send-to-campagne] upsert phone error', error);
        insertErrors.push(error.message);
      } else {
        inserted += data?.length || 0;
      }
    }
  }

  const skipped = totalSubmitted - inserted;

  // ─── 4. Refresh des compteurs de la liste ────────────────────────
  // On recompte plutôt que d'incrémenter (idempotent + robuste vs concurrence).
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

  // Fire-and-forget : émet 'prospect.created' une seule fois par batch
  // (event_payload résumé — un event par prospect serait trop bruyant pour
  // les abonnés Zapier qui ont des quotas de tasks). Inclut un échantillon
  // pour permettre les zaps qui veulent traiter par batch.
  if (inserted > 0) {
    emitWebhookEvent({
      userId: user.id,
      event: 'prospect.created',
      data: {
        list_id: listId,
        list_name: resolvedName,
        inserted_count: inserted,
        total_submitted: totalSubmitted,
        sample: (toInsert || []).slice(0, 10).map((c) => ({
          email: c.email,
          phone: c.phone,
          first_name: c.first_name,
          company: c.company,
        })),
      },
    }).catch(() => {});
  }

  return NextResponse.json({
    list_id: listId,
    list_name: resolvedName,
    inserted,
    skipped,
    skipped_no_contact: skippedNoContact,
    total: totalSubmitted,
    errors: insertErrors.slice(0, 5),
  });
}
