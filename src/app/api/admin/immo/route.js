// GET /api/admin/immo
//
// Liste les inscrits à la liste d'attente Volia Immo (table immo_waitlist).
// Requiert user_profiles.is_admin = true.
//
// Query params :
//   - format : 'json' (défaut) ou 'csv'
//   - limit / offset

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const LIMIT_MAX = 5000;

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';
  const limit = Math.min(LIMIT_MAX, Math.max(1, parseInt(url.searchParams.get('limit') || '2000', 10)));
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error, count } = await supabaseAdmin
    .from('immo_waitlist')
    .select('id, email, profil, secteurs, telephone, budget, source, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[api/admin/immo]', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }

  if (format === 'csv') {
    const headers = ['email', 'profil', 'secteurs', 'telephone', 'budget', 'source', 'created_at'];
    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(',')];
    for (const row of data || []) lines.push(headers.map((h) => escape(row[h])).join(','));
    const csv = lines.join('\n');
    const filename = `volia-immo-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({
    leads: data || [],
    pagination: { total: count || 0, limit, offset, has_more: (offset + limit) < (count || 0) },
  });
}
