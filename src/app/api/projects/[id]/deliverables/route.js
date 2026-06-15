// POST /api/projects/[id]/deliverables → crée un livrable { name }
// Le fichier est uploadé côté client dans le bucket project-files
// (path {userId}/{projectId}/...) puis lié via PATCH /deliverables/[id].

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/projects';

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
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  if (!name) return NextResponse.json({ success: false, error: 'Nom requis' }, { status: 400 });

  const { data, error } = await supabase
    .from('project_deliverables')
    .insert({ project_id: params.id, name })
    .select()
    .single();

  if (error) {
    console.error('[api/projects/:id/deliverables] POST error', error);
    return NextResponse.json({ success: false, error: 'Erreur création' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data }, { status: 201 });
}
