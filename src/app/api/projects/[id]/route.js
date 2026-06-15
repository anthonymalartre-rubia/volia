// GET    /api/projects/[id]  → détail projet (tâches + livrables + partages + activité)
// PATCH  /api/projects/[id]  → met à jour nom/description/statut/couleur
// DELETE /api/projects/[id]  → supprime le projet (cascade DB)

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  checkProjectAccess,
  computeProjectStats,
  logProjectActivity,
  PROJECT_COLORS,
  PROJECT_STATUSES,
} from '@/lib/projects';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
    { status: 403 }
  );
}

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      id, name, description, status, color, crm_deal_id, crm_contact_id, created_at, updated_at,
      tasks:project_tasks(id, title, description, status, assignee_user_id, due_at, position, is_milestone, created_at, updated_at),
      deliverables:project_deliverables(id, name, status, attachment_id, delivered_at, created_at),
      shares:project_shares(id, token, revoked_at, created_at)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.error('[api/projects/:id] GET error', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture' }, { status: 500 });
  }
  if (!project) return NextResponse.json({ success: false, error: 'Projet introuvable' }, { status: 404 });

  // Tri stable des tâches (position puis date) — l'embed Supabase ne trie pas.
  project.tasks = (project.tasks || []).sort(
    (a, b) => a.position - b.position || new Date(a.created_at) - new Date(b.created_at)
  );
  project.stats = computeProjectStats(project.tasks);

  // Activité récente (20 dernières)
  const { data: activity } = await supabase
    .from('project_activity')
    .select('id, action, metadata, created_at')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);
  project.activity = activity || [];

  return NextResponse.json({ success: true, data: project });
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
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim().slice(0, 200);
  if (typeof body.description === 'string') updates.description = body.description.trim().slice(0, 2000) || null;
  if (PROJECT_STATUSES.includes(body.status)) updates.status = body.status;
  if (PROJECT_COLORS.includes(body.color)) updates.color = body.color;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', params.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[api/projects/:id] PATCH error', error);
    return NextResponse.json({ success: false, error: 'Erreur mise à jour' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ success: false, error: 'Projet introuvable' }, { status: 404 });

  if (updates.status === 'done') {
    logProjectActivity(supabase, {
      projectId: params.id,
      userId: user.id,
      action: 'project_completed',
    });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { error } = await supabase.from('projects').delete().eq('id', params.id);
  if (error) {
    console.error('[api/projects/:id] DELETE error', error);
    return NextResponse.json({ success: false, error: 'Erreur suppression' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
