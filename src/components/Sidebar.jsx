'use client';

import {
  LayoutDashboard,
  Search,
  Users,
  Download,
  ChevronLeft,
  Shield,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Sidebar({ activeView, onViewChange, onClose, isOpen, prospectCount, searchHistory, isAdmin, userPlan }) {
  const { t, locale } = useI18n();

  const NAV_ITEMS = [
    { id: 'overview', label: t('sidebar.overview'), icon: LayoutDashboard, description: 'Tableau de bord' },
    { id: 'search', label: t('sidebar.search'), icon: Search, description: 'Google Places' },
    { id: 'results', label: t('sidebar.leads'), icon: Users, description: 'Prospects' },
    { id: 'export', label: t('sidebar.export'), icon: Download, description: 'CSV' },
    { id: 'verify', label: t('sidebar.verify'), icon: ShieldCheck, description: t('sidebar.verifyDesc'), paid: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        relative fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64
        bg-surface-base/90 backdrop-blur-xl border-r border-line
        transition-transform duration-300 ease-out
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Hint gradient violet au sommet — signal visuel "premium" subtil */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

        <div className="flex flex-col h-full p-4">
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="md:hidden self-end p-2.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated active:scale-95 transition-all mb-3"
            aria-label={t('sidebar.closeMenu')}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Navigation */}
          <nav className="space-y-1" role="navigation" aria-label="Navigation principale">
            {NAV_ITEMS.filter(item => !item.paid || userPlan?.id === 'pro' || userPlan?.id === 'enterprise').map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    // onClose() ne sert qu'en mobile pour refermer le drawer.
                    // Sur desktop la sidebar est toujours visible : pas la peine
                    // de muter sidebarOpen=false et de re-render pour rien (P2 audit).
                    if (window.matchMedia('(max-width: 767px)').matches) {
                      onClose();
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-indigo-600/15 text-indigo-400 shadow-sm shadow-indigo-500/10'
                      : 'text-content-tertiary hover:text-content-primary hover:bg-surface-card active:scale-[0.98]'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                  )}
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20' : 'bg-surface-card'}`}>
                    <item.icon size={16} />
                  </div>
                  <div className="flex-1 text-left">
                    <div>{item.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-indigo-400/50' : 'text-content-faint'}`}>
                      {item.description}
                    </div>
                  </div>
                  {item.id === 'results' && prospectCount > 0 && (
                    <span className={`
                      text-xs font-mono px-2 py-0.5 rounded-full transition-colors
                      ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-surface-elevated text-content-muted'}
                    `}>
                      {prospectCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Séparateur subtil entre Navigation et Settings/Admin */}
          <div className="my-5 h-px bg-line" />

          {/* Settings link */}
          <a
            href="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-content-tertiary hover:text-content-primary hover:bg-surface-card transition-all duration-200"
          >
            <div className="p-1.5 rounded-lg bg-surface-card">
              <Settings size={16} />
            </div>
            <div className="flex-1 text-left">
              <div>{t('sidebar.settings')}</div>
              <div className="text-[10px] text-content-faint">{t('sidebar.settingsDesc')}</div>
            </div>
          </a>

          {/* Admin link */}
          {isAdmin && (
            <a
              href="/admin"
              className="mt-1 flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Shield size={16} />
              </div>
              <div className="flex-1 text-left">
                <div>{t('sidebar.admin')}</div>
                <div className="text-[10px] text-amber-400/50">{t('sidebar.adminDesc')}</div>
              </div>
            </a>
          )}

          {/* Search history */}
          <div className="mt-6">
            <h3 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-content-muted mb-2">
              {t('sidebar.history')}
            </h3>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {(searchHistory || []).slice(0, 10).map(session => (
                <div
                  key={session.id}
                  className="px-3 py-2 rounded-lg text-xs text-content-secondary hover:bg-surface-elevated hover:text-content-primary transition-colors"
                >
                  <div className="font-medium truncate">{session.label || t('sidebar.search')}</div>
                  <div className="text-[10px] text-content-muted mt-0.5">
                    {session.results_count || 0} {t('sidebar.results')} &middot; {new Date(session.created_at).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR')}
                  </div>
                </div>
              ))}
              {(!searchHistory || searchHistory.length === 0) && (
                <div className="px-3 py-2 text-xs text-content-muted">{t('sidebar.noHistory')}</div>
              )}
            </div>
          </div>

          {/* Bottom info — encart subtil avec hint gradient violet/indigo */}
          <div className="mt-auto">
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-violet-500/[0.05] to-indigo-500/[0.05] border border-violet-500/15 overflow-hidden">
              {/* Mini blob violet en bas-droite pour donner du caractère */}
              <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />
              <p className="relative text-[10px] uppercase tracking-wider text-violet-300 font-semibold mb-2">{t('sidebar.allFrance')}</p>
              <p className="relative text-[10px] text-content-muted leading-relaxed">{t('sidebar.franceMeta')}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
