// GET  /api/projects/tasks/[taskId]/attachments → pièces jointes de la tâche
// POST /api/projects/tasks/[taskId]/attachments → enregistre une PJ
//      { file_path, file_name, file_size } — fichier déjà uploadé côté
//      client dans le bucket project-files (path {userId}/{projectId}/...).
// DELETE ?id=... → supprime une PJ (métadonnée + fichier Storage best-effort)

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/projects';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
    { status: 403 }
  );
}

async function getTask(supabase, taskId) {
  const { data } = await supabase
    .from('project_tasks')
    .select('id, project_id, title')
    .eq('id', taskId)
    .maybeSingle();
  return data;
}

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { data, error } = await supabase
    .from('project_attachments')
    .select('id, file_path, file_name, file_size, created_at')
    .eq('task_id', params.taskId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[api/projects/tasks/:id/attachments] GET error', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 });
  }
  // Le path DOIT être dans le dossier du user (cohérent avec la policy Storage).
  if (typeof body.file_path !== 'string' || !body.file_path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ success: false, error: 'Chemin de fichier invalide' }, { status: 400 });
  }

  const task = await getTask(supabase, params.taskId);
  if (!task) return NextResponse.json({ success: false, error: 'Tâche introuvable' }, { status: 404 });

  const { data, error } = await supabase
    .from('project_attachments')
    .insert({
      project_id: task.project_id,
      task_id: task.id,
      file_path: body.file_path.slice(0, 500),
      file_name: (body.file_name || 'fichier').slice(0, 200),
      file_size: Number.isFinite(body.file_size) ? body.file_size : null,
      uploaded_by: user.id,
    })
    .select('id, file_path, file_name, file_size, created_at')
    .single();

  if (error) {
    console.error('[api/projects/tasks/:id/attachments] POST error', error);
    return NextResponse.json({ success: false, error: 'Erreur enregistrement' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });

  // RLS garantit l'ownership ; on récupère le path pour nettoyer le Storage.
  const { data: att } = await supabase
    .from('project_attachments')
    .select('id, file_path')
    .eq('id', id)
    .eq('task_id', params.taskId)
    .maybeSingle();
  if (!att) return NextResponse.json({ success: false, error: 'Pièce jointe introuvable' }, { status: 404 });

  const { error } = await supabase.from('project_attachments').delete().eq('id', att.id);
  if (error) {
    return NextResponse.json({ success: false, error: 'Erreur suppression' }, { status: 500 });
  }
  // Nettoyage Storage best-effort (la policy owner couvre le delete).
  try {
    await supabase.storage.from('project-files').remove([att.file_path]);
  } catch {}

  return NextResponse.json({ success: true });
}
