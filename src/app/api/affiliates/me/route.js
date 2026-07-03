// GET /api/affiliates/me
// Renvoie les stats de l'affilié LIÉ à l'utilisateur connecté.
//
// WS3bis (audit) : avant, la route résolvait l'affilié par ?code=XXXX en
// traitant le code comme un jeton d'accès. Or ce code est AUSSI le paramètre
// public des liens d'affiliation (volia.fr/?aff=CODE) → n'importe qui voyant
// un lien pouvait lire les PII + gains de l'affilié. On exige désormais une
// SESSION et on résout l'affilié via affiliates.user_id = user.id.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAffiliateStats } from '@/lib/affiliates';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  // Résout l'affilié par le compte connecté (jamais par un code fourni).
  const admin = getSupabaseAdmin();
  const { data: aff } = await admin
    .from('affiliates')
    .select('code')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!aff?.code) {
    return NextResponse.json(
      { error: "Aucun compte affilié lié à cet utilisateur" },
      { status: 404 }
    );
  }

  const data = await getAffiliateStats(aff.code);
  if (!data) {
    return NextResponse.json({ error: 'Stats introuvables' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...data });
}
