// /api/webhooks/deliveries
//
// GET → liste paginée des deliveries du user.
// Params querystring :
//   - subscription_id   : filtre par sub
//   - event_type        : filtre par type d'event
//   - status            : 'success' | 'failed' | '2xx' | '4xx' | '5xx'
//   - since             : ISO datetime — borne basse
//   - limit             : 1-100 (default 50)
//   - offset            : pagination
//
// Réponse : { deliveries: [...], total }

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  const url = new URL(request.url);
  const subId = url.searchParams.get('subscription_id');
  const eventType = url.searchParams.get('event_type');
  const status = url.searchParams.get('status');
  const since = url.searchParams.get('since');
  const limitParam = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);
  const limit = Math.max(1, Math.min(MAX_LIMIT, isNaN(limitParam) ? DEFAULT_LIMIT : limitParam));
  const offsetParam = parseInt(url.searchParams.get('offset') || '0', 10);
  const offset = Math.max(0, isNaN(offsetParam) ? 0 : offsetParam);

  let query = supabase
    .from('webhook_deliveries')
    .select(
      'id, subscription_id, event_type, target_url, response_status, duration_ms, attempt, attempted_at, success, error_message',
      { count: 'exact' }
    )
    .order('attempted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (subId) query = query.eq('subscription_id', subId);
  if (eventType) query = query.eq('event_type', eventType);
  if (since) query = query.gte('attempted_at', since);

  if (status === 'success') query = query.eq('success', true);
  else if (status === 'failed') query = query.eq('success', false);
  else if (status === '2xx') query = query.gte('response_status', 200).lt('response_status', 300);
  else if (status === '4xx') query = query.gte('response_status', 400).lt('response_status', 500);
  else if (status === '5xx') query = query.gte('response_status', 500).lt('response_status', 600);

  const { data, error, count } = await query;

  if (error) {
    console.error('[api/webhooks/deliveries] GET error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }

  return NextResponse.json({ deliveries: data || [], total: count || 0, limit, offset });
}
