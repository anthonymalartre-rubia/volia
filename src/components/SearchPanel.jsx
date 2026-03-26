"use client";

import { useState } from "react";
import { DEPTS, B2B_CATS, COPRO_CATS } from "@/lib/constants";

export default function SearchPanel({
  onStartScraping,
  onStopScraping,
  isSearching,
  apiKeySet,
  searchProgress,
}) {
  const [selectedDepts, setSelectedDepts] = useState(Object.keys(DEPTS));
  const [selectedB2B, setSelectedB2B] = useState(B2B_CATS);
  const [selectedCopro, setSelectedCopro] = useState(COPRO_CATS);
  const [customQueries, setCustomQueries] = useState([]);
  const [customQueryInput, setCustomQueryInput] = useState("");

  const handleDeptToggle = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleB2BToggle = (cat) => {
    setSelectedB2B((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleCoproToggle = (cat) => {
    setSelectedCopro((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomQuery = () => {
    if (customQueryInput.trim()) {
      setCustomQueries((prev) => [...prev, customQueryInput.trim()]);
      setCustomQueryInput("");
    }
  };

  const handleRemoveCustomQuery = (index) => {
    setCustomQueries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartScraping = () => {
    onStartScraping(selectedDepts, selectedB2B, selectedCopro, customQueries);
  };

  const progress =
    searchProgress && searchProgress.total > 0
      ? (searchProgress.current / searchProgress.total) * 100
      : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* API Status Card */}
      <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
        <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold mb-4">
          État de l'API
        </h3>
        {apiKeySet ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#059669] rounded-full"></div>
            <span className="text-sm text-[#a1a1aa]">
              API configurée ✓
            </span>
          </div>
        ) : (
          <div className="bg-[#7c2d12] border border-[#ea580c] rounded-lg p-3">
            <p className="text-sm text-[#fed7aa]">
              <span className="font-semibold">Configuration requise:</span> Définissez la variable d'environnement{" "}
              <code className="bg-[#1e1e24] px-2 py-1 rounded text-xs">
                GOOGLE_PLACES_API_KEY
              </code>{" "}
              dans les variables Vercel.
            </p>
          </div>
        )}
      </div>

      {/* Departments Selection Card */}
      <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
        <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold mb-4">
          Départements
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(DEPTS).map(([code, dept]) => (
            <label
              key={code}
              className="flex items-center gap-2 bg-[#16161a] border border-[#1e1e24] rounded-full px-3 py-1 text-sm text-[#a1a1aa] cursor-pointer hover:border-[#3f3f46] transition"
            >
              <input
                type="checkbox"
                checked={selectedDepts.includes(code)}
                onChange={() => handleDeptToggle(code)}
                className="w-4 h-4 cursor-pointer"
              />
              {code} {dept.name}
            </label>
          ))}
        </div>
      </div>

      {/* B2B and Copro Categories - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* B2B Categories Card */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold mb-4">
            Catégories B2B
          </h3>
          <div className="flex flex-wrap gap-2">
            {B2B_CATS.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 bg-[#16161a] border border-[#1e1e24] rounded-full px-3 py-1 text-sm text-[#a1a1aa] cursor-pointer hover:border-[#3f3f46] transition"
              >
                <input
                  type="checkbox"
                  checked={selectedB2B.includes(cat)}
                  onChange={() => handleB2BToggle(cat)}
                  className="w-4 h-4 cursor-pointer"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Copro Categories Card */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold mb-4">
            Catégories Copro
          </h3>
          <div className="flex flex-wrap gap-2">
            {COPRO_CATS.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 bg-[#16161a] border border-[#1e1e24] rounded-full px-3 py-1 text-sm text-[#a1a1aa] cursor-pointer hover:border-[#3f3f46] transition"
              >
                <input
                  type="checkbox"
                  checked={selectedCopro.includes(cat)}
                  onChange={() => handleCoproToggle(cat)}
                  className="w-4 h-4 cursor-pointer"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Query Card */}
      <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
        <h3 className="text-xs uppercase tracking-wider text-[#52525b] font-semibold mb-4">
          Requêtes personnalisées
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customQueryInput}
            onChange={(e) => setCustomQueryInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCustomQuery();
              }
            }}
            placeholder="Entrez une requête..."
            className="flex-1 bg-[#16161a] border border-[#1e1e24] rounded-lg px-3 py-2 text-sm text-[#a1a1aa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] transition"
          />
          <button
            onClick={handleAddCustomQuery}
            className="bg-[#059669] hover:bg-[#34d399] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Ajouter
          </button>
        </div>
        {customQueries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customQueries.map((query, index) => (
              <div
                key={index}
                className="bg-[#16161a] border border-[#1e1e24] rounded-full px-3 py-1 text-sm text-[#a1a1aa] flex items-center gap-2"
              >
                {query}
                <button
                  onClick={() => handleRemoveCustomQuery(index)}
                  className="ml-1 text-[#52525b] hover:text-[#dc2626] transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleStartScraping}
          disabled={isSearching}
          className="flex-1 bg-[#059669] hover:bg-[#34d399] disabled:bg-[#374151] text-white px-6 py-3 rounded-lg font-medium transition disabled:cursor-not-allowed"
        >
          Lancer le scraping
        </button>
        {isSearching && (
          <button
            onClick={onStopScraping}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Arrêter
          </button>
        )}
      </div>

      {/* Progress Section */}
      {isSearching && searchProgress && (
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 space-y-4">
          {/* Current Query */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#059669] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#a1a1aa]">
              {searchProgress.currentQuery || "Initialisation..."}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#52525b]">Progression</span>
              <span className="text-xs text-[#52525b]">
                {searchProgress.current} / {searchProgress.total}
              </span>
            </div>
            <div className="h-1 bg-[#1e1e24] rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Log Box */}
          {searchProgress.logs && (
            <div className="bg-[#09090b] border border-[#1e1e24] rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="font-mono text-xs text-[#52525b] space-y-1">
                {searchProgress.logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
