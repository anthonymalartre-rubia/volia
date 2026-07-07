import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { monthlyUpgradeNudgeEmail } from '@/lib/emailTemplates';

/**
 * GET /api/cron/monthly-nudge
 *
 * Cron Vercel mensuel (1er du mois, 9h UTC = 10h FR hiver / 11h FR été).
 * Envoie un email d'upgrade nudge à tous les utilisateurs sur le plan free.
 *
 * L'email inclut leurs stats du mois précédent (prospects récupérés,
 * emails enrichis, jours actifs) pour personnaliser le message :
 * - Si actif : "Bilan de mai - vous auriez pu X avec Pro"
 * - Si inactif : "On vous attend, voici comment démarrer"
 *
 * Sécurité : protégé par le header Vercel cron (Authorization: Bearer CRON_SECRET).
 *
 * Configuration : voir vercel.json (cron expressions).
 */
export const dynamic = 'force-dynamic';

function checkCronAuth(request) {
  // Vercel cron envoie un header Authorization: Bearer <CRON_SECRET>
  // (configuré dans vercel.json + Vercel UI env vars).
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
  const stats = { totalFreeUsers: 0, sent: 0, skipped: 0, failed: 0 };

  try {
    // Mois précédent pour les stats (ex: si on est en juin, on regarde mai)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthName = lastMonth.toLocaleDateString('fr-FR', { month: 'long' });

    // 1. Fetch tous les users sur le plan free (créés il y a + de 7j pour
    //    éviter de spammer les inscriptions toutes fraîches qui ont déjà eu
    //    le welcome email).
    const oneWeekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, created_at')
      .eq('plan', 'free')
      // Respect de l'opt-out marketing : sans ce filtre, un user qui a coupé
      // les emails drip (ou reçu C3 « Dernier email (promis) », qui pose
      // drip_emails_enabled=false) continuait de recevoir le nudge mensuel.
      .eq('drip_emails_enabled', true)
      .lt('created_at', oneWeekAgo);

    if (profilesError) {
      console.error('[cron/monthly-nudge] fetch profiles failed:', profilesError);
      return NextResponse.json({ error: 'db error', details: profilesError.message }, { status: 500 });
    }

    stats.totalFreeUsers = profiles?.length || 0;
    console.log(`[cron/monthly-nudge] ${stats.totalFreeUsers} free users to process`);

    // 2. Process chacun (avec petit delay entre les envois pour ne pas
    //    saturer Resend — 100 emails/sec en plan free, 1000/sec en payant).
    for (const profile of profiles || []) {
      try {
        // Récupère email + name
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        if (!userData?.user?.email) {
          stats.skipped++;
          continue;
        }
        const email = userData.user.email;
        const fullName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null;

        // Récupère usage du mois dernier
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('searches, enrichments')
          .eq('user_id', profile.id)
          .eq('month', lastMonthKey)
          .maybeSingle();

        // Compte les jours actifs : prospects créés sur le mois dernier
        // (approximation, on regarde les days distincts).
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString();
        const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const { data: activity } = await supabase
          .from('prospects')
          .select('created_at')
          .eq('user_id', profile.id)
          .gte('created_at', lastMonthStart)
          .lte('created_at', lastMonthEnd);

        const daysActiveSet = new Set();
        (activity || []).forEach((p) => {
          daysActiveSet.add(p.created_at.slice(0, 10));
        });

        const tpl = monthlyUpgradeNudgeEmail(fullName, {
          monthName: lastMonthName,
          prospectsFound: usage?.searches || 0,
          emailsEnriched: usage?.enrichments || 0,
          daysActive: daysActiveSet.size,
        });

        const result = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        if (result.success) {
          stats.sent++;
        } else {
          stats.failed++;
          console.warn(`[cron/monthly-nudge] send failed for ${email}:`, result.error);
        }

        // Throttle léger : 50ms entre envois = 20/sec
        await new Promise((r) => setTimeout(r, 50));
      } catch (err) {
        stats.failed++;
        console.error(`[cron/monthly-nudge] error processing user ${profile.id}:`, err);
      }
    }

    const finishedAt = new Date().toISOString();
    console.log('[cron/monthly-nudge] done', { startedAt, finishedAt, ...stats });
    return NextResponse.json({ ok: true, startedAt, finishedAt, ...stats });
  } catch (err) {
    console.error('[cron/monthly-nudge] fatal:', err);
    return NextResponse.json({ error: 'fatal', details: err?.message }, { status: 500 });
  }
}
