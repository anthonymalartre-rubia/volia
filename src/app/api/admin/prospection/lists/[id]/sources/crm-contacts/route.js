// GET /api/admin/prospection/lists/[id]/sources/crm-contacts
//
// Liste les contacts CRM du user (max 200) pour permettre l'import dans
// une liste prospect_contacts. Gating CRM (plan Business) côté API.
//
// Query params : ?q=search & tag=tag & has_email=true
//
// Réponse : { contacts: [{ id, name, email, phone, company, position, tags }],
//             pagination: { total, limit, offset, has_more } }

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { checkCrmAccess } from '@/lib/crm';

const LIMIT_DEFAULT = 200;
const LIMIT_MAX = 200;

export async function GET(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id: listId } = await params;

  // Vérifie liste = au user
  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .select('id')
    .eq('id', listId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (listErr || !list) {
    return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });
  }

  // Gating CRM — code dédié pour que le frontend puisse afficher upgrade screen.
  const hasCrm = await checkCrmAccess(supabase, user.id);
  if (!hasCrm) {
    return NextResponse.json(
      { error: 'CRM réservé au plan Business', code: 'crm_not_allowed' },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';
  const tag = url.searchParams.get('tag')?.trim() || '';
  const hasEmail = url.searchParams.get('has_email') === 'true';
  const limitParam = parseInt(url.searchParams.get('limit') || '', 10);
  const offsetParam = parseInt(url.searchParams.get('offset') || '', 10);
  const limit = Math.min(
    LIMIT_MAX,
    isNaN(limitParam) ? LIMIT_DEFAULT : Math.max(1, limitParam)
  );
  const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

  let query = supabase
    .from('crm_contacts')
    .select('id, name, email, phone, company, position, tags, created_at', {
      count: 'exact',
    })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    const safe = q.replace(/[%_]/g, '\\$&');
    const like = `%${safe}%`;
    query = query.or(`name.ilike.${like},email.ilike.${like},company.ilike.${like}`);
  }
  if (hasEmail) query = query.not('email', 'is', null);
  if (tag) query = query.contains('tags', [tag]);

  const { data, error, count } = await query;
  if (error) {
    console.error('[sources/crm-contacts] GET error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    contacts: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: offset + limit < (count || 0),
    },
  });
}
