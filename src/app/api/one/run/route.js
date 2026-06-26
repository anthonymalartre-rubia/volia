// ─────────────────────────────────────────────────────────────────────
// POST /api/one/run — Volia One (Phase 1, test) : domaine → leads + emails
// (dossier "run" et non "build" : "build" est ignoré par .gitignore)
// ─────────────────────────────────────────────────────────────────────
// Body: { domain }
// Authz : admin uniquement (phase de validation — contrôle des coûts).
// Renvoie { success, icp, leads, counts }.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { buildFromDomain } from '@/lib/one/build';

// Le pipeline (Places + enrich + Claude) dépasse les 10s par défaut.
export const maxDuration = 60;

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json(
      { error: 'Réservé admin pendant la phase de test Volia One.' },
      { status: 403 }
    );
  }

  const { domain } = await request.json().catch(() => ({}));
  if (!domain || typeof domain !== 'string' || domain.length > 120) {
    return NextResponse.json({ error: 'Domaine requis (string, < 120 car.)' }, { status: 400 });
  }

  try {
    const result = await buildFromDomain(domain);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error('[one/build] échec:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Erreur Volia One' }, { status: 500 });
  }
}
