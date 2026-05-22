// Marque une étape d'onboarding comme complétée (persistant Supabase).
//
// POST { step: 'first_search' | 'first_csv_import' | 'first_campaign'
//        | 'first_export' | 'profile_completed' | 'overlay_seen' }
//
// Met à jour user_profiles.onboarding_steps (JSONB merge).
// Auto-set onboarding_completed_at quand toutes les 5 étapes sont faites.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

const VALID_STEPS = [
  'overlay_seen',
  'first_search',
  'first_csv_import',
  'first_campaign',
  'first_export',
  'profile_completed',
];

// Les 5 étapes obligatoires pour marquer l'onboarding 100% complet
const REQUIRED_STEPS = [
  'first_search',
  'first_csv_import',
  'first_campaign',
  'first_export',
  'profile_completed',
];

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { step } = body;

  if (!step || !VALID_STEPS.includes(step)) {
    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  }

  // Récupère l'état actuel
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_steps, onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  const currentSteps = profile?.onboarding_steps || {};

  // Idempotent : si déjà fait, ne re-écrit pas
  if (currentSteps[step]) {
    return NextResponse.json({
      ok: true,
      already_done: true,
      steps: currentSteps,
      completed_at: profile?.onboarding_completed_at,
    });
  }

  const now = new Date().toISOString();
  const nextSteps = { ...currentSteps, [step]: now };

  // Check si toutes les required steps sont faites pour marquer completed_at
  const allDone = REQUIRED_STEPS.every((s) => nextSteps[s]);
  const completedAt = allDone && !profile?.onboarding_completed_at ? now : profile?.onboarding_completed_at;

  const updates = { onboarding_steps: nextSteps };
  if (step === 'overlay_seen' && !profile?.onboarding_overlay_seen_at) {
    updates.onboarding_overlay_seen_at = now;
  }
  if (completedAt && !profile?.onboarding_completed_at) {
    updates.onboarding_completed_at = completedAt;
  }

  const { error: updErr } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id);

  if (updErr) {
    console.error('[onboarding/complete-step] update error', updErr);
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    step,
    steps: nextSteps,
    completed_at: completedAt,
    all_done: allDone,
  });
}

// GET pour récupérer l'état courant (utilisé par le widget onboarding)
export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_steps, onboarding_completed_at, onboarding_overlay_seen_at, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return NextResponse.json({
    steps: profile?.onboarding_steps || {},
    completed_at: profile?.onboarding_completed_at,
    overlay_seen_at: profile?.onboarding_overlay_seen_at,
    user_created_at: profile?.created_at,
    required_steps: REQUIRED_STEPS,
  });
}
