// GET    /api/teams/invitations           → liste des invitations pending de la team du user
// DELETE /api/teams/invitations?id=...     → cancel une invitation pending (owner/admin)

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getTeamForUser, canInviteMembers } from '@/lib/teams';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teamData = await getTeamForUser(user.id);
  if (!teamData) return NextResponse.json({ invitations: [] });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('team_invitations')
    .select('id, email, role, invited_by, expires_at, created_at')
    .eq('team_id', teamData.team.id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  return NextResponse.json({ invitations: data || [] });
}

export async function DELETE(request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const teamData = await getTeamForUser(user.id);
  if (!teamData) return NextResponse.json({ error: 'No team' }, { status: 403 });
  if (!canInviteMembers(teamData.role)) {
    return NextResponse.json(
      { error: 'Seuls les owners et admins peuvent annuler une invitation.' },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', id)
    .eq('team_id', teamData.team.id) // sécurité : ne supprime que les invites de SA team
    .is('accepted_at', null);

  if (error) {
    console.error('[api/teams/invitations] delete error', error);
    return NextResponse.json({ error: 'Erreur suppression.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
