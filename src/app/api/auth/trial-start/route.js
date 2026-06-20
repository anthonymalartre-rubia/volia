import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/emailTemplates';

/**
 * POST /api/auth/trial-start
 *
 * Appelé depuis /auth/confirm (signup email) après détection SIGNED_IN.
 *
 * Freemium pur (20/06/2026) : il n'y a plus d'essai d'office. Le nouvel
 * inscrit démarre en 'free' (créé par le trigger DB handle_new_user). Ce
 * endpoint envoie le WELCOME email une seule fois, de façon idempotente
 * via la colonne welcomed_at (posée ici → 2e confirm = no-op).
 *
 * On garde le path /api/auth/trial-start pour ne pas casser l'appel client
 * existant ; son rôle est désormais "send welcome", pas "start trial".
 *
 * /api/auth/callback (OAuth Google) fait la même chose pour le flow Google.
 */
export async function POST() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, welcomed_at')
    .eq('id', user.id)
    .maybeSingle();

  // Cas edge : profil pas encore créé par le trigger → on le crée en free.
  if (!profile) {
    await supabaseAdmin
      .from('user_profiles')
      .insert({ id: user.id, plan: 'free' });
  }

  // Déjà accueilli → no-op (anti double-send sur re-confirm / double-clic).
  if (profile?.welcomed_at) {
    return NextResponse.json({ ok: true, welcomed: 'already' });
  }

  // Marque comme accueilli AVANT l'envoi (idempotence forte).
  await supabaseAdmin
    .from('user_profiles')
    .update({ welcomed_at: new Date().toISOString() })
    .eq('id', user.id);

  // Envoi email — fire & forget pour ne pas bloquer la redirect dashboard.
  try {
    const userName =
      user.user_metadata?.full_name || user.user_metadata?.name || null;
    const tpl = welcomeEmail(userName);
    sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html }).catch(
      (err) => console.error('[trial-start] welcome email failed:', err),
    );
  } catch (err) {
    console.error('[trial-start] template error:', err);
  }

  return NextResponse.json({ ok: true, welcomed: true });
}
