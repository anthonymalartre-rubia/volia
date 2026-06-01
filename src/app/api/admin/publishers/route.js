// ─────────────────────────────────────────────────────────────────────
// /api/admin/publishers — CRUD config des publishers sociaux (admin only)
// ─────────────────────────────────────────────────────────────────────
//
// GET   → liste les publishers configurés (credentials masqués)
// POST  → upsert un publisher
//          body : { platform, enabled, credentials, label }
//          → contrainte UNIQUE(platform) en DB → 1 ligne max par platform
// DELETE → désactive (enabled=false) un publisher (on garde la ligne pour audit)
//          body : { platform }
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { listPublishersStatus } from '@/lib/publishers';

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

const VALID_PLATFORMS = ['linkedin', 'twitter', 'webhook'];

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const publishers = await listPublishersStatus();
  return NextResponse.json({ success: true, publishers });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { platform, enabled = true, credentials = {}, label = null } = body;

  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: `platform requis, valeurs : ${VALID_PLATFORMS.join(', ')}` },
      { status: 400 }
    );
  }
  if (!credentials || typeof credentials !== 'object') {
    return NextResponse.json({ error: 'credentials doit être un objet' }, { status: 400 });
  }

  // Validation minimale par platform
  if (platform === 'linkedin') {
    if (!credentials.access_token) {
      return NextResponse.json(
        { error: 'credentials.access_token requis pour LinkedIn' },
        { status: 400 }
      );
    }
    if (!credentials.person_urn || !credentials.person_urn.startsWith('urn:li:person:')) {
      return NextResponse.json(
        { error: 'credentials.person_urn requis (format urn:li:person:XXXX)' },
        { status: 400 }
      );
    }
  }
  if (platform === 'webhook' && !credentials.url) {
    return NextResponse.json({ error: 'credentials.url requis pour webhook' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Si une ligne existe pour cette platform, on update ; sinon insert.
  // (UNIQUE constraint en DB → upsert on platform)
  const { data, error } = await supabase
    .from('publisher_credentials')
    .upsert(
      {
        platform,
        enabled,
        credentials,
        label,
        last_error: null, // reset l'erreur précédente quand on update les creds
      },
      { onConflict: 'platform' }
    )
    .select('id, platform, enabled, label, updated_at')
    .single();

  if (error) {
    console.error('[api/admin/publishers] upsert error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, publisher: data });
}

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { platform } = body;
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'platform requis' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('publisher_credentials')
    .update({ enabled: false })
    .eq('platform', platform);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
