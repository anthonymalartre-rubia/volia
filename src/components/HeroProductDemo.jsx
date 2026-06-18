'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Send, Layers, ArrowRight } from 'lucide-react';

/**
 * Démo produit ANIMÉE du hero (alternative codée à une vraie vidéo).
 *
 * Rejoue en boucle le parcours Volia dans une fausse fenêtre navigateur :
 *   0. Prospection  — la liste de prospects se remplit
 *   1. Enrichissement — les emails manquants se complètent (badge « Vérifié »)
 *   2. Campagnes     — campagne envoyée, stats qui s'affichent
 *   3. CRM           — une réponse crée une carte dans le pipeline
 *
 * 100 % CSS/JS, aucun fichier vidéo → léger, n'impacte pas le LCP.
 * Respecte prefers-reduced-motion (pas de cycle auto).
 */
const SCENES = ['Prospection', 'Enrichissement', 'Campagnes', 'CRM'];
const DOT = ['bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-emerald-500'];
const STEP_MS = 3600;

const ROWS = [
  { name: 'La Bonne Table', email: 'contact@labonnetable.fr', phone: '01 42 33 87 19', type: 'fixe' },
  { name: 'Pasta Roma', email: 'info@pastaroma.fr', phone: '06 78 24 51 09', type: 'mobile' },
  { name: 'Boulangerie Maison', email: 'bonjour@boulangerie-m.fr', phone: '01 45 88 12 67', type: 'fixe' },
];

