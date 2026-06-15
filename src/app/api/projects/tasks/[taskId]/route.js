// PATCH  /api/projects/tasks/[taskId] → met à jour une tâche (statut, titre,
//        échéance, jalon, assigné, position). Le drag-drop = PATCH {status}.
// DELETE /api/projects/tasks/[taskId] → supprime la tâche.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess, logProjectActivity, TASK_STATUSES } from '@/lib/projects';

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

  const updates = {};
  if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim().slice(0, 300);
  if (typeof body.description === 'string') updates.description = body.description.slice(0, 5000) || null;
  if (TASK_STATUSES.includes(body.status)) updates.status = body.status;
  if ('due_at' in body) updates.due_at = body.due_at || null;
  if ('is_milestone' in body) updates.is_milestone = Boolean(body.is_milestone);
  if ('assignee_user_id' in body) updates.assignee_user_id = body.assignee_user_id || null;
  if (Number.isFinite(body.position)) updates.position = Math.max(0, Math.round(body.position));

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const { data: task, error } = await supabase
    .from('project_tasks')
    .update(updates)
    .eq('id', params.taskId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[api/projects/tasks/:id] PATCH error', error);
    return NextResponse.json({ success: false, error: 'Erreur mise à jour' }, { status: 500 });
  }
  if (!task) return NextResponse.json({ success: false, error: 'Tâche introuvable' }, { status: 404 });

  if (updates.status === 'done') {
    logProjectActivity(supabase, {
      projectId: task.project_id,
      userId: user.id,
      action: 'task_done',
      metadata: { title: task.title },
    });
  }

  return NextResponse.json({ success: true, data: task });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { error } = await supabase.from('project_tasks').delete().eq('id', params.taskId);
  if (error) {
    console.error('[api/projects/tasks/:id] DELETE error', error);
    return NextResponse.json({ success: false, error: 'Erreur suppression' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
