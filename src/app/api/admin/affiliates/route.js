// /api/admin/affiliates
//   GET  → liste des affiliés + résumé commissions (admin only)
//   POST → actions : approve | reject | suspend | reactivate | mark_paid
//
// Réservé aux users user_profiles.is_admin = true.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';

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

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const supabase = getSupabaseAdmin();

  const { data: affiliates } = await supabase
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('affiliate_id, commission_cents, status, payable_at');

  const now = Date.now();
  const byAffiliate = {};
  for (const c of commissions || []) {
    const a = (byAffiliate[c.affiliate_id] ||= {
      paidCents: 0, payableCents: 0, pendingHoldCents: 0, clawedBackCents: 0, count: 0,
    });
    a.count += 1;
    if (c.status === 'paid') a.paidCents += c.commission_cents;
    else if (c.status === 'clawed_back') a.clawedBackCents += c.commission_cents;
    else if (new Date(c.payable_at).getTime() <= now) a.payableCents += c.commission_cents;
    else a.pendingHoldCents += c.commission_cents;
  }

  const enriched = (affiliates || []).map((a) => ({
    ...a,
    summary: byAffiliate[a.id] || { paidCents: 0, payableCents: 0, pendingHoldCents: 0, clawedBackCents: 0, count: 0 },
  }));

  return NextResponse.json({ ok: true, affiliates: enriched });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const { action, affiliateId, payoutInvoiceRef } = body || {};
  if (!action || !affiliateId) {
    return NextResponse.json({ error: 'action + affiliateId requis' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: aff } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .maybeSingle();
  if (!aff) return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });

  switch (action) {
    case 'approve': {
      await supabase
        .from('affiliates')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', affiliateId);
      // Email de bienvenue avec lien d'affiliation + dashboard
      const link = `https://volia.fr/?aff=${aff.code}`;
      const dash = `https://volia.fr/affiliation/suivi?code=${aff.code}`;
      sendEmail({
        to: aff.email,
        subject: '✅ Bienvenue dans le programme affilié Volia',
        html: `<p>Salut ${aff.name || ''},</p>
<p>Ta candidature est validée 🎉 Voici tout ce qu'il te faut :</p>
<p><b>Ton lien d'affiliation :</b><br><a href="${link}">${link}</a></p>
<p><b>Ton tableau de bord (gains en temps réel) :</b><br><a href="${dash}">${dash}</a></p>
<p>Commission : <b>50 % la 1ʳᵉ année, 30 % la 2ᵉ</b> sur chaque paiement des clients que tu amènes. Versement sur facture une fois le seuil atteint.</p>
<p>Garde ce lien précieusement (il vaut tes commissions). À toi de jouer 🚀</p>
<p>Anthony · Volia</p>`,
      }).catch((e) => console.error('[admin/affiliates] approve email failed', e));
      return NextResponse.json({ ok: true, status: 'approved' });
    }

    case 'reject':
      await supabase.from('affiliates').update({ status: 'rejected' }).eq('id', affiliateId);
      return NextResponse.json({ ok: true, status: 'rejected' });

    case 'suspend':
      await supabase.from('affiliates').update({ status: 'suspended' }).eq('id', affiliateId);
      return NextResponse.json({ ok: true, status: 'suspended' });

    case 'reactivate':
      await supabase.from('affiliates').update({ status: 'approved' }).eq('id', affiliateId);
      return NextResponse.json({ ok: true, status: 'approved' });

    case 'mark_paid': {
      // Marque PAYÉES toutes les commissions éligibles (payables, hors hold/clawback).
      const nowIso = new Date().toISOString();
      const { data: updated } = await supabase
        .from('affiliate_commissions')
        .update({ status: 'paid', paid_at: nowIso, payout_invoice_ref: payoutInvoiceRef || null })
        .eq('affiliate_id', affiliateId)
        .in('status', ['pending', 'payable'])
        .lte('payable_at', nowIso)
        .select('id, commission_cents');
      const total = (updated || []).reduce((t, c) => t + c.commission_cents, 0);
      return NextResponse.json({ ok: true, marked: updated?.length || 0, total_cents: total });
    }

    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  }
}
