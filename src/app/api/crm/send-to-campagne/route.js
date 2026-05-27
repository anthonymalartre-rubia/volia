// POST /api/crm/send-to-campagne
//
// Pousse des contacts CRM (crm_contacts) vers une liste Campagnes
// (prospect_lists + prospect_contacts), en journalisant l'action dans
// crm_activities (type=note) pour chaque contact migré.
//
// Body :
//   {
//     contact_ids: string[],        // IDs des crm_contacts à pousser
//     list_name?: string,           // requis si create_new_list=true
//     create_new_list: boolean,     // true => INSERT prospect_lists ; false => existing_list_id requis
//     existing_list_id?: string,    // requis si create_new_list=false
//     deal_id?: string,             // optionnel : lié à l'activity log
//   }
//
// Réponse :
//   { success, data: { list_id, list_name, inserted, skipped, activities_logged } }
//
// Logique :
//   1. Auth + gating Business
//   2. Charge les crm_contacts (ownership user_id strictement vérifié)
//   3. Filtre les contacts sans email (prospect_contacts requiert email OU phone)
//   4. Crée OU récupère la prospect_list (ownership owner_id vérifié)
//   5. Bulk upsert dans prospect_contacts (dédup sur list_id+email)
//   6. Pour chaque contact INSERÉ avec succès : INSERT crm_activities (note)
//   7. Si l'insert prospect_contacts échoue, on ne crée PAS l'activity
//      (atomicité côté contact, pas de transaction Supabase globale possible).

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

const MAX_CONTACTS = 500;
const CHUNK_SIZE = 200;

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

function splitName(name) {
  if (!name || typeof name !== 'string') return { first_name: null, last_name: null };
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: null, last_name: null };
  if (parts.length === 1) return { first_name: parts[0].slice(0, 80), last_name: null };
  return {
    first_name: parts[0].slice(0, 80),
    last_name: parts.slice(1).join(' ').slice(0, 80),
  };
}

