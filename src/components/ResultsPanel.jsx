"use client";

import { useState, useMemo, useCallback, useEffect, memo } from "react";
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
  Crown,
  Folder,
  FolderOpen,
  X,
  ChevronDown,
  Lock,
} from "lucide-react";
import { DEPTS } from "@/lib/constants";
import { computeLeadScore, getScoreLabel } from "@/lib/scoring";

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
  scrape: { label: "Trouvé sur le site", color: "text-green-400" },
  "deep-verified": { label: "Vérifié (MX + pattern)", color: "text-purple-400" },
  "deep-pattern": { label: "Généré par pattern", color: "text-purple-400/70" },
  serper: { label: "Serper.dev (Google)", color: "text-yellow-400" },
  apollo: { label: "Apollo.io", color: "text-orange-400" },
  enrichly: { label: "Enrichly", color: "text-cyan-400" },
  anymail: { label: "Anymail Finder", color: "text-teal-400" },
  findymail: { label: "Findymail", color: "text-sky-400" },
  guess: { label: "Email probable (contact@)", color: "text-amber-400" },
};

const folderColorClass = (color) => {
  const map = { indigo: 'bg-indigo-500', blue: 'bg-blue-500', purple: 'bg-purple-500', green: 'bg-green-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
  return map[color] || map.indigo;
};

function TagDropdown({ tags, activeTags, onToggle, onCreate }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full bg-[#1e1e24] hover:bg-[#2a2a32] text-[#71717a] hover:text-[#fafafa] flex items-center justify-center text-xs transition-colors"
      >
        +
      </button>
      {open && (
        <div className="absolute z-50 top-7 left-0 w-48 rounded-lg border border-[#1e1e24] bg-[#111114] shadow-xl p-2 space-y-1">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => { onToggle(tag.id); setOpen(false); }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-[#1e1e24] transition-colors ${
                activeTags.includes(tag.id) ? 'text-[#fafafa]' : 'text-[#a1a1aa]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              {tag.name}
              {activeTags.includes(tag.id) && <span className="ml-auto text-violet-400">&#10003;</span>}
            </button>
          ))}
          <div className="border-t border-[#1e1e24] pt-1 mt-1">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) {
                onCreate?.(newName.trim(), 'violet');
                setNewName('');
                setOpen(false);
              }
            }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nouveau tag..."
                className="w-full px-2 py-1.5 rounded text-xs bg-[#09090b] border border-[#1e1e24] text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-violet-500"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(function ResultsPanel({
  prospects = [],
  folders = [],
  activeFolder = 'all',
  onActiveFolder,
  onDeleteFolder,
  onStartEnrichment,
  onStopEnrichment,
  onStartDeepEnrichment,
  onStartWaterfallEnrichment,
  isEnriching,
  isDeepEnriching,
  isWaterfallEnriching,
  enrichProgress,
  deepEnrichProgress,
  waterfallProgress,
  onDownloadCSV,
  onDeleteAll,
  tags,
  prospectTagMap,
  onCreateTag,
  onDeleteTag,
  onToggleProspectTag,
  onBulkEnrich,
  userPlan,
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tooltipId, setTooltipId] = useState(null);
  const [showEnrichDropdown, setShowEnrichDropdown] = useState(false);

  const isEnterprise = userPlan?.id === 'enterprise';

  const ENRICH_METHODS = [
    { id: null, label: 'Waterfall (auto)', icon: '🔄', description: 'Essaie chaque source dans l\'ordre' },
    { id: 'scrape', label: 'Scraping uniquement', icon: '🌐', description: 'Scrape le site web directement' },
    { id: 'serper', label: 'Serper.dev (Google)', icon: '🔍', description: 'Recherche Google via Serper' },
    { id: 'apollo', label: 'Apollo.io', icon: '🚀', description: 'Enrichissement Apollo People' },
    { id: 'enrichly', label: 'Enrichly', icon: '📧', description: 'API Enrichly' },
    { id: 'anymail', label: 'Anymail Finder', icon: '📬', description: 'API Anymail Finder' },
    { id: 'findymail', label: 'Findymail', icon: '✉️', description: 'API Findymail' },
  ];

  const folderProspects = useMemo(() => {
    if (activeFolder === 'all') return prospects;
    if (activeFolder === 'unassigned') return prospects.filter((p) => !p.folder_id);
    return prospects.filter((p) => p.folder_id === activeFolder);
  }, [prospects, activeFolder]);

  const filteredProspects = useMemo(() => {
    return folderProspects.filter((prospect) => {
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
  }, [folderProspects, searchText, selectedDept, selectedType]);

  // Reset page when filters change (outside useMemo to avoid setState during render)
  useEffect(() => {
    setPage(0);
  }, [searchText, selectedDept, selectedType]);

  const stats = useMemo(() => {
    const total = folderProspects.length;
    const phones = folderProspects.filter((p) => p.telephone).length;
    const emails = folderProspects.filter((p) => p.email).length;
    const websites = folderProspects.filter((p) => p.site_web).length;
    return { total, phones, emails, websites };
  }, [folderProspects]);

  const prospectsWithoutEmail = useMemo(() => {
    return folderProspects.filter((p) => p.site_web && !p.email).length;
  }, [folderProspects]);

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

  const [showFolderDelete, setShowFolderDelete] = useState(null);

  const handleDeleteFolder = (folderId) => {
    if (showFolderDelete === folderId) {
      onDeleteFolder(folderId);
      setShowFolderDelete(null);
    } else {
      setShowFolderDelete(folderId);
      setTimeout(() => setShowFolderDelete(null), 3000);
    }
  };

  const handleExport = (format) => {
    onDownloadCSV(format, folderProspects);
  };

  const handleDeleteAll = () => {
    if (showDeleteConfirm) {
      onDeleteAll(activeFolder !== 'all' ? activeFolder : undefined);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  // Count prospects per folder
  const folderCounts = useMemo(() => {
    const counts = { all: prospects.length, unassigned: 0 };
    for (const p of prospects) {
      if (!p.folder_id) counts.unassigned++;
      else counts[p.folder_id] = (counts[p.folder_id] || 0) + 1;
    }
    return counts;
  }, [prospects]);

  return (
    <div className="space-y-4">
      {/* Folder tabs */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onActiveFolder('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${
              activeFolder === 'all'
                ? 'bg-[#1e1e24] border-[#27272a] text-[#fafafa]'
                : 'border-transparent text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#111114]'
            }`}
          >
            <FolderOpen size={13} />
            Tous
            <span className="font-mono text-[10px] opacity-60">{folderCounts.all}</span>
          </button>
          {folders.map((f) => (
            <div key={f.id} className="relative group/folder flex items-center">
              <button
                onClick={() => onActiveFolder(f.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${
                  activeFolder === f.id
                    ? 'bg-[#1e1e24] border-[#27272a] text-[#fafafa]'
                    : 'border-transparent text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#111114]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${folderColorClass(f.color)}`} />
                {f.name}
                <span className="font-mono text-[10px] opacity-60">{folderCounts[f.id] || 0}</span>
              </button>
              <button
                onClick={() => handleDeleteFolder(f.id)}
                className={`ml-0.5 p-1 rounded-md transition-all ${
                  showFolderDelete === f.id
                    ? 'bg-red-600/20 text-red-400'
                    : 'opacity-0 group-hover/folder:opacity-100 text-[#3f3f46] hover:text-red-400 hover:bg-red-600/10'
                }`}
                title={showFolderDelete === f.id ? 'Confirmer la suppression' : 'Supprimer la liste'}
              >
                {showFolderDelete === f.id ? <AlertTriangle size={11} /> : <X size={11} />}
              </button>
            </div>
          ))}
          {prospects.some((p) => !p.folder_id) && (
            <button
              onClick={() => onActiveFolder('unassigned')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${
                activeFolder === 'unassigned'
                  ? 'bg-[#1e1e24] border-[#27272a] text-[#fafafa]'
                  : 'border-transparent text-[#3f3f46] hover:text-[#71717a] hover:bg-[#111114]'
              }`}
            >
              <Folder size={13} />
              Non classes
              <span className="font-mono text-[10px] opacity-60">{folderCounts.unassigned}</span>
            </button>
          )}
        </div>
      )}

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
        {!isEnriching && !isDeepEnriching && !isWaterfallEnriching ? (
          <div className="flex items-center gap-2">
            <div className="relative group/tip">
              <button
                onClick={onStartEnrichment}
                disabled={prospects.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#1e1e24] disabled:text-[#3f3f46] text-white text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              >
                <Zap size={14} />
                Enrichir
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1e1e24] border border-[#27272a] rounded-xl text-[10px] text-[#a1a1aa] w-52 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                <div className="font-semibold text-[#fafafa] mb-1">Scraping basique</div>
                Parcourt la homepage et les pages contact/mentions légales du site web pour trouver les emails visibles.
                <div className="text-[#3f3f46] mt-1">Gratuit • Rapide</div>
              </div>
            </div>
            <div className="relative group/tip">
              <button
                onClick={onStartDeepEnrichment}
                disabled={prospects.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-[#1e1e24] disabled:text-[#3f3f46] text-white text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              >
                <Radar size={14} />
                Deep Enrich
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1e1e24] border border-[#27272a] rounded-xl text-[10px] text-[#a1a1aa] w-56 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                <div className="font-semibold text-[#fafafa] mb-1">Crawl approfondi</div>
                Explore plusieurs pages du site, détecte les patterns d'emails (prénom.nom@), vérifie les enregistrements MX du domaine.
                <div className="text-[#3f3f46] mt-1">Gratuit • Plus lent</div>
              </div>
            </div>
            <div className="relative group/tip">
              <button
                onClick={onStartWaterfallEnrichment}
                disabled={prospects.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:bg-[#1e1e24] disabled:from-[#1e1e24] disabled:to-[#1e1e24] disabled:text-[#3f3f46] text-white text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed shadow-lg shadow-orange-600/10"
              >
                <Crown size={14} />
                Waterfall Pro
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1e1e24] border border-[#27272a] rounded-xl text-[10px] text-[#a1a1aa] w-64 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                <div className="font-semibold text-orange-400 mb-1">Enrichissement cascade</div>
                <div className="space-y-0.5">
                  <div>1. Scraping site web (gratuit)</div>
                  <div>2. Serper.dev — recherche Google ($0.002/req)</div>
                  <div>3. Apollo.io ($79/mo)</div>
                  <div>4. Enrichly ($59/mo)</div>
                  <div>5. Anymail Finder</div>
                  <div>6. Findymail</div>
                  <div>7. Email deviné (fallback)</div>
                </div>
                <div className="text-[#3f3f46] mt-1">S'arrête dès qu'un email est trouvé</div>
              </div>
            </div>
          </div>
        ) : (
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
                  className={`h-full transition-all duration-300 rounded-full ${isWaterfallEnriching ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                  style={{ width: `${
                    isWaterfallEnriching ? (waterfallProgress?.total > 0 ? (waterfallProgress.current / waterfallProgress.total) * 100 : 0) :
                    isDeepEnriching ? (deepEnrichProgress?.total > 0 ? (deepEnrichProgress.current / deepEnrichProgress.total) * 100 : 0) :
                    enrichProgress_pct
                  }%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#52525b] tabular-nums">
                {isWaterfallEnriching ? `${waterfallProgress?.current || 0}/${waterfallProgress?.total || 0}` :
                 isDeepEnriching ? `${deepEnrichProgress?.current || 0}/${deepEnrichProgress?.total || 0}` :
                 `${enrichProgress?.current}/${enrichProgress?.total}`}
              </span>
            </div>
            <span className="text-[10px] truncate max-w-[150px] hidden sm:block" style={{ color: isWaterfallEnriching ? '#f97316' : '#a78bfa' }}>
              {isWaterfallEnriching ? (waterfallProgress?.currentSite || '') :
               isDeepEnriching ? (deepEnrichProgress?.currentSite || '') :
               (enrichProgress?.currentSite || '')}
            </span>
          </div>
        )}

        <div className="relative">
          <div className="flex">
            <button
              onClick={() => onBulkEnrich?.(activeFolder === 'all' ? null : activeFolder, null)}
              disabled={isWaterfallEnriching || prospectsWithoutEmail === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-l-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Zap className="h-3.5 w-3.5" />
              Enrichir tout ({prospectsWithoutEmail})
            </button>
            <button
              onClick={() => setShowEnrichDropdown(!showEnrichDropdown)}
              disabled={isWaterfallEnriching || prospectsWithoutEmail === 0}
              className="flex items-center px-1.5 py-2 rounded-r-lg text-xs font-medium bg-violet-700 text-white hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-l border-violet-500/30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {showEnrichDropdown && (
            <div className="absolute z-50 top-full mt-1 left-0 w-64 rounded-lg border border-[#1e1e24] bg-[#111114] shadow-xl py-1">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#52525b] font-semibold">
                Méthode d'enrichissement
              </div>
              {ENRICH_METHODS.map((m) => {
                const isLocked = m.id !== null && !isEnterprise;
                return (
                  <button
                    key={m.id || 'waterfall'}
                    onClick={() => {
                      if (isLocked) return;
                      setShowEnrichDropdown(false);
                      onBulkEnrich?.(activeFolder === 'all' ? null : activeFolder, m.id);
                    }}
                    disabled={isLocked}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs transition-colors ${
                      isLocked
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-[#1e1e24] cursor-pointer'
                    }`}
                  >
                    <span className="text-sm">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#fafafa] font-medium flex items-center gap-1.5">
                        {m.label}
                        {isLocked && <Lock className="h-3 w-3 text-[#52525b]" />}
                      </div>
                      <div className="text-[10px] text-[#52525b] truncate">{m.description}</div>
                    </div>
                    {isLocked && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium whitespace-nowrap">
                        Enterprise
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Export */}
        <button
          onClick={() => handleExport("standard")}
          disabled={folderProspects.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1e1e24] hover:bg-[#1e1e24] text-[#71717a] hover:text-[#fafafa] text-xs font-medium transition disabled:opacity-30"
          title="Exporter en CSV standard"
        >
          <Download size={14} />
          <span className="hidden sm:inline">CSV</span>
        </button>
        <button
          onClick={() => handleExport("zoho")}
          disabled={folderProspects.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1e1e24] hover:bg-[#1e1e24] text-[#71717a] hover:text-[#fafafa] text-xs font-medium transition disabled:opacity-30"
          title="Exporter au format Zoho CRM"
        >
          <FileSpreadsheet size={14} />
          <span className="hidden sm:inline">Zoho</span>
        </button>
        <button
          onClick={handleDeleteAll}
          disabled={folderProspects.length === 0}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition disabled:opacity-30 ${
            showDeleteConfirm
              ? 'border-red-600/50 bg-red-600/20 text-red-400'
              : 'border-red-600/20 hover:bg-red-600/10 text-red-400/60 hover:text-red-400'
          }`}
          title={showDeleteConfirm ? "Cliquez pour confirmer" : "Supprimer les prospects"}
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
              method === 'serper' ? 'bg-yellow-400' :
              method === 'apollo' ? 'bg-orange-400' :
              method === 'enrichly' ? 'bg-cyan-400' :
              method === 'anymail' ? 'bg-teal-400' :
              method === 'findymail' ? 'bg-sky-400' :
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
                <th className="px-3 py-2 text-left text-xs font-medium text-[#71717a]">Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[#71717a]">Tags</th>
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
                    {(() => {
                      const score = p.lead_score || computeLeadScore(p);
                      const scoreInfo = getScoreLabel(score);
                      return (
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${scoreInfo.bg} ${scoreInfo.color}`}>
                            {score}
                          </span>
                        </td>
                      );
                    })()}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 items-center">
                        {(prospectTagMap?.[p.id] || []).map(tagId => {
                          const tag = tags?.find(t => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-400 cursor-pointer hover:opacity-70"
                              onClick={() => onToggleProspectTag?.(p.id, tagId)}
                              title="Cliquer pour retirer"
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                        <TagDropdown
                          tags={tags || []}
                          activeTags={prospectTagMap?.[p.id] || []}
                          onToggle={(tagId) => onToggleProspectTag?.(p.id, tagId)}
                          onCreate={onCreateTag}
                        />
                      </div>
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
})
