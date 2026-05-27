'use client';

// Layout pour /settings/* :
//   - TopBar globale (ModuleSwitcher pour switcher de module)
//   - SettingsSidebar contextuelle UNIQUEMENT sur les sous-pages
//     (/settings/team, /settings/email-senders, /settings/webhooks, etc.).
//     Bug fix 27 mai 2026 : sur /settings (page racine), la page a sa
//     propre sidebar in-page avec onglets → afficher la SettingsSidebar
//     en plus ferait double menu. On la cache sur /settings exact.
//   - Contenu enfant à droite

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { Menu } from 'lucide-react';

export default function SettingsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() || '';

  // Sur /settings (page racine), la page a sa propre sidebar in-page
  // avec onglets (Préférences, Sécurité, Plan & Usage, Parrainage, Aide,
  // Zone dangereuse). Pas besoin de la SettingsSidebar contextuelle qui
  // ferait double menu. On l'affiche UNIQUEMENT sur les sous-pages.
  const isRootSettingsPage = pathname === '/settings' || pathname === '/settings/';
  const showContextualSidebar = !isRootSettingsPage;

  return (
    <AppShell>
      <div className="flex">
        {showContextualSidebar && (
          <SettingsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Mobile : bouton hamburger pour ouvrir la sidebar — uniquement
            quand la sidebar contextuelle est affichée */}
        {showContextualSidebar && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed bottom-4 left-4 z-30 p-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30 active:scale-95 transition-all"
            aria-label="Ouvrir le menu Paramètres"
          >
            <Menu size={20} />
          </button>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AppShell>
  );
}
