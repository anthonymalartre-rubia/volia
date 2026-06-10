'use client';

// ─────────────────────────────────────────────────────────────────────
// AppSidebar — sidebar de module unifiée, data-driven (UX-2).
// ─────────────────────────────────────────────────────────────────────
// Avant : CrmSidebar / CampagnesSidebar / FormsSidebar dupliquaient
// ~230 lignes chacune (overlay mobile, aside, renderNavItem, footer)
// en ne changeant que l'accent couleur et la liste d'items. Ce composant
// centralise le rendu ; chaque module ne fournit plus que sa config :
//
//   <AppSidebar
//     accent="emerald"
//     title="Volia CRM"
//     sections={[{ items: NAV_ITEMS }, { title: 'Configuration', items: CONFIG_ITEMS }]}
//     footer={{ title: 'Plan Business', text: '…' }}
//     isOpen={isOpen} onClose={onClose}
//   />
//
// Item : { id, label, description, href, icon, matches(pathname), soon? }
//
// ⚠️ Tailwind purge : toutes les classes par accent sont déclarées
// statiquement dans ACCENTS — pas d'interpolation dynamique.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Sparkles } from 'lucide-react';

const ACCENTS = {
  emerald: {
    hint: 'via-emerald-500/40',
    activeBg: 'bg-emerald-100/80 text-emerald-700 shadow-sm shadow-emerald-500/10',
    activeBar: 'bg-emerald-600',
    activeIconBg: 'bg-emerald-200/60',
    activeDesc: 'text-emerald-700/60',
    footerCard: 'from-emerald-500/[0.06] to-teal-500/[0.06] border-emerald-500/15',
    footerBlob: 'bg-emerald-500/15',
    footerIcon: 'text-emerald-600',
    footerTitle: 'text-emerald-700',
  },
  blue: {
    hint: 'via-blue-500/40',
    activeBg: 'bg-blue-100/80 text-blue-700 shadow-sm shadow-blue-500/10',
    activeBar: 'bg-blue-600',
    activeIconBg: 'bg-blue-200/60',
    activeDesc: 'text-blue-700/60',
    footerCard: 'from-blue-500/[0.06] to-cyan-500/[0.06] border-blue-500/15',
    footerBlob: 'bg-blue-500/15',
    footerIcon: 'text-blue-600',
    footerTitle: 'text-blue-700',
  },
  pink: {
    hint: 'via-pink-500/40',
    activeBg: 'bg-pink-100/80 text-pink-700 shadow-sm shadow-pink-500/10',
    activeBar: 'bg-pink-600',
    activeIconBg: 'bg-pink-200/60',
    activeDesc: 'text-pink-700/60',
    footerCard: 'from-pink-500/[0.06] to-rose-500/[0.06] border-pink-500/15',
    footerBlob: 'bg-pink-500/15',
    footerIcon: 'text-pink-600',
    footerTitle: 'text-pink-700',
  },
  orange: {
    hint: 'via-orange-500/40',
    activeBg: 'bg-orange-100/80 text-orange-700 shadow-sm shadow-orange-500/10',
    activeBar: 'bg-orange-600',
    activeIconBg: 'bg-orange-200/60',
    activeDesc: 'text-orange-700/60',
    footerCard: 'from-orange-500/[0.06] to-amber-500/[0.06] border-orange-500/15',
    footerBlob: 'bg-orange-500/15',
    footerIcon: 'text-orange-600',
    footerTitle: 'text-orange-700',
  },
};

function NavItem({ item, accent, pathname, onClose }) {
  const isActive = item.matches(pathname);
  const Icon = item.icon;
  const isDisabled = item.soon;

  const className = `
    w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative
    ${
      isActive
        ? accent.activeBg
        : isDisabled
        ? 'text-content-tertiary hover:bg-surface-card cursor-not-allowed opacity-70'
        : 'text-content-tertiary hover:text-content-primary hover:bg-surface-card active:scale-[0.98]'
    }
  `;

  const inner = (
    <>
      {isActive && <div className={`absolute left-0 w-1 h-6 ${accent.activeBar} rounded-r-full`} />}
      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? accent.activeIconBg : 'bg-surface-card'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span>{item.label}</span>
          {item.soon && (
            <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-px rounded bg-amber-100 text-amber-700 border border-amber-200">
              Bientôt
            </span>
          )}
        </div>
        <div className={`text-[10px] ${isActive ? accent.activeDesc : 'text-content-faint'}`}>
          {item.description}
        </div>
      </div>
    </>
  );

  if (isDisabled) {
    return (
      <button type="button" disabled aria-disabled="true" title="Disponible bientôt" className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
          onClose?.();
        }
      }}
      className={className}
    >
      {inner}
    </Link>
  );
}

export default function AppSidebar({ accent = 'emerald', title, sections = [], footer, isOpen, onClose }) {
  const pathname = usePathname() || '';
  const a = ACCENTS[accent] || ACCENTS.emerald;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64
          bg-surface-base/95 backdrop-blur-xl border-r border-line
          transition-transform duration-300 ease-out
          md:translate-x-0 md:static md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${a.hint} to-transparent pointer-events-none`} />

        <div className="flex flex-col h-full p-4">
          <button
            onClick={onClose}
            className="md:hidden self-end p-2.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated active:scale-95 transition-all mb-3"
            aria-label="Fermer le menu"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">{title}</p>
          </div>

          {sections.map((section, i) => (
            <div key={section.title || i} className={i > 0 ? 'mt-6 pt-4 border-t border-line' : undefined}>
              {section.title && (
                <div className="px-3 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">
                    {section.title}
                  </p>
                </div>
              )}
              <nav className="space-y-1" role="navigation" aria-label={section.title || title}>
                {section.items.map((item) => (
                  <NavItem key={item.id} item={item} accent={a} pathname={pathname} onClose={onClose} />
                ))}
              </nav>
            </div>
          ))}

          {footer && (
            <div className="mt-auto">
              <div className={`relative p-4 rounded-xl bg-gradient-to-br ${a.footerCard} border overflow-hidden`}>
                <div className={`absolute -bottom-8 -right-8 w-20 h-20 rounded-full ${a.footerBlob} blur-2xl pointer-events-none`} />
                <div className="relative flex items-center gap-2 mb-2">
                  <Sparkles size={11} className={a.footerIcon} />
                  <p className={`text-[10px] uppercase tracking-wider ${a.footerTitle} font-semibold`}>
                    {footer.title}
                  </p>
                </div>
                <p className="relative text-[10px] text-content-tertiary leading-relaxed">{footer.text}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
