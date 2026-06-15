// GET /api/teams/me
// Retourne la team du user courant + members + pending invitations.
// Si l'utilisateur n'a pas de team (plan < Business ou pas encore initialisé),
// retourne { team: null }.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getTeamForUser, planAllowsTeams, ensureTeamForOwner } from '@/lib/teams';
import { getEffectivePlan } from '@/lib/trial';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Plan effectif (trial inclus)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', user.id)
    .maybeSingle();

  const effectivePlan = getEffectivePlan(profile);
  const teamsAllowed = planAllowsTeams(effectivePlan);

  let teamData = await getTeamForUser(user.id);

  // Auto-heal : si user a un plan qui débloque les équipes mais pas de team,
  // on la crée. Couvre les anciens clients Business pré-feature et les
  // comptes admin manuels.
  if (!teamData && teamsAllowed && profile?.plan && planAllowsTeams(profile.plan)) {
    try {
      await ensureTeamForOwner(user.id, user.email);
      teamData = await getTeamForUser(user.id);
    } catch (err) {
      console.error('[api/teams/me] auto-heal failed:', err);
    }
  }

  if (!teamData) {
    return NextResponse.json({
      team: null,
      role: null,
      members: [],
      invitations: [],
      can_invite: false,
      plan_allows_teams: teamsAllowed,
      effective_plan: effectivePlan,
    });
  }

  // Pending invitations de la team
  const { data: invitations } = await supabase
    .from('team_invitations')
    .select('id, email, role, invited_by, expires_at, created_at')
    .eq('team_id', teamData.team.id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    team: teamData.team,
    role: teamData.role,
    members: teamData.members,
    invitations: invitations || [],
    can_invite: teamsAllowed && (teamData.role === 'owner' || teamData.role === 'admin'),
    plan_allows_teams: teamsAllowed,
    effective_plan: effectivePlan,
  });
}
