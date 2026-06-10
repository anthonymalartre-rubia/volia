'use client';

// ─────────────────────────────────────────────────────────────────────
// Layout des pages /app/formulaires/*
// ─────────────────────────────────────────────────────────────────────
// Wrappe les pages du module Volia Formulaires avec :
//   - FormsSidebar (Mes formulaires, Templates, Statistiques)
//   - Bouton hamburger mobile
//
// Rend AppShell (TopBar + ModuleSwitcher) directement : plus de layout
// parent depuis la migration /admin/forms → /app/formulaires.
// Pattern strictement identique à /app/campagnes/layout.js.
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';
import FormsSidebar from '@/components/forms/FormsSidebar';
import { Menu } from 'lucide-react';

export default function FormsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() || '';

  // Sur les pages builder (/app/formulaires/[id], hors sous-pages) ou preview,
  // on cache la sidebar pour laisser le builder occuper toute la largeur.
  // Match :
  //   /app/formulaires/abc                → builder fullscreen
  //   /app/formulaires/abc/preview        → preview fullscreen
  //   /app/formulaires/abc/settings       → garde sidebar
  //   /app/formulaires/abc/responses      → garde sidebar
  //   /app/formulaires/templates          → garde sidebar (sous-route nommée)
  //   /app/formulaires/stats              → garde sidebar (sous-route nommée)
  //
  // ⚠️ Bug 28 mai 2026 (signalé par founder) : la regex `[^/]+` matchait
  // aussi "templates" et "stats" → le menu de gauche disparaissait sur
  // ces 2 pages. Fix : whitelist explicite des sous-routes nommées non
  // fullscreen, comme ça toute future sous-route (ex /app/formulaires/import)
  // ne cassera pas non plus.
  const RESERVED_SUBROUTES = new Set(['templates', 'stats']);
  const fullscreenExec = /^\/app\/formulaires\/([^/]+)(\/preview)?\/?$/.exec(pathname);
  const isFullscreen =
    fullscreenExec &&
    pathname !== '/app/formulaires' &&
    !RESERVED_SUBROUTES.has(fullscreenExec[1]);

  if (isFullscreen) {
    return (
      <AppShell>
        <main className="min-w-0">{children}</main>
      </AppShell>
    );
  }

  return (
    <AppShell>
    <div className="flex">
      <FormsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile : bouton hamburger pour ouvrir la sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-30 p-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
        aria-label="Ouvrir le menu Formulaires"
      >
        <Menu size={20} />
      </button>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
    </AppShell>
  );
}
