// ─────────────────────────────────────────────────────────────────────
// GET /api/app/autopilot/stats — "Pipeline en direct"
// ─────────────────────────────────────────────────────────────────────
// Agrège ce que l'Autopilot a fait pour le user : aujourd'hui + 7 derniers
// jours (prospects entrés, emails envoyés, formulaires remplis, leads chauds,
// poussés au CRM). Rend la valeur VISIBLE → confiance + rétention.
// Auth requise. Lecture seule.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: workflows } = await supabase
    .from('autopilot_workflows')
    .select('id')
    .eq('user_id', user.id);
  const ids = (workflows || []).map((w) => w.id);

  const empty = { prospects: 0, emails: 0, forms: 0, crm: 0 };
  if (ids.length === 0) {
    return NextResponse.json({ success: true, today: { ...empty }, last7d: { ...empty }, hot_leads_7d: 0, workflows: 0 });
  }

  const now = Date.now();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const today0 = startToday.getTime();
  const since7d = new Date(now - 7 * 86400000).toISOString();

  const { data: execs } = await supabase
    .from('autopilot_executions')
    .select('created_at, email_1_sent_at, email_2_sent_at, email_3_sent_at, form_submitted_at, computed_score, crm_pushed_at')
    .in('workflow_id', ids)
    .gte('updated_at', since7d)
    .limit(5000);

  const today = { ...empty };
  const last7d = { ...empty };
  let hotLeads7d = 0;
  const ms = (t) => (t ? new Date(t).getTime() : 0);

  for (const e of execs || []) {
    const created = ms(e.created_at);
    const emailsAll = [e.email_1_sent_at, e.email_2_sent_at, e.email_3_sent_at].map(ms).filter(Boolean);
    const form = ms(e.form_submitted_at);
    const crm = ms(e.crm_pushed_at);

    // 7 jours
    if (created) last7d.prospects += 1;
    last7d.emails += emailsAll.length;
    if (form) last7d.forms += 1;
    if (crm) last7d.crm += 1;
    if ((e.computed_score || 0) >= 70 && form) hotLeads7d += 1;

    // Aujourd'hui
    if (created >= today0) today.prospects += 1;
    today.emails += emailsAll.filter((t) => t >= today0).length;
    if (form >= today0) today.forms += 1;
    if (crm >= today0) today.crm += 1;
  }

  return NextResponse.json({ success: true, today, last7d, hot_leads_7d: hotLeads7d, workflows: ids.length });
}
