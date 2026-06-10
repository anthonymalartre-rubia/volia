// POST /api/admin/prospection/sms-campaigns/[id]/send
//
// Queue un sms_sends pour chaque contact NON opt-out avec phone valide (mobile FR)
// et passe la campagne en status 'sending' (ou 'scheduled').
//
// Body : { scheduled_at? } pour planification.

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isMobileE164Fr } from '@/lib/sms';

export async function POST(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at).toISOString() : null;

  const { data: campaign } = await supabase
    .from('sms_campaigns')
    .select('id, list_id, status')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });
  if (campaign.status === 'sending' || campaign.status === 'sent') {
    return NextResponse.json({ error: 'Campagne déjà en cours / envoyée' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const PAGE_SIZE = 1000;
  let totalQueued = 0;
  let totalSkipped = 0;
  let offset = 0;

  while (true) {
    const { data: contacts, error: cErr } = await supabaseAdmin
      .from('prospect_contacts')
      .select('id, phone')
      .eq('list_id', campaign.list_id)
      .not('phone', 'is', null)
      .eq('opt_out', false)
      .range(offset, offset + PAGE_SIZE - 1);

    if (cErr) {
      console.error('[sms/send] fetch error', cErr);
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }
    if (!contacts || contacts.length === 0) break;

    // Filtre : seulement les mobiles FR valides E.164
    const valid = contacts.filter((c) => isMobileE164Fr(c.phone));
    totalSkipped += contacts.length - valid.length;

    if (valid.length > 0) {
      const rows = valid.map((c) => ({
        campaign_id: id,
        contact_id: c.id,
        phone: c.phone,
        status: 'pending',
      }));

      const { error: insErr } = await supabaseAdmin
        .from('sms_sends')
        .upsert(rows, { ignoreDuplicates: true });

      if (insErr) {
        console.error('[sms/send] insert error', insErr);
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
      totalQueued += valid.length;
    }

    if (contacts.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  const newStatus = scheduledAt && new Date(scheduledAt) > new Date() ? 'scheduled' : 'sending';
  const { error: upErr } = await supabaseAdmin
    .from('sms_campaigns')
    .update({
      status: newStatus,
      scheduled_at: scheduledAt,
      started_at: newStatus === 'sending' ? new Date().toISOString() : null,
      total_recipients: totalQueued,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    queued: totalQueued,
    skipped_non_mobile: totalSkipped,
    status: newStatus,
    message: newStatus === 'scheduled'
      ? `Campagne SMS planifiée pour ${scheduledAt}. ${totalQueued} destinataires.`
      : `Envoi SMS démarré. ${totalQueued} destinataires (cron envoie ~20 SMS / 5 min). ${totalSkipped} ignorés (non mobile FR).`,
  });
}
