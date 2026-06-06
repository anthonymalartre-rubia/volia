// GET /api/admin/prospection/lists/[id]/sources/sessions
//
// Liste les 50 dernières search_sessions de l'utilisateur avec compteurs agrégés
// (prospects totaux + prospects avec email) pour proposer un import dans la liste.
//
// Réponse :
//   { sessions: [{ session_id, created_at, departments, categories,
//                  prospects_count, emails_count }] }

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

const MAX_SESSIONS = 50;

export async function GET(_request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id: listId } = await params;

  // Vérifie que la liste existe et appartient au user (cohérence avec le reste
  // des routes — on évite d'exposer la liste des sessions sur un listId arbitraire).
  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .select('id')
    .eq('id', listId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (listErr || !list) {
    return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });
  }

  // 1. Récupère les sessions du user
  const { data: sessions, error: sErr } = await supabase
    .from('search_sessions')
    .select('id, created_at, departments, categories, results_count, status, label')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(MAX_SESSIONS);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const sessionIds = (sessions || []).map((s) => s.id);
  if (sessionIds.length === 0) return NextResponse.json({ sessions: [] });

  // 2. Compte les prospects par session (total + ceux avec email) via une
  //    fonction SQL d'agrégation.
  //    ⚠️ NE PAS lire les lignes pour compter côté JS : PostgREST plafonne le
  //    SELECT à 1000 lignes par défaut → l'ancien code sous-comptait toute
  //    session > 1000 prospects (ex: 30 600 affichés "1000"). La fonction
  //    session_prospect_counts agrège côté Postgres, sans cap.
  const { data: countRows, error: pErr } = await supabase.rpc('session_prospect_counts', {
    p_user_id: user.id,
    p_session_ids: sessionIds,
  });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // total      = nb brut de prospects trouvés (headline)
  // withEmail  = nb de contacts email UNIQUES (dédup email = ce que l'import insère)
  // importable = withEmail + contacts téléphone-seul uniques (mode "inclure sans email")
  const counts = new Map(); // session_id → { total, withEmail, importable }
  for (const row of countRows || []) {
    counts.set(row.search_session_id, {
      total: Number(row.total) || 0,
      withEmail: Number(row.with_email) || 0,
      importable: Number(row.importable) || 0,
    });
  }

  const out = (sessions || []).map((s) => {
    const c = counts.get(s.id) || { total: 0, withEmail: 0, importable: 0 };
    return {
      session_id: s.id,
      created_at: s.created_at,
      departments: s.departments || [],
      categories: s.categories || null,
      label: s.label || null,
      status: s.status || null,
      prospects_count: c.total,
      emails_count: c.withEmail,
      // Nb réellement importable en mode "inclure sans email" (dédup email + tel).
      importable_count: c.importable,
    };
  });

  return NextResponse.json({ sessions: out });
}
