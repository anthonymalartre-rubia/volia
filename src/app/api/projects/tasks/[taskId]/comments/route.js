// GET  /api/projects/tasks/[taskId]/comments → commentaires de la tâche
// POST /api/projects/tasks/[taskId]/comments → ajoute un commentaire

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess, logProjectActivity } from '@/lib/projects';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Volia Project est réservé au plan Business' },
    { status: 403 }
  );
}

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { data, error } = await supabase
    .from('project_task_comments')
    .select('id, user_id, content, created_at')
    .eq('task_id', params.taskId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    console.error('[api/projects/tasks/:id/comments] GET error', error);
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

  const content = typeof body.content === 'string' ? body.content.trim().slice(0, 3000) : '';
  if (!content) {
    return NextResponse.json({ success: false, error: 'Commentaire vide' }, { status: 400 });
  }

  const { data: comment, error } = await supabase
    .from('project_task_comments')
    .insert({ task_id: params.taskId, user_id: user.id, content })
    .select()
    .single();

  if (error) {
    console.error('[api/projects/tasks/:id/comments] POST error', error);
    return NextResponse.json({ success: false, error: 'Erreur création' }, { status: 500 });
  }

  // project_id pour le journal — lecture rapide de la tâche.
  const { data: task } = await supabase
    .from('project_tasks')
    .select('project_id, title')
    .eq('id', params.taskId)
    .maybeSingle();
  if (task) {
    logProjectActivity(supabase, {
      projectId: task.project_id,
      userId: user.id,
      action: 'comment_added',
      metadata: { task: task.title },
    });
  }

  return NextResponse.json({ success: true, data: comment }, { status: 201 });
}
