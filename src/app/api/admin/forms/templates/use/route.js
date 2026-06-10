// ─────────────────────────────────────────────────────────────────
// POST /api/app/formulaires/templates/use — Instancie un template (Sprint F7)
// ─────────────────────────────────────────────────────────────────
// Body : { template_slug: string }
// 1. Vérifie quota (canCreateForm — gating plan)
// 2. Lit le template depuis form_templates
// 3. Crée un form draft avec name + description + schema du template
// 4. Renvoie le form créé → le client redirige vers /app/formulaires/[id]
//
// Atomique côté UX : 1 appel HTTP, pas besoin de POST + PUT depuis le client.
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { canCreateForm } from '@/lib/forms-gating';
import { generateUniqueSlug, validateFormSchema } from '@/lib/forms';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const templateSlug = typeof body.template_slug === 'string' ? body.template_slug.trim() : '';
  if (!templateSlug) {
    return NextResponse.json(
      { success: false, error: 'template_slug requis' },
      { status: 400 }
    );
  }

  // Gating plan
  const gate = await canCreateForm(supabase, user.id);
  if (!gate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: gate.reason,
        gating: { plan: gate.plan, limit: gate.limit, current: gate.current },
      },
      { status: 403 }
    );
  }

  // Fetch template
  const { data: template, error: tplError } = await supabase
    .from('form_templates')
    .select('slug, name, description, schema, is_premium')
    .eq('slug', templateSlug)
    .maybeSingle();

  if (tplError) {
    console.error('[forms/templates/use] template fetch error', tplError);
    return NextResponse.json({ success: false, error: tplError.message }, { status: 500 });
  }
  if (!template) {
    return NextResponse.json({ success: false, error: 'Template introuvable' }, { status: 404 });
  }

  // Validation défensive du schema (au cas où un seed mal formé serait passé)
  const validation = validateFormSchema(template.schema);
  if (!validation.valid) {
    console.error('[forms/templates/use] template schema invalid', templateSlug, validation.errors);
    return NextResponse.json(
      { success: false, error: 'Le template est corrompu, contactez le support.' },
      { status: 500 }
    );
  }

  const slug = await generateUniqueSlug(supabase, template.name);

  const insertPayload = {
    user_id: user.id,
    slug,
    name: template.name.slice(0, 200),
    description: template.description ? template.description.slice(0, 2000) : null,
    status: 'draft',
    schema: template.schema,
    settings: {},
  };

  const { data, error } = await supabase
    .from('forms')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('[forms/templates/use] insert error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
