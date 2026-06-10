import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';

/**
 * GET /api/cron/weekly-activation-report
 *
 * Cron hebdomadaire (vendredi 7h UTC = 9h Paris). Compile le funnel
 * d'activation des inscrits récents (14 jours) + les trials qui expirent
 * sous 72 h + les conversions de la semaine, et envoie le tout à l'ops.
 *
 * Objectif : piloter la semaine commerciale sans audit manuel.
 * Sécurité : header Authorization: Bearer CRON_SECRET (cf. vercel.json).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function checkCronAuth(request) {
  const auth = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  return process.env.CRON_SECRET && auth === expected;
}

function esc(s) {
  return String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

export async function GET(request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const to = cleanEnv(process.env.OPS_ALERT_EMAIL) || 'anthony.malartre@suraya.fr';
  const now = new Date();
  const month = now.toISOString().slice(0, 7);

  try {
    // 1. Inscrits des 14 derniers jours, avec funnel d'usage.
    const { data: recentUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    const cutoff = now.getTime() - 14 * 86400000;
    const recents = (recentUsers?.users || []).filter(
      (u) => new Date(u.created_at).getTime() > cutoff
    );

    const rows = [];
    for (const u of recents) {
      const [{ data: profile }, { data: usage }] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('plan, trial_ends_at, trial_converted_at, onboarding_steps')
          .eq('id', u.id)
          .maybeSingle(),
        supabase
          .from('usage_tracking')
          .select('searches, enrichments, exports')
          .eq('user_id', u.id)
          .eq('month', month)
          .maybeSingle(),
      ]);
      const steps = profile?.onboarding_steps || {};
      rows.push({
        email: u.email,
        lastSignIn: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-FR') : '—',
        trialEnd: profile?.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString('fr-FR') : '—',
        converted: Boolean(profile?.trial_converted_at),
        searches: usage?.searches || 0,
        enrichments: usage?.enrichments || 0,
        exports: usage?.exports || 0,
        campaign: Boolean(steps.first_campaign),
      });
    }
    // Tri : les plus avancés d'abord (ce sont eux qu'on appelle en premier).
    rows.sort((a, b) => (b.enrichments - a.enrichments) || (b.searches - a.searches));

    // 2. Trials expirant sous 72 h (non convertis).
    const in72h = new Date(now.getTime() + 72 * 3600000).toISOString();
    const { data: expiring } = await supabase
      .from('user_profiles')
      .select('id, trial_ends_at')
      .not('trial_ends_at', 'is', null)
      .is('trial_converted_at', null)
      .gt('trial_ends_at', now.toISOString())
      .lte('trial_ends_at', in72h);

    // 3. Conversions des 7 derniers jours.
    const { count: conversions } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('trial_converted_at', new Date(now.getTime() - 7 * 86400000).toISOString());

    const enriched = rows.filter((r) => r.enrichments > 0).length;
    const tableRows = rows
      .map(
        (r) => `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #26263a;font-size:12px;color:#e4e4ef;">${esc(r.email)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #26263a;font-size:12px;color:#a1a1b5;text-align:center;">${r.searches}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #26263a;font-size:12px;text-align:center;color:${r.enrichments > 0 ? '#34d399' : '#71717a'};">${r.enrichments}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #26263a;font-size:12px;color:#a1a1b5;text-align:center;">${r.campaign ? '✉️' : '—'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #26263a;font-size:12px;color:#a1a1b5;text-align:center;">${esc(r.lastSignIn)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #26263a;font-size:12px;text-align:center;color:${r.converted ? '#34d399' : '#fbbf24'};">${r.converted ? '✅ payé' : esc(r.trialEnd)}</td>
        </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#0b0b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:32px 20px;">
  <div style="background:#14141f;border:1px solid #26263a;border-radius:16px;padding:28px;">
    <p style="font-size:13px;font-weight:700;color:#a78bfa;margin:0 0 4px;">Volia · Radar activation</p>
    <h1 style="color:#fff;font-size:20px;margin:0 0 18px;">Rapport du ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
    <table role="presentation" style="width:100%;margin:0 0 20px;"><tr>
      <td style="background:#1c1c2b;border-radius:10px;padding:12px;text-align:center;"><span style="display:block;font-size:22px;font-weight:700;color:#fff;">${rows.length}</span><span style="font-size:11px;color:#71717a;">inscrits 14 j</span></td>
      <td style="width:8px;"></td>
      <td style="background:#1c1c2b;border-radius:10px;padding:12px;text-align:center;"><span style="display:block;font-size:22px;font-weight:700;color:${enriched > 0 ? '#34d399' : '#fff'};">${enriched}</span><span style="font-size:11px;color:#71717a;">ont enrichi</span></td>
      <td style="width:8px;"></td>
      <td style="background:#1c1c2b;border-radius:10px;padding:12px;text-align:center;"><span style="display:block;font-size:22px;font-weight:700;color:${(expiring || []).length > 0 ? '#fbbf24' : '#fff'};">${(expiring || []).length}</span><span style="font-size:11px;color:#71717a;">trials &lt; 72 h</span></td>
      <td style="width:8px;"></td>
      <td style="background:#1c1c2b;border-radius:10px;padding:12px;text-align:center;"><span style="display:block;font-size:22px;font-weight:700;color:${(conversions || 0) > 0 ? '#34d399' : '#fff'};">${conversions || 0}</span><span style="font-size:11px;color:#71717a;">conversions 7 j</span></td>
    </tr></table>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <th style="padding:6px 8px;font-size:11px;color:#71717a;text-align:left;text-transform:uppercase;">Compte</th>
        <th style="padding:6px 8px;font-size:11px;color:#71717a;text-transform:uppercase;">Rech.</th>
        <th style="padding:6px 8px;font-size:11px;color:#71717a;text-transform:uppercase;">Enrich.</th>
        <th style="padding:6px 8px;font-size:11px;color:#71717a;text-transform:uppercase;">Camp.</th>
        <th style="padding:6px 8px;font-size:11px;color:#71717a;text-transform:uppercase;">Vu le</th>
        <th style="padding:6px 8px;font-size:11px;color:#71717a;text-transform:uppercase;">Fin trial</th>
      </tr>
      ${tableRows || '<tr><td colspan="6" style="padding:12px;font-size:12px;color:#71717a;">Aucun inscrit sur 14 jours.</td></tr>'}
    </table>
    <p style="color:#71717a;font-size:11px;margin:18px 0 0;">Règle simple : appeler d'abord ceux qui ont enrichi, relancer ceux qui expirent sous 72 h.</p>
  </div>
</div></body></html>`;

    const result = await sendEmail({
      to,
      subject: `📊 Radar activation — ${rows.length} inscrits, ${enriched} activés, ${(expiring || []).length} trials urgents`,
      html,
      tags: [{ name: 'type', value: 'weekly_activation_report' }],
    });

    return NextResponse.json({
      ok: true,
      sent: Boolean(result?.success),
      recents: rows.length,
      enriched,
      expiring72h: (expiring || []).length,
      conversions: conversions || 0,
    });
  } catch (e) {
    console.error('[cron/weekly-activation-report] error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
