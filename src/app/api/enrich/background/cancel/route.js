// POST /api/enrich/background/cancel — annule le job d'enrichissement actif.
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getActiveJob } from '@/lib/enrichment-jobs';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const active = await getActiveJob(supabase, user.id);
  if (!active) return NextResponse.json({ ok: true, nothing: true });

  await supabase
    .from('enrichment_jobs')
    .update({ status: 'canceled', finished_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', active.id);

  return NextResponse.json({ ok: true });
}
