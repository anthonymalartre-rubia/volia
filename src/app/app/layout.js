'use client';

// Layout pour /app/* — wrappe avec TopBar (ModuleSwitcher inclus).
// Les sous-pages /app/crm/* rendent leur propre CrmSidebar dans
// leur page.js (pattern in-page actuel, non touché ici).

import AppShell from '@/components/AppShell';

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
