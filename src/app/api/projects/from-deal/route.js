// POST /api/projects/from-deal — { deal_id, template_id? }
// Crée le projet de livraison d'un deal (bouton manuel du drawer CRM).
// Idempotent : si un projet est déjà lié au deal, on le renvoie tel quel
// ({ existing: true }) au lieu d'en créer un doublon.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  checkProjectAccess,
  buildTasksFromTemplate,
  logProjectActivity,
} from '@/lib/projects';

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) {
    return NextResponse.json(
      { success: false, error: 'Volia Project est réservé au plan Business' },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON invalide' }, { status: 400 });
  }
  if (!body.deal_id) {
    return NextResponse.json({ success: false, error: 'deal_id requis' }, { status: 400 });
  }

  // Le deal doit appartenir au user (RLS CRM).
  const { data: deal } = await supabase
    .from('crm_deals')
    .select('id, title, contact_id, status')
    .eq('id', body.deal_id)
    .maybeSingle();
  if (!deal) {
    return NextResponse.json({ success: false, error: 'Deal introuvable' }, { status: 404 });
  }

  // Idempotence : projet déjà lié → on le renvoie.
  const { data: existing } = await supabase
    .from('projects')
    .select('id, name')
    .eq('crm_deal_id', deal.id)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ success: true, existing: true, data: existing });
  }

  // Template : celui demandé, sinon "Onboarding client" (système).
  let template = null;
  if (body.template_id) {
    const { data: tpl } = await supabase
      .from('project_templates')
      .select('id, name, tasks')
      .eq('id', body.template_id)
      .maybeSingle();
    template = tpl || null;
  }
  if (!template) {
    const { data: tpl } = await supabase
      .from('project_templates')
      .select('id, name, tasks')
      .is('user_id', null)
      .eq('name', 'Onboarding client')
      .maybeSingle();
    template = tpl || null;
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: `Livraison — ${deal.title || 'nouveau client'}`,
      color: 'amber',
      crm_deal_id: deal.id,
      crm_contact_id: deal.contact_id || null,
      template_id: template?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[api/projects/from-deal] error', error);
    return NextResponse.json({ success: false, error: 'Erreur création projet' }, { status: 500 });
  }

  if (template) {
    const rows = buildTasksFromTemplate(template, project.id);
    if (rows.length) await supabase.from('project_tasks').insert(rows);
  }

  logProjectActivity(supabase, {
    projectId: project.id,
    userId: user.id,
    action: 'project_created',
    metadata: { from_deal: deal.id, deal_title: deal.title },
  });

  return NextResponse.json({ success: true, existing: false, data: project }, { status: 201 });
}
