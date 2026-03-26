"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Download,
  Trash2,
  Zap,
  Square,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Inbox,
  Radar,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { DEPTS } from "@/lib/constants";

const shortUrl = (url) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const PAGE_SIZE = 50;

const EMAIL_METHOD_INFO = {
  scrape: { label: "Trouvé sur le site", color: "text-green-400", icon: null },
  "deep-verified": { label: "Vérifié (MX + pattern)", color: "text-purple-400", icon: null },
  "deep-pattern": { label: "Généré par pattern", color: "text-purple-400/70", icon: null },
  guess: { label: "Email probable (contact@)", color: "text-amber-400", icon: null },
};

export default function ResultsPanel({
  prospects = [],
  onStartEnrichment,
  onStopEnrichment,
  onStartDeepEnrichment,
  isEnriching,
  isDeepEnriching,
  enrichProgress,
  deepEnrichProgress,
  onDownloadCSV,
  onDeleteAll,
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tooltipId, setTooltipId] = useState(null);

  const filteredProspects = useMemo(() => {
    setPage(0);
    return prospects.filter((prospect) => {
      const q = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        prospect.nom?.toLowerCase().includes(q) ||
        prospect.adresse?.toLowerCase().includes(q) ||
        prospect.telephone?.includes(searchText) ||
        prospect.email?.toLowerCase().includes(q);

      const matchesDept = selectedDept === "all" || prospect.departement === selectedDept;
      const matchesType = selectedType === "all" || prospect.type === selectedType;

      return matchesSearch && matchesDept && matchesType;
    });
  }, [prospects, searchText, selectedDept, selectedType]);

  const stats = useMemo(() => {
    const total = prospects.length;
    const phones = prospects.filter((p) => p.telephone).length;
    const emails = prospects.filter((p) => p.email).length;
    const websites = prospects.filter((p) => p.site_web).length;
    return { total, phones, emails, websites };
  }, [prospects]);

  const totalPages = Math.ceil(filteredProspects.length / PAGE_SIZE);
  const displayProspects = filteredProspects.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const enrichProgress_pct = enrichProgress?.total > 0
    ? (enrichProgress.current / enrichProgress.total) * 100
    : 0;

  const getTypeStyle = (type) => {
    switch (type) {
      case "b2b": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "copro": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "custom": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-[#1e1e24] text-[#52525b] border-[#1e1e24]";
    }
  };

  const copyEmail = useCallback(async (email, id) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(id);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDeleteAll();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  // Empty state
  if (prospects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#111114] border border-[#1e1e24] flex items-center justify-center mb-6">
          <Inbox size={28} className="text-[#27272a]" />
        </div>
        <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Aucun prospect</h3>
        <p className="text-sm text-[#52525b] text-center max-w-xs">
          Lancez une recherche pour commencer à collecter des prospects B2B et copropriétés.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Prospects", value: stats.total, icon: Search, color: "text-indigo-400", bgColor: "bg-indigo-500/10", border: "border-indigo-500/20" },
          { label: "Emails", value: stats.emails, icon: Mail, color: "text-green-400", bgColor: "bg-green-500/10", border: "border-[#1e1e24]" },
          { label: "Téléphones", value: stats.phones, icon: Phone, color: "text-[#a1a1aa]", bgColor: "bg-[#1e1e24]", border: "border-[#1e1e24]" },
          { label: "Sites web", value: stats.websites, icon: Globe, color: "text-blue-400", bgColor: "bg-blue-500/10", border: "border-[#1e1e24]" },
        ].map((stat) => (
          <div key={stat.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${stat.border} bg-[#111114] hover:border-[#27272a] transition-colors`}>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <div className={`text-xl font-bold font-mono ${stat.color} tabular-nums`}>{stat.value}</div>
              <div className="text-[10px] text-[#3f3f46] uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-[#1e1e24] bg-[#111114]">
        {/* Enrichment */}
        {!isEnriching && !isDeepEnriching ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onStartEnrichment}
              disabled={prospects.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#1e1e24] disabled:text-[#3f3f46] text-white text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
            >
              <Zap size={14} />
              Enrichir emails
            </button>
            <button
              onClick={onStartDeepEnrichment}
              disabled={prospects.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-[#1e1e24] disabled:text-[#3f3f46] text-white text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              title="Crawl approfondi + détection pattern + vérification MX"
            >
              <Radar size={14} />
              Deep Enrich
            </button>
          </div>
        ) : (isEnriching || isDeepEnriching) ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onStopEnrichment}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-semibold transition hover:bg-red-600/20 active:scale-[0.98]"
            >
              <Square size={14} />
              Stop
            </button>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-[#1e1e24] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${isDeepEnriching ? (deepEnrichProgress?.total > 0 ? (deepEnrichProgress.current / deepEnrichProgress.total) * 100 : 0) : enrichProgress_pct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#52525b] tabular-nums">
                {isDeepEnriching ? `${deepEnrichProgress?.current || 0}/${deepEnrichProgress?.total || 0}` : `${enrichProgress?.current}/${enrichProgress?.total}`}
              </span>
            </div>
            {isDeepEnriching && deepEnrichProgress?.currentSite && (
              <span className="text-[10px] text-purple-400/60 truncate max-w-[150px] hidden sm:block">
                {deepEnrichProgress.currentSite}
              </span>
            )}
          </div>
        ) : null}

        <div className="flex-1" />

        {/* Export */}
        <button
          onClick={() => onDownloadCSV("standard")}
          disabled={prospects.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1e1e24] hover:bg-[#1e1e24] text-[#71717a] hover:text-[#fafafa] text-xs font-medium transition disabled:opacity-30"
          title="Exporter en CSV standard"
        >
          <Download size={14} />
          <span className="hidden sm:inline">CSV</span>
        </button>
        <button
          onClick={() => onDownloadCSV("zoho")}
          disabled={prospects.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1e1e24] hover:bg-[#1e1e24] text-[#71717a] hover:text-[#fafafa] text-xs font-medium transition disabled:opacity-30"
          title="Exporter au format Zoho CRM"
        >
          <FileSpreadsheet size={14} />
          <span className="hidden sm:inline">Zoho</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={prospects.length === 0}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition disabled:opacity-30 ${
            showDeleteConfirm
              ? 'border-red-600/50 bg-red-600/20 text-red-400'
              : 'border-red-600/20 hover:bg-red-600/10 text-red-400/60 hover:text-red-400'
          }`}
          title={showDeleteConfirm ? "Cliquez pour confirmer" : "Supprimer tous les prospects"}
        >
          {showDeleteConfirm ? (
            <>
              <AlertTriangle size={14} />
              <span className="hidden sm:inline">Confirmer</span>
            </>
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3f3f46]" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#111114] border border-[#1e1e24] rounded-xl text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-indigo-500/30 transition"
          />
        </div>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2.5 bg-[#111114] border border-[#1e1e24] rounded-xl text-xs text-[#71717a] focus:outline-none focus:border-indigo-500/30"
        >
          <option value="all">Tous les départements</option>
          {Object.entries(DEPTS).map(([code, dept]) => (
            <option key={code} value={code}>{code} {dept.name}</option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2.5 bg-[#111114] border border-[#1e1e24] rounded-xl text-xs text-[#71717a] focus:outline-none focus:border-indigo-500/30"
        >
          <option value="all">Tous les types</option>
          <option value="b2b">B2B</option>
          <option value="copro">Copro</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Email method legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(EMAIL_METHOD_INFO).map(([method, info]) => (
          <div key={method} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              method === 'scrape' ? 'bg-green-400' :
              method === 'deep-verified' ? 'bg-purple-400' :
              method === 'deep-pattern' ? 'bg-purple-400/70' :
              'bg-amber-400'
            }`} />
            <span className="text-[10px] text-[#3f3f46]">{info.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e1e24] bg-[#0a0a0c]">
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Type</th>
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Téléphone</th>
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Site</th>
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Note</th>
                <th className="px-4 py-3 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Dept</th>
              </tr>
            </thead>
            <tbody>
              {displayProspects.map((p) => {
                const methodInfo = EMAIL_METHOD_INFO[p.email_method];
                return (
                  <tr key={p.id} className="border-b border-[#1e1e24]/50 hover:bg-[#16161a] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${getTypeStyle(p.type)}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[#fafafa] font-medium">{p.nom}</div>
                      <div className="text-[10px] text-[#3f3f46] truncate max-w-[200px]">{p.adresse}</div>
                    </td>
                    <td className="px-4 py-2.5 text-[#a1a1aa] font-mono">{p.telephone || <span className="text-[#27272a]">—</span>}</td>
                    <td className="px-4 py-2.5">
                      {p.email ? (
                        <div className="group/email flex items-center gap-1.5 relative">
                          <span
                            className={`cursor-default ${methodInfo?.color || 'text-[#a1a1aa]'}`}
                            onMouseEnter={() => setTooltipId(p.id)}
                            onMouseLeave={() => setTooltipId(null)}
                          >
                            {p.email}
                            {p.email_method === 'guess' && <span className="ml-1 text-[10px] opacity-50">~</span>}
                            {p.email_method === 'deep-verified' && <span className="ml-1 text-[10px] opacity-50">&#10003;</span>}
                            {p.email_method === 'deep-pattern' && <span className="ml-1 text-[10px] opacity-50">&#8776;</span>}
                          </span>
                          <button
                            onClick={() => copyEmail(p.email, p.id)}
                            className="opacity-0 group-hover/email:opacity-100 p-0.5 rounded hover:bg-[#1e1e24] transition-all"
                            title="Copier l'email"
                          >
                            {copiedEmail === p.id ? (
                              <Check size={12} className="text-green-400" />
                            ) : (
                              <Copy size={12} className="text-[#3f3f46]" />
                            )}
                          </button>
                          {/* Tooltip */}
                          {tooltipId === p.id && methodInfo && (
                            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-[#1e1e24] border border-[#27272a] rounded-lg text-[10px] text-[#a1a1aa] whitespace-nowrap z-10 shadow-lg">
                              {methodInfo.label}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#27272a]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {p.site_web ? (
                        <a href={p.site_web} target="_blank" rel="noopener noreferrer" className="text-indigo-400/70 hover:text-indigo-400 flex items-center gap-1 transition">
                          {shortUrl(p.site_web)}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[#27272a]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {p.note ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-[10px]">&#9733;</span>
                          <span className="text-[#a1a1aa] font-mono">{p.note}</span>
                          {p.nb_avis > 0 && <span className="text-[#3f3f46] text-[10px]">({p.nb_avis})</span>}
                        </div>
                      ) : (
                        <span className="text-[#27272a]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[#52525b]">{p.departement}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e24] bg-[#0a0a0c]">
          <span className="text-[10px] text-[#3f3f46]">
            {filteredProspects.length} résultat{filteredProspects.length > 1 ? 's' : ''}
            {filteredProspects.length !== prospects.length && ` sur ${prospects.length}`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-[#1e1e24] text-[#52525b] disabled:opacity-20 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-mono text-[#52525b] px-2 tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-[#1e1e24] text-[#52525b] disabled:opacity-20 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
