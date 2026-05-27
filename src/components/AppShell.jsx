'use client';

// ─────────────────────────────────────────────────────────────────────
// AppShell — wrapper réutilisable pour les pages app post-login
// ─────────────────────────────────────────────────────────────────────
// Rend la TopBar (avec ModuleSwitcher) + un conteneur enfant.
// Utilisé par les layouts qui couvrent les routes authentifiées :
//   - src/app/admin/layout.js         (couvre /admin/*)
//   - src/app/admin/prospection/layout.js (ajoute la sidebar Campagnes)
//   - src/app/settings/layout.js      (couvre /settings/*)
//   - src/app/parrainage/layout.js
//   - src/app/app/layout.js           (couvre /app/*)
//
// Avantage : 1 seul endroit pour fetch user + render TopBar. Si on
// change le TopBar (nouveau bouton, theme switcher, etc.), ça
// répercute partout.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';
import CrispChat from '@/components/CrispChat';
// Brand Achievements Pull : récupère les achievements débloqués côté
// serveur sans toast affiché (webhook resend.inbound, form public submit)
// et les cascade au prochain login. Aucun rendu visuel — utilise l'event
// bus de <AchievementToast /> monté dans le layout racine.
import AchievementPuller from '@/components/welcome/AchievementPuller';

export default function AppShell({ children }) {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    // Récupère le plan une fois le user identifié (best-effort, pour Crisp).
    async function loadPlan(userId) {
      if (!userId) return;
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', userId)
          .maybeSingle();
        if (!cancelled && data?.plan) setPlan(data.plan);
      } catch {
        /* noop — affichage Crisp ne doit jamais casser l'app */
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data?.user) {
        setUser(data.user);
        loadPlan(data.user.id);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u?.id) loadPlan(u.id);
      else setPlan(null);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <TopBar user={user} showHamburger={false} />
      {children}
      {/* Live chat in-app (Crisp) — uniquement post-login + consentement marketing */}
      <CrispChat user={user} plan={plan} enabled={Boolean(user)} />
      {/* Pull des achievements silencieux — uniquement post-login (sinon
          la route /api/achievements/unseen retourne 401). On attend que le
          user soit connu pour le mount. */}
      {user ? <AchievementPuller /> : null}
    </div>
  );
}
