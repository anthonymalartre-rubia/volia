// POST   /api/projects/[id]/shares → get-or-create le lien de partage actif
//        du projet (1 seul lien actif à la fois — simplicité).
// DELETE /api/projects/[id]/shares → révoque tous les liens actifs.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess, logProjectActivity } from '@/lib/projects';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Volia Project est réservé au plan Business' },
    { status: 403 }
  );
}

export async function POST(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  // Lien actif existant ?
  const { data: existing } = await supabase
    .from('project_shares')
    .select('id, token, created_at')
    .eq('project_id', params.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return NextResponse.json({ success: true, data: existing });

  // Sinon on en crée un (token généré par la DB). RLS vérifie l'ownership.
  const { data: share, error } = await supabase
    .from('project_shares')
    .insert({ project_id: params.id })
    .select('id, token, created_at')
    .single();

  if (error) {
    console.error('[api/projects/:id/shares] POST error', error);
    return NextResponse.json({ success: false, error: 'Erreur création lien' }, { status: 500 });
  }

  logProjectActivity(supabase, {
    projectId: params.id,
    userId: user.id,
    action: 'share_created',
  });

  return NextResponse.json({ success: true, data: share }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) return forbidden();

  const { error } = await supabase
    .from('project_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('project_id', params.id)
    .is('revoked_at', null);

  if (error) {
    console.error('[api/projects/:id/shares] DELETE error', error);
    return NextResponse.json({ success: false, error: 'Erreur révocation' }, { status: 500 });
  }

  logProjectActivity(supabase, {
    projectId: params.id,
    userId: user.id,
    action: 'share_revoked',
  });

  return NextResponse.json({ success: true });
}
