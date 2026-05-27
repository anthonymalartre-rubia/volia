// POST /api/crm/contacts/bulk-import
// Body : {
//   contacts: [{ name, email, phone, company, position, source_ref_id }],
//   source?: 'prospection'|'manual'|'campagnes'|'import',
//   mode?: 'skip'|'update',
//   createDeals?: { pipeline_id, stage_id }   // Phase 3 : crée 1 deal par contact
// }
// Insert bulk avec dédup par (user_id, lower(email)) :
//   - mode 'skip' (défaut) : ignore les doublons
//   - mode 'update'        : met à jour les champs non-vides du contact existant
// Si createDeals est fourni, 1 deal est créé par contact (créé OU mis à jour)
// dans la stage spécifiée (title = nom du contact, value = 0, status = 'open').
// Retourne { success, data: { created, skipped, updated, deals_created, errors } }

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

const MAX_BATCH = 1000;
const VALID_SOURCES = ['manual', 'prospection', 'campagnes', 'import'];

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function normalizeContact(c, userId, defaultSource) {
  if (!c || typeof c !== 'object') return null;
  const name = typeof c.name === 'string' ? c.name.trim() : '';
  if (!name) return null;
  const rawEmail = typeof c.email === 'string' ? c.email.trim().toLowerCase() : '';
  const email = isValidEmail(rawEmail) ? rawEmail : null;
  return {
    user_id: userId,
    name: name.slice(0, 200),
    email,
    phone: typeof c.phone === 'string' ? c.phone.trim().slice(0, 50) || null : null,
    company: typeof c.company === 'string' ? c.company.trim().slice(0, 200) || null : null,
    position: typeof c.position === 'string' ? c.position.trim().slice(0, 200) || null : null,
    notes: typeof c.notes === 'string' ? c.notes.trim() || null : null,
    source: VALID_SOURCES.includes(c.source) ? c.source : defaultSource,
    source_ref_id: typeof c.source_ref_id === 'string' ? c.source_ref_id : null,
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
  const rawContacts = Array.isArray(body.contacts) ? body.contacts : null;
  if (!rawContacts || rawContacts.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Le tableau "contacts" est requis et non vide' },
      { status: 400 }
    );
  }
  if (rawContacts.length > MAX_BATCH) {
    return NextResponse.json(
      { success: false, error: `Maximum ${MAX_BATCH} contacts par batch` },
      { status: 400 }
    );
  }

  const defaultSource = VALID_SOURCES.includes(body.source) ? body.source : 'import';
  const mode = body.mode === 'update' ? 'update' : 'skip';

  // Phase 3 : option pour créer 1 deal par contact dans une stage donnée.
  // On valide le pipeline_id / stage_id avant de toucher quoi que ce soit
  // pour ne pas se retrouver avec des contacts créés mais des deals KO.
  let createDealsCfg = null;
  if (
    body.createDeals &&
    typeof body.createDeals === 'object' &&
    typeof body.createDeals.pipeline_id === 'string' &&
    typeof body.createDeals.stage_id === 'string'
  ) {
    const { pipeline_id, stage_id } = body.createDeals;
    const { data: stage, error: stageErr } = await supabase
      .from('crm_stages')
      .select('id, pipeline_id, closing_type')
      .eq('id', stage_id)
      .eq('pipeline_id', pipeline_id)
      .maybeSingle();
    if (stageErr || !stage) {
      return NextResponse.json(
        { success: false, error: 'Stage introuvable ou ne correspond pas au pipeline' },
        { status: 400 }
      );
    }
    createDealsCfg = { pipeline_id, stage_id, closing_type: stage.closing_type };
  }

  // 1. Normalise et filtre les contacts invalides
  const normalized = [];
  let invalidCount = 0;
  for (const raw of rawContacts) {
    const n = normalizeContact(raw, user.id, defaultSource);
    if (n) normalized.push(n);
    else invalidCount++;
  }
  if (normalized.length === 0) {
    return NextResponse.json({
      success: true,
      data: { created: 0, skipped: 0, updated: 0, invalid: invalidCount },
    });
  }

  // 2. Sépare ceux avec email (dédup possible) et ceux sans
  const withEmail = normalized.filter((c) => c.email);
  const withoutEmail = normalized.filter((c) => !c.email);

  // 3. Fetch existants pour les emails fournis
  let existingByEmail = new Map();
  if (withEmail.length > 0) {
    const emails = [...new Set(withEmail.map((c) => c.email))];
    const { data: existing } = await supabase
      .from('crm_contacts')
      .select('id, email')
      .in('email', emails);
    if (existing) {
      for (const row of existing) {
        if (row.email) existingByEmail.set(row.email.toLowerCase(), row.id);
      }
    }
  }

  let created = 0;
  let skipped = 0;
  let updated = 0;
  const errors = [];
  // Phase 3 : on collecte les contacts touchés (créés OU updated) pour
  // créer les deals associés à la fin, si createDealsCfg est défini.
  // { id, name } — id est null si createDeals=false (on ne fait rien).
  const touchedContacts = [];

  // 4. Contacts sans email : insert direct (pas de dédup)
  if (withoutEmail.length > 0) {
    // Si on doit créer des deals, on récupère les ids via select().
    // Sinon insert simple avec count (plus rapide).
    if (createDealsCfg) {
      const { data: inserted, error: insErr } = await supabase
        .from('crm_contacts')
        .insert(withoutEmail)
        .select('id, name');
      if (insErr) {
        errors.push(`Insert sans email: ${insErr.message}`);
      } else if (inserted) {
        created += inserted.length;
        for (const row of inserted) {
          touchedContacts.push({ id: row.id, name: row.name });
        }
      }
    } else {
      const { error: insErr, count } = await supabase
        .from('crm_contacts')
        .insert(withoutEmail, { count: 'exact' });
      if (insErr) {
        errors.push(`Insert sans email: ${insErr.message}`);
      } else {
        created += count ?? withoutEmail.length;
      }
    }
  }

  // 5. Contacts avec email
  const newOnes = [];
  const existingOnes = [];
  for (const c of withEmail) {
    if (existingByEmail.has(c.email)) {
      existingOnes.push({ ...c, id: existingByEmail.get(c.email) });
    } else {
      newOnes.push(c);
    }
  }

  // Dédup interne sur le batch (garder le 1er par email)
  const seenEmails = new Set();
  const newDeduped = [];
  for (const c of newOnes) {
    if (!seenEmails.has(c.email)) {
      seenEmails.add(c.email);
      newDeduped.push(c);
    } else {
      skipped++;
    }
  }

  if (newDeduped.length > 0) {
    if (createDealsCfg) {
      const { data: inserted, error: insErr } = await supabase
        .from('crm_contacts')
        .insert(newDeduped)
        .select('id, name');
      if (insErr) {
        errors.push(`Insert avec email: ${insErr.message}`);
      } else if (inserted) {
        created += inserted.length;
        for (const row of inserted) {
          touchedContacts.push({ id: row.id, name: row.name });
        }
      }
    } else {
      const { error: insErr, count } = await supabase
        .from('crm_contacts')
        .insert(newDeduped, { count: 'exact' });
      if (insErr) {
        errors.push(`Insert avec email: ${insErr.message}`);
      } else {
        created += count ?? newDeduped.length;
      }
    }
  }

  if (existingOnes.length > 0) {
    if (mode === 'update') {
      // Update champ par champ (uniquement les valeurs non vides du payload)
      for (const c of existingOnes) {
        const patch = {};
        if (c.name) patch.name = c.name;
        if (c.phone) patch.phone = c.phone;
        if (c.company) patch.company = c.company;
        if (c.position) patch.position = c.position;
        if (c.notes) patch.notes = c.notes;
        if (c.source_ref_id) patch.source_ref_id = c.source_ref_id;
        if (Object.keys(patch).length === 0) {
          skipped++;
          // En mode update, même sans patch on considère le contact "touched"
          // pour la création de deal si demandé.
          if (createDealsCfg) {
            touchedContacts.push({ id: c.id, name: c.name });
          }
          continue;
        }
        const { error: upErr } = await supabase
          .from('crm_contacts')
          .update(patch)
          .eq('id', c.id);
        if (upErr) {
          errors.push(`Update ${c.email}: ${upErr.message}`);
        } else {
          updated++;
          if (createDealsCfg) {
            touchedContacts.push({ id: c.id, name: c.name });
          }
        }
      }
    } else {
      skipped += existingOnes.length;
      // mode skip : on ne crée PAS de deal pour les contacts ignorés.
      // Si l'user voulait des deals pour les doublons, qu'il choisisse update.
    }
  }

  // ─── Phase 3 : création des deals ──────────────────────────
  let dealsCreated = 0;
  if (createDealsCfg && touchedContacts.length > 0) {
    let status = 'open';
    let closedAt = null;
    if (createDealsCfg.closing_type === 'won') {
      status = 'won';
      closedAt = new Date().toISOString();
    } else if (createDealsCfg.closing_type === 'lost') {
      status = 'lost';
      closedAt = new Date().toISOString();
    }

    const dealsPayload = touchedContacts.map((c) => ({
      user_id: user.id,
      contact_id: c.id,
      pipeline_id: createDealsCfg.pipeline_id,
      stage_id: createDealsCfg.stage_id,
      title: c.name?.slice(0, 200) || 'Nouveau deal',
      value_cents: 0,
      currency: 'EUR',
      status,
      closed_at: closedAt,
      position: 0,
    }));

    const { error: dealsErr, count } = await supabase
      .from('crm_deals')
      .insert(dealsPayload, { count: 'exact' });
    if (dealsErr) {
      errors.push(`Création deals: ${dealsErr.message}`);
    } else {
      dealsCreated = count ?? dealsPayload.length;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      created,
      skipped,
      updated,
      invalid: invalidCount,
      deals_created: dealsCreated,
      errors: errors.length ? errors : undefined,
    },
  });
}
