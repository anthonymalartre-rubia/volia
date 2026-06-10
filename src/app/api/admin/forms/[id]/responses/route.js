// ─────────────────────────────────────────────────────────────────────
// GET /api/admin/forms/[id]/responses — Liste paginée + export CSV
// ─────────────────────────────────────────────────────────────────────
// Query params :
//   - limit (default 50, max 200)
//   - offset (default 0)
//   - format=csv → renvoie un text/csv en download
//
// RLS-aware : on filtre par user_id = current user (en plus du RLS),
// pas besoin de service_role.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

const LIMIT_DEFAULT = 50;
const LIMIT_MAX = 200;

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

function escapeCsv(value) {
  if (value == null) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get('format');
  const limitParam = parseInt(url.searchParams.get('limit') || '', 10);
  const offsetParam = parseInt(url.searchParams.get('offset') || '', 10);
  const limit = Math.min(LIMIT_MAX, isNaN(limitParam) ? LIMIT_DEFAULT : Math.max(1, limitParam));
  const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

  // Vérifie ownership form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, name, slug, schema')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (formError) {
    return NextResponse.json({ success: false, error: formError.message }, { status: 500 });
  }
  if (!form) {
    return NextResponse.json({ success: false, error: 'Formulaire introuvable' }, { status: 404 });
  }

  // CSV : on récupère tout (cap à 5k pour éviter timeout — V2 = streaming)
  const csvLimit = format === 'csv' ? Math.min(5000, LIMIT_MAX * 100) : limit;
  const csvOffset = format === 'csv' ? 0 : offset;

  const { data: responses, error: respError, count } = await supabase
    .from('form_responses')
    .select('id, answers, metadata, bridge_status, bridge_error, crm_contact_id, campagnes_contact_id, submitted_at', { count: 'exact' })
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })
    .range(csvOffset, csvOffset + csvLimit - 1);

  if (respError) {
    return NextResponse.json({ success: false, error: respError.message }, { status: 500 });
  }

  if (format === 'csv') {
    const schemaFields = Array.isArray(form.schema?.fields) ? form.schema.fields : [];
    const fieldKeys = schemaFields.map((f) => f.key);
    const headers = ['submitted_at', 'response_id', 'bridge_status', ...fieldKeys];
    const lines = [headers.map(escapeCsv).join(',')];
    for (const r of responses || []) {
      const row = [
        r.submitted_at,
        r.id,
        r.bridge_status || '',
        ...fieldKeys.map((k) => {
          const v = r.answers?.[k];
          if (v && typeof v === 'object' && v._file) return v.name || '';
          return v;
        }),
      ];
      lines.push(row.map(escapeCsv).join(','));
    }
    const csv = '﻿' + lines.join('\n'); // BOM UTF-8 pour Excel
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${form.slug}-responses-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: responses || [],
    form: { id: form.id, name: form.name, slug: form.slug, schema: form.schema },
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: offset + limit < (count || 0),
    },
  });
}
