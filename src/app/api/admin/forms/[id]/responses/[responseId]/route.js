// ─────────────────────────────────────────────────────────────────
// GET    /api/admin/forms/[id]/responses/[responseId]
// DELETE /api/admin/forms/[id]/responses/[responseId]
// POST   /api/admin/forms/[id]/responses/[responseId]/retry
// ─────────────────────────────────────────────────────────────────
// Sprint F7 — détail d'une réponse + actions admin :
//   - GET    : fetch full response (answers, metadata, bridges, files)
//   - DELETE : RGPD — supprime la réponse + fichiers Storage
//   - retry  : reset bridge_status='failed' + next_retry_at=NOW pour
//              que le cron F6 retraite cette réponse au prochain tick
//
// RLS : on filtre via form.user_id = current user.
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { normalizeSchema, schemaFieldsToRendererFields } from '@/lib/forms';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

async function loadFormResponse(supabase, formId, responseId, userId) {
  // 1. Vérifie ownership form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, name, slug, schema, user_id')
    .eq('id', formId)
    .eq('user_id', userId)
    .maybeSingle();
  if (formError) return { error: formError.message, status: 500 };
  if (!form) return { error: 'Formulaire introuvable', status: 404 };

  // 2. Fetch response
  const { data: response, error: respError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('id', responseId)
    .eq('form_id', formId)
    .maybeSingle();
  if (respError) return { error: respError.message, status: 500 };
  if (!response) return { error: 'Réponse introuvable', status: 404 };

  return { form, response };
}

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();
  const { id, responseId } = await params;

  const loaded = await loadFormResponse(supabase, id, responseId, user.id);
  if (loaded.error) {
    return NextResponse.json({ success: false, error: loaded.error }, { status: loaded.status });
  }

  const { form, response } = loaded;

  // Schema fields pour labelliser proprement les answers
  const schema = normalizeSchema(form.schema);
  const flatFields = schemaFieldsToRendererFields(schema);

  // Files associés à cette réponse (avec signed URL pour download)
  const supabaseAdmin = getSupabaseAdmin();
  const { data: files } = await supabaseAdmin
    .from('form_files')
    .select('id, field_key, file_name, file_size, mime_type, storage_path')
    .eq('form_response_id', responseId);

  const filesWithUrls = [];
  for (const f of files || []) {
    try {
      const { data: signed } = await supabaseAdmin.storage
        .from('form-uploads')
        .createSignedUrl(f.storage_path, 300); // 5 min
      filesWithUrls.push({
        ...f,
        signed_url: signed?.signedUrl || null,
      });
    } catch (e) {
      filesWithUrls.push({ ...f, signed_url: null });
    }
  }

  return NextResponse.json({
    success: true,
    form: { id: form.id, name: form.name, slug: form.slug },
    response: {
      id: response.id,
      submitted_at: response.submitted_at,
      answers: response.answers,
      metadata: response.metadata,
      bridge_status: response.bridge_status,
      bridge_error: response.bridge_error,
      bridge_retry_count: response.bridge_retry_count,
      bridge_next_retry_at: response.bridge_next_retry_at,
      crm_contact_id: response.crm_contact_id,
      campagnes_contact_id: response.campagnes_contact_id,
    },
    schema_fields: flatFields,
    files: filesWithUrls,
  });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();
  const { id, responseId } = await params;

  const loaded = await loadFormResponse(supabase, id, responseId, user.id);
  if (loaded.error) {
    return NextResponse.json({ success: false, error: loaded.error }, { status: loaded.status });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Récupère + supprime les fichiers Storage liés (best-effort)
  const { data: files } = await supabaseAdmin
    .from('form_files')
    .select('storage_path')
    .eq('form_response_id', responseId);
  if (files && files.length > 0) {
    const paths = files.map((f) => f.storage_path).filter(Boolean);
    if (paths.length > 0) {
      try {
        await supabaseAdmin.storage.from('form-uploads').remove(paths);
      } catch (e) {
        console.warn('[forms/response/delete] storage remove failed', e.message);
      }
    }
  }

  // 2. Supprime form_files (cascade absent — on nettoie manuellement)
  await supabaseAdmin.from('form_files').delete().eq('form_response_id', responseId);

  // 3. Supprime la response
  const { error: delError } = await supabaseAdmin
    .from('form_responses')
    .delete()
    .eq('id', responseId);

  if (delError) {
    return NextResponse.json({ success: false, error: delError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
