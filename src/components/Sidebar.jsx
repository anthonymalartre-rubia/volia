'use client';

import {
  LayoutDashboard,
  Search,
  Users,
  Download,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'search', label: 'Nouvelle recherche', icon: Search },
  { id: 'results', label: 'Mes leads', icon: Users },
  { id: 'export', label: 'Exporter', icon: Download },
];

export default function Sidebar({ activeView, onViewChange, onClose, isOpen, prospectCount }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-60 bg-[#09090b] border-r border-[#1e1e24]
        transition-transform duration-200 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-3">
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="lg:hidden self-end p-2 rounded-lg text-[#52525b] hover:text-[#fafafa] hover:bg-[#1e1e24] transition mb-2"
          >
            <X size={18} />
          </button>

          {/* Navigation */}
          <nav className="space-y-1">
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
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                      : 'text-[#71717a] hover:text-[#fafafa] hover:bg-[#111114] border border-transparent'
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.id === 'results' && prospectCount > 0 && (
                    <span className={`
                      ml-auto text-xs font-mono px-1.5 py-0.5 rounded-md
                      ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-[#1e1e24] text-[#52525b]'}
                    `}>
                      {prospectCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom info */}
          <div className="mt-auto p-3 rounded-xl bg-[#111114] border border-[#1e1e24]">
            <p className="text-[10px] uppercase tracking-wider text-[#3f3f46] font-semibold mb-2">Régions</p>
            <div className="flex flex-wrap gap-1">
              {['971', '972', '973', '974'].map((dept) => (
                <span key={dept} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e1e24] text-[#52525b] font-mono">
                  {dept}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
