'use client';

// ReferralPushBanner — Bandeau persistant en haut du dashboard pour
// pousser le programme de parrainage.
//
// Design pattern Notion / Linear / Vercel : pleine largeur, gradient
// violet→pink subtle, copie courte, 2 CTA (Copier code + Voir programme).
//
// Règles d'affichage :
// - Caché tant que les stats parrainage ne sont pas chargées (évite flicker)
// - Caché si l'user a déjà parrainé ≥ 3 amis qualifiés ou converti
// - Dismiss (X) : enregistré dans localStorage pour 7 jours
// - Affiché APRÈS le TrialBanner et UpgradeBanner (priorité aux nudges $)
//
// Le bouton "Copier" copie directement le lien complet, pas que le code,
// pour faciliter le partage. Le code reste affiché en monospace pour
// renforcer le sentiment de "ton code à toi".

import { useState, useEffect } from 'react';
import { safeStorage } from "@/lib/safe-storage";
import Link from 'next/link';
import { Gift, X, ArrowRight, Copy, Check } from 'lucide-react';

const DISMISS_KEY = 'volia_referral_push_banner_dismissed_at';
const DISMISS_DAYS = 7;
// Seuil au-delà duquel on considère que l'user a déjà adopté le programme
// → on cache le banner pour ne pas être chiant.
const QUALIFIED_THRESHOLD = 3;

export default function ReferralPushBanner() {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Garde-fou : si fermé récemment (< 7j), on n'affiche rien.
    try {
      const dismissed = safeStorage.get(DISMISS_KEY);
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
          return;
        }
      }
    } catch {}

    // Fetch stats — si erreur (user non auth ou réseau), on n'affiche rien.
    (async () => {
      try {
        const res = await fetch('/api/referrals/me');
        if (!res.ok) return;
        const data = await res.json();
        const s = data.stats || {};
        // Cache si user a déjà 3+ filleuls qualifiés (programme adopté)
        if ((s.qualified || 0) >= QUALIFIED_THRESHOLD) return;
        setStats(s);
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

  async function handleCopy() {
    if (!stats?.code) return;
    const url = `https://volia.fr/signup?ref=${stats.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  if (!visible || !stats?.code) return null;

  return (
    <div className="relative mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/[0.08] via-fuchsia-500/[0.06] to-pink-500/[0.08] overflow-hidden">
      {/* Halo lumineux discret */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3">
        {/* Icône + message */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Gift size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-content-primary leading-tight">
              Invitez 3 amis = <span className="text-pink-400">3 mois d&apos;abonnement offerts</span>
              <span className="text-content-secondary font-normal"> + 1 mois pour eux</span>
            </p>
            <p className="text-[11px] text-content-tertiary mt-0.5 leading-snug">
              Votre code :{' '}
              <code className="font-mono text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded text-[11px]">
                {stats.code}
              </code>
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            aria-label="Copier mon lien de parrainage"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated/80 hover:bg-surface-elevated border border-line text-xs font-medium text-content-primary transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
          <Link
            href="/parrainage"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold transition-all shadow-md shadow-violet-500/20"
          >
            Voir le programme
            <ArrowRight size={11} />
          </Link>
          <button
            onClick={handleDismiss}
            aria-label="Masquer pour 7 jours"
            title="Masquer pour 7 jours"
            className="p-1 rounded-md hover:bg-surface-elevated transition-colors text-content-tertiary hover:text-content-secondary"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
