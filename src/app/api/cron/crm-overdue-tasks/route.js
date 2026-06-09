import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';

/**
 * GET /api/cron/crm-overdue-tasks  (CRM P2-2)
 *
 * Cron quotidien (8h UTC). Pour chaque utilisateur ayant des tâches CRM en
 * retard (crm_activities non complétées, due_at < now), crée UNE notification
 * in-app digest + envoie un email récap.
 *
 * Anti-spam : 1 seule notification "crm_overdue" par user et par jour
 * (dédup sur created_at >= début de journée). Si exécuté 2× le même jour,
 * ne renvoie rien.
 *
 * Sécurité : header Authorization: Bearer CRON_SECRET (cf. vercel.json).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function checkCronAuth(request) {
  const auth = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  return process.env.CRON_SECRET && auth === expected;
}

const BASE = 'https://volia.fr';

export async function GET(request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayIso = startOfToday.toISOString();

  const stats = { usersNotified: 0, notifsCreated: 0, emailsSent: 0, emailsFailed: 0, skippedAlreadyNotified: 0 };

  try {
    // 1. Toutes les tâches en retard (paginé pour dépasser le plafond 1000).
    const PAGE = 1000;
    const overdue = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('id, user_id, content, due_at')
        .is('completed_at', null)
        .not('due_at', 'is', null)
        .lt('due_at', nowIso)
        .order('due_at', { ascending: true })
        .range(offset, offset + PAGE - 1);
      if (error) {
        console.error('[cron/crm-overdue-tasks] fetch error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const batch = data || [];
      overdue.push(...batch);
      if (batch.length < PAGE) break;
    }

    // 2. Regroupe par user.
    const byUser = new Map();
    for (const t of overdue) {
      if (!byUser.has(t.user_id)) byUser.set(t.user_id, []);
      byUser.get(t.user_id).push(t);
    }

    // 3. Pour chaque user : dédup jour → notification + email.
    for (const [userId, tasks] of byUser.entries()) {
      // Déjà notifié aujourd'hui ?
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'crm_overdue')
        .gte('created_at', startOfTodayIso)
        .limit(1);
      if (existing && existing.length > 0) {
        stats.skippedAlreadyNotified += 1;
        continue;
      }

      const n = tasks.length;
      const title = n === 1 ? '1 tâche CRM en retard' : `${n} tâches CRM en retard`;
      const body = `Vous avez ${n} tâche${n > 1 ? 's' : ''} en retard dans votre CRM. Relancez vos contacts pour ne rien laisser filer.`;

      // Notification in-app (service-role : pas de policy INSERT côté user).
      const { error: notifErr } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'crm_overdue',
        title,
        body,
        link: '/app/crm/activities',
        metadata: { count: n, source: 'cron' },
      });
      if (!notifErr) { stats.notifsCreated += 1; stats.usersNotified += 1; }

      // Email récap (best-effort).
      try {
        const { data: u } = await supabase.auth.admin.getUserById(userId);
        const email = u?.user?.email;
        if (email) {
          const top = tasks.slice(0, 5)
            .map((t) => `<li style="margin:0 0 6px;color:#a1a1b5;font-size:13px;">${escapeHtml(t.content)}</li>`)
            .join('');
          const more = n > 5 ? `<p style="color:#7c7c95;font-size:12px;margin:8px 0 0;">… et ${n - 5} autre${n - 5 > 1 ? 's' : ''}.</p>` : '';
          const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#0b0b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="background:#14141f;border:1px solid #26263a;border-radius:16px;padding:28px;">
      <div style="font-size:32px;line-height:1;margin-bottom:12px;">⏰</div>
      <h1 style="color:#fff;font-size:20px;margin:0 0 8px;">${title}</h1>
      <p style="color:#a1a1b5;font-size:14px;line-height:1.6;margin:0 0 16px;">${body}</p>
      <ul style="margin:0 0 16px;padding-left:18px;">${top}</ul>
      ${more}
      <a href="${BASE}/app/crm/activities" style="display:inline-block;margin-top:8px;background:#6366f1;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">Voir mes tâches</a>
    </div>
    <p style="color:#55556a;font-size:12px;text-align:center;margin:18px 0 0;">Volia CRM · volia.fr</p>
  </div></body></html>`;
          const r = await sendEmail({
            to: email,
            subject: title,
            html,
            tags: [{ name: 'type', value: 'crm_overdue' }],
          });
          if (r?.success) stats.emailsSent += 1; else stats.emailsFailed += 1;
        }
      } catch (e) {
        stats.emailsFailed += 1;
        console.warn('[cron/crm-overdue-tasks] email failed', e?.message);
      }
    }

    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    console.error('[cron/crm-overdue-tasks] error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
