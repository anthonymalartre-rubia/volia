// /api/reactivation/unsubscribe — GET, opt-out global des emails reactivation
// Lien dans le footer de chaque mail de la séquence J+30/60/90.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();

  if (!email) {
    return new Response('Email manquant.', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  try {
    const supabase = getSupabaseAdmin();
    // Trouve user par email (via auth.users)
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      return new Response('Aucun compte trouvé pour cet email.', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }
    await supabase
      .from('user_profiles')
      .update({ reactivation_opted_out: true })
      .eq('id', user.id);

    return new Response(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:480px;margin:60px auto;padding:24px;text-align:center;">
        <h1 style="color:#10b981;">✅ C'est fait</h1>
        <p>Tu ne recevras plus d'emails de reactivation Volia.</p>
        <p style="color:#6b7280;font-size:13px;margin-top:24px;">Si tu changes d'avis, écris-nous à <a href="mailto:contact@volia.fr">contact@volia.fr</a>.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    return new Response('Erreur serveur.', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
}
