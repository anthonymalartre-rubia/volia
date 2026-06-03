'use client';

// ─────────────────────────────────────────────────────────────────────
// AttributionTracker — capture l'attribution marketing FIRST-TOUCH.
// ─────────────────────────────────────────────────────────────────────
// 1) Au 1er passage : lit les UTM (?utm_source/medium/campaign/term/content)
//    + le referrer externe, classe le canal, et pose un cookie `volia_attr`
//    (90j, first-touch — jamais écrasé). Permet de distinguer
//    linkedin-ads / linkedin / seo / referral / direct.
// 2) Dès que l'utilisateur est authentifié (getSession au mount + écoute
//    onAuthStateChange pour les signups via navigation client) : persiste
//    l'attribution sur user_profiles.signup_attribution (one-shot, idempotent
//    côté API). Le flag localStorage `volia_attr_synced` évite les rappels.
//
// Monté une fois dans le layout racine, à côté d'AffiliateTracker. Ne rend rien.
// Cookie non-HttpOnly (posé client) mais same-origin → suffisant pour l'attribution.
// ─────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { classifyChannel } from '@/lib/attribution';

const COOKIE = 'volia_attr';
const SYNCED = 'volia_attr_synced';
const MAX_AGE = 90 * 24 * 60 * 60; // 90 jours

function readCookie(name) {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : null;
}

export default function AttributionTracker() {
  useEffect(() => {
    let attr = null;

    // 1) Capture first-touch
    try {
      const existing = readCookie(COOKIE);
      if (existing) {
        attr = JSON.parse(existing);
      } else {
        const p = new URLSearchParams(window.location.search);
        let referrer = '';
        try {
          const ref = document.referrer || '';
          if (ref && new URL(ref).hostname !== window.location.hostname) referrer = ref;
        } catch { /* referrer illisible */ }

        attr = {
          utm_source: p.get('utm_source') || undefined,
          utm_medium: p.get('utm_medium') || undefined,
          utm_campaign: p.get('utm_campaign') || undefined,
          utm_term: p.get('utm_term') || undefined,
          utm_content: p.get('utm_content') || undefined,
          referrer: referrer || undefined,
          landing_path: window.location.pathname || undefined,
          captured_at: new Date().toISOString(),
        };
        Object.keys(attr).forEach((k) => attr[k] === undefined && delete attr[k]);
        attr.channel = classifyChannel(attr);
        document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(attr))}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
      }
    } catch {
      return; // capture impossible → on n'empêche jamais le rendu
    }

    // 2) Persistance sur le profil dès qu'on est authentifié (one-shot)
    if (!attr) return;
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      return;
    }
    if (!supabase) return;

    const trySync = async () => {
      try {
        if (localStorage.getItem(SYNCED)) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/attribution/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attribution: attr }),
        });
        if (res.ok) localStorage.setItem(SYNCED, '1');
      } catch { /* no-op */ }
    };

    trySync(); // cas : déjà connecté au chargement
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') trySync(); // cas : signup/login via navigation client
      });
      subscription = data?.subscription;
    } catch { /* no-op */ }

    return () => {
      try { subscription?.unsubscribe(); } catch { /* no-op */ }
    };
  }, []);

  return null;
}
