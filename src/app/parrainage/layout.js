'use client';

// Layout pour /parrainage — wrappe avec TopBar (ModuleSwitcher inclus).

import AppShell from '@/components/AppShell';

export default function ParrainageLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