export default function HeroProductDemo() {
  const [step, setStep] = useState(0);
  const [fill, setFill] = useState(false);

  // Cycle automatique entre les 4 scènes (sauf si l'utilisateur réduit les animations).
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % SCENES.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  // Anime la barre de progression de l'enrichissement à chaque entrée sur la scène 1.
  useEffect(() => {
    setFill(false);
    if (step === 1) {
      const t = setTimeout(() => setFill(true), 80);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-150">
      {/* Sticker live */}
      <div className="absolute -top-4 -left-4 z-20 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 shadow-md flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-700">Démo en direct</span>
      </div>

      {/* Fenêtre navigateur */}
      <div className="rounded-2xl bg-white border border-line shadow-2xl shadow-violet-500/10 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-line bg-surface-alt">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="ml-3 text-[11px] text-content-tertiary font-medium">app.volia.fr</span>
        </div>

        {/* Zone scène — hauteur fixe pour éviter les sauts de layout */}
        <div className="relative h-[300px] bg-white px-4 py-4 overflow-hidden">
          <div key={step} className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {step === 0 && <SceneProspection />}
            {step === 1 && <SceneEnrich fill={fill} />}
            {step === 2 && <SceneCampagnes />}
            {step === 3 && <SceneCRM />}
          </div>
        </div>

        {/* Pied : module courant + points d'étape */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-surface-alt">
          <span className="text-xs font-bold text-content-primary">{step + 1} · Volia {SCENES[step]}</span>
          <div className="flex items-center gap-1.5">
            {SCENES.map((s, i) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? `w-5 ${DOT[i]}` : 'w-1.5 bg-line'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Badge flottant */}
      <div className="hidden lg:flex absolute -bottom-4 -right-4 z-20 px-4 py-2.5 rounded-xl bg-white border border-line shadow-xl items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 flex items-center justify-center">
          <CheckCircle2 size={16} className="text-white" />
        </div>
        <div>
          <div className="text-[10px] text-content-tertiary uppercase tracking-wider font-semibold">0 saisie manuelle</div>
          <div className="text-xs font-bold text-content-primary">Suite connectée</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Scène 0 : Prospection ─────────────────────────────────────────────── */
function SceneProspection() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Search size={13} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-violet-600 font-bold leading-none">Recherche</div>
            <div className="text-xs font-semibold text-content-primary mt-0.5">Restaurants · Paris</div>
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-md bg-violet-100 text-violet-700 font-bold">234 résultats</div>
      </div>
      <div className="space-y-2">
        {ROWS.map((row, i) => (
          <div
            key={row.name}
            className="flex items-center justify-between gap-2 text-xs animate-in fade-in slide-in-from-right-2 fill-mode-both"
            style={{ animationDelay: `${250 + i * 350}ms`, animationDuration: '500ms' }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-content-primary truncate">{row.name}</div>
              <div className="text-content-tertiary font-mono text-[10px] truncate">{row.email}</div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
              <span className="font-mono text-[10px] text-content-secondary tabular-nums">{row.phone}</span>
              <span
                className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${
                  row.type === 'mobile' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {row.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scène 1 : Enrichissement ──────────────────────────────────────────── */
function SceneEnrich({ fill }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <CheckCircle2 size={13} className="text-white" />
          </div>
          <div className="text-xs font-semibold text-content-primary">Enrichissement en cours…</div>
        </div>
        <div className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-bold tabular-nums">3 emails ✓</div>
      </div>

      {/* Barre de progression */}
      <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
          style={{ width: fill ? '100%' : '8%', transition: 'width 2.4s ease-out' }}
        />
      </div>

      <div className="space-y-2">
        {ROWS.map((row, i) => (
          <div key={row.name} className="flex items-center justify-between gap-2 text-xs">
            <div className="font-medium text-content-primary truncate flex-1 min-w-0">{row.name}</div>
            <div
              className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 fill-mode-both"
              style={{ animationDelay: `${600 + i * 450}ms`, animationDuration: '400ms' }}
            >
              <span className="font-mono text-[10px] text-content-secondary truncate max-w-[120px]">{row.email}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                <CheckCircle2 size={8} /> Vérifié
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scène 2 : Campagnes ───────────────────────────────────────────────── */
function SceneCampagnes() {
  const stats = [
    { label: 'Envoyés', value: '234', color: 'text-blue-700' },
    { label: 'Ouverts', value: '47', color: 'text-emerald-600' },
    { label: 'Réponses', value: '12', color: 'text-violet-700' },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <Send size={13} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold leading-none">Campagne envoyée</div>
            <div className="text-xs font-semibold text-content-primary mt-0.5">« Resto-Q4 » · cold email</div>
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-bold">234 envois</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl bg-surface-alt border border-line py-3 text-center animate-in fade-in zoom-in-95 fill-mode-both"
            style={{ animationDelay: `${200 + i * 250}ms`, animationDuration: '450ms' }}
          >
            <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-content-tertiary uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div
        className="mt-auto flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
        style={{ animationDelay: '1100ms', animationDuration: '450ms' }}
      >
        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
        <span className="text-xs text-emerald-800 font-medium">12 réponses → ajoutées au CRM automatiquement</span>
      </div>
    </div>
  );
}

/* ─── Scène 3 : CRM ─────────────────────────────────────────────────────── */
function SceneCRM() {
  const cols = [
    { name: 'Lead', accent: 'border-emerald-300 bg-emerald-50 text-emerald-800', deals: ['La Bonne Table'], fresh: true },
    { name: 'Qualifié', accent: 'border-line bg-surface-alt text-content-secondary', deals: ['Pasta Roma'] },
    { name: 'RDV', accent: 'border-line bg-surface-alt text-content-secondary', deals: ['Le Bistrot'] },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <Layers size={13} className="text-white" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold leading-none">Pipeline commercial</div>
          <div className="text-xs font-semibold text-content-primary mt-0.5">Deals créés automatiquement</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1">
        {cols.map((col, i) => (
          <div key={col.name} className="flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-wider text-content-tertiary mb-1.5 px-1">{col.name}</div>
            <div className="flex flex-col gap-1.5">
              {col.deals.map((deal) => (
                <div
                  key={deal}
                  className={`rounded-lg border px-2 py-2 text-[10px] font-semibold text-center ${col.accent} ${
                    col.fresh ? 'animate-in fade-in slide-in-from-top-2 fill-mode-both' : ''
                  }`}
                  style={col.fresh ? { animationDelay: '400ms', animationDuration: '500ms' } : undefined}
                >
                  {deal}
                  {col.fresh && (
                    <div className="mt-1 inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600">
                      <ArrowRight size={8} /> réponse email
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
