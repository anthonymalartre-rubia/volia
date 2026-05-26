'use client';

// ─────────────────────────────────────────────────────────────────────
// Layout des pages /admin/*
// ─────────────────────────────────────────────────────────────────────
// Wrappe toutes les pages /admin avec :
//   - TopBar (qui contient le ModuleSwitcher Prospection/Campagnes/CRM)
//   - Background light surface-base
//
// On ne rend PAS la Sidebar latérale (celle de /dashboard) parce que :
//   - Les pages /admin/* ont leur propre sub-navigation interne
//     (campagnes, listes, sms-senders, etc.)
//   - La Sidebar ferait double-emploi et alourdirait l'écran
//
// Ce qu'on garde absolument : le ModuleSwitcher (via TopBar) pour
// que l'utilisateur puisse switcher entre Prospection / Campagnes /
// CRM depuis n'importe quelle page admin sans devoir revenir au
// dashboard.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    // Re-fetch sur changement d'état auth (signin/signout depuis un autre onglet)
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
