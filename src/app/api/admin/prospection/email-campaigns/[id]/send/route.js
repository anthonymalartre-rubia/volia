// POST /api/admin/prospection/email-campaigns/[id]/send
//
// Action : génère un email_sends pour chaque contact NON opt-out NON
// déjà envoyé de la liste, et passe la campagne en status 'sending'.
// Le cron /api/cron/process-email-campaigns fera l'envoi par batch.
//
// Body : { scheduled_at? } pour planification, sinon envoi immédiat.

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { trackOnboardingStep } from '@/lib/onboarding';

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at).toISOString() : null;

  // Vérifie la campagne
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select('id, list_id, status')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });
  if (campaign.status === 'sending' || campaign.status === 'sent') {
    return NextResponse.json({ error: 'Campagne déjà en cours / envoyée' }, { status: 400 });
  }

  // Use service_role pour le bulk insert (bypass RLS sur email_sends)
  const supabaseAdmin = getSupabaseAdmin();

  // Récup les contacts éligibles (email présent, non opt-out)
  // On chunk par 1000 pour pas exploser la mémoire
  const PAGE_SIZE = 1000;
  let totalQueued = 0;
  let offset = 0;

  while (true) {
    const { data: contacts, error: cErr } = await supabaseAdmin
      .from('prospect_contacts')
      .select('id, email')
      .eq('list_id', campaign.list_id)
      .not('email', 'is', null)
      .eq('opt_out', false)
      .range(offset, offset + PAGE_SIZE - 1);

    if (cErr) {
      console.error('[campaigns/send] error fetching contacts', cErr);
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }
    if (!contacts || contacts.length === 0) break;

    // Insert sends, ignore les déjà-existants (campaign × contact unique)
    const rows = contacts.map((c) => ({
      campaign_id: id,
      contact_id: c.id,
      email: c.email,
      status: 'pending',
    }));

    const { error: insErr, count } = await supabaseAdmin
      .from('email_sends')
      .upsert(rows, { ignoreDuplicates: true, count: 'exact' });

    if (insErr) {
      console.error('[campaigns/send] insert error', insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    totalQueued += contacts.length;

    if (contacts.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  // Update status campagne
  const newStatus = scheduledAt && new Date(scheduledAt) > new Date() ? 'scheduled' : 'sending';
  const { error: upErr } = await supabaseAdmin
    .from('email_campaigns')
    .update({
      status: newStatus,
      scheduled_at: scheduledAt,
      started_at: newStatus === 'sending' ? new Date().toISOString() : null,
      total_recipients: totalQueued,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Onboarding : marque first_campaign (fire-and-forget)
  if (totalQueued > 0) {
    trackOnboardingStep(user.id, 'first_campaign');
  }

  return NextResponse.json({
    ok: true,
    queued: totalQueued,
    status: newStatus,
    message: newStatus === 'scheduled'
      ? `Campagne planifiée pour ${scheduledAt}. ${totalQueued} destinataires.`
      : `Envoi démarré. ${totalQueued} destinataires en queue. Cron envoie ~50 mails toutes les 5 min.`,
  });
}
