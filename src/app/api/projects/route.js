// GET  /api/projects  → liste des projets du user + stats (tâches embarquées light)
// POST /api/projects  → crée un projet (nom + couleur + template optionnel)
//
// Gating Volia Project : plan Business + auth + RLS.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  checkProjectAccess,
  computeProjectStats,
  buildTasksFromTemplate,
  logProjectActivity,
  PROJECT_COLORS,
  PROJECT_STATUSES,
} from '@/lib/projects';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Volia Project est réservé au plan Business' },
    { status: 403 }
  );
}

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // active | done | archived | null = non archivés

  let query = supabase
    .from('projects')
    .select('id, name, description, status, color, crm_deal_id, crm_contact_id, created_at, updated_at, tasks:project_tasks(id, status, due_at, is_milestone)')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (status && PROJECT_STATUSES.includes(status)) query = query.eq('status', status);
  else query = query.neq('status', 'archived');

  const { data, error } = await query;
  if (error) {
    console.error('[api/projects] GET error', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture' }, { status: 500 });
  }

  const projects = (data || []).map((p) => {
    const { tasks, ...rest } = p;
    return { ...rest, stats: computeProjectStats(tasks || []) };
  });

  return NextResponse.json({ success: true, data: projects });
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  if (!name) {
    return NextResponse.json({ success: false, error: 'Le nom du projet est requis' }, { status: 400 });
  }
  const color = PROJECT_COLORS.includes(body.color) ? body.color : 'violet';
  const description =
    typeof body.description === 'string' ? body.description.trim().slice(0, 2000) : null;

  // Template optionnel : le sien OU un modèle système (user_id null) — RLS l'assure.
  let template = null;
  if (body.template_id) {
    const { data: tpl } = await supabase
      .from('project_templates')
      .select('id, name, tasks')
      .eq('id', body.template_id)
      .maybeSingle();
    template = tpl || null;
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      description,
      color,
      template_id: template?.id || null,
      crm_deal_id: body.crm_deal_id || null,
      crm_contact_id: body.crm_contact_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[api/projects] POST error', error);
    return NextResponse.json({ success: false, error: 'Erreur création' }, { status: 500 });
  }

  // Tâches du template (best-effort : un échec ici ne doit pas perdre le projet créé)
  let tasks = [];
  if (template) {
    const rows = buildTasksFromTemplate(template, project.id);
    if (rows.length) {
      const { data: created, error: tasksErr } = await supabase
        .from('project_tasks')
        .insert(rows)
        .select();
      if (tasksErr) console.error('[api/projects] template tasks error', tasksErr);
      tasks = created || [];
    }
  }

  logProjectActivity(supabase, {
    projectId: project.id,
    userId: user.id,
    action: 'project_created',
    metadata: { name, template: template?.name || null },
  });

  return NextResponse.json({ success: true, data: { ...project, tasks } }, { status: 201 });
}
