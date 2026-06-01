// ─────────────────────────────────────────────────────────────────────
// /api/admin/publishers/test — Tester la connexion à un publisher
// ─────────────────────────────────────────────────────────────────────
//
// POST body : { platform, credentials }
//
// Pour LinkedIn : appelle /v2/me et vérifie que le token marche.
//   → renvoie le person_urn détecté (utile à coller dans le formulaire).
// Pour Webhook : POST un payload "ping" sur l'URL, attend un 2xx.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { testLinkedInToken } from '@/lib/publishers/linkedin';
import { publishToWebhook } from '@/lib/publishers/webhook';

async function requireAdmin() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { error: 'Forbidden — admin only', status: 403 };
  return { user };
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { platform, credentials } = body;
  if (!platform) return NextResponse.json({ error: 'platform requis' }, { status: 400 });
  if (!credentials) return NextResponse.json({ error: 'credentials requis' }, { status: 400 });

  let result;
  if (platform === 'linkedin') {
    result = await testLinkedInToken(credentials.access_token);
  } else if (platform === 'webhook') {
    result = await publishToWebhook(
      '🟢 Volia publisher test — ce message peut être ignoré',
      credentials,
      { platform: 'test', action_id: 'test-ping' }
    );
  } else {
    return NextResponse.json({ error: `platform "${platform}" non supportée pour test` }, { status: 400 });
  }

  // Si test OK, met à jour test_passed_at sur la ligne existante (si elle existe)
  if (result.ok) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('publisher_credentials')
        .update({ test_passed_at: new Date().toISOString(), last_error: null })
        .eq('platform', platform);
    } catch (e) {
      // Non bloquant
      console.warn('[test publisher] update test_passed_at failed', e.message);
    }
  }

  return NextResponse.json(result);
}
