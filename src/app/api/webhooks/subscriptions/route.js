// /api/webhooks/subscriptions
//
// Gestion des webhooks sortants (Sprint D5).
//
// GET  → liste les subscriptions du user (RLS-protected)
// POST → crée une nouvelle subscription
//        body: { target_url, events: string[], secret?, label?, active? }
//        - secret auto-généré si non fourni
//        - validation URL https publique (anti-SSRF)
//        - limite 20 subs / user (anti-abus)
//
// Gating : Pro+ requis (campagnes-access).

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { generateWebhookSecret, WEBHOOK_EVENTS } from '@/lib/webhooks/emitter';
import { validateUrl } from '@/lib/url-validation';

const MAX_SUBS_PER_USER = 20;
const ALLOWED_EVENT_IDS = new Set(WEBHOOK_EVENTS.map((e) => e.id));

export async function GET() {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select(
      'id, target_url, events, label, active, last_triggered_at, success_rate, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api/webhooks/subscriptions] GET error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: data || [] });
}

export async function POST(request) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;

  const body = await request.json().catch(() => ({}));

  // Validation URL
  const urlCheck = validateUrl(body.target_url);
  if (!urlCheck.valid) {
    return NextResponse.json(
      { error: urlCheck.error || 'URL invalide' },
      { status: 400 }
    );
  }
  // On force HTTPS pour les webhooks (best-practice production).
  if (!urlCheck.url.startsWith('https://')) {
    return NextResponse.json(
      { error: "L'URL doit être en HTTPS pour des raisons de sécurité." },
      { status: 400 }
    );
  }

  // Validation events
  const events = Array.isArray(body.events) ? body.events.filter((e) => typeof e === 'string') : [];
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

  // Label optionnel
  const label =
    typeof body.label === 'string' ? body.label.trim().slice(0, 80) || null : null;

  // Secret : custom ou auto-généré
  let secret;
  if (body.secret && typeof body.secret === 'string') {
    const trimmed = body.secret.trim();
    if (trimmed.length < 16) {
      return NextResponse.json(
        { error: 'Le secret doit faire au moins 16 caractères.' },
        { status: 400 }
      );
    }
    secret = trimmed.slice(0, 256);
  } else {
    secret = generateWebhookSecret();
  }

  // Limite anti-abus
  const { count } = await supabase
    .from('webhook_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= MAX_SUBS_PER_USER) {
    return NextResponse.json(
      { error: `Limite atteinte (${MAX_SUBS_PER_USER} webhooks max par compte).` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .insert({
      user_id: user.id,
      target_url: urlCheck.url,
      events,
      secret,
      label,
      active: body.active !== false,
    })
    .select(
      'id, target_url, events, secret, label, active, last_triggered_at, success_rate, created_at, updated_at'
    )
    .single();

  if (error) {
    console.error('[api/webhooks/subscriptions] POST insert error', error);
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
  }

  // À la création, on retourne le secret en clair UNE SEULE FOIS — comme
  // pour les API keys. L'UI affiche un toast d'info pour le copier.
  return NextResponse.json({ subscription: data, secret_revealed: true }, { status: 201 });
}
