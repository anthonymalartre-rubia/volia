// GET /api/admin/leads
//
// Liste tous les leads capturés via /api/ressources/download.
// Requiert que l'utilisateur authentifié ait user_profiles.is_admin = true.
//
// Query params (optionnels) :
//   - resource_slug : filtre sur une ressource précise
//   - format        : 'json' (défaut) ou 'csv' (export prospection)
//   - limit / offset

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const LIMIT_MAX = 1000;

export async function GET(request) {
  // Auth + admin check
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

  // Query params
  const url = new URL(request.url);
  const resourceSlug = url.searchParams.get('resource_slug');
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';
  const limit = Math.min(LIMIT_MAX, Math.max(1, parseInt(url.searchParams.get('limit') || '500', 10)));
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  // Fetch via service_role (bypass RLS)
  const supabaseAdmin = getSupabaseAdmin();
  let query = supabaseAdmin
    .from('resource_leads')
    .select(
      'id, email, first_name, company, resource_slug, ' +
      'utm_source, utm_medium, utm_campaign, referrer, ip_country, ' +
      'email_sent, email_sent_at, email_provider_id, email_error, ' +
      'consent_given, opt_out, opt_out_at, ' +
      'created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (resourceSlug) query = query.eq('resource_slug', resourceSlug);

  const { data, error, count } = await query;
  if (error) {
    console.error('[api/admin/leads]', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }

  // Format CSV (export pour Lemlist, Apollo, Notion, etc.)
  if (format === 'csv') {
    const headers = [
      'email', 'first_name', 'company', 'resource_slug',
      'utm_source', 'utm_medium', 'utm_campaign', 'referrer', 'ip_country',
      'email_sent', 'consent_given', 'opt_out', 'created_at',
    ];
    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const lines = [headers.join(',')];
    for (const row of data || []) {
      lines.push(headers.map((h) => escape(row[h])).join(','));
    }
    const csv = lines.join('\n');
    const filename = `prospectia-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // JSON par défaut
  return NextResponse.json({
    leads: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (offset + limit) < (count || 0),
    },
  });
}
