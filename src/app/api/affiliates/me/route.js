// GET /api/affiliates/me?code=XXXX
// Renvoie les stats d'un affilié. Le code joue le rôle de jeton d'accès
// (lien privé envoyé à l'affilié après validation). Lecture seule.

import { NextResponse } from 'next/server';
import { getAffiliateStats } from '@/lib/affiliates';

export async function GET(request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get('code') || '').trim();
  if (!code) {
    return NextResponse.json({ error: 'Code requis' }, { status: 400 });
  }

  const data = await getAffiliateStats(code);
  if (!data) {
    return NextResponse.json({ error: 'Code inconnu' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...data });
}
