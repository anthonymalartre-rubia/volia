'use client';

// Layout pour /admin/* — wrappe avec TopBar (ModuleSwitcher inclus).
// Les pages /app/campagnes/* ajoutent en plus la CampagnesSidebar
// via leur propre layout imbriqué.

import AppShell from '@/components/AppShell';

export default function AdminLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
