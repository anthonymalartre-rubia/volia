import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { incrementUsage, checkLimit } from '@/lib/usage';
import { trackOnboardingStep } from '@/lib/onboarding';

/**
 * POST /api/usage/track-export
 *
 * Incrémente le compteur `exports` du mois pour l'utilisateur authentifié.
 *
 * Pourquoi côté serveur ?
 * Avant le fix audit P0 #2, le dashboard client faisait directement
 *   supabase.from('usage_tracking').update({ exports: ... })
 * via la clé anon. Couplé à une RLS UPDATE permissive (only `user_id = auth.uid()`),
 * n'importe quel user pouvait remettre son compteur à 0 depuis la console JS
 * et bypasser les quotas d'export.
 *
 * Maintenant : la RLS UPDATE a été DROP sur usage_tracking (migration
 * harden_security_p0_audit), et toutes les mutations passent par cette
 * route qui utilise le service_role via incrementUsage().
 */
export async function POST() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    // Re-check du quota côté serveur (le client peut afficher des numéros périmés)
    const limitCheck = await checkLimit(supabase, user.id, 'exports');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: 'Limite d\'exports atteinte pour ce mois. Passez à Prospection (19€/mois — exports illimités) pour continuer.', limitReached: true, ...limitCheck },
        { status: 429 }
      );
    }

    await incrementUsage(supabase, user.id, 'exports');

    // Onboarding : marque first_export (fire-and-forget)
    trackOnboardingStep(user.id, 'first_export');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('track-export error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
