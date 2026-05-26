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

export default function AppShell({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <TopBar user={user} />
      {children}
    </div>
  );
}
