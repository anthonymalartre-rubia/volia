// POST /api/onboarding/welcomed
//
// Marque que le user a vu (et dismissed) le FirstLoginWelcome overlay sur
// son dashboard. Set user_profiles.welcomed_at = NOW() de manière idempotente
// (si déjà set, on ne touche pas — on garde le timestamp historique).
//
// Appelé en best-effort (fire-and-forget) côté client : ne renvoie jamais
// 500 — si l'UPDATE échoue, l'utilisateur reverra le modal au prochain
// load et c'est OK (jamais bloquant).

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupère le timestamp existant pour ne pas l'écraser (idempotent).
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('welcomed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.welcomed_at) {
    // Déjà welcomé : on renvoie ok sans rien faire.
    return NextResponse.json({ ok: true, welcomed_at: profile.welcomed_at });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('user_profiles')
    .update({ welcomed_at: now })
    .eq('id', user.id);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[onboarding/welcomed] update error', error);
    // Best-effort : on renvoie 200 quand même pour ne pas spammer le client.
    return NextResponse.json({ ok: false, error: error.message });
  }

  return NextResponse.json({ ok: true, welcomed_at: now });
}
