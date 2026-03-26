'use client';

import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function TopBar({ user }) {
  const router = useRouter();
  const supabase = getSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-[#1e1e24] bg-[#09090b]/82 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side: Logo and title */}
        <div className="flex items-center gap-4">
          {/* Logo box with gradient */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-sm font-bold text-white">LG</span>
          </div>

          {/* Title and badge */}
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold text-[#fafafa]">
              Lead Generator
            </h1>
            <div className="inline-flex w-fit rounded-md bg-[#1e1e24] px-2 py-1">
              <span className="text-xs font-medium text-[#52525b]">
                Prospection DOM
              </span>
            </div>
          </div>
        </div>

        {/* Right side: User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-[#52525b] hidden sm:block">
            Martinique · Guadeloupe · Guyane · La Réunion
          </div>

          {user && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#1e1e24]">
              <span className="text-sm text-[#a1a1aa]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#71717a] hover:text-[#fafafa] hover:bg-[#1e1e24] transition"
                title="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
