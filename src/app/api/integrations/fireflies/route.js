// ─────────────────────────────────────────────────────────────────────
// /api/integrations/fireflies
// ─────────────────────────────────────────────────────────────────────
//   POST  { api_key }            → valide + enregistre la clé Fireflies
//   GET                          → { connected } + (si connecté) réunions récentes
//   GET   ?id=<transcriptId>     → { text } d'un transcript (pour pré-remplir
//                                  le résumé d'appel CRM)
//   DELETE                       → déconnecte (efface la clé)
//
// Réservé au plan CRM (la feature vit dans le CRM). Clé stockée sur
// user_profiles.fireflies_api_key (RLS user). Jamais renvoyée au client.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';
import { validateFirefliesKey, listRecentTranscripts, getTranscriptText } from '@/lib/fireflies';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function guard() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return { error: NextResponse.json({ success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' }, { status: 403 }) };
  return { user, supabase };
}

export async function POST(request) {
  const g = await guard();
  if (g.error) return g.error;
  const { user, supabase } = g;

  const body = await request.json().catch(() => ({}));
  const apiKey = typeof body.api_key === 'string' ? body.api_key.trim() : '';
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Clé API requise' }, { status: 400 });
  }

  const valid = await validateFirefliesKey(apiKey);
  if (!valid) {
    return NextResponse.json({ success: false, error: 'Clé Fireflies invalide ou API injoignable.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ fireflies_api_key: apiKey })
    .eq('id', user.id);
  if (error) {
    return NextResponse.json({ success: false, error: 'Échec de l\'enregistrement.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, connected: true });
}

export async function GET(request) {
  const g = await guard();
  if (g.error) return g.error;
  const { user, supabase } = g;

  const { data: prof } = await supabase
    .from('user_profiles')
    .select('fireflies_api_key')
    .eq('id', user.id)
    .maybeSingle();
  const apiKey = prof?.fireflies_api_key || null;

  if (!apiKey) {
    return NextResponse.json({ success: true, connected: false });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Récup d'un transcript précis
  if (id) {
    const r = await getTranscriptText(apiKey, id);
    if (!r.ok) return NextResponse.json({ success: false, connected: true, error: r.error }, { status: 502 });
    return NextResponse.json({ success: true, connected: true, title: r.title, text: r.text });
  }

  // Liste des réunions récentes
  const r = await listRecentTranscripts(apiKey);
  if (!r.ok) return NextResponse.json({ success: false, connected: true, error: r.error }, { status: 502 });
  return NextResponse.json({ success: true, connected: true, meetings: r.items });
}

export async function DELETE() {
  const g = await guard();
  if (g.error) return g.error;
  const { user, supabase } = g;
  await supabase.from('user_profiles').update({ fireflies_api_key: null }).eq('id', user.id);
  return NextResponse.json({ success: true, connected: false });
}
