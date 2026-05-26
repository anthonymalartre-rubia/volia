// /api/webhooks/subscriptions/[id]
//
// GET    → détail (sans secret)
// PATCH  → update partiel : target_url | events | label | active | secret
// DELETE → supprime la subscription (cascade sur deliveries via FK)
//
// RLS isole déjà par user. On vérifie quand même ownership via le SELECT
// initial pour donner un 404 propre (RLS retourne 0 row, on doit le mapper).

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { WEBHOOK_EVENTS } from '@/lib/webhooks/emitter';
import { validateUrl } from '@/lib/url-validation';

const ALLOWED_EVENT_IDS = new Set(WEBHOOK_EVENTS.map((e) => e.id));

export async function GET(_request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select(
      'id, target_url, events, label, active, last_triggered_at, success_rate, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[api/webhooks/subscriptions/[id]] GET error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Webhook introuvable' }, { status: 404 });
  return NextResponse.json({ subscription: data });
}

export async function PATCH(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const patch = { updated_at: new Date().toISOString() };

  if (typeof body.target_url === 'string') {
    const urlCheck = validateUrl(body.target_url);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error || 'URL invalide' }, { status: 400 });
    }
    if (!urlCheck.url.startsWith('https://')) {
      return NextResponse.json(
        { error: "L'URL doit être en HTTPS." },
        { status: 400 }
      );
    }
    patch.target_url = urlCheck.url;
  }

  if (Array.isArray(body.events)) {
    const events = body.events.filter((e) => typeof e === 'string');
    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un event doit être sélectionné.' },
        { status: 400 }
      );
    }
    const invalid = events.filter((e) => !ALLOWED_EVENT_IDS.has(e));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Events inconnus : ${invalid.join(', ')}` },
        { status: 400 }
      );
    }
    patch.events = events;
  }

  if (typeof body.label !== 'undefined') {
    patch.label = body.label ? String(body.label).trim().slice(0, 80) : null;
  }

  if (typeof body.active === 'boolean') {
    patch.active = body.active;
  }

  if (typeof body.secret === 'string' && body.secret.trim()) {
    const s = body.secret.trim();
    if (s.length < 16) {
      return NextResponse.json(
        { error: 'Le secret doit faire au moins 16 caractères.' },
        { status: 400 }
      );
    }
    patch.secret = s.slice(0, 256);
  }

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .update(patch)
    .eq('id', id)
    .select(
      'id, target_url, events, label, active, last_triggered_at, success_rate, created_at, updated_at'
    )
    .maybeSingle();

  if (error) {
    console.error('[api/webhooks/subscriptions/[id]] PATCH error', error);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Webhook introuvable' }, { status: 404 });
  return NextResponse.json({ subscription: data });
}

export async function DELETE(_request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;
  const { id } = await params;

  // Vérifie ownership pour différencier 404 de "ok mais 0 row".
  const { data: existing } = await supabase
    .from('webhook_subscriptions')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Webhook introuvable' }, { status: 404 });
  }

  const { error } = await supabase.from('webhook_subscriptions').delete().eq('id', id);
  if (error) {
    console.error('[api/webhooks/subscriptions/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
