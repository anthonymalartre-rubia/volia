'use client';

// ─────────────────────────────────────────────────────────────────────────
// FirstLoginWelcome — modal full-screen non-bloquant qui s'affiche au
// premier login sur /dashboard (user_profiles.welcomed_at IS NULL).
//
// UX :
//  - Backdrop blur + animation slide-up + scale de la card
//  - Mascot welcome + speech bubble
//  - 4 cards d'action (1 par module Volia)
//  - Bouton "Plus tard, montre-moi juste le dashboard" en bas
//  - Dismiss : Esc, X, click backdrop OU clic sur "Plus tard"
//  - Au dismiss → POST /api/onboarding/welcomed
//
// Le parent (dashboard/page.js) :
//  - Détecte welcomed_at == null
//  - Render <FirstLoginWelcome user={user} onDismiss={...} />
//  - onDismiss met à jour le state local pour ne plus afficher le modal
//    pour cette session (la DB est mise à jour en parallèle par le composant)
// ─────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Mascot from './Mascot';
import { Target, Send, FormInput, Trophy, X, ArrowRight } from 'lucide-react';

// 4 cards d'action — 1 par module Volia.
// L'icon + couleur servent à varier visuellement les 4 entrées.
const ACTIONS = [
  {
    key: 'prospection',
    icon: Target,
    label: 'Démarrer une recherche',
    desc: 'Trouve tes 100 premiers prospects en 2 min.',
    href: '/admin/prospection',
    accent: 'violet',
  },
  {
    key: 'campaigns',
    icon: Send,
    label: 'Créer ma première campagne',
    desc: 'Lance une séquence cold email automatisée.',
    href: '/admin/prospection/campaigns/new',
    accent: 'indigo',
  },
  {
    key: 'forms',
    icon: FormInput,
    label: 'Capturer des leads',
    desc: 'Crée un formulaire embeddable en 30 secondes.',
    href: '/admin/forms',
    accent: 'sky',
  },
  {
    key: 'crm',
    icon: Trophy,
    label: 'Organiser mon pipeline',
    desc: 'Suis tes deals dans un CRM natif Volia.',
    href: '/admin/crm',
    accent: 'amber',
  },
];

const ACCENT_CLASSES = {
  violet: 'group-hover:border-violet-500/50 group-hover:bg-violet-500/[0.06]',
  indigo: 'group-hover:border-indigo-500/50 group-hover:bg-indigo-500/[0.06]',
  sky: 'group-hover:border-sky-500/50 group-hover:bg-sky-500/[0.06]',
  amber: 'group-hover:border-amber-500/50 group-hover:bg-amber-500/[0.06]',
};
const ICON_BG = {
  violet: 'bg-violet-500/15 text-violet-400',
  indigo: 'bg-indigo-500/15 text-indigo-400',
  sky: 'bg-sky-500/15 text-sky-400',
  amber: 'bg-amber-500/15 text-amber-400',
};

export default function FirstLoginWelcome({ firstName = '', onDismiss }) {
  const router = useRouter();
  const dismissedRef = useRef(false);
  const [closing, setClosing] = useState(false);

  const handleDismiss = useCallback(
    (navigateTo = null) => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      setClosing(true);

      // Best-effort POST — pas d'await, ne bloque pas le navigate.
      try {
        fetch('/api/onboarding/welcomed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      } catch {}

      // Petit délai pour laisser l'animation close jouer avant le navigate
      // ou avant que le parent retire le modal du DOM.
      setTimeout(() => {
        if (typeof onDismiss === 'function') onDismiss();
        if (navigateTo) router.push(navigateTo);
      }, 200);
    },
    [onDismiss, router]
  );

  // Esc → dismiss
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') handleDismiss();
    }
    window.addEventListener('keydown', onKey);
    // Lock body scroll quand le modal est ouvert
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleDismiss]);

  const displayName = (firstName || '').trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="volia-welcome-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6 ${
        closing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={() => handleDismiss()}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Card */}
      <div
        className={`relative w-full max-w-2xl bg-surface-card border border-line rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8 ${
          closing ? 'animate-card-out' : 'animate-card-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => handleDismiss()}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition flex items-center justify-center"
        >
          <X size={18} />
        </button>

        {/* Mascot + speech bubble */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <div className="shrink-0">
            <Mascot variant="welcome" size="xl" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2
              id="volia-welcome-title"
              className="text-xl sm:text-2xl font-bold text-content-primary leading-tight"
            >
              Salut{displayName ? ` ${displayName}` : ''}.
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-content-secondary leading-relaxed">
              On va te trouver tes <strong className="text-content-primary">100 premiers prospects</strong>.
              C&apos;est par où ?
            </p>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => handleDismiss(a.href)}
                className={`group text-left px-4 py-3.5 rounded-xl bg-surface-base border border-line transition-all ${
                  ACCENT_CLASSES[a.accent]
                } hover:translate-y-[-1px] hover:shadow-lg hover:shadow-black/20 flex items-center gap-3 min-h-[72px]`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${ICON_BG[a.accent]}`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-content-primary flex items-center gap-1.5">
                    {a.label}
                    <ArrowRight
                      size={14}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </p>
                  <p className="text-xs text-content-tertiary mt-0.5 line-clamp-1">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Skip link en bas */}
        <div className="text-center pt-2 border-t border-line/50">
          <button
            type="button"
            onClick={() => handleDismiss()}
            className="text-xs text-content-tertiary hover:text-content-secondary transition px-2 py-2"
          >
            Plus tard, montre-moi juste le dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes volia-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes volia-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes volia-card-in {
          0% { opacity: 0; transform: translateY(24px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes volia-card-out {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(8px) scale(0.98); }
        }
        .animate-fade-in { animation: volia-fade-in 200ms ease-out forwards; }
        .animate-fade-out { animation: volia-fade-out 200ms ease-out forwards; }
        :global(.animate-card-in) {
          animation: volia-card-in 380ms cubic-bezier(0.34, 1.32, 0.64, 1) forwards;
        }
        :global(.animate-card-out) {
          animation: volia-card-out 200ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
