// PATCH  /api/teams/members/[id]   → update role (owner uniquement)
// DELETE /api/teams/members/[id]   → remove member (owner/admin, ou self-leave)
//
// [id] = team_members.id (UUID de la row).

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  getTeamForUser,
  canRemoveMembers,
  canChangeRole,
  ROLES,
} from '@/lib/teams';

export async function PATCH(request, context) {
  const { id } = await context.params;
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const newRole = body.role;
  if (![ROLES.ADMIN, ROLES.MEMBER].includes(newRole)) {
    return NextResponse.json({ error: 'Rôle invalide (admin ou member).' }, { status: 400 });
  }

  const teamData = await getTeamForUser(user.id);
  if (!teamData) return NextResponse.json({ error: 'No team' }, { status: 403 });
  if (!canChangeRole(teamData.role)) {
    return NextResponse.json(
      { error: 'Seul l\'owner peut changer les rôles.' },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Récupère le member ciblé, vérifie qu'il appartient bien à la team du user
  const { data: target } = await supabase
    .from('team_members')
    .select('id, team_id, role, user_id')
    .eq('id', id)
    .maybeSingle();

  if (!target || target.team_id !== teamData.team.id) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }

  // On ne touche jamais au rôle de l'owner via cette route (sinon il pourrait
  // se rétrograder et casser la team).
  if (target.role === ROLES.OWNER) {
    return NextResponse.json(
      { error: 'Le rôle owner ne peut pas être modifié ici (utilisez transfer ownership).' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('team_members')
    .update({ role: newRole })
    .eq('id', id);

  if (error) {
    console.error('[api/teams/members PATCH] update error', error);
    return NextResponse.json({ error: 'Erreur mise à jour.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, context) {
  const { id } = await context.params;
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teamData = await getTeamForUser(user.id);
  if (!teamData) return NextResponse.json({ error: 'No team' }, { status: 403 });

  const supabase = getSupabaseAdmin();

  const { data: target } = await supabase
    .from('team_members')
    .select('id, team_id, role, user_id')
    .eq('id', id)
    .maybeSingle();

  if (!target || target.team_id !== teamData.team.id) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }

  // L'owner ne peut pas être supprimé via cette route
  if (target.role === ROLES.OWNER) {
    return NextResponse.json(
      { error: 'L\'owner ne peut pas être retiré. Supprimez la team ou transférez l\'ownership.' },
      { status: 400 }
    );
  }

  const isSelf = target.user_id === user.id;
  const isAdmin = canRemoveMembers(teamData.role);

  if (!isSelf && !isAdmin) {
    return NextResponse.json(
      { error: 'Vous ne pouvez retirer que vous-même.' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[api/teams/members DELETE] error', error);
    return NextResponse.json({ error: 'Erreur suppression.' }, { status: 500 });
  }

  // Unlink user_profiles.team_id de l'ex-member (pour qu'il retombe en mode solo)
  await supabase
    .from('user_profiles')
    .update({ team_id: null })
    .eq('id', target.user_id);

  return NextResponse.json({ ok: true });
}
