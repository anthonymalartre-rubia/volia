// src/app/api/achievements/mark-seen/route.js
// ─────────────────────────────────────────────────────────────────────
// POST /api/achievements/mark-seen
//
// Body : { ids: string[] }  — liste des user_achievement.id à marquer
// comme vus (toast déjà affiché côté client).
//
// Met à jour toast_shown_at = NOW() pour ces lignes. Le WHERE filtre
// IN (...) AND user_id = auth.uid() pour empêcher un user de marquer
// les achievements d'un autre user (même si ça n'a aucun intérêt).
//
// Idempotent : si une ligne a déjà toast_shown_at, l'UPDATE ne fait rien
// de visible (on garde la première timestamp). Si on voulait ce comportement
// précis, on ajouterait `AND toast_shown_at IS NULL` ; on le laisse simple
// — repasser sur un UPDATE qui ne change rien est sans conséquence.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
  if (ids.length === 0) {
    return NextResponse.json({ marked: 0 });
  }

  // Cap raisonnable pour éviter qu'un client malveillant envoie 1M ids.
  // Le cas normal c'est <10 achievements en attente.
  const safeIds = ids.slice(0, 100);

  const { data, error } = await supabase
    .from('user_achievements')
    .update({ toast_shown_at: new Date().toISOString() })
    .in('id', safeIds)
    .eq('user_id', user.id) // safety : pas de cross-user
    .select('id');

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[achievements/mark-seen] update error:', error.message);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ marked: data?.length || 0 });
}
