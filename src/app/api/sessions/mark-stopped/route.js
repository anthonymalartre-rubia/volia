import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * POST /api/sessions/mark-stopped
 * body: { session_id: string }
 *
 * Marque une search_sessions comme 'stopped' si elle est encore 'running'.
 *
 * Appelé via navigator.sendBeacon() depuis beforeunload côté client quand
 * l'utilisateur ferme l'onglet pendant un scraping. Évite que les sessions
 * restent à 'running' à vie et polluent l'historique sidebar (audit P1 bug #9).
 *
 * Idempotent : si déjà completed/stopped, no-op.
 */
export async function POST(request) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const sessionId = body?.session_id;
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    await supabase
      .from('search_sessions')
      .update({ status: 'stopped' })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'running');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('mark-stopped error:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
