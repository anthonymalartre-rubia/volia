// ─────────────────────────────────────────────────────────────────────
// GET /api/one/campaigns — Volia One : historique des envois de l'utilisateur
// ─────────────────────────────────────────────────────────────────────
// Permet au feed d'activité de survivre au rechargement : /one liste les
// campagnes Volia One de l'utilisateur (nommées "Volia One — …" par /launch)
// et rouvre le feed live (/api/one/status) de n'importe laquelle.
// OWNER-SCOPED : filtre owner_id = user.id. Jamais anonyme.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('email_campaigns')
    .select('id, name, status, total_recipients, created_at')
    .eq('owner_id', user.id)
    .ilike('name', 'Volia One —%')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data || [] });
}
