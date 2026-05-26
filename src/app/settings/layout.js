'use client';

// Layout pour /settings/* — wrappe avec TopBar (ModuleSwitcher inclus).
// Les pages settings (préférences, email-senders, sms-senders) gardent
// leur layout interne (sub-nav scroll inline, retours navigation).

import AppShell from '@/components/AppShell';

export default function SettingsLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
