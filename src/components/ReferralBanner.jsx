'use client';

// Banner dashboard "Invitez X amis, gagnez X mois gratuits".
// Dismissable (localStorage) — réapparait après 7 jours.

import { useState, useEffect } from 'react';
import { safeStorage } from "@/lib/safe-storage";
import Link from 'next/link';
import { Gift, X, ArrowRight, Sparkles } from 'lucide-react';

const DISMISS_KEY = 'volia_referral_banner_dismissed_at';
const DISMISS_DAYS = 7;

export default function ReferralBanner() {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Si fermé récemment (< 7j), ne pas afficher
    try {
      const dismissed = safeStorage.get(DISMISS_KEY);
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
          return;
        }
      }
    } catch {}

    // Fetch stats
    (async () => {
      try {
        const res = await fetch('/api/referrals/me');
        if (!res.ok) return;
        const data = await res.json();
        setStats(data.stats);
        setVisible(true);
      } catch {}
    })();
  }, []);

  function handleDismiss() {
    try {
      safeStorage.set(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }

  if (!visible || !stats) return null;

  // Adaptation du message selon l'état
  const isNewbie = stats.total === 0;
  const hasRewards = stats.bonus_months_earned > 0;
  const message = hasRewards
    ? `🎁 Vous avez gagné ${stats.bonus_months_earned} mois gratuits — continuez !`
    : isNewbie
    ? '🎁 Invitez 3 amis, gagnez 3 mois gratuits sur votre abonnement'
    : `🎁 ${stats.total} filleul${stats.total > 1 ? 's' : ''} invités — ${stats.pending} en attente de signature payante`;

  return (
    <div className="mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/[0.08] to-violet-500/[0.08] p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/30 shrink-0">
          <Gift className="h-4 w-4 text-pink-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-content-primary mb-1.5">{message}</p>
          <p className="text-xs text-content-secondary leading-relaxed">
            Pour chaque ami qui devient client payant via votre lien, vous gagnez 1 mois gratuit. Aucune limite.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/parrainage"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-pink-600 to-violet-600 text-white hover:from-pink-500 hover:to-violet-500 transition-all shadow-lg shadow-pink-500/20"
            >
              <Sparkles size={11} />
              Récupérer mon lien
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-md hover:bg-surface-elevated transition-colors shrink-0 text-content-tertiary hover:text-content-secondary"
          aria-label="Masquer pour 7 jours"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
