// GET    /api/admin/prospection/sms-campaigns/[id]  → détails + stats
// DELETE /api/admin/prospection/sms-campaigns/[id]  → supprime (seulement si draft / paused)

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

export async function GET(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const { data: campaign } = await supabase
    .from('sms_campaigns')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });

  const { data: sends } = await supabase
    .from('sms_sends')
    .select('id, phone, status, error, sent_at, delivered_at, failed_at, cost_eur, segments')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ campaign, sample_sends: sends || [] });
}

export async function DELETE(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const { data: c } = await supabase
    .from('sms_campaigns').select('status').eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!c) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (['sending', 'sent'].includes(c.status)) {
    return NextResponse.json({ error: 'Impossible : campagne déjà envoyée.' }, { status: 400 });
  }

  const { error } = await supabase.from('sms_campaigns').delete().eq('id', id).eq('owner_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
