// POST /api/enrich/background/start — lance un enrichissement en arrière-plan.
// Body optionnel : { folder_id?, departement? } pour limiter la portée.
// Crée un job "queued" (un seul actif par user) ; le cron le traite ensuite.
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getActiveJob, countPending } from '@/lib/enrichment-jobs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const scope = {};
  if (body?.folder_id) scope.folder_id = body.folder_id;
  if (body?.departement) scope.departement = body.departement;
  const scopeVal = Object.keys(scope).length ? scope : null;

  const existing = await getActiveJob(supabase, user.id);
  if (existing) return NextResponse.json({ ok: true, job: existing, already: true });

  const total = await countPending(supabase, user.id, scopeVal);
  if (total === 0) return NextResponse.json({ ok: true, job: null, nothing: true });

  const { data, error } = await supabase
    .from('enrichment_jobs')
    .insert({ user_id: user.id, status: 'queued', scope: scopeVal, total })
    .select('*')
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, job: data });
}
