// Helper d'auto-tracking onboarding.
//
// Appelé en fire-and-forget depuis les routes API métier (search, import,
// campaign, export, profile) pour marquer les étapes du widget
// OnboardingChecklist.
//
// Idempotent côté serveur : si l'étape est déjà faite, no-op.
// Erreur silencieuse : ne casse JAMAIS la route principale.

import { getSupabaseAdmin } from './supabase-admin';

const REQUIRED_STEPS = [
  'first_search',
  'first_csv_import',
  'first_campaign',
  'first_export',
  'profile_completed',
];

const VALID_STEPS = [...REQUIRED_STEPS, 'overlay_seen'];

/**
 * Marque une étape comme complétée pour un user.
 * Fire-and-forget : à appeler sans `await` dans les routes pour ne pas
 * ralentir la réponse principale.
 *
 * Exemple :
 *   import { trackOnboardingStep } from '@/lib/onboarding';
 *   trackOnboardingStep(user.id, 'first_search'); // pas d'await
 */
export async function trackOnboardingStep(userId, step) {
  if (!userId || !step) return;
  if (!VALID_STEPS.includes(step)) return;

  try {
    const supabase = getSupabaseAdmin();

    // Lecture rapide pour check idempotent
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_steps, onboarding_completed_at')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return; // user inconnu, skip
    const currentSteps = profile.onboarding_steps || {};
    if (currentSteps[step]) return; // déjà fait, skip

    const now = new Date().toISOString();
    const nextSteps = { ...currentSteps, [step]: now };

    // Auto-complete onboarding si toutes les required steps sont faites
    const allDone = REQUIRED_STEPS.every((s) => nextSteps[s]);
    const updates = { onboarding_steps: nextSteps };
    if (allDone && !profile.onboarding_completed_at) {
      updates.onboarding_completed_at = now;
    }

    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
  } catch (err) {
    // Erreur silencieuse — l'onboarding tracking ne doit JAMAIS casser
    // une route métier.
    console.error('[onboarding] track step error', step, err?.message);
  }
}
