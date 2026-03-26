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

  return (
    <div className="space-y-6">
      {/* Welcome + Quick stats */}
      <div>
        <h2 className="text-xl font-bold text-[#fafafa] mb-1">Vue d'ensemble</h2>
        <p className="text-sm text-[#52525b]">Votre activité de prospection en un coup d'oeil</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total prospects", value: stats.total, icon: Users, color: "from-indigo-500 to-purple-500", textColor: "text-indigo-400" },
          { label: "Emails trouvés", value: stats.emails, icon: Mail, color: "from-green-500 to-emerald-500", textColor: "text-green-400" },
          { label: "Taux enrichissement", value: `${stats.enrichRate}%`, icon: TrendingUp, color: "from-amber-500 to-orange-500", textColor: "text-amber-400" },
          { label: "Sites web", value: stats.websites, icon: Globe, color: "from-blue-500 to-cyan-500", textColor: "text-blue-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-xl border border-[#1e1e24] bg-[#111114] p-5">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.color} opacity-5 rounded-bl-full`} />
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${kpi.color} bg-opacity-10 mb-3`}>
              <kpi.icon size={16} className="text-white" />
            </div>
            <div className={`text-2xl font-bold font-mono ${kpi.textColor}`}>{kpi.value}</div>
            <div className="text-[10px] text-[#3f3f46] uppercase tracking-wider mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate("search")}
          className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-indigo-500/30 transition-all text-left"
        >
          <div className="p-3 rounded-xl bg-indigo-600/10">
            <Search size={20} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#fafafa]">Nouvelle recherche</div>
            <div className="text-xs text-[#3f3f46]">Google Places API</div>
          </div>
          <ArrowRight size={16} className="text-[#27272a] group-hover:text-indigo-400 transition" />
        </button>

        <button
          onClick={() => onNavigate("results")}
          className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-green-500/30 transition-all text-left"
        >
          <div className="p-3 rounded-xl bg-green-600/10">
            <Zap size={20} className="text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#fafafa]">Enrichir les emails</div>
            <div className="text-xs text-[#3f3f46]">{stats.total - stats.emails} à enrichir</div>
          </div>
          <ArrowRight size={16} className="text-[#27272a] group-hover:text-green-400 transition" />
        </button>

        <button
          onClick={() => onNavigate("export")}
          className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-amber-500/30 transition-all text-left"
        >
          <div className="p-3 rounded-xl bg-amber-600/10">
            <Download size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#fafafa]">Exporter</div>
            <div className="text-xs text-[#3f3f46]">CSV ou Zoho CRM</div>
          </div>
          <ArrowRight size={16} className="text-[#27272a] group-hover:text-amber-400 transition" />
        </button>
      </div>

      {/* Type breakdown */}
      {stats.total > 0 && (
        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e1e24]">
            <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold">Répartition</h3>
          </div>
          <div className="p-5">
            <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-[#0a0a0c]">
              {stats.b2b > 0 && (
                <div
                  className="bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(stats.b2b / stats.total) * 100}%` }}
                />
              )}
              {stats.copro > 0 && (
                <div
                  className="bg-purple-500 rounded-full transition-all"
                  style={{ width: `${(stats.copro / stats.total) * 100}%` }}
                />
              )}
              {stats.total - stats.b2b - stats.copro > 0 && (
                <div
                  className="bg-amber-500 rounded-full transition-all"
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
        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e24]">
            <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold">Derniers prospects</h3>
            <button
              onClick={() => onNavigate("results")}
              className="text-[10px] uppercase tracking-wider text-indigo-400/60 hover:text-indigo-400 font-semibold transition"
            >
              Voir tout
            </button>
          </div>
          <div>
            {recentProspects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#1e1e24]/50 last:border-0 hover:bg-[#16161a] transition">
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
