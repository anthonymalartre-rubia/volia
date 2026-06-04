// GET /api/enrich/background/status — état de l'enrichissement en arrière-plan
// pour l'utilisateur courant (job actif + dernier job + nb de prospects restants).
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getActiveJob, getLatestJob, countPending } from '@/lib/enrichment-jobs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const active = await getActiveJob(supabase, user.id);
  const latest = active || (await getLatestJob(supabase, user.id));
  const pending = await countPending(supabase, user.id, active?.scope || null);

  return NextResponse.json({ ok: true, active: active || null, latest: latest || null, pending });
}
