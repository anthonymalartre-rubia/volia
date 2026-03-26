"use client";

import { useMemo } from "react";
import {
  Users,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  Search,
  Zap,
  Download,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function OverviewPanel({ prospects, onNavigate }) {
  const stats = useMemo(() => {
    const total = prospects.length;
    const emails = prospects.filter((p) => p.email).length;
    const phones = prospects.filter((p) => p.telephone).length;
    const websites = prospects.filter((p) => p.site_web).length;
    const b2b = prospects.filter((p) => p.type === "b2b").length;
    const copro = prospects.filter((p) => p.type === "copro").length;
    const enrichRate = total > 0 ? Math.round((emails / total) * 100) : 0;
    return { total, emails, phones, websites, b2b, copro, enrichRate };
  }, [prospects]);

  const recentProspects = prospects.slice(0, 5);

  // Empty/onboarding state
  if (prospects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] mb-1">Bienvenue</h2>
          <p className="text-sm text-[#52525b]">Commencez à prospecter en 3 étapes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Configurez', desc: 'Choisissez vos départements et catégories', icon: Search, color: 'indigo', action: 'search' },
            { step: '2', title: 'Enrichissez', desc: 'Trouvez les emails automatiquement', icon: Zap, color: 'green', action: 'results' },
            { step: '3', title: 'Exportez', desc: 'Téléchargez en CSV ou Zoho', icon: Download, color: 'amber', action: 'export' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => onNavigate(item.action)}
              className="group relative p-6 rounded-2xl border border-[#1e1e24] bg-[#111114] hover:border-[#27272a] transition-all duration-300 text-left overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-bl-full transition-all group-hover:w-32 group-hover:h-32`} />
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-[#1e1e24] font-mono">{item.step}</span>
                <div className={`p-2 rounded-lg bg-${item.color}-600/10`}>
                  <item.icon size={18} className={`text-${item.color}-400`} />
                </div>
              </div>
              <h3 className="text-base font-semibold text-[#fafafa] mb-1">{item.title}</h3>
              <p className="text-xs text-[#52525b] leading-relaxed">{item.desc}</p>
              <ArrowRight size={14} className="mt-3 text-[#27272a] group-hover:text-[#52525b] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <div className="p-6 rounded-2xl border border-indigo-500/10 bg-indigo-500/5">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-400">Astuce</p>
              <p className="text-xs text-[#71717a] mt-1">
                L'outil utilise Google Places API pour trouver des entreprises, puis enrichit automatiquement les emails en crawlant leurs sites web.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#fafafa] mb-1">Vue d'ensemble</h2>
        <p className="text-sm text-[#52525b]">Votre activité de prospection en un coup d'oeil</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total prospects", value: stats.total, icon: Users, color: "from-indigo-500 to-purple-500", textColor: "text-indigo-400", bgColor: "bg-indigo-500/10" },
          { label: "Emails trouvés", value: stats.emails, icon: Mail, color: "from-green-500 to-emerald-500", textColor: "text-green-400", bgColor: "bg-green-500/10" },
          { label: "Taux enrichissement", value: `${stats.enrichRate}%`, icon: TrendingUp, color: "from-amber-500 to-orange-500", textColor: "text-amber-400", bgColor: "bg-amber-500/10" },
          { label: "Sites web", value: stats.websites, icon: Globe, color: "from-blue-500 to-cyan-500", textColor: "text-blue-400", bgColor: "bg-blue-500/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-2xl border border-[#1e1e24] bg-[#111114] p-5 hover:border-[#27272a] transition-colors">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.color} opacity-5 rounded-bl-full`} />
            <div className={`inline-flex p-2 rounded-lg ${kpi.bgColor} mb-3`}>
              <kpi.icon size={16} className={kpi.textColor} />
            </div>
            <div className={`text-2xl font-bold font-mono ${kpi.textColor} tabular-nums`}>{kpi.value}</div>
            <div className="text-[10px] text-[#3f3f46] uppercase tracking-wider mt-1 font-medium">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate("search")}
          className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-indigo-500/30 hover:bg-[#111114]/80 active:scale-[0.99] transition-all text-left"
        >
          <div className="p-3 rounded-xl bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-colors">
            <Search size={20} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#fafafa]">Nouvelle recherche</div>
            <div className="text-xs text-[#3f3f46]">Google Places API</div>
          </div>
          <ArrowRight size={16} className="text-[#27272a] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => onNavigate("results")}
          className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-green-500/30 hover:bg-[#111114]/80 active:scale-[0.99] transition-all text-left"
        >
          <div className="p-3 rounded-xl bg-green-600/10 group-hover:bg-green-600/20 transition-colors">
            <Zap size={20} className="text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#fafafa]">Enrichir les emails</div>
            <div className="text-xs text-[#3f3f46]">{stats.total - stats.emails} à enrichir</div>
          </div>
          <ArrowRight size={16} className="text-[#27272a] group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => onNavigate("export")}
          className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-amber-500/30 hover:bg-[#111114]/80 active:scale-[0.99] transition-all text-left"
        >
          <div className="p-3 rounded-xl bg-amber-600/10 group-hover:bg-amber-600/20 transition-colors">
            <Download size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#fafafa]">Exporter</div>
            <div className="text-xs text-[#3f3f46]">CSV ou Zoho CRM</div>
          </div>
          <ArrowRight size={16} className="text-[#27272a] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Type breakdown */}
      {stats.total > 0 && (
        <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e1e24]">
            <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold">Répartition</h3>
          </div>
          <div className="p-5">
            <div className="flex gap-1.5 h-3 rounded-full overflow-hidden bg-[#0a0a0c]">
              {stats.b2b > 0 && (
                <div
                  className="bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.b2b / stats.total) * 100}%` }}
                />
              )}
              {stats.copro > 0 && (
                <div
                  className="bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.copro / stats.total) * 100}%` }}
                />
              )}
              {stats.total - stats.b2b - stats.copro > 0 && (
                <div
                  className="bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${((stats.total - stats.b2b - stats.copro) / stats.total) * 100}%` }}
                />
              )}
            </div>
            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-[#52525b]">B2B <span className="font-mono text-[#71717a]">{stats.b2b}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs text-[#52525b]">Copro <span className="font-mono text-[#71717a]">{stats.copro}</span></span>
              </div>
              {stats.total - stats.b2b - stats.copro > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-[#52525b]">Custom <span className="font-mono text-[#71717a]">{stats.total - stats.b2b - stats.copro}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent prospects */}
      {recentProspects.length > 0 && (
        <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e24]">
            <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold">Derniers prospects</h3>
            <button
              onClick={() => onNavigate("results")}
              className="text-[10px] uppercase tracking-wider text-indigo-400/60 hover:text-indigo-400 font-semibold transition-colors"
            >
              Voir tout →
            </button>
          </div>
          <div>
            {recentProspects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#1e1e24]/50 last:border-0 hover:bg-[#16161a] transition-colors">
                <div className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                  p.type === 'b2b' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  p.type === 'copro' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {p.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#fafafa] font-medium truncate">{p.nom}</div>
                  <div className="text-[10px] text-[#3f3f46] truncate">{p.adresse}</div>
                </div>
                {p.email && (
                  <span className="text-xs text-green-400/70 hidden sm:block truncate max-w-[180px]">{p.email}</span>
                )}
                <span className="text-[10px] font-mono text-[#27272a]">{p.departement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
