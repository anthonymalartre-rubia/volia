import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/cron/crm-automations  (CRM P3-2)
 *
 * Cron quotidien (7h UTC). Règle "relance" : pour chaque deal ouvert qui dort
 * (créé il y a > 7 j, aucune activité depuis 7 j, étape non-closing, user n'a pas
 * désactivé stale_relance), crée une tâche de relance (due le lendemain).
 *
 * Idempotent : la RPC exclut déjà les deals qui ont une tâche de relance auto
 * non complétée → pas de doublon.
 *
 * Sécurité : header Authorization: Bearer CRON_SECRET.
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
  const stats = { staleDeals: 0, relanceTasksCreated: 0, failed: 0 };

  try {
    const { data: stale, error } = await supabase.rpc('crm_stale_open_deals', { p_days: 7 });
    if (error) {
      console.error('[cron/crm-automations] rpc error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    stats.staleDeals = (stale || []).length;
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 1);
    const dueAtIso = dueAt.toISOString();

    // Insertion en batch (chunk de 500) des tâches de relance.
    const rows = (stale || []).map((d) => ({
      user_id: d.user_id,
      deal_id: d.deal_id,
      contact_id: d.contact_id || null,
      type: 'task',
      content: `Relancer ${d.contact_name || d.title} — sans activité depuis 7 jours`,
      due_at: dueAtIso,
      metadata: { automation: 'relance', source: 'crm_automation' },
    }));

    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error: insErr, count } = await supabase
        .from('crm_activities')
        .insert(chunk, { count: 'exact' });
      if (insErr) {
        stats.failed += chunk.length;
        console.error('[cron/crm-automations] insert error', insErr);
      } else {
        stats.relanceTasksCreated += count || chunk.length;
      }
    }

    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    console.error('[cron/crm-automations] error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
