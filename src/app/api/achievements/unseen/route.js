// src/app/api/achievements/unseen/route.js
// ─────────────────────────────────────────────────────────────────────
// GET /api/achievements/unseen
//
// Retourne les achievements débloqués par le user mais jamais montrés
// sous forme de toast (toast_shown_at IS NULL).
//
// Use case : un user débloque un achievement "silencieux" (webhook
// resend.inbound → first_reply_received, form public submit →
// first_lead_via_form) pendant qu'il n'est pas devant l'écran. À sa
// prochaine visite, le composant client <AchievementPuller> appelle
// cette route et cascade les toasts.
//
// Sécurité : l'auth user vient de getAuthenticatedUser() (cookie Supabase
// SSR). Aucune fuite cross-user possible — on filtre toujours par user.id.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { ACHIEVEMENTS } from '@/lib/achievements';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  // SELECT * FROM user_achievements WHERE user_id = $1 AND toast_shown_at IS NULL
  // ORDER BY unlocked_at ASC (chronologique pour la cascade)
  const { data, error } = await supabase
    .from('user_achievements')
    .select('id, achievement_key, unlocked_at, payload')
    .eq('user_id', user.id)
    .is('toast_shown_at', null)
    .order('unlocked_at', { ascending: true });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[achievements/unseen] query error:', error.message);
    // On retourne 200 + array vide plutôt qu'une 500 : un achievement raté
    // n'est pas critique, on ne veut pas spammer Sentry et on ne veut pas
    // que le puller boucle en réessayant.
    return NextResponse.json({ achievements: [] });
  }

  // Enrichir avec le catalogue ACHIEVEMENTS (label, description, icon, color)
  // pour que le client puisse render le toast directement.
  const achievements = (data || [])
    .map((row) => {
      const meta = ACHIEVEMENTS[row.achievement_key];
      if (!meta) return null; // clé obsolète : on skip silencieusement
      return {
        id: row.id, // user_achievement.id — utilisé par mark-seen
        ...meta,
        unlocked_at: row.unlocked_at,
        payload: row.payload,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ achievements });
}
