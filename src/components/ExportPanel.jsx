"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Table2, CheckCircle2, Users, Mail, Phone, ArrowRight } from "lucide-react";

export default function ExportPanel({ prospects, onDownloadCSV }) {
  const [lastExport, setLastExport] = useState(null);

  const stats = {
    total: prospects.length,
    withEmail: prospects.filter((p) => p.email).length,
    withPhone: prospects.filter((p) => p.telephone).length,
    withSite: prospects.filter((p) => p.site_web).length,
  };

  const emailPct = stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0;
  const phonePct = stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0;

  const handleExport = (format) => {
    onDownloadCSV(format);
    setLastExport(format);
    setTimeout(() => setLastExport(null), 3000);
  };

  if (prospects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#111114] border border-[#1e1e24] flex items-center justify-center mb-6">
          <Download size={28} className="text-[#27272a]" />
        </div>
        <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Rien à exporter</h3>
        <p className="text-sm text-[#52525b] text-center max-w-xs">
          Lancez une recherche d'abord pour avoir des prospects à exporter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#fafafa] mb-1">Exporter</h2>
        <p className="text-sm text-[#52525b]">Téléchargez vos prospects au format CSV</p>
      </div>

      {/* Success toast */}
      {lastExport && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5 animate-toast-in">
          <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">
            Export {lastExport === 'zoho' ? 'Zoho CRM' : 'CSV standard'} téléchargé avec succès
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl border border-[#1e1e24] bg-[#111114]">
          <div className="p-2 rounded-lg bg-indigo-500/10 w-fit mb-3">
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">{stats.total}</div>
          <div className="text-[10px] text-[#3f3f46] uppercase tracking-wider mt-1 font-medium">Prospects</div>
        </div>
        <div className="p-4 rounded-2xl border border-[#1e1e24] bg-[#111114]">
          <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-3">
            <Mail size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-green-400 tabular-nums">{stats.withEmail}</div>
          <div className="text-[10px] text-[#3f3f46] uppercase tracking-wider mt-1 font-medium">
            Emails <span className="text-[#52525b]">{emailPct}%</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-[#1e1e24] bg-[#111114]">
          <div className="p-2 rounded-lg bg-[#1e1e24] w-fit mb-3">
            <Phone size={16} className="text-[#a1a1aa]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#a1a1aa] tabular-nums">{stats.withPhone}</div>
          <div className="text-[10px] text-[#3f3f46] uppercase tracking-wider mt-1 font-medium">
            Téléphones <span className="text-[#52525b]">{phonePct}%</span>
          </div>
        </div>
      </div>

      {/* Data completeness bar */}
      <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e1e24]">
          <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold">Complétude des données</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#71717a]">Emails</span>
              <span className="text-xs font-mono text-green-400">{emailPct}%</span>
            </div>
            <div className="h-2 bg-[#0a0a0c] rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${emailPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#71717a]">Téléphones</span>
              <span className="text-xs font-mono text-[#a1a1aa]">{phonePct}%</span>
            </div>
            <div className="h-2 bg-[#0a0a0c] rounded-full overflow-hidden">
              <div className="h-full bg-[#52525b] rounded-full transition-all duration-500" style={{ width: `${phonePct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleExport("standard")}
          className="group relative p-6 rounded-2xl border border-[#1e1e24] bg-[#111114] hover:border-green-500/30 active:scale-[0.99] transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full transition-all group-hover:w-32 group-hover:h-32" />
          <div className="p-3 rounded-xl bg-green-600/10 w-fit mb-4">
            <Table2 size={24} className="text-green-400" />
          </div>
          <h3 className="text-base font-semibold text-[#fafafa] mb-1">CSV Standard</h3>
          <p className="text-xs text-[#52525b] leading-relaxed">
            Format classique avec nom, email, téléphone, site web, adresse, département et catégorie.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-400/70 group-hover:text-green-400 transition">
            <Download size={14} />
            <span className="font-medium">Télécharger</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => handleExport("zoho")}
          className="group relative p-6 rounded-2xl border border-[#1e1e24] bg-[#111114] hover:border-indigo-500/30 active:scale-[0.99] transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full transition-all group-hover:w-32 group-hover:h-32" />
          <div className="p-3 rounded-xl bg-indigo-600/10 w-fit mb-4">
            <FileSpreadsheet size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-[#fafafa] mb-1">Zoho CRM</h3>
          <p className="text-xs text-[#52525b] leading-relaxed">
            Format compatible Zoho avec First Name, Last Name, Company, Email, Phone, Website, Address.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400/70 group-hover:text-indigo-400 transition">
            <Download size={14} />
            <span className="font-medium">Télécharger</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e1e24]">
          <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold">Aperçu (5 premiers)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e1e24] bg-[#0a0a0c]">
                <th className="px-4 py-2.5 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Nom</th>
                <th className="px-4 py-2.5 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Email</th>
                <th className="px-4 py-2.5 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Tel</th>
                <th className="px-4 py-2.5 text-left font-medium text-[#3f3f46] uppercase tracking-wider text-[10px]">Dept</th>
              </tr>
            </thead>
            <tbody>
              {prospects.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b border-[#1e1e24]/50">
                  <td className="px-4 py-2 text-[#fafafa] truncate max-w-[180px]">{p.nom}</td>
                  <td className="px-4 py-2 text-green-400/70 truncate max-w-[180px]">{p.email || <span className="text-[#27272a]">—</span>}</td>
                  <td className="px-4 py-2 text-[#a1a1aa] font-mono">{p.telephone || <span className="text-[#27272a]">—</span>}</td>
                  <td className="px-4 py-2 text-[#52525b] font-mono">{p.departement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
