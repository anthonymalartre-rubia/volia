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
        className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm text-gray-500 hover:text-black transition"
      >
        Se connecter
      </Link>
      <Link
        href="/signup"
        className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all"
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
      className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-black text-white text-base font-semibold hover:bg-gray-800 transition-all"
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
      className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-black text-lg font-semibold hover:bg-gray-100 transition-all"
    >
      {text}
      <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
