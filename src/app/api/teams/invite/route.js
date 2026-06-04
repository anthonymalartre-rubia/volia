// POST /api/teams/invite
// Crée une invitation team_invitations + envoie un email avec un lien token.
//
// Body : { email, role: 'admin' | 'member' }
// Auth : user doit appartenir à une team avec rôle owner ou admin,
//        et le plan effectif de la team doit être Business+.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  getTeamForUser,
  canInviteMembers,
  teamCanInvite,
  generateInviteToken,
  ROLES,
} from '@/lib/teams';
import { sendEmail } from '@/lib/email';
import { teamInvitationEmail } from '@/lib/emailTemplates';
import { syncTeamSeats } from '@/lib/seats';

const INVITATION_TTL_DAYS = 7;
const MAX_PENDING_INVITES = 50; // anti-abus

function isValidEmail(str) {
  return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export async function POST(request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const email = (body.email || '').trim().toLowerCase();
  const role = body.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.MEMBER;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
  }

  // Vérifie que le user a une team
  const teamData = await getTeamForUser(user.id);
  if (!teamData) {
    return NextResponse.json(
      { error: 'Aucune équipe trouvée. Passez au plan Business pour inviter des membres.' },
      { status: 403 }
    );
  }

  // RBAC
  if (!canInviteMembers(teamData.role)) {
    return NextResponse.json(
      { error: 'Seuls les owners et admins peuvent inviter.' },
      { status: 403 }
    );
  }

  // Gating Business
  const allowed = await teamCanInvite(teamData.team.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Le plan Business est requis pour inviter des membres.' },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Vérifie qu'on n'invite pas un email déjà membre
  const alreadyMember = (teamData.members || []).some(
    (m) => (m.email || '').toLowerCase() === email
  );
  if (alreadyMember) {
    return NextResponse.json(
      { error: 'Cet utilisateur est déjà membre de l\'équipe.' },
      { status: 400 }
    );
  }

  // Vérifie qu'il n'y a pas déjà une invite pending pour cet email
  const { data: existingInvite } = await supabase
    .from('team_invitations')
    .select('id, expires_at, token')
    .eq('team_id', teamData.team.id)
    .ilike('email', email)
    .is('accepted_at', null)
    .maybeSingle();

  if (existingInvite && new Date(existingInvite.expires_at) > new Date()) {
    return NextResponse.json(
      { error: 'Une invitation est déjà en attente pour cet email.' },
      { status: 400 }
    );
  }

  // Anti-abus : count des invites pending de la team
  const { count: pendingCount } = await supabase
    .from('team_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', teamData.team.id)
    .is('accepted_at', null);

  if ((pendingCount || 0) >= MAX_PENDING_INVITES) {
    return NextResponse.json(
      { error: `Limite d'invitations en attente atteinte (${MAX_PENDING_INVITES}).` },
      { status: 400 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 3600 * 1000).toISOString();

  // Si invite expirée existe, on la remplace plutôt que d'en créer une 2e
  if (existingInvite) {
    await supabase
      .from('team_invitations')
      .delete()
      .eq('id', existingInvite.id);
  }

  const { data: invite, error: insertError } = await supabase
    .from('team_invitations')
    .insert({
      team_id: teamData.team.id,
      email,
      role,
      invited_by: user.id,
      token,
      expires_at: expiresAt,
    })
    .select('id, email, role, expires_at, created_at')
    .single();

  if (insertError) {
    console.error('[api/teams/invite] insert error', insertError);
    return NextResponse.json({ error: 'Erreur création invitation.' }, { status: 500 });
  }

  // Email transactionnel (fire-and-forget, on retourne quand même OK)
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://volia.fr';
    const acceptUrl = `${appUrl}/team/join/${token}`;
    const tpl = teamInvitationEmail({
      inviterName: user.user_metadata?.full_name || user.user_metadata?.name || null,
      inviterEmail: user.email,
      teamName: teamData.team.name,
      role,
      acceptUrl,
    });
    sendEmail({ to: email, subject: tpl.subject, html: tpl.html }).catch((err) =>
      console.error('[api/teams/invite] email failed:', err)
    );
  } catch (err) {
    console.error('[api/teams/invite] email build error:', err);
  }

  // Facturation au siège : un siège est réservé dès l'invitation (proraté).
  let seatSync = null;
  try { seatSync = await syncTeamSeats(teamData.team.id); } catch (e) { console.error('[api/teams/invite] seat sync', e?.message || e); }

  return NextResponse.json({ invitation: invite, ok: true, seats: seatSync?.seats });
}
