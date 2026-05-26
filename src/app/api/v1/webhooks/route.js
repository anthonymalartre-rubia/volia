// Webhook subscriptions — API publique pour Zapier / Make (pattern REST Hooks).
//
// GET  /api/v1/webhooks                                    → liste les subscriptions
// POST /api/v1/webhooks  { event_type | events[], target_url, label? } → crée
// (Zapier appelle ça à l'activation d'un Zap, supprime à la désactivation
// via DELETE /api/v1/webhooks/[id]).
//
// Auth : Bearer pk_xxxxx (clé API utilisateur, voir /settings#api).
//
// Surface publique stable de la table interne webhook_subscriptions —
// les UI internes utilisent /api/webhooks/* (auth cookie). Le système
// d'émission + log est partagé (cf src/lib/webhooks/emitter.js).
//
// Catalogue des events : src/lib/webhooks/events.js (notation pointée
// type Stripe : "crm.deal.created", "email.replied", "*" wildcard).

import { NextResponse } from 'next/server';
import { authenticateApiRequest, apiCorsHeaders } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateUrl } from '@/lib/url-validation';
import { generateWebhookSecret } from '@/lib/webhooks/emitter';
import { WEBHOOK_EVENTS } from '@/lib/webhooks/events';

const MAX_SUBS_PER_USER = 50;
const ALLOWED_EVENTS = new Set(WEBHOOK_EVENTS.map((e) => e.id));

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiCorsHeaders() });
}

export async function GET(request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: apiCorsHeaders() });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('id, target_url, events, label, active, last_triggered_at, success_rate, created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api/v1/webhooks] GET error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500, headers: apiCorsHeaders() });
  }

  return NextResponse.json(
    { data: (data || []).map(toPublic) },
    { headers: apiCorsHeaders() }
  );
}

export async function POST(request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: apiCorsHeaders() });
  }

  const body = await request.json().catch(() => ({}));

  // Accepte event_type (string, mode Zapier "1 event = 1 sub") ou events[] (array)
  let events = [];
  if (typeof body.event_type === 'string' && body.event_type.trim()) {
    events = [body.event_type.trim()];
  } else if (Array.isArray(body.events)) {
    events = body.events.filter((e) => typeof e === 'string').map((e) => e.trim()).filter(Boolean);
  }

  if (events.length === 0) {
    return NextResponse.json(
      { error: 'event_type (string) ou events (array) requis. Ex: "crm.deal.created"' },
      { status: 400, headers: apiCorsHeaders() }
    );
  }

  const invalid = events.filter((e) => !ALLOWED_EVENTS.has(e));
  if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: `Events invalides : ${invalid.join(', ')}. Liste complète : GET /api/v1/webhooks/events`,
      },
      { status: 400, headers: apiCorsHeaders() }
    );
  }

  const urlCheck = validateUrl(body.target_url);
  if (!urlCheck.valid) {
    return NextResponse.json(
      { error: `target_url invalide : ${urlCheck.error}` },
      { status: 400, headers: apiCorsHeaders() }
    );
  }
  if (!urlCheck.url.startsWith('https://')) {
    return NextResponse.json(
      { error: "target_url doit être en HTTPS." },
      { status: 400, headers: apiCorsHeaders() }
    );
  }

  const label = typeof body.label === 'string' ? body.label.trim().slice(0, 80) : null;

  const supabase = getSupabaseAdmin();

  // Anti-abus : max N subscriptions actives par user
  const { count } = await supabase
    .from('webhook_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.userId)
    .eq('active', true);

  if ((count || 0) >= MAX_SUBS_PER_USER) {
    return NextResponse.json(
      { error: `Limite atteinte (${MAX_SUBS_PER_USER} webhooks actifs max).` },
      { status: 400, headers: apiCorsHeaders() }
    );
  }

  const secret = generateWebhookSecret();

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .insert({
      user_id: auth.userId,
      target_url: urlCheck.url,
      events,
      secret,
      label,
      active: true,
    })
    .select('id, target_url, events, label, active, created_at')
    .single();

  if (error) {
    console.error('[api/v1/webhooks] POST error', error);
    return NextResponse.json(
      { error: 'Erreur création subscription' },
      { status: 500, headers: apiCorsHeaders() }
    );
  }

  // Le secret est retourné UNE SEULE FOIS à la création — l'abonné doit
  // le stocker pour vérifier la signature HMAC à chaque livraison.
  return NextResponse.json(
    {
      ...toPublic(data),
      secret,
      warning: 'Ce secret HMAC ne sera plus jamais visible. Stockez-le maintenant.',
    },
    { status: 201, headers: apiCorsHeaders() }
  );
}

function toPublic(sub) {
  return {
    id: sub.id,
    event_type: Array.isArray(sub.events) && sub.events.length === 1 ? sub.events[0] : null,
    events: sub.events || [],
    target_url: sub.target_url,
    label: sub.label || null,
    active: sub.active,
    last_triggered_at: sub.last_triggered_at || null,
    success_rate: sub.success_rate ?? null,
    created_at: sub.created_at,
  };
}
