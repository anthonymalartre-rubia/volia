// src/lib/teams.js
// Helpers serveur pour la gestion des teams (multi-utilisateurs Business).
//
// Modèle :
//   teams           — 1 par owner Business
//   team_members    — relation user ↔ team avec rôle (owner|admin|member)
//   team_invitations— invitations pending avec token unique
//
// RBAC simple :
//   owner  → tout (billing, delete team, transfer ownership)
//   admin  → invite + remove members, gère les données
//   member → utilisation normale, pas d'invite

import crypto from 'crypto';
import { getSupabaseAdmin } from './supabase-admin';
import { getEffectivePlan } from './trial';

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

// Plans qui débloquent le multi-utilisateurs.
// Garde 'enterprise' comme alias historique (cf. lib/plans.js).
export const TEAMS_ENABLED_PLANS = ['business', 'enterprise'];

/**
 * Vrai si le plan donné débloque le multi-utilisateurs.
 */
export function planAllowsTeams(planId) {
  if (!planId) return false;
  return TEAMS_ENABLED_PLANS.includes(planId);
}

/**
 * Génère un token d'invitation cryptographiquement aléatoire (urlsafe).
 */
export function generateInviteToken() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Crée (ou récupère) la team d'un owner. Idempotent : si owner a déjà une team
 * il la renvoie. Sinon crée la team + team_members(role=owner) + link
 * user_profiles.team_id.
 *
 * Appelé depuis le webhook Stripe quand un user passe en plan Business.
 *
 * @param {string} userId
 * @param {string} userEmail — utilisé pour générer le nom par défaut
 * @returns {Promise<{ team: object, created: boolean }>}
 */
export async function ensureTeamForOwner(userId, userEmail) {
  const supabase = getSupabaseAdmin();

  // Already owns a team ?
  const { data: existing } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle();

  if (existing) {
    // S'assure que user_profiles.team_id est bien set
    await supabase
      .from('user_profiles')
      .update({ team_id: existing.id })
      .eq('id', userId);
    return { team: existing, created: false };
  }

  const defaultName = userEmail
    ? `Équipe de ${userEmail.split('@')[0]}`
    : 'Mon équipe';

  const { data: team, error } = await supabase
    .from('teams')
    .insert({ owner_id: userId, name: defaultName, plan: 'business' })
    .select()
    .single();

  if (error) {
    console.error('[teams] ensureTeamForOwner insert team failed:', error);
    throw error;
  }

  // Owner = premier team_member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: ROLES.OWNER });

  if (memberError && memberError.code !== '23505') {
    console.error('[teams] ensureTeamForOwner insert member failed:', memberError);
  }

  // Link sur user_profiles
  await supabase
    .from('user_profiles')
    .update({ team_id: team.id })
    .eq('id', userId);

  return { team, created: true };
}

/**
 * Récupère la team du user (en tant que owner ou member) avec ses members.
 * Retourne null si pas de team.
 */
export async function getTeamForUser(userId) {
  const supabase = getSupabaseAdmin();

  // Cherche un membership (couvre owner ET member car owner est toujours member)
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', userId)
    .maybeSingle();

  if (!membership) return null;

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', membership.team_id)
    .maybeSingle();

  if (!team) return null;

  const { data: members } = await supabase
    .from('team_members')
    .select('id, user_id, role, joined_at, invited_by')
    .eq('team_id', team.id)
    .order('joined_at', { ascending: true });

  // Enrichit chaque member avec email + nom depuis auth.users
  const enrichedMembers = await Promise.all(
    (members || []).map(async (m) => {
      try {
        const { data } = await supabase.auth.admin.getUserById(m.user_id);
        return {
          ...m,
          email: data?.user?.email || null,
          full_name:
            data?.user?.user_metadata?.full_name ||
            data?.user?.user_metadata?.name ||
            null,
        };
      } catch {
        return { ...m, email: null, full_name: null };
      }
    })
  );

  return {
    team,
    role: membership.role,
    members: enrichedMembers,
  };
}

/**
 * Récupère le rôle du user dans une team. null si pas membre.
 */
export async function getUserRole(teamId, userId) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle();
  return data?.role || null;
}

// ─── RBAC checks ──────────────────────────────────────────────────────

export function canInviteMembers(role) {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

export function canRemoveMembers(role) {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

export function canManageBilling(role) {
  return role === ROLES.OWNER;
}

export function canDeleteTeam(role) {
  return role === ROLES.OWNER;
}

export function canChangeRole(role) {
  return role === ROLES.OWNER;
}

/**
 * Helper "scope de quota" : retourne team_id si user appartient à une team,
 * sinon user_id. Permet aux checks de quota de partager le pot par team.
 *
 * @returns {{ kind: 'team'|'user', id: string }}
 */
export async function getQuotaScope(userId) {
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('team_id')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.team_id) {
    return { kind: 'team', id: profile.team_id };
  }
  return { kind: 'user', id: userId };
}

/**
 * Récupère la liste des user_ids de la team du user (pour agréger l'usage).
 * Si pas de team → retourne [userId].
 */
export async function getQuotaMemberIds(userId) {
  const scope = await getQuotaScope(userId);
  if (scope.kind === 'user') return [userId];

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', scope.id);

  return (data || []).map((m) => m.user_id);
}

/**
 * Vérifie qu'une team est sur un plan qui débloque les invitations.
 * Combine le plan stocké sur teams.plan + le plan effectif de l'owner (avec trial).
 */
export async function teamCanInvite(teamId) {
  const supabase = getSupabaseAdmin();
  const { data: team } = await supabase
    .from('teams')
    .select('id, owner_id, plan')
    .eq('id', teamId)
    .maybeSingle();
  if (!team) return false;

  if (planAllowsTeams(team.plan)) return true;

  // Fallback : check le plan effectif de l'owner (peut être en trial Pro+)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', team.owner_id)
    .maybeSingle();

  if (!profile) return false;
  const effective = getEffectivePlan(profile);
  return planAllowsTeams(effective);
}
