// ─────────────────────────────────────────────────────────────────────
// GET /api/email-senders/deliverability
// ─────────────────────────────────────────────────────────────────────
// Santé d'envoi du user :
//   - par domaine vérifié : statut, DNS (SPF/DKIM/DMARC depuis dns_records),
//     état warmup (peers actifs, échangés/répondus)
//   - global 30j : envoyés / délivrés / bounces / plaintes + taux
//
// Read-only. Auth requise. RLS = le user ne voit que ses senders/campagnes.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function summarizeDns(dnsRecords) {
  if (!Array.isArray(dnsRecords) || dnsRecords.length === 0) {
    return { total: 0, verified: 0, spf: null, dkim: null, dmarc: null };
  }
  const isVerified = (r) => /verified|success|ok/i.test(String(r?.status || ''));
  const kind = (r) => {
    const s = `${r?.record || ''} ${r?.type || ''} ${r?.name || ''}`.toLowerCase();
    if (s.includes('dmarc')) return 'dmarc';
    if (s.includes('dkim')) return 'dkim';
    if (s.includes('spf') || (s.includes('txt') && s.includes('send'))) return 'spf';
    return null;
  };
  const out = { total: dnsRecords.length, verified: 0, spf: null, dkim: null, dmarc: null };
  for (const r of dnsRecords) {
    const v = isVerified(r);
    if (v) out.verified += 1;
    const k = kind(r);
    if (k && out[k] !== true) out[k] = v ? true : out[k] === null ? false : out[k];
  }
  return out;
}

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 1) Senders du user
  const { data: senders } = await supabase
    .from('email_senders')
    .select('id, domain, status, dns_records, from_name, verified_at, last_check_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const senderList = Array.isArray(senders) ? senders : [];
  const senderIds = senderList.map((s) => s.id);

  // 2) Warmup par sender
  let warmupBySender = {};
  if (senderIds.length) {
    const { data: warm } = await supabase
      .from('warmup_peer_pool')
      .select('sender_id, active, total_sent, total_replied')
      .in('sender_id', senderIds);
    for (const w of warm || []) {
      const agg = warmupBySender[w.sender_id] || { peers: 0, active: 0, sent: 0, replied: 0 };
      agg.peers += 1;
      if (w.active) agg.active += 1;
      agg.sent += w.total_sent || 0;
      agg.replied += w.total_replied || 0;
      warmupBySender[w.sender_id] = agg;
    }
  }

  // 3) Stats 30j globales (via les campagnes du user)
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const stats = { sent: 0, delivered: 0, bounced: 0, complained: 0 };
  const { data: camps } = await supabase
    .from('email_campaigns')
    .select('id')
    .eq('owner_id', user.id);
  const campaignIds = (camps || []).map((c) => c.id);
  if (campaignIds.length) {
    const { data: sends } = await supabase
      .from('email_sends')
      .select('status, sent_at, delivered_at, bounced_at, complained_at')
      .in('campaign_id', campaignIds)
      .gte('sent_at', since)
      .limit(5000);
    for (const s of sends || []) {
      stats.sent += 1;
      if (s.delivered_at) stats.delivered += 1;
      if (s.bounced_at) stats.bounced += 1;
      if (s.complained_at) stats.complained += 1;
    }
  }
  const pct = (n) => (stats.sent ? Math.round((n / stats.sent) * 1000) / 10 : 0);

  const senders_health = senderList.map((s) => ({
    id: s.id,
    domain: s.domain,
    from_name: s.from_name,
    status: s.status,
    verified_at: s.verified_at,
    last_check_at: s.last_check_at,
    dns: summarizeDns(s.dns_records),
    warmup: warmupBySender[s.id] || { peers: 0, active: 0, sent: 0, replied: 0 },
  }));

  return NextResponse.json({
    success: true,
    senders: senders_health,
    stats30d: {
      ...stats,
      bounce_rate: pct(stats.bounced),
      complaint_rate: pct(stats.complained),
      delivery_rate: pct(stats.delivered),
    },
  });
}
