"use client";

import { useState, useMemo } from "react";
import {
  Download,
  Trash2,
  Zap,
  Square,
  Search,
  ExternalLink,
} from "lucide-react";
import { DEPTS } from "@/lib/constants";

const shortUrl = (url) => {
  if (!url) return "";
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default function ResultsPanel({
  prospects = [],
  onStartEnrichment,
  onStopEnrichment,
  isEnriching,
  enrichProgress,
  onDownloadCSV,
  onDeleteAll,
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Filter prospects based on search and dropdowns
  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      const matchesSearch =
        !searchText ||
        prospect.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        prospect.adresse?.toLowerCase().includes(searchText.toLowerCase()) ||
        prospect.telephone?.includes(searchText) ||
        prospect.email?.toLowerCase().includes(searchText.toLowerCase());

      const matchesDept =
        selectedDept === "all" || prospect.departement === selectedDept;

      const matchesType =
        selectedType === "all" || prospect.type === selectedType;

      return matchesSearch && matchesDept && matchesType;
    });
  }, [prospects, searchText, selectedDept, selectedType]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = prospects.length;
    const phones = prospects.filter((p) => p.telephone).length;
    const emails = prospects.filter((p) => p.email).length;
    const websites = prospects.filter((p) => p.site_web).length;
    const b2b = prospects.filter((p) => p.type === "b2b").length;
    const copro = prospects.filter((p) => p.type === "copro").length;

    return { total, phones, emails, websites, b2b, copro };
  }, [prospects]);

  const getTypeStyle = (type) => {
    switch (type) {
      case "b2b":
        return "bg-blue-500/10 text-blue-400";
      case "copro":
        return "bg-purple-500/10 text-purple-400";
      case "custom":
        return "bg-amber-500/10 text-amber-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getEmailStyle = (prospect) => {
    if (prospect.email_method === "scrape") {
      return "text-green-400";
    } else if (prospect.email_method === "guess") {
      return "text-amber-400";
    }
    return "text-[#a1a1aa]";
  };

  const displayProspects = filteredProspects.slice(0, 500);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#111114] border border-indigo-600/50 rounded-xl p-4 text-center bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="text-3xl font-bold text-[#fafafa] font-mono">
            {stats.total}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Total Prospects</div>
        </div>

        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#fafafa] font-mono">
            {stats.phones}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Téléphones</div>
        </div>

        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400 font-mono">
            {stats.emails}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Emails</div>
        </div>

        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#fafafa] font-mono">
            {stats.websites}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Sites web</div>
        </div>

        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-400 font-mono">
            {stats.b2b}
          </div>
          <div className="text-xs text-[#71717a] mt-1">B2B</div>
        </div>

        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400 font-mono">
            {stats.copro}
          </div>
          <div className="text-xs text-[#71717a] mt-1">Copro</div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 bg-[#111114] border border-[#1e1e24] rounded-xl p-4">
        <button
          onClick={onStartEnrichment}
          disabled={isEnriching || prospects.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
        >
          <Zap size={16} />
          Enrichir les emails
        </button>

        {isEnriching && (
          <button
            onClick={onStopEnrichment}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Square size={16} />
            Arrêter
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={() => onDownloadCSV("standard")}
          disabled={prospects.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
        >
          <Download size={16} />
          CSV
        </button>

        <button
          onClick={() => onDownloadCSV("zoho")}
          disabled={prospects.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-[#1e1e24] hover:bg-[#1e1e24] text-[#a1a1aa] rounded-lg text-sm font-medium transition"
        >
          <Download size={16} />
          Zoho CRM
        </button>

        <button
          onClick={onDeleteAll}
          disabled={prospects.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-red-600/50 hover:bg-red-600/10 disabled:border-gray-700 disabled:cursor-not-allowed text-red-400 rounded-lg text-sm font-medium transition"
        >
          <Trash2 size={16} />
          Vider
        </button>
      </div>

      {/* Enrichment Progress */}
      {isEnriching && enrichProgress && (
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-[#a1a1aa]">
              Processing: {enrichProgress.currentSite}
            </span>
          </div>

          <div className="w-full bg-[#1e1e24] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
              style={{
                width: `${
                  enrichProgress.total > 0
                    ? (enrichProgress.current / enrichProgress.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="text-xs text-[#71717a]">
            {enrichProgress.current} / {enrichProgress.total}
          </div>

          {enrichProgress.logs && enrichProgress.logs.length > 0 && (
            <div className="bg-[#0a0a0c] border border-[#1e1e24] rounded-lg p-3 max-h-32 overflow-y-auto text-xs font-mono text-green-400 space-y-1">
              {enrichProgress.logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          )}

          {enrichProgress.foundScrape !== undefined && (
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-[#71717a]">Scrape: </span>
                <span className="text-green-400 font-mono">
                  {enrichProgress.foundScrape}
                </span>
              </div>
              <div>
                <span className="text-[#71717a]">Guess: </span>
                <span className="text-amber-400 font-mono">
                  {enrichProgress.foundGuess}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#111114] border border-[#1e1e24] rounded-xl p-4">
        <div className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]"
            />
            <input
              type="text"
              placeholder="Chercher par nom, adresse, téléphone..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0a0a0c] border border-[#1e1e24] rounded-lg text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-indigo-600/50"
            />
          </div>
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-[#0a0a0c] border border-[#1e1e24] rounded-lg text-sm text-[#a1a1aa] focus:outline-none focus:border-indigo-600/50"
        >
          <option value="all">Tous (Département)</option>
          {DEPTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-[#0a0a0c] border border-[#1e1e24] rounded-lg text-sm text-[#a1a1aa] focus:outline-none focus:border-indigo-600/50"
        >
          <option value="all">Tous (Type)</option>
          <option value="b2b">B2B</option>
          <option value="copro">Copro</option>
          <option value="custom">Personnalisé</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-[#111114] border border-[#1e1e24] rounded-xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#16161a] text-[#52525b]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Nom</th>
                <th className="px-4 py-3 text-left font-medium">Adresse</th>
                <th className="px-4 py-3 text-left font-medium">Téléphone</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Site web</th>
                <th className="px-4 py-3 text-left font-medium">Note</th>
                <th className="px-4 py-3 text-left font-medium">Avis</th>
                <th className="px-4 py-3 text-left font-medium">Dept</th>
              </tr>
            </thead>
            <tbody>
              {displayProspects.map((prospect) => (
                <tr
                  key={prospect.id}
                  className="border-b border-[#1e1e24] hover:bg-[#16161a] transition"
                >
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeStyle(
                        prospect.type
                      )}`}
                    >
                      {prospect.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#fafafa] font-semibold">
                    {prospect.nom}
                  </td>
                  <td className="px-4 py-2 text-[#a1a1aa]">
                    {prospect.adresse}
                  </td>
                  <td className="px-4 py-2 text-[#a1a1aa]">
                    {prospect.telephone}
                  </td>
                  <td className={`px-4 py-2 ${getEmailStyle(prospect)}`}>
                    {prospect.email}
                    {prospect.email_method === "guess" && (
                      <span className="text-amber-400">~</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {prospect.site_web ? (
                      <a
                        href={prospect.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {shortUrl(prospect.site_web)}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[#71717a]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {prospect.note ? (
                      <span className="text-yellow-400">★ {prospect.note}</span>
                    ) : (
                      <span className="text-[#71717a]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-[#a1a1aa]">
                    {prospect.nb_avis || "—"}
                  </td>
                  <td className="px-4 py-2 text-[#a1a1aa]">
                    {prospect.departement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#16161a] border-t border-[#1e1e24] px-4 py-3 text-xs text-[#71717a]">
          {displayProspects.length} résultats ({stats.total} total)
        </div>
      </div>
    </div>
  );
}
