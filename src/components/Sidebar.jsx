'use client';

import {
  LayoutDashboard,
  Search,
  Users,
  Download,
  ChevronLeft,
  Shield,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, description: 'Tableau de bord' },
  { id: 'search', label: 'Recherche', icon: Search, description: 'Google Places' },
  { id: 'results', label: 'Mes leads', icon: Users, description: 'Prospects trouvés' },
  { id: 'export', label: 'Exporter', icon: Download, description: 'CSV & Zoho' },
];

export default function Sidebar({ activeView, onViewChange, onClose, isOpen, prospectCount, searchHistory, isAdmin }) {
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
        fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-surface-base border-r border-line
        transition-transform duration-300 ease-out
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="md:hidden self-end p-2.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated active:scale-95 transition-all mb-3"
            aria-label="Fermer le menu"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Navigation */}
          <nav className="space-y-1.5" role="navigation" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose();
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

          {/* Settings link */}
          <a
            href="/settings"
            className="mt-4 flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-content-tertiary hover:text-content-primary hover:bg-surface-card transition-all duration-200"
          >
            <div className="p-1.5 rounded-lg bg-surface-card">
              <Settings size={16} />
            </div>
            <div className="flex-1 text-left">
              <div>Parametres</div>
              <div className="text-[10px] text-content-faint">Profil & compte</div>
            </div>
          </a>

          {/* Admin link */}
          {isAdmin && (
            <a
              href="/admin"
              className="mt-4 flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Shield size={16} />
              </div>
              <div className="flex-1 text-left">
                <div>Administration</div>
                <div className="text-[10px] text-amber-400/50">Gestion utilisateurs</div>
              </div>
            </a>
          )}

          {/* Search history */}
          <div className="mt-6">
            <h3 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-content-muted mb-2">
              Historique
            </h3>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {(searchHistory || []).slice(0, 10).map(session => (
                <div
                  key={session.id}
                  className="px-3 py-2 rounded-lg text-xs text-content-secondary hover:bg-surface-elevated hover:text-content-primary transition-colors"
                >
                  <div className="font-medium truncate">{session.label || 'Recherche'}</div>
                  <div className="text-[10px] text-content-muted mt-0.5">
                    {session.results_count || 0} resultats &middot; {new Date(session.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
              {(!searchHistory || searchHistory.length === 0) && (
                <div className="px-3 py-2 text-xs text-content-muted">Aucun historique</div>
              )}
            </div>
          </div>

          {/* Bottom info */}
          <div className="mt-auto">
            <div className="p-4 rounded-xl bg-gradient-to-br from-surface-card to-surface-alt border border-line">
              <p className="text-[10px] uppercase tracking-wider text-content-faint font-semibold mb-2">France entiere</p>
              <p className="text-[10px] text-content-muted leading-relaxed">101 departements · Metropole + Outre-mer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
