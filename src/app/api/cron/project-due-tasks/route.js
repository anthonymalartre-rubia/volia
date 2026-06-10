import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/cron/project-due-tasks  (Volia Project P4)
 *
 * Cron quotidien (8h15 UTC). Pour chaque utilisateur ayant des tâches de
 * projet en retard ou dues aujourd'hui (project_tasks non terminées,
 * due_at <= fin de journée), crée UNE notification in-app digest.
 *
 * Anti-spam : 1 notification "project_due" / user / jour (dédup
 * created_at >= début de journée). Pas d'email : le digest CRM couvre
 * déjà la boîte mail, on évite la sur-notification.
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

export async function GET(request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const stats = { usersNotified: 0, skippedAlreadyNotified: 0 };

  try {
    // 1. Tâches dues (retard + aujourd'hui), avec le projet pour user_id + nom.
    const PAGE = 1000;
    const due = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('id, title, due_at, project:projects(id, name, user_id, status)')
        .neq('status', 'done')
        .not('due_at', 'is', null)
        .lte('due_at', endOfToday.toISOString())
        .order('due_at', { ascending: true })
        .range(offset, offset + PAGE - 1);
      if (error) {
        console.error('[cron/project-due-tasks] fetch error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const batch = data || [];
      due.push(...batch);
      if (batch.length < PAGE) break;
    }

    // 2. Regroupe par user (projets actifs uniquement).
    const byUser = new Map();
    for (const t of due) {
      if (!t.project || t.project.status !== 'active') continue;
      const uid = t.project.user_id;
      if (!byUser.has(uid)) byUser.set(uid, []);
      byUser.get(uid).push(t);
    }

    // 3. Notification digest par user, dédupée à la journée.
    for (const [userId, tasks] of byUser.entries()) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'project_due')
        .gte('created_at', startOfToday.toISOString())
        .limit(1);
      if (existing && existing.length > 0) {
        stats.skippedAlreadyNotified += 1;
        continue;
      }

      const n = tasks.length;
      const projects = [...new Set(tasks.map((t) => t.project.name))].slice(0, 3);
      const { error: notifErr } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'project_due',
        title: n === 1 ? '1 tâche de projet à traiter' : `${n} tâches de projet à traiter`,
        body: `Échéances du jour ou en retard sur : ${projects.join(', ')}${tasks.length > 3 ? '…' : ''}.`,
        link: '/app/projets',
        metadata: { count: n, source: 'cron' },
      });
      if (!notifErr) stats.usersNotified += 1;
    }

    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    console.error('[cron/project-due-tasks] error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
