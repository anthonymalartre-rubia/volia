'use client';

// ─────────────────────────────────────────────────────────────────────
// ModuleSwitcher — dropdown HubSpot-style pour switcher entre les 4
// modules de la suite Volia (Prospection / Campagnes / CRM / Forms).
// ─────────────────────────────────────────────────────────────────────
//
// Placement : TopBar, juste après le logo.
//
// Badge "Plan Business" : on n'affiche PAS LIVE/BETA/BIENTÔT (vestige
// pré-launch). À la place, on indique uniquement les modules réservés
// au plan Business (CRM, Campagnes, Formulaires) — Prospection est
// disponible sur tous les plans donc aucun badge.
// Cf. lib/plans.js → business.unlocksModules = true.
//
// Détection du module actif via usePathname() :
//   - /dashboard*       OR /app/prospection* → Prospection (violet)
//   - /app/campagnes (hub Listes du module Campagnes)
//   - /app/campagnes/lists/*
//   - /app/campagnes/campaigns/*
//   - /app/campagnes*                        → Campagnes (blue)
//   (Note : /app/campagnes est trompeur — c'est le BACKEND de
//   Campagnes, pas du module Prospection. Legacy nommage à
//   refactorer un jour.)
//   - /app/crm*                              → CRM (emerald)
//   - /app/formulaires*                          → Formulaires (pink)
//   - sinon (settings, admin home, ...)      → Prospection par défaut
//
// Couleurs alignées avec MODULE_THEMES de ProductPageLayout.jsx.
// Tout en LIGHT mode (semantic tokens). A11y : aria-* + keyboard nav.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Mail,
  KanbanSquare,
  FormInput,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// Catalogue des modules
// ─────────────────────────────────────────────────────────────────────
// On garde la liste statique (3 modules connus) et on déclare TOUTES
// les classes Tailwind explicitement — pas de string interpolation
// dynamique sinon le purge Tailwind les supprime au build.
// ─────────────────────────────────────────────────────────────────────
// Pivot freemium (11/06/2026) : tous les modules sont ouverts. Seul
// Autopilot porte le badge "Plan MAX" (le flag businessOnly est
// conservé comme nom de prop pour éviter un rename invasif).
const BUSINESS_BADGE = {
  label: 'Plan MAX',
  className: 'bg-amber-50 text-amber-700 border-amber-200',
};

const MODULES = [
  {
    // ⚡ Volia Autopilot — module FLAGSHIP, placé en #1.
    // Orchestre les 4 autres (Prospection → Campagnes → Forms → CRM).
    // Pivot freemium : Autopilot = plan MAX uniquement.
    id: 'autopilot',
    name: 'Autopilot',
    description: 'Pipeline B2B end-to-end auto',
    href: '/app/autopilot',
    icon: Zap,
    businessOnly: true, // badge Plan MAX
    color: 'amber',
    iconGradient: 'from-amber-500 to-orange-600',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-200',
    activeText: 'text-amber-700',
    accent: 'text-amber-600',
    badge: 'NEW',
  },
  {
    id: 'prospection',
    name: 'Prospection',
    description: 'Trouvez les emails B2B',
    href: '/app/prospection',
    icon: Search,
    businessOnly: false,
    color: 'violet',
    iconGradient: 'from-violet-500 to-indigo-600',
    activeBg: 'bg-violet-50',
    activeBorder: 'border-violet-200',
    activeText: 'text-violet-700',
    accent: 'text-violet-600',
  },
  {
    id: 'campagnes',
    name: 'Campagnes',
    description: 'Séquences email automatisées',
    href: '/app/campagnes',
    icon: Mail,
    businessOnly: false, // gratuit pour tous (limites, illimité en MAX)
    color: 'blue',
    iconGradient: 'from-blue-500 to-cyan-600',
    activeBg: 'bg-blue-50',
    activeBorder: 'border-blue-200',
    activeText: 'text-blue-700',
    accent: 'text-blue-600',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Pipeline commercial',
    href: '/app/crm',
    icon: KanbanSquare,
    businessOnly: false, // gratuit pour tous (limites, illimité en MAX)
    color: 'emerald',
    iconGradient: 'from-emerald-500 to-teal-600',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-200',
    activeText: 'text-emerald-700',
    accent: 'text-emerald-600',
  },
  {
    id: 'formulaires',
    name: 'Formulaires',
    description: 'Form builder + bridges',
    href: '/app/formulaires',
    icon: FormInput,
    businessOnly: false, // gratuit pour tous (limites, illimité en MAX)
    color: 'pink',
    iconGradient: 'from-pink-500 to-rose-600',
    activeBg: 'bg-pink-50',
    activeBorder: 'border-pink-200',
    activeText: 'text-pink-700',
    accent: 'text-pink-600',
  },
  {
    // Volia Project (juin 2026) — gestion de projets de livraison.
    // Deal gagné → projet · kanban simple · partage client par lien.
    id: 'project',
    name: 'Project',
    description: 'Livraison & suivi client',
    href: '/app/projets',
    icon: FolderKanban,
    businessOnly: false, // gratuit pour tous (limites, illimité en MAX)
    color: 'orange',
    iconGradient: 'from-orange-500 to-amber-600',
    activeBg: 'bg-orange-50',
    activeBorder: 'border-orange-200',
    activeText: 'text-orange-700',
    accent: 'text-orange-600',
    badge: 'NEW',
  },
];

