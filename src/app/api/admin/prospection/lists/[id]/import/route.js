// POST /api/admin/prospection/lists/[id]/import
//
// Body : { csv: "header1,header2\nval,val\n..." }
//   OU multipart form-data avec champ "file"
//
// Réponse : { inserted, skipped, errors, warnings, sample }
//
// Comportement :
// - Parse CSV (séparateur auto)
// - Normalise chaque ligne (email lowercase, phone E.164, trim)
// - Skip les doublons (UNIQUE index sur (list_id, email) et (list_id, phone))
// - Skip les lignes sans email NI phone
// - Bulk insert par chunks de 500 (limite Supabase)

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { parseCsv, normalizeContact } from '@/lib/prospection';
import { trackOnboardingStep } from '@/lib/onboarding';

const MAX_ROWS = 50_000;       // Anti-bombing
const CHUNK_SIZE = 500;        // Bulk insert chunk

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id: listId } = await params;

  // Vérifie que la liste existe et appartient au user
  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .select('id')
    .eq('id', listId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (listErr || !list) return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });

  // Récup le CSV — supporte JSON {csv:...} ET multipart form-data {file:...}
  let csvText = '';
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const body = await request.json();
      csvText = String(body.csv || '');
    } else if (ct.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (file && typeof file === 'object' && file.text) {
        csvText = await file.text();
      }
    } else {
      csvText = await request.text();
    }
  } catch (err) {
    return NextResponse.json({ error: 'Impossible de lire le CSV' }, { status: 400 });
  }

  if (!csvText || csvText.length < 5) {
    return NextResponse.json({ error: 'CSV vide ou trop petit' }, { status: 400 });
  }

  const { rows, headers } = parseCsv(csvText);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Aucune ligne valide dans le CSV', headers }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Trop de lignes : max ${MAX_ROWS} par import` }, { status: 413 });
  }

  // Normalisation
  const toInsert = [];
  const errors = [];
  const allWarnings = new Set();
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const normalized = normalizeContact(rows[i]);
    if (!normalized.ok) {
      skipped++;
      if (errors.length < 10) errors.push(`Ligne ${i + 2}: ${normalized.error}`);
      continue;
    }
    toInsert.push({ list_id: listId, ...normalized.contact });
    if (normalized.warnings) normalized.warnings.forEach((w) => allWarnings.add(w));
  }

  // Insert par chunks. On utilise upsert pour ignorer les doublons gracefully
  let inserted = 0;
  const insertErrors = [];

  for (let start = 0; start < toInsert.length; start += CHUNK_SIZE) {
    const chunk = toInsert.slice(start, start + CHUNK_SIZE);
    const { data, error, count } = await supabase
      .from('prospect_contacts')
      .upsert(chunk, {
        onConflict: 'list_id,email',
        ignoreDuplicates: true,
        count: 'exact',
      })
      .select('id', { count: 'exact' });

    if (error) {
      console.error('[import] chunk error', error);
      insertErrors.push(error.message);
    } else {
      inserted += (data?.length || count || 0);
    }
  }

  // Sample des 3 premières lignes valides pour le UI
  const sample = toInsert.slice(0, 3).map((c) => ({
    email: c.email,
    phone: c.phone,
    company: c.company,
  }));

  // Onboarding : marque first_csv_import si au moins 1 contact inséré (fire-and-forget)
  if (inserted > 0) {
    trackOnboardingStep(user.id, 'first_csv_import');
  }

  return NextResponse.json({
    ok: true,
    parsed: rows.length,
    inserted,
    skipped,
    duplicates: toInsert.length - inserted - insertErrors.length,
    errors: [...errors, ...insertErrors].slice(0, 10),
    warnings: Array.from(allWarnings),
    headers,
    sample,
  });
}
