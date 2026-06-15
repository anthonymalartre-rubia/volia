// GET /api/projects/templates → modèles système (user_id null) + modèles du user.
// RLS s'en charge : policy "templates select" = user_id is null OR auth.uid().

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/projects';

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkProjectAccess(supabase, user.id))) {
    return NextResponse.json(
      { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('project_templates')
    .select('id, user_id, name, emoji, description, tasks')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('[api/projects/templates] GET error', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture' }, { status: 500 });
  }

  // Système d'abord, puis les modèles perso.
  const templates = (data || []).sort((a, b) => (a.user_id === null ? 0 : 1) - (b.user_id === null ? 0 : 1));
  return NextResponse.json({ success: true, data: templates });
}
