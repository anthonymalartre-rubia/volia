'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function NavAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsLoggedIn(!!user);
      });
    }
  }, []);

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm text-[#a1a1aa] hover:text-white transition"
      >
        Se connecter
      </Link>
      <Link
        href="/signup"
        className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all"
      >
        Commencer
      </Link>
    </>
  );
}

export function HeroCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsLoggedIn(!!user);
      });
    }
  }, []);

  const href = isLoggedIn ? '/dashboard' : '/signup';
  const text = isLoggedIn ? 'Acceder au dashboard' : 'Commencer gratuitement';

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-base font-semibold hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
    >
      {text}
      <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}

export function FooterCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsLoggedIn(!!user);
      });
    }
  }, []);

  const href = isLoggedIn ? '/dashboard' : '/signup';
  const text = isLoggedIn ? 'Acceder au dashboard' : 'Commencer gratuitement';

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-lg font-semibold hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
    >
      {text}
      <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
