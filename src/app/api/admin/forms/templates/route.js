// ─────────────────────────────────────────────────────────────────
// GET /api/app/formulaires/templates — Liste des templates publics (Sprint F7)
// ─────────────────────────────────────────────────────────────────
// Templates partagés à tous les users authentifiés. Lecture publique
// (RLS policy "form_templates_select_all") mais on exige quand même un
// user connecté pour pouvoir filtrer plus tard par plan (is_premium).
//
// Query params :
//   - category (optionnel) → filtre exact
//   - search (optionnel)   → ILIKE name + description
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const search = (url.searchParams.get('search') || '').trim();

  let query = supabase
    .from('form_templates')
    .select('id, slug, name, description, category, schema, preview_image_url, use_cases, is_premium, position')
    .order('category', { ascending: true })
    .order('position', { ascending: true });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (search) {
    // .ilike sur 2 colonnes via .or
    const safe = search.replace(/[,()]/g, '');
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[api/app/formulaires/templates] GET error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Enrichit chaque template avec un récap fields/pages pour les cards
  const enriched = (data || []).map((t) => {
    const schema = t.schema && typeof t.schema === 'object' ? t.schema : {};
    return {
      ...t,
      fields_count: Array.isArray(schema.fields) ? schema.fields.length : 0,
      pages_count: Array.isArray(schema.pages) ? schema.pages.length : 1,
    };
  });

  // Liste des catégories distinctes pour les chips de filtres
  const categories = Array.from(new Set(enriched.map((t) => t.category)));

  return NextResponse.json({
    success: true,
    data: enriched,
    categories,
  });
}
