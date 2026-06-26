// ─────────────────────────────────────────────────────────────────────
// GET /api/one/runs           → liste des analyses récentes (léger)
// GET /api/one/runs?id=<uuid> → une analyse complète (icp + leads + counts)
// ─────────────────────────────────────────────────────────────────────
// Persistance des runs Volia One : permet de rouvrir une analyse au
// rechargement SANS la relancer (donc sans re-consommer de crédits).
// OWNER-SCOPED (RLS + filtre owner_id). Jamais anonyme.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('id');

  // Détail : une analyse complète (pour rouvrir les résultats)
  if (id) {
    const { data, error } = await supabase
      .from('volia_one_runs')
      .select('id, domain, icp, leads, counts, created_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Analyse introuvable' }, { status: 404 });
    return NextResponse.json({ run: data });
  }

  // Liste : champs légers (pas les leads, pour ne pas charger des Mo)
  const { data, error } = await supabase
    .from('volia_one_runs')
    .select('id, domain, counts, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ runs: data || [] });
}
