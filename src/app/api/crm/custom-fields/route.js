// ─────────────────────────────────────────────────────────────────────
// /api/crm/custom-fields — gestion des définitions de champs custom CRM.
// ─────────────────────────────────────────────────────────────────────
//
// GET  /api/crm/custom-fields?entity=contact|deal&include_archived=0
//   → liste des fields définis par l'user, triés par position.
//
// POST /api/crm/custom-fields
//   body: { entity, field_label, field_type, field_key?, field_options?, required?, position? }
//   → crée un field. field_key est slug(field_label) si non fourni.
//
// Gating Business uniquement. RLS Supabase enforce l'isolation user_id.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';
import { toSlug } from '@/lib/slugs';

const VALID_ENTITIES = ['contact', 'deal'];
const VALID_TYPES = ['text', 'number', 'select', 'date', 'boolean'];

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

function normalizeOptions(type, raw) {
  if (type !== 'select') return null;
  // Accept either array of strings or { options: [...] }
  let arr = [];
  if (Array.isArray(raw)) arr = raw;
  else if (raw && Array.isArray(raw.options)) arr = raw.options;
  arr = arr
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0)
    .slice(0, 50);
  return { options: arr };
}

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const url = new URL(request.url);
  const entity = url.searchParams.get('entity');
  const includeArchived = url.searchParams.get('include_archived') === '1';

  let query = supabase
    .from('crm_custom_fields')
    .select('id, entity, field_key, field_label, field_type, field_options, position, required, archived, created_at')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (entity && VALID_ENTITIES.includes(entity)) {
    query = query.eq('entity', entity);
  }
  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[api/crm/custom-fields] GET error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const body = await request.json().catch(() => ({}));
  const entity = typeof body.entity === 'string' ? body.entity : '';
  const fieldType = typeof body.field_type === 'string' ? body.field_type : '';
  const fieldLabel = typeof body.field_label === 'string' ? body.field_label.trim() : '';
  const fieldKeyRaw = typeof body.field_key === 'string' ? body.field_key.trim() : '';

  if (!VALID_ENTITIES.includes(entity)) {
    return NextResponse.json(
      { success: false, error: "entity doit être 'contact' ou 'deal'" },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.includes(fieldType)) {
    return NextResponse.json(
      { success: false, error: `field_type doit être l'un de : ${VALID_TYPES.join(', ')}` },
      { status: 400 }
    );
  }
  if (!fieldLabel) {
    return NextResponse.json(
      { success: false, error: 'field_label est requis' },
      { status: 400 }
    );
  }

  // Slug field_key depuis label si non fourni, normalise sinon
  let fieldKey = fieldKeyRaw || toSlug(fieldLabel);
  fieldKey = fieldKey.replace(/[^a-z0-9_]/gi, '_').toLowerCase().slice(0, 60);
  if (!fieldKey) {
    return NextResponse.json(
      { success: false, error: 'Impossible de générer une clé valide depuis le label' },
      { status: 400 }
    );
  }

  // Calcule position : last + 1 pour l'entity
  let nextPosition = 0;
  if (Number.isInteger(body.position)) {
    nextPosition = Math.max(0, body.position);
  } else {
    const { data: last } = await supabase
      .from('crm_custom_fields')
      .select('position')
      .eq('user_id', user.id)
      .eq('entity', entity)
      .eq('archived', false)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    nextPosition = (last?.position ?? -1) + 1;
  }

  const payload = {
    user_id: user.id,
    entity,
    field_key: fieldKey,
    field_label: fieldLabel.slice(0, 100),
    field_type: fieldType,
    field_options: normalizeOptions(fieldType, body.field_options),
    position: nextPosition,
    required: !!body.required,
    archived: false,
  };

  const { data, error } = await supabase
    .from('crm_custom_fields')
    .insert(payload)
    .select('id, entity, field_key, field_label, field_type, field_options, position, required, archived, created_at')
    .single();

  if (error) {
    console.error('[api/crm/custom-fields] POST error', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: `Un champ avec la clé "${fieldKey}" existe déjà pour cette entité` },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
