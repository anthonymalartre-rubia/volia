'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle2, Send, Layers, ArrowRight, FormInput, FolderKanban, Bell } from 'lucide-react';

/**
 * Démo produit ANIMÉE du hero (alternative codée à une vraie vidéo) — v4.
 *
 * Mise en scène dans un VRAI SHELL D'APP (sidebar de navigation + barre d'app
 * interne) pour donner l'impression d'être DANS l'outil. Le module actif
 * s'allume dans la sidebar au fil des scènes ; le curseur se pose au pixel près
 * sur le bouton d'action de chaque scène.
 *   0. Prospection (recherche)   1. Prospection (enrichissement)
 *   2. Campagnes                 3. CRM
 *
 * 100 % CSS/JS, aucune dépendance fragile. Pause auto hors écran, respecte
 * prefers-reduced-motion (état final figé).
 */
const STEP_MS = 4200;

// Sidebar : la suite complète. activeKey allumé selon la scène.
const NAV = [
  { key: 'prospection', label: 'Prospection', Icon: Search, on: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  { key: 'campagnes', label: 'Campagnes', Icon: Send, on: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { key: 'crm', label: 'CRM', Icon: Layers, on: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'forms', label: 'Formulaires', Icon: FormInput, on: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { key: 'projets', label: 'Projets', Icon: FolderKanban, on: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
];
// step → module actif dans la sidebar + fil d'Ariane
const SCENE = [
  { active: 'prospection', crumb: 'Recherche' },
  { active: 'prospection', crumb: 'Enrichissement' },
  { active: 'campagnes', crumb: 'Campagne « Resto-Q4 »' },
  { active: 'crm', crumb: 'Pipeline commercial' },
];

const ROWS = [
  { name: 'La Bonne Table', email: 'contact@labonnetable.fr', phone: '01 42 33 87 19', type: 'fixe' },
  { name: 'Pasta Roma', email: 'info@pastaroma.fr', phone: '06 78 24 51 09', type: 'mobile' },
  { name: 'Boulangerie Maison', email: 'bonjour@boulangerie-m.fr', phone: '01 45 88 12 67', type: 'fixe' },
];

function useCountUp(target, active, duration = 1100) {
  const [val, setVal] = useState(active ? 0 : target);
  useEffect(() => {
    if (!active) { setVal(target); return; }
    let raf, start = null;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

function useTyping(text, active, speed = 60) {
  const [n, setN] = useState(active ? 0 : text.length);
  useEffect(() => {
    if (!active) { setN(text.length); return; }
    let i = 0;
    setN(0);
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, text, speed]);
  return text.slice(0, n);
}

export default function HeroProductDemo() {
  const [step, setStep] = useState(0);
  const [fill, setFill] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cursor, setCursor] = useState({ x: 230, y: 300 });
  const rootRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !visible) return;
    const id = setInterval(() => setStep((s) => (s + 1) % SCENE.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, visible]);

  useEffect(() => {
    setFill(false);
    if (step === 1 && !reduce) {
      const t = setTimeout(() => setFill(true), 120);
      return () => clearTimeout(t);
    }
  }, [step, reduce]);

  // Curseur posé pile sur le bouton [data-cta] de la scène (mesure runtime).
  useEffect(() => {
    if (reduce) return;
    const place = () => {
      const area = sceneRef.current;
      const cta = area?.querySelector('[data-cta]');
      if (!area || !cta) return;
      const a = area.getBoundingClientRect();
      const c = cta.getBoundingClientRect();
      setCursor({ x: c.left - a.left + c.width / 2, y: c.top - a.top + c.height / 2 });
    };
    const t = setTimeout(place, 60);
    window.addEventListener('resize', place);
    return () => { clearTimeout(t); window.removeEventListener('resize', place); };
  }, [step, reduce]);

  const scene = SCENE[step];

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-150"
    >
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
        {/* Barre navigateur */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-line bg-surface-alt">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="ml-3 text-[11px] text-content-tertiary font-medium">app.volia.fr</span>
        </div>

        {/* Shell d'application : sidebar + contenu */}
        <div className="flex h-[360px]">
          {/* ─── Sidebar ─── */}
          <aside className="w-[124px] shrink-0 border-r border-line bg-surface-alt/50 py-3 px-2 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 px-2 mb-3">
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-black">V</span>
              <span className="text-xs font-bold text-content-primary">Volia</span>
            </div>
            {NAV.map((item) => {
              const isActive = item.key === scene.active;
              const Icon = item.Icon;
              return (
                <div
                  key={item.key}
                  className={`relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors duration-300 ${
                    isActive ? `${item.on} font-semibold` : 'text-content-tertiary'
                  }`}
                >
                  {isActive && <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full ${item.dot}`} />}
                  <Icon size={13} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
            <div className="mt-auto flex items-center gap-2 px-2 pt-2 border-t border-line">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold">AM</span>
              <span className="text-[10px] text-content-tertiary truncate">Mon espace</span>
            </div>
          </aside>

          {/* ─── Zone principale ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Barre d'app interne : fil d'Ariane + cloche */}
            <div className="flex items-center justify-between px-4 h-9 border-b border-line">
              <div className="text-[11px] text-content-tertiary truncate">
                <span className="font-semibold text-content-secondary capitalize">{scene.active}</span>
                <span className="mx-1">›</span>
                {scene.crumb}
              </div>
              <Bell size={13} className="text-content-tertiary flex-shrink-0" />
            </div>

            {/* Scène + curseur */}
            <div ref={sceneRef} className="relative flex-1 px-4 py-3.5 overflow-hidden">
              <div key={step} className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                {step === 0 && <SceneProspection reduce={reduce} />}
                {step === 1 && <SceneEnrich fill={fill} reduce={reduce} />}
                {step === 2 && <SceneCampagnes reduce={reduce} />}
                {step === 3 && <SceneCRM reduce={reduce} />}
              </div>
              {!reduce && <FakeCursor x={cursor.x} y={cursor.y} tapKey={step} />}
            </div>

            {/* Barre de progression de la scène (bas de l'app) */}
            <div className="h-0.5 w-full bg-line/60 overflow-hidden">
              <DotFill key={step} className={NAV.find((n) => n.key === scene.active)?.dot || 'bg-violet-500'} reduce={reduce} />
            </div>
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

function CtaButton({ className, children }) {
  return (
    <div
      data-cta=""
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* Barre de progression temporisée (transition CSS pure). */
function DotFill({ className, reduce }) {
  const [w, setW] = useState(reduce ? 100 : 0);
  useEffect(() => {
    if (reduce) { setW(100); return; }
    const t = setTimeout(() => setW(100), 40);
    return () => clearTimeout(t);
  }, [reduce]);
  return (
    <span
      className={`block h-full ${className}`}
      style={{ width: `${w}%`, transition: reduce ? 'none' : `width ${STEP_MS}ms linear` }}
    />
  );
}

/* Curseur animé (SVG inline) positionné en px sur le bouton + halo de tap. */
function FakeCursor({ x, y, tapKey }) {
  return (
    <div
      data-demo-cursor=""
      className="pointer-events-none absolute z-30 transition-all duration-700 ease-out"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <span className="relative block">
        <span key={tapKey} className="absolute -left-3 -top-3 h-9 w-9 rounded-full bg-violet-500/25 animate-ping" />
        <svg width="22" height="22" viewBox="0 0 24 24" className="relative drop-shadow-md" aria-hidden="true">
          <path
            d="M5 3 L5 19 L9 15 L11.5 20.5 L13.7 19.4 L11.2 14.2 L17 14 Z"
            fill="#ffffff"
            stroke="#1f2937"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

/* ─── Scène 0 : Prospection (recherche) ─────────────────────────────────── */
function SceneProspection({ reduce }) {
  const typed = useTyping('Restaurants · Paris', !reduce);
  const count = useCountUp(234, !reduce);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* fausse barre de recherche */}
        <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-line bg-surface-alt px-2.5 py-1.5">
          <Search size={13} className="text-violet-500 flex-shrink-0" />
          <span className="text-xs text-content-primary truncate">
            {reduce ? 'Restaurants · Paris' : typed}
            {!reduce && typed.length < 19 && <span className="inline-block w-0.5 h-3 bg-violet-500 ml-0.5 align-middle animate-pulse" />}
          </span>
        </div>
        <div className="text-xs px-2 py-1 rounded-md bg-violet-100 text-violet-700 font-bold tabular-nums flex-shrink-0">{count}</div>
      </div>
      <div className="space-y-2">
        {ROWS.map((row, i) => (
          <div
            key={row.name}
            className="flex items-center justify-between gap-2 text-xs animate-in fade-in slide-in-from-right-2 fill-mode-both"
            style={reduce ? undefined : { animationDelay: `${500 + i * 360}ms`, animationDuration: '500ms' }}
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
      <div className="mt-auto pt-3 flex justify-center">
        <CtaButton className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <Search size={12} /> Lancer la recherche
        </CtaButton>
      </div>
    </div>
  );
}

/* ─── Scène 1 : Enrichissement ──────────────────────────────────────────── */
function SceneEnrich({ fill, reduce }) {
  const count = useCountUp(3, !reduce, 1600);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-content-primary">Enrichissement en cours…</div>
        <div className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-bold tabular-nums">{count} emails ✓</div>
      </div>

      <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
          style={{ width: reduce || fill ? '100%' : '8%', transition: 'width 2.6s ease-out' }}
        />
      </div>

      <div className="space-y-2">
        {ROWS.map((row, i) => (
          <div key={row.name} className="flex items-center justify-between gap-2 text-xs">
            <div className="font-medium text-content-primary truncate flex-1 min-w-0">{row.name}</div>
            <div
              className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 fill-mode-both"
              style={reduce ? undefined : { animationDelay: `${700 + i * 480}ms`, animationDuration: '400ms' }}
            >
              <span className="font-mono text-[10px] text-content-secondary truncate max-w-[110px]">{row.email}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                <CheckCircle2 size={8} /> Vérifié
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 flex justify-center">
        <CtaButton className="bg-gradient-to-r from-blue-600 to-cyan-600">
          <CheckCircle2 size={12} /> Enrichir tout (5)
        </CtaButton>
      </div>
    </div>
  );
}

/* ─── Scène 2 : Campagnes ───────────────────────────────────────────────── */
function SceneCampagnes({ reduce }) {
  const sent = useCountUp(234, !reduce, 1000);
  const open = useCountUp(47, !reduce, 1300);
  const rep = useCountUp(12, !reduce, 1600);
  const stats = [
    { label: 'Envoyés', value: sent, color: 'text-blue-700' },
    { label: 'Ouverts', value: open, color: 'text-emerald-600' },
    { label: 'Réponses', value: rep, color: 'text-violet-700' },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-content-primary">Campagne envoyée · cold email</div>
        <div className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-bold tabular-nums">{sent} envois</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl bg-surface-alt border border-line py-3 text-center animate-in fade-in zoom-in-95 fill-mode-both"
            style={reduce ? undefined : { animationDelay: `${150 + i * 200}ms`, animationDuration: '400ms' }}
          >
            <div className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-content-tertiary uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
        <span className="text-[11px] text-emerald-800 font-medium">12 réponses → ajoutées au CRM</span>
      </div>

      <div className="mt-auto pt-3 flex justify-center">
        <CtaButton className="bg-gradient-to-r from-blue-600 to-cyan-600">
          <Send size={12} /> Voir le rapport
        </CtaButton>
      </div>
    </div>
  );
}

/* ─── Scène 3 : CRM ─────────────────────────────────────────────────────── */
function SceneCRM({ reduce }) {
  const cols = [
    { name: 'Lead', accent: 'border-emerald-300 bg-emerald-50 text-emerald-800', deals: ['La Bonne Table'], fresh: true },
    { name: 'Qualifié', accent: 'border-line bg-surface-alt text-content-secondary', deals: ['Pasta Roma'] },
    { name: 'RDV', accent: 'border-line bg-surface-alt text-content-secondary', deals: ['Le Bistrot'] },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-semibold text-content-primary mb-3">Deals créés automatiquement</div>

      <div className="grid grid-cols-3 gap-2">
        {cols.map((col) => (
          <div key={col.name} className="flex flex-col">
            <div className="text-[9px] font-bold uppercase tracking-wider text-content-tertiary mb-1.5 px-1">{col.name}</div>
            <div className="flex flex-col gap-1.5">
              {col.deals.map((deal) => (
                <div
                  key={deal}
                  className={`rounded-lg border px-2 py-2 text-[10px] font-semibold text-center ${col.accent} ${
                    col.fresh && !reduce ? 'animate-in fade-in slide-in-from-top-2 fill-mode-both' : ''
                  }`}
                  style={col.fresh && !reduce ? { animationDelay: '450ms', animationDuration: '500ms' } : undefined}
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

      <div className="mt-auto pt-3 flex justify-center">
        <CtaButton className="bg-gradient-to-r from-emerald-600 to-teal-600">
          <Layers size={12} /> Ouvrir le deal
        </CtaButton>
      </div>
    </div>
  );
}