// Lookup par id (robuste à l'ordre du tableau).
const moduleById = (id) => MODULES.find((m) => m.id === id) || MODULES[0];

// ─────────────────────────────────────────────────────────────────────
// Détection du module actif depuis le pathname.
// ─────────────────────────────────────────────────────────────────────
function detectActiveModule(pathname) {
  if (!pathname) return moduleById('prospection');

  // Autopilot
  if (pathname.startsWith('/app/autopilot')) {
    return moduleById('autopilot');
  }

  // Campagnes : /app/campagnes/* (URL canonique depuis la migration
  // /admin/prospection → /app/campagnes) + les settings senders
  // accessibles depuis la CampagnesSidebar.
  if (
    pathname.startsWith('/app/campagnes') ||
    pathname.startsWith('/settings/email-senders') ||
    pathname.startsWith('/settings/sms-senders')
  ) {
    return moduleById('campagnes');
  }

  // CRM
  if (pathname.startsWith('/app/crm')) {
    return moduleById('crm');
  }

  // Volia Project
  if (pathname.startsWith('/app/projets')) {
    return moduleById('project');
  }

  // Formulaires : /app/formulaires/*
  if (pathname.startsWith('/app/formulaires')) {
    return moduleById('formulaires');
  }

  // Prospection (default — dashboard, /app/prospection, fallback admin/settings)
  return moduleById('prospection');
}

export default function ModuleSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const activeModule = useMemo(() => detectActiveModule(pathname), [pathname]);
  const ActiveIcon = activeModule.icon;

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* ─── Trigger ────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Module actif : Volia ${activeModule.name}. Cliquer pour changer de module.`}
        className={`
          group flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg
          border border-line bg-surface-card hover:bg-surface-elevated
          text-content-primary text-sm font-medium
          active:scale-[0.98] transition-all
        `}
      >
        <span
          className={`
            w-6 h-6 rounded-md flex items-center justify-center
            bg-gradient-to-br ${activeModule.iconGradient}
            shadow-sm
          `}
          aria-hidden="true"
        >
          <ActiveIcon size={13} className="text-white" />
        </span>
        <span className="hidden sm:inline whitespace-nowrap">
          {activeModule.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-content-tertiary transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ─── Dropdown menu ──────────────────────────────────────── */}
      {open && (
        <div
          role="menu"
          aria-label="Modules Volia"
          className={`
            absolute left-0 mt-2 w-[300px] max-w-[calc(100vw-2rem)]
            rounded-xl border border-line bg-surface-base shadow-2xl shadow-zinc-900/10
            ring-1 ring-zinc-900/5
            p-2 z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          `}
        >
          <div className="px-2 pt-1 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">
              Suite Volia
            </p>
          </div>

          <ul className="space-y-1" role="none">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = mod.id === activeModule.id;
              return (
                <li key={mod.id} role="none">
                  <Link
                    href={mod.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      group flex items-center gap-3 px-2.5 py-2.5 rounded-lg
                      border transition-all
                      ${
                        isActive
                          ? `${mod.activeBg} ${mod.activeBorder}`
                          : 'border-transparent hover:bg-surface-elevated hover:border-line'
                      }
                    `}
                  >
                    <span
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        bg-gradient-to-br ${mod.iconGradient}
                        shadow-md
                        ${isActive ? '' : 'group-hover:scale-105'}
                        transition-transform
                      `}
                      aria-hidden="true"
                    >
                      <Icon size={16} className="text-white" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            isActive ? mod.activeText : 'text-content-primary'
                          }`}
                        >
                          Volia {mod.name}
                        </span>
                        {mod.businessOnly && (
                          <span
                            className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${BUSINESS_BADGE.className}`}
                            title="Module inclus dans le plan MAX uniquement"
                          >
                            {BUSINESS_BADGE.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-content-tertiary mt-0.5 truncate">
                        {mod.description}
                      </div>
                    </div>

                    {isActive ? (
                      <Check
                        size={16}
                        className={`flex-shrink-0 ${mod.accent}`}
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="flex-shrink-0 text-content-muted group-hover:text-content-tertiary group-hover:translate-x-0.5 transition-all"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 pt-2 border-t border-line">
            <Link
              href="/produits/prospection"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-2.5 py-1.5 rounded-md text-[11px] text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition-colors"
            >
              Découvrir la suite Volia →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
