// POST /api/projects/[id]/tasks → crée une tâche dans le projet.
// L'ajout inline (UX) n'envoie que { title } ; le reste est optionnel.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess, logProjectActivity, TASK_STATUSES } from '@/lib/projects';

export async function POST(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) {
    return NextResponse.json(
      { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 300) : '';
  if (!title) {
    return NextResponse.json({ success: false, error: 'Le titre est requis' }, { status: 400 });
  }
  const status = TASK_STATUSES.includes(body.status) ? body.status : 'todo';

  // Position = fin de colonne (max + 1). RLS garantit que le projet est au user.
  const { data: last } = await supabase
    .from('project_tasks')
    .select('position')
    .eq('project_id', params.id)
    .eq('status', status)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: task, error } = await supabase
    .from('project_tasks')
    .insert({
      project_id: params.id,
      title,
      status,
      description: typeof body.description === 'string' ? body.description.slice(0, 5000) : null,
      due_at: body.due_at || null,
      is_milestone: Boolean(body.is_milestone),
      assignee_user_id: body.assignee_user_id || null,
      position: (last?.position ?? -1) + 1,
    })
    .select()
    .single();

  if (error) {
    console.error('[api/projects/:id/tasks] POST error', error);
    return NextResponse.json({ success: false, error: 'Erreur création tâche' }, { status: 500 });
  }

  logProjectActivity(supabase, {
    projectId: params.id,
    userId: user.id,
    action: 'task_created',
    metadata: { title },
  });

  return NextResponse.json({ success: true, data: task }, { status: 201 });
}
