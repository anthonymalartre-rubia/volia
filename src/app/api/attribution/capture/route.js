// ─────────────────────────────────────────────────────────────────────
// /api/attribution/capture — persiste l'attribution first-touch sur le profil
// ─────────────────────────────────────────────────────────────────────
// POST { attribution: { utm_source, utm_medium, utm_campaign, utm_term,
//        utm_content, referrer, landing_path, captured_at } }
// → écrit user_profiles.signup_attribution UNE SEULE FOIS (first-touch).
// Appelé par AttributionTracker dès que l'utilisateur est authentifié.
// Le canal est recalculé côté serveur (on ne fait pas confiance au client).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { sanitizeAttribution } from '@/lib/attribution';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const attr = sanitizeAttribution(body?.attribution || {});
  if (!attr) {
    return NextResponse.json({ ok: true, skipped: 'empty' });
  }

  // first-touch : ne jamais écraser une attribution déjà posée
  const { data: prof } = await supabase
    .from('user_profiles')
    .select('signup_attribution')
    .eq('id', user.id)
    .maybeSingle();
  if (prof?.signup_attribution) {
    return NextResponse.json({ ok: true, skipped: 'already_set' });
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ signup_attribution: attr })
    .eq('id', user.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, channel: attr.channel });
}
