"use client";

import { Download, FileSpreadsheet, Table2, CheckCircle2 } from "lucide-react";

export default function ExportPanel({ prospects, onDownloadCSV }) {
  const stats = {
    total: prospects.length,
    withEmail: prospects.filter((p) => p.email).length,
    withPhone: prospects.filter((p) => p.telephone).length,
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

      {/* Summary */}
      <div className="p-5 rounded-xl border border-[#1e1e24] bg-[#111114]">
        <h3 className="text-xs uppercase tracking-wider text-[#3f3f46] font-semibold mb-4">Résumé de l'export</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#71717a]">Total prospects</span>
            <span className="text-sm font-mono text-[#fafafa]">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#71717a]">Avec email</span>
            <span className="text-sm font-mono text-green-400">{stats.withEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#71717a]">Avec téléphone</span>
            <span className="text-sm font-mono text-[#a1a1aa]">{stats.withPhone}</span>
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onDownloadCSV("standard")}
          className="group p-6 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-green-500/30 transition-all text-left"
        >
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
          </div>
        </button>

        <button
          onClick={() => onDownloadCSV("zoho")}
          className="group p-6 rounded-xl border border-[#1e1e24] bg-[#111114] hover:border-indigo-500/30 transition-all text-left"
        >
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
          </div>
        </button>
      </div>
    </div>
  );
}
