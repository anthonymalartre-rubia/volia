import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { trialExpiredEmail, trialExpiringEmail } from '@/lib/emailTemplates';

/**
 * GET /api/cron/expire-trials
 *
 * Cron Vercel quotidien (9h UTC). Fait deux choses :
 *
 *  1. J-3 NOTIFICATIONS — Identifie les trials qui expirent dans 3 jours
 *     (et qui n'ont pas encore reçu l'email), envoie trial_expiring_3d,
 *     stamp trial_expiring_notified_at pour éviter les doublons.
 *
 *  2. EXPIRATION — Pour les trials dont trial_ends_at est passé et qui
 *     ne sont pas convertis :
 *       - Reset plan='free'
 *       - Envoie trial_expired
 *       - Stamp trial_expired_notified_at
 *
 * Sécurité : header Authorization: Bearer CRON_SECRET (cf. vercel.json).
 *
 * Idempotent : si exécuté 2 fois le même jour, ne re-fait rien grâce
 * aux flags *_notified_at.
 */
export const dynamic = 'force-dynamic';

function checkCronAuth(request) {
  const auth = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  return process.env.CRON_SECRET && auth === expected;
}

export async function GET(request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();
  const stats = {
    expiringNotified: 0,
    expiringFailed: 0,
    expired: 0,
    expiredFailed: 0,
  };

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // ─── 1. J-3 EXPIRING NOTIFICATIONS ──────────────────────────────
    // Trials qui expirent dans ≤3 jours, encore actifs, jamais notifiés.
    const { data: expiring } = await supabase
      .from('user_profiles')
      .select('id, trial_ends_at, trial_plan')
      .not('trial_ends_at', 'is', null)
      .is('trial_converted_at', null)
      .is('trial_expiring_notified_at', null)
      .gt('trial_ends_at', nowIso)
      .lte('trial_ends_at', threeDaysFromNow);

    for (const profile of expiring || []) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        if (!userData?.user?.email) continue;

        const email = userData.user.email;
        const fullName =
          userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null;
        const msRemaining = new Date(profile.trial_ends_at) - now;
        const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

        const tpl = trialExpiringEmail(fullName, daysRemaining, profile.trial_plan);
        const result = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        if (result.success) {
          await supabase
            .from('user_profiles')
            .update({ trial_expiring_notified_at: nowIso })
            .eq('id', profile.id);
          stats.expiringNotified++;
        } else {
          stats.expiringFailed++;
        }
        await new Promise((r) => setTimeout(r, 50));
      } catch (err) {
        stats.expiringFailed++;
        console.error('[cron/expire-trials] expiring err for', profile.id, err);
      }
    }

    // ─── 2. ACTUAL EXPIRATION ───────────────────────────────────────
    // Trials passés, non convertis, pas encore traités (pas notified).
    const { data: expired } = await supabase
      .from('user_profiles')
      .select('id, plan, trial_ends_at')
      .not('trial_ends_at', 'is', null)
      .is('trial_converted_at', null)
      .is('trial_expired_notified_at', null)
      .lte('trial_ends_at', nowIso);

    for (const profile of expired || []) {
      try {
        // Downgrade au plan free (si pas déjà fait — un user qui aurait pris
        // un plan payant pendant son trial verrait trial_converted_at set par
        // le webhook, donc on ne traiterait pas son profil ici).
        await supabase
          .from('user_profiles')
          .update({
            plan: 'free',
            trial_expired_notified_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', profile.id);

        // Envoi de l'email trial_expired
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        if (!userData?.user?.email) {
          stats.expired++;
          continue;
        }
        const email = userData.user.email;
        const fullName =
          userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null;

        const tpl = trialExpiredEmail(fullName, profile.trial_plan);
        const result = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        if (result.success) {
          stats.expired++;
        } else {
          stats.expiredFailed++;
          console.warn('[cron/expire-trials] expired email failed for', email, result.error);
        }
        await new Promise((r) => setTimeout(r, 50));
      } catch (err) {
        stats.expiredFailed++;
        console.error('[cron/expire-trials] expired err for', profile.id, err);
      }
    }

    const finishedAt = new Date().toISOString();
    console.log('[cron/expire-trials] done', { startedAt, finishedAt, ...stats });
    return NextResponse.json({ ok: true, startedAt, finishedAt, ...stats });
  } catch (err) {
    console.error('[cron/expire-trials] fatal:', err);
    return NextResponse.json({ error: 'fatal', details: err?.message }, { status: 500 });
  }
}
