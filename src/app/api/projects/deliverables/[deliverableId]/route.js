// PATCH  /api/projects/deliverables/[deliverableId]
//   { status: 'delivered'|'pending' } et/ou { file_path, file_name, file_size }
//   (fichier déjà uploadé côté client dans project-files → on enregistre la
//   pièce jointe et on la lie au livrable).
// DELETE /api/projects/deliverables/[deliverableId]

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess, logProjectActivity } from '@/lib/projects';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
    { status: 403 }
  );
}

export async function PATCH(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 });
  }

  // RLS : le livrable n'est lisible/modifiable que si le projet est au user.
  const { data: deliverable } = await supabase
    .from('project_deliverables')
    .select('id, project_id, status')
    .eq('id', params.deliverableId)
    .maybeSingle();
  if (!deliverable) {
    return NextResponse.json({ success: false, error: 'Livrable introuvable' }, { status: 404 });
  }

  const updates = {};

  // Fichier : enregistre l'attachment (uploadé côté client) et le lie.
  if (typeof body.file_path === 'string' && body.file_path.startsWith(`${user.id}/`)) {
    const { data: attachment, error: attErr } = await supabase
      .from('project_attachments')
      .insert({
        project_id: deliverable.project_id,
        file_path: body.file_path.slice(0, 500),
        file_name: (body.file_name || 'fichier').slice(0, 200),
        file_size: Number.isFinite(body.file_size) ? body.file_size : null,
        uploaded_by: user.id,
      })
      .select('id')
      .single();
    if (attErr) {
      console.error('[api/projects/deliverables/:id] attachment error', attErr);
      return NextResponse.json({ success: false, error: 'Erreur pièce jointe' }, { status: 500 });
    }
    updates.attachment_id = attachment.id;
  }

  if (body.status === 'delivered' && deliverable.status !== 'delivered') {
    updates.status = 'delivered';
    updates.delivered_at = new Date().toISOString();
  } else if (body.status === 'pending') {
    updates.status = 'pending';
    updates.delivered_at = null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('project_deliverables')
    .update(updates)
    .eq('id', params.deliverableId)
    .select()
    .single();

  if (error) {
    console.error('[api/projects/deliverables/:id] PATCH error', error);
    return NextResponse.json({ success: false, error: 'Erreur mise à jour' }, { status: 500 });
  }

  if (updates.status === 'delivered') {
    logProjectActivity(supabase, {
      projectId: deliverable.project_id,
      userId: user.id,
      action: 'deliverable_delivered',
      metadata: { deliverable_id: deliverable.id },
    });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { error } = await supabase
    .from('project_deliverables')
    .delete()
    .eq('id', params.deliverableId);
  if (error) {
    console.error('[api/projects/deliverables/:id] DELETE error', error);
    return NextResponse.json({ success: false, error: 'Erreur suppression' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
