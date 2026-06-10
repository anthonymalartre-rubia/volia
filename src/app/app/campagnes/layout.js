'use client';

// ─────────────────────────────────────────────────────────────────────
// Layout des pages /app/campagnes/*
// ─────────────────────────────────────────────────────────────────────
// Wrappe toutes les pages du module Campagnes avec :
//   - CampagnesSidebar (Listes, Campagnes email, Domaines, etc.)
//   - Container responsive
//
// Rend AppShell (TopBar + ModuleSwitcher) directement : depuis la
// migration /admin/prospection → /app/campagnes, il n'y a plus de
// layout parent qui le fournisse.
//
// Couvre :
//   - /app/campagnes                       → Hub Listes
//   - /app/campagnes/lists/[id]            → Détail liste
//   - /app/campagnes/campaigns             → Liste campagnes
//   - /app/campagnes/campaigns/new         → Création campagne
//   - /app/campagnes/campaigns/[id]        → Détail campagne
//
// NE couvre PAS : /app/campagnes/sms (le module SMS est désactivé
// via feature flag, et même réactivé il aura sa propre nav).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import CampagnesSidebar from '@/components/campagnes/CampagnesSidebar';
import { Menu } from 'lucide-react';

export default function CampagnesLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShell>
    <div className="flex">
      <CampagnesSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile : bouton hamburger pour ouvrir la sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-30 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
        aria-label="Ouvrir le menu Campagnes"
      >
        <Menu size={20} />
      </button>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
    </AppShell>
  );
}
