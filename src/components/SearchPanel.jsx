"use client";

import { useState } from "react";
import { DEPTS, B2B_CATS, COPRO_CATS } from "@/lib/constants";
import { Search, X, Plus, Play, Square, MapPin, Building2, Home, Sparkles, Info } from "lucide-react";

export default function SearchPanel({
  onStartScraping,
  onStopScraping,
  isSearching,
  apiKeySet,
  searchProgress,
}) {
  const [selectedDepts, setSelectedDepts] = useState(Object.keys(DEPTS));
  const [selectedB2B, setSelectedB2B] = useState([...B2B_CATS]);
  const [selectedCopro, setSelectedCopro] = useState([...COPRO_CATS]);
  const [customQueries, setCustomQueries] = useState([]);
  const [customQueryInput, setCustomQueryInput] = useState("");

  const toggleDept = (dept) => {
    if (isSearching) return;
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleB2B = (cat) => {
    if (isSearching) return;
    setSelectedB2B((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCopro = (cat) => {
    if (isSearching) return;
    setSelectedCopro((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const selectAllB2B = () => {
    if (isSearching) return;
    setSelectedB2B(selectedB2B.length === B2B_CATS.length ? [] : [...B2B_CATS]);
  };
  const selectAllCopro = () => {
    if (isSearching) return;
    setSelectedCopro(selectedCopro.length === COPRO_CATS.length ? [] : [...COPRO_CATS]);
  };

  const addCustomQuery = () => {
    if (isSearching) return;
    if (customQueryInput.trim()) {
      setCustomQueries((prev) => [...prev, customQueryInput.trim()]);
      setCustomQueryInput("");
    }
  };

  const removeCustomQuery = (index) => {
    if (isSearching) return;
    setCustomQueries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    onStartScraping(selectedDepts, selectedB2B, selectedCopro, customQueries);
  };

  const b2bQueries = selectedDepts.length * selectedB2B.length;
  const coproQueries = selectedDepts.length * selectedCopro.length;
  const totalQueries = b2bQueries + coproQueries + customQueries.length;

  const progress = searchProgress?.total > 0
    ? (searchProgress.current / searchProgress.total) * 100
    : 0;

  return (
    <div className={`space-y-6 ${isSearching ? 'pointer-events-auto' : ''}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#fafafa] mb-1">Recherche</h2>
        <p className="text-sm text-[#52525b]">Configurez et lancez votre recherche Google Places</p>
      </div>

      {/* API Status */}
      {!apiKeySet && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <Sparkles size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Configuration requise</p>
            <p className="text-xs text-[#71717a] mt-1">
              Définissez <code className="px-1.5 py-0.5 rounded bg-[#1e1e24] text-[#a1a1aa] text-[11px]">GOOGLE_PLACES_API_KEY</code> dans les variables Vercel.
            </p>
          </div>
        </div>
      )}

      {/* Departments */}
      <div className={`rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden transition-opacity ${isSearching ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1e1e24]">
          <MapPin size={14} className="text-indigo-400" />
          <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold">
            Départements
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e24] text-[#3f3f46]">
            {selectedDepts.length}/{Object.keys(DEPTS).length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 p-5">
          {Object.entries(DEPTS).map(([code, dept]) => {
            const isActive = selectedDepts.includes(code);
            return (
              <button
                key={code}
                onClick={() => toggleDept(code)}
                disabled={isSearching}
                className={`
                  px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                  ${isActive
                    ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 shadow-sm shadow-indigo-500/10'
                    : 'bg-[#0a0a0c] border-[#1e1e24] text-[#52525b] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                <span className="font-mono mr-1.5">{code}</span>
                {dept.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity ${isSearching ? 'opacity-50' : ''}`}>
        {/* B2B */}
        <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e24]">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-blue-400" />
              <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold">
                B2B
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e24] text-[#3f3f46]">
                {selectedB2B.length}/{B2B_CATS.length}
              </span>
            </div>
            <button
              onClick={selectAllB2B}
              disabled={isSearching}
              className="text-[10px] uppercase tracking-wider text-[#3f3f46] hover:text-indigo-400 font-semibold transition disabled:cursor-not-allowed"
            >
              {selectedB2B.length === B2B_CATS.length ? 'Aucun' : 'Tous'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-4">
            {B2B_CATS.map((cat) => {
              const isActive = selectedB2B.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleB2B(cat)}
                  disabled={isSearching}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${isActive
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : 'bg-transparent border-[#1e1e24] text-[#3f3f46] hover:border-[#3f3f46] hover:text-[#71717a]'
                    }
                    disabled:cursor-not-allowed
                  `}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Copro */}
        <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e24]">
            <div className="flex items-center gap-2">
              <Home size={14} className="text-purple-400" />
              <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold">
                Copropriété
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e24] text-[#3f3f46]">
                {selectedCopro.length}/{COPRO_CATS.length}
              </span>
            </div>
            <button
              onClick={selectAllCopro}
              disabled={isSearching}
              className="text-[10px] uppercase tracking-wider text-[#3f3f46] hover:text-indigo-400 font-semibold transition disabled:cursor-not-allowed"
            >
              {selectedCopro.length === COPRO_CATS.length ? 'Aucun' : 'Tous'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-4">
            {COPRO_CATS.map((cat) => {
              const isActive = selectedCopro.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCopro(cat)}
                  disabled={isSearching}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${isActive
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      : 'bg-transparent border-[#1e1e24] text-[#3f3f46] hover:border-[#3f3f46] hover:text-[#71717a]'
                    }
                    disabled:cursor-not-allowed
                  `}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom queries */}
      <div className={`rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden transition-opacity ${isSearching ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1e1e24]">
          <Search size={14} className="text-amber-400" />
          <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold">
            Requêtes personnalisées
          </h3>
        </div>
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={customQueryInput}
              onChange={(e) => setCustomQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomQuery()}
              disabled={isSearching}
              placeholder="Ex: plombier Martinique, notaire 972..."
              className="flex-1 bg-[#0a0a0c] border border-[#1e1e24] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-indigo-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={addCustomQuery}
              disabled={isSearching || !customQueryInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#1e1e24] hover:bg-[#27272a] text-[#a1a1aa] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
            </button>
          </div>
          {customQueries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customQueries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                >
                  {query}
                  <button
                    onClick={() => removeCustomQuery(index)}
                    disabled={isSearching}
                    className="text-amber-600 hover:text-amber-300 transition disabled:cursor-not-allowed"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Query breakdown + Action bar */}
      <div className="rounded-2xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
        {/* Query breakdown */}
        {totalQueries > 0 && !isSearching && (
          <div className="px-5 py-3 border-b border-[#1e1e24]">
            <div className="flex items-center gap-2 mb-2">
              <Info size={12} className="text-[#3f3f46]" />
              <span className="text-[10px] uppercase tracking-wider text-[#3f3f46] font-semibold">Détail des requêtes</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#52525b]">
              {b2bQueries > 0 && (
                <span>
                  <span className="text-blue-400 font-mono">{b2bQueries}</span> B2B ({selectedDepts.length} dept × {selectedB2B.length} cat)
                </span>
              )}
              {coproQueries > 0 && (
                <span>
                  <span className="text-purple-400 font-mono">{coproQueries}</span> Copro ({selectedDepts.length} dept × {selectedCopro.length} cat)
                </span>
              )}
              {customQueries.length > 0 && (
                <span>
                  <span className="text-amber-400 font-mono">{customQueries.length}</span> Custom
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center gap-4 p-4">
          {!isSearching ? (
            <>
              <button
                onClick={handleStart}
                disabled={totalQueries === 0 || !apiKeySet}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#1e1e24] disabled:text-[#3f3f46] text-white font-semibold text-sm transition-all disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 disabled:shadow-none active:scale-[0.98]"
              >
                <Play size={16} />
                Lancer la recherche
              </button>
              <div className="text-xs text-[#3f3f46]">
                <span className="font-mono text-[#52525b]">{totalQueries}</span> requêtes à traiter
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onStopScraping}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 text-red-400 font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <Square size={16} />
                Arrêter
              </button>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs text-[#a1a1aa] truncate">
                    {searchProgress?.currentQuery || "Initialisation..."}
                  </span>
                </div>
                <div className="h-1.5 bg-[#1e1e24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#3f3f46] tabular-nums">
                    {searchProgress?.current}/{searchProgress?.total}
                  </span>
                  <span className="text-[10px] font-mono text-[#3f3f46] tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logs */}
      {searchProgress?.logs?.length > 0 && (
        <div className="rounded-2xl border border-[#1e1e24] bg-[#0a0a0c] overflow-hidden">
          <div className="px-5 py-2.5 border-b border-[#1e1e24]">
            <h3 className="text-[10px] uppercase tracking-wider text-[#3f3f46] font-semibold">Logs</h3>
          </div>
          <div className="p-4 max-h-48 overflow-y-auto">
            <div className="font-mono text-[11px] text-[#3f3f46] space-y-0.5">
              {searchProgress.logs.slice(-20).map((log, index) => (
                <div key={index} className={log.startsWith('Error') ? 'text-red-400/60' : ''}>
                  <span className="text-[#27272a] mr-2">{String(index + 1).padStart(2, '0')}</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
