'use client';

// Layout pour /settings/* :
//   - TopBar globale (ModuleSwitcher pour switcher de module)
//   - SettingsSidebar contextuelle (Préférences, Domaines email, etc.)
//   - Contenu enfant à droite

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { Menu } from 'lucide-react';

export default function SettingsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShell>
      <div className="flex">
        <SettingsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile : bouton hamburger pour ouvrir la sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed bottom-4 left-4 z-30 p-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30 active:scale-95 transition-all"
          aria-label="Ouvrir le menu Paramètres"
        >
          <Menu size={20} />
        </button>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AppShell>
  );
}