function mapCrmContactToProspect(c, listId) {
  const { first_name, last_name } = splitName(c.name);
  return {
    list_id: listId,
    email: c.email ? String(c.email).trim().toLowerCase() : null,
    phone: c.phone ? String(c.phone).trim() : null,
    first_name,
    last_name,
    company: c.company ? String(c.company).slice(0, 200) : null,
    position_title: c.position ? String(c.position).slice(0, 200) : null,
    custom_fields: { crm_contact_id: c.id, crm_source: 'crm' },
  };
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const body = await request.json().catch(() => ({}));
  const contactIds = Array.isArray(body.contact_ids)
    ? body.contact_ids.filter((s) => typeof s === 'string' && s.length > 0)
    : [];
  const createNewList = !!body.create_new_list;
  const listNameRaw = typeof body.list_name === 'string' ? body.list_name.trim() : '';
  const existingListId =
    typeof body.existing_list_id === 'string' ? body.existing_list_id : null;
  const dealId = typeof body.deal_id === 'string' ? body.deal_id : null;

  if (contactIds.length === 0) {
    return NextResponse.json(
      { success: false, error: 'contact_ids requis (tableau non vide)' },
      { status: 400 }
    );
  }
  if (contactIds.length > MAX_CONTACTS) {
    return NextResponse.json(
      { success: false, error: `Maximum ${MAX_CONTACTS} contacts par envoi` },
      { status: 400 }
    );
  }
  if (createNewList) {
    if (!listNameRaw || listNameRaw.length > 120) {
      return NextResponse.json(
        { success: false, error: 'list_name requis (1-120 caractères)' },
        { status: 400 }
      );
    }
  } else if (!existingListId) {
    return NextResponse.json(
      { success: false, error: 'existing_list_id requis si create_new_list=false' },
      { status: 400 }
    );
  }

  // 1. Charge les crm_contacts (ownership vérifié par user_id)
  const { data: crmContacts, error: contactsErr } = await supabase
    .from('crm_contacts')
    .select('id, name, email, phone, company, position')
    .eq('user_id', user.id)
    .in('id', contactIds);

  if (contactsErr) {
    console.error('[api/crm/send-to-campagne] load contacts error', contactsErr);
    return NextResponse.json(
      { success: false, error: contactsErr.message },
      { status: 500 }
    );
  }
  if (!crmContacts || crmContacts.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Aucun contact trouvé (ou non autorisé)' },
      { status: 404 }
    );
  }

  // 2. Filtre : prospect_contacts requiert email OU phone
  const eligible = crmContacts.filter((c) => c.email || c.phone);
  const ineligibleCount = crmContacts.length - eligible.length;
  if (eligible.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Aucun contact éligible (email ou téléphone requis)',
      },
      { status: 400 }
    );
  }

  // 3. Résolution liste : création OU récupération
  let listId = existingListId;
  let listName = '';

  if (createNewList) {
    const { data: created, error: listErr } = await supabase
      .from('prospect_lists')
      .insert({
        owner_id: user.id,
        name: listNameRaw,
        description: 'Créée depuis le CRM',
        source: 'crm',
        legal_basis: 'legitimate_interest',
      })
      .select('id, name')
      .single();
    if (listErr || !created) {
      console.error('[api/crm/send-to-campagne] create list error', listErr);
      return NextResponse.json(
        { success: false, error: listErr?.message || 'Impossible de créer la liste' },
        { status: 500 }
      );
    }
    listId = created.id;
    listName = created.name;
  } else {
    const { data: existing, error: getErr } = await supabase
      .from('prospect_lists')
      .select('id, name')
      .eq('id', existingListId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (getErr || !existing) {
      return NextResponse.json(
        { success: false, error: 'Liste introuvable ou non autorisée' },
        { status: 404 }
      );
    }
    listName = existing.name;
  }

  // 4. Bulk upsert dans prospect_contacts (dédup sur list_id+email).
  //    On upsert avec ignoreDuplicates pour ne pas écraser les contacts
  //    déjà ciblés/optés-out. Les inserts retournés sont la "vérité"
  //    pour décider quoi journaliser dans crm_activities.
  const payload = eligible.map((c) => mapCrmContactToProspect(c, listId));

  // payload conserve l'ordre des `eligible` → on peut mapper back via email|phone+crm_contact_id
  let insertedRows = [];
  const insertErrors = [];

  for (let start = 0; start < payload.length; start += CHUNK_SIZE) {
    const chunk = payload.slice(start, start + CHUNK_SIZE);
    // Pour les contacts avec email, upsert sur (list_id, email).
    // Les contacts sans email sont insérés simplement (la table autorise
    // un même phone plusieurs fois — si une contrainte d'unicité existe,
    // l'erreur sera capturée et loggée).
    const withEmail = chunk.filter((p) => p.email);
    const withoutEmail = chunk.filter((p) => !p.email);

    if (withEmail.length > 0) {
      const { data, error } = await supabase
        .from('prospect_contacts')
        .upsert(withEmail, {
          onConflict: 'list_id,email',
          ignoreDuplicates: true,
        })
        .select('id, email, custom_fields');
      if (error) {
        console.error('[api/crm/send-to-campagne] upsert email chunk error', error);
        insertErrors.push(error.message);
      } else if (data) {
        insertedRows = insertedRows.concat(data);
      }
    }

    if (withoutEmail.length > 0) {
      const { data, error } = await supabase
        .from('prospect_contacts')
        .insert(withoutEmail)
        .select('id, phone, custom_fields');
      if (error) {
        console.error('[api/crm/send-to-campagne] insert phone-only chunk error', error);
        insertErrors.push(error.message);
      } else if (data) {
        insertedRows = insertedRows.concat(data);
      }
    }
  }

  const inserted = insertedRows.length;
  const skipped = eligible.length - inserted;

  // 5. Activity logging — uniquement pour les contacts effectivement insérés.
  //    Si insert prospect_contacts a échoué pour un contact, pas d'activity.
  const insertedCrmContactIds = new Set();
  for (const row of insertedRows) {
    const cfId = row?.custom_fields?.crm_contact_id;
    if (cfId) insertedCrmContactIds.add(cfId);
  }

  let activitiesLogged = 0;
  if (insertedCrmContactIds.size > 0) {
    const noteContent = `Ajouté à la séquence "${listName}"`;
    const activitiesPayload = Array.from(insertedCrmContactIds).map((cid) => ({
      user_id: user.id,
      contact_id: cid,
      deal_id: dealId || null,
      type: 'note',
      content: noteContent,
    }));

    const { error: actErr, count } = await supabase
      .from('crm_activities')
      .insert(activitiesPayload, { count: 'exact' });
    if (actErr) {
      console.error('[api/crm/send-to-campagne] activities log error', actErr);
      // Pas fatal — les contacts sont déjà dans la liste.
      insertErrors.push(`Activities: ${actErr.message}`);
    } else {
      activitiesLogged = count ?? activitiesPayload.length;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      list_id: listId,
      list_name: listName,
      inserted,
      skipped,
      ineligible: ineligibleCount,
      activities_logged: activitiesLogged,
      errors: insertErrors.length ? insertErrors : undefined,
    },
  });
}
