// POST /api/teams/invitations/[token]/accept
//
// Accepte une invitation : crée le team_member et link user_profiles.team_id.
// L'utilisateur doit être logué. Si son email ne matche pas l'invite,
// on rejette (sécurité — sinon un attaquant pourrait deviner le token et joinr).
//
// GET (bonus) : retourne les infos publiques d'une invitation sans la consommer,
// utile pour afficher la team sur la page /team/join/[token].

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ROLES } from '@/lib/teams';

export async function GET(_request, context) {
  const { token } = await context.params;
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: invite } = await supabase
    .from('team_invitations')
    .select('id, team_id, email, role, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: 'Invitation introuvable.' }, { status: 404 });
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Invitation déjà acceptée.' }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invitation expirée.' }, { status: 410 });
  }

  const { data: team } = await supabase
    .from('teams')
    .select('id, name')
    .eq('id', invite.team_id)
    .maybeSingle();

  return NextResponse.json({
    invitation: {
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
    },
    team: team ? { id: team.id, name: team.name } : null,
  });
}

export async function POST(_request, context) {
  const { token } = await context.params;
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });

  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Vous devez être connecté pour accepter une invitation.', need_auth: true },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Récupère l'invite
  const { data: invite } = await supabase
    .from('team_invitations')
    .select('id, team_id, email, role, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: 'Invitation introuvable.' }, { status: 404 });
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Invitation déjà acceptée.' }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invitation expirée.' }, { status: 410 });
  }

  // Sécurité : vérifier que l'email de l'invite matche l'email du user.
  // Sinon le token pourrait être deviné/exfiltré et accepté par n'importe qui.
  if ((user.email || '').toLowerCase() !== (invite.email || '').toLowerCase()) {
    return NextResponse.json(
      {
        error: `Cette invitation est adressée à ${invite.email}. Connectez-vous avec ce compte pour l'accepter.`,
      },
      { status: 403 }
    );
  }

  // Vérifie que le user n'est pas déjà dans une autre team
  // (un user = une seule team — pour rester simple et éviter les ambiguïtés de quota).
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingMembership && existingMembership.team_id !== invite.team_id) {
    return NextResponse.json(
      {
        error:
          'Vous appartenez déjà à une autre équipe. Quittez-la avant d\'accepter cette invitation.',
      },
      { status: 400 }
    );
  }

  // Crée le team_member (idempotent grâce au UNIQUE constraint)
  const role = invite.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.MEMBER;
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: user.id,
      role,
      invited_by: invite.invited_by,
    });

  if (memberError && memberError.code !== '23505') {
    console.error('[api/teams/invitations/accept] member insert failed:', memberError);
    return NextResponse.json({ error: 'Erreur ajout au team.' }, { status: 500 });
  }

  // Marque l'invitation comme acceptée
  await supabase
    .from('team_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  // Link sur user_profiles (best-effort)
  await supabase
    .from('user_profiles')
    .update({ team_id: invite.team_id })
    .eq('id', user.id);

  return NextResponse.json({ ok: true, team_id: invite.team_id });
}
