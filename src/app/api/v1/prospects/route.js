// GET /api/v1/prospects
// Liste paginée des prospects de l'utilisateur.
//
// Query params :
//   - limit  : 1-100 (default 50)
//   - offset : 0+    (default 0)
//   - has_email : "true" | "false" → filtre sur la présence d'un email
//   - department : code dept FR (ex "75", "13")
//   - search_session_id : UUID d'une session de recherche précise
//   - sort : "newest" (default) | "oldest"

import { NextResponse } from 'next/server';
import { authenticateApiRequest, apiCorsHeaders } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const LIMIT_DEFAULT = 50;
const LIMIT_MAX = 100;
// WS14 : borne l'offset pour éviter une pagination profonde pathologique (scan coûteux).
const OFFSET_MAX = 100000;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiCorsHeaders() });
}

export async function GET(request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: apiCorsHeaders() });
  }

  const supabase = getSupabaseAdmin();
  const { userId } = auth;
  const url = new URL(request.url);

  const limit = Math.min(LIMIT_MAX, Math.max(1, parseInt(url.searchParams.get('limit') || LIMIT_DEFAULT, 10) || LIMIT_DEFAULT));
  const offset = Math.min(OFFSET_MAX, Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0));
  const hasEmail = url.searchParams.get('has_email');
  const department = url.searchParams.get('department');
  const searchSessionId = url.searchParams.get('search_session_id');
  const sort = url.searchParams.get('sort') === 'oldest' ? { ascending: true } : { ascending: false };

  let query = supabase
    .from('prospects')
    .select('id, nom, adresse, telephone, email, email_method, site_web, note, nb_avis, type, departement, search_session_id, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', sort)
    .range(offset, offset + limit - 1);

  if (hasEmail === 'true') query = query.not('email', 'is', null);
  if (hasEmail === 'false') query = query.is('email', null);
  if (department) query = query.eq('departement', department);
  if (searchSessionId) query = query.eq('search_session_id', searchSessionId);

  const { data, error, count } = await query;

  if (error) {
    console.error('[api/v1/prospects] error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500, headers: apiCorsHeaders() });
  }

  return NextResponse.json(
    {
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (offset + limit) < (count || 0),
      },
    },
    { headers: apiCorsHeaders() }
  );
}
