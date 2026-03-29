"use client";

import { useState, useRef, useEffect } from "react";
import { DEPTS, REGIONS, B2B_CATS, COPRO_CATS, B2B_GROUPS, COPRO_GROUPS, COUNTRIES, getRegionsForCountry, getDeptsForCountry } from "@/lib/constants";
import {
  Send, Square, Sparkles, MapPin, Building2, Home, Search, PenLine, Loader2,
  Plus, X, Play, RotateCcw, ChevronRight, FolderPlus, Folder, Zap,
  UtensilsCrossed, Briefcase, Building, Hotel, HardHat, ShoppingBag, ArrowRight,
  Lightbulb, Globe, User, Users, ExternalLink, Mail, Phone, Crown, Link2,
} from "lucide-react";

// LinkedIn SVG icon (lucide-react doesn't include brand icons)
function LinkedInIcon({ size = 16, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function BotMessage({ children, icon: Icon, delay = 0 }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  if (!visible) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={13} className="text-white" />
        </div>
        <div className="flex gap-1 py-3">
          <div className="w-1.5 h-1.5 bg-content-faint rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 bg-content-faint rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 bg-content-faint rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        {Icon ? <Icon size={13} className="text-white" /> : <Sparkles size={13} className="text-white" />}
      </div>
      <div className="flex-1 text-sm text-[#e4e4e7] leading-relaxed">{children}</div>
    </div>
  );
}

function UserMessage({ children }) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-xl px-4 py-2 text-sm text-indigo-300 max-w-[80%]">
        {children}
      </div>
    </div>
  );
}

function OptionChips({ options, selected, onToggle, colorClass = "indigo" }) {
  const colors = {
    indigo: { active: "bg-indigo-600/20 border-indigo-500/30 text-indigo-400", inactive: "border-line-hover text-content-tertiary hover:border-content-faint hover:text-content-secondary" },
    blue: { active: "bg-blue-600/20 border-blue-500/30 text-blue-400", inactive: "border-line-hover text-content-tertiary hover:border-content-faint hover:text-content-secondary" },
    purple: { active: "bg-purple-600/20 border-purple-500/30 text-purple-400", inactive: "border-line-hover text-content-tertiary hover:border-content-faint hover:text-content-secondary" },
  };
  const c = colors[colorClass] || colors.indigo;

  return (
    <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isActive = selected.includes(value);
        return (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={`px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 rounded-xl text-sm font-medium border transition-all active:scale-[0.97] ${isActive ? c.active : c.inactive}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

const FOLDER_COLORS = [
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
  { value: 'green', label: 'Vert', class: 'bg-green-500' },
  { value: 'amber', label: 'Ambre', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
];

function OnboardingHint({ storageKey, children }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(storageKey) === '1' || localStorage.getItem('onboarding_completed') != null;
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(storageKey, '1'); } catch {}
  };

  return (
    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] animate-gentle-glow">
      <div className="p-1.5 rounded-lg bg-indigo-500/15 flex-shrink-0 mt-0.5">
        <Lightbulb size={14} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-indigo-300 leading-relaxed">{children}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/15 transition flex-shrink-0"
      >
        Compris
      </button>
    </div>
  );
}

const QUICK_SEARCH_PRESETS = [
  {
    id: 'restaurants-paris',
    name: 'Restaurants a Paris',
    subtitle: '1 dept, 1 categorie',
    icon: UtensilsCrossed,
    type: 'b2b',
    depts: ['75'],
    cats: ['restaurant'],
  },
  {
    id: 'b2b-idf',
    name: 'B2B Ile-de-France',
    subtitle: '8 depts, toutes categories',
    icon: Briefcase,
    type: 'b2b',
    depts: ['75', '77', '78', '91', '92', '93', '94', '95'],
    cats: 'ALL_B2B',
  },
  {
    id: 'syndics-france',
    name: 'Syndics toute France',
    subtitle: '101 depts, toutes categories',
    icon: Building,
    type: 'copro',
    depts: 'ALL',
    cats: 'ALL_COPRO',
  },
  {
    id: 'hotels-cote-azur',
    name: "Hotels Cote d'Azur",
    subtitle: '3 depts, 4 categories',
    icon: Hotel,
    type: 'b2b',
    depts: ['06', '83', '13'],
    cats: ['hôtel', "chambre d'hôtes", 'résidence hôtelière', 'camping'],
  },
  {
    id: 'artisans-btp-lyon',
    name: 'Artisans BTP Lyon',
    subtitle: '1 dept, ' + (B2B_GROUPS['BTP & Construction']?.length || 0) + ' categories',
    icon: HardHat,
    type: 'b2b',
    depts: ['69'],
    cats: B2B_GROUPS['BTP & Construction'],
  },
  {
    id: 'commerces-bordeaux',
    name: 'Commerces Bordeaux',
    subtitle: '1 dept, ' + (B2B_GROUPS['Commerce & Distribution']?.length || 0) + ' categories',
    icon: ShoppingBag,
    type: 'b2b',
    depts: ['33'],
    cats: B2B_GROUPS['Commerce & Distribution'],
  },
];

export default function SearchPanel({
  onStartScraping,
  onStopScraping,
  isSearching,
  apiKeySet,
  searchProgress,
  folders = [],
  onCreateFolder,
}) {
  const [step, setStep] = useState(0);
  const [searchType, setSearchType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('FR');
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [customQueries, setCustomQueries] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('indigo');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const scrollRef = useRef(null);

  // ─── Company & LinkedIn search state ───────────────────
  const [companySearchMode, setCompanySearchMode] = useState(null); // 'company' | 'linkedin' | null
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [companySearching, setCompanySearching] = useState(false);
  const [companyResults, setCompanyResults] = useState(null);
  const [companyError, setCompanyError] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    }
  }, [step, searchType, selectedDepts, selectedCats, customQueries, confirmed, isSearching, showNewFolder, companySearchMode, companyResults]);

  const [deptSearch, setDeptSearch] = useState('');
  const [expandedRegions, setExpandedRegions] = useState(new Set());
  const [catSearch, setCatSearch] = useState('');
  const [expandedCatGroups, setExpandedCatGroups] = useState(new Set());

  const activeRegions = getRegionsForCountry(selectedCountry);
  const activeDepts = getDeptsForCountry(selectedCountry);

  const toggleRegion = (regionKey) => {
    const region = activeRegions[regionKey];
    if (!region) return;
    const allSelected = region.depts.every(d => selectedDepts.includes(d));
    if (allSelected) {
      setSelectedDepts(prev => prev.filter(d => !region.depts.includes(d)));
    } else {
      setSelectedDepts(prev => [...new Set([...prev, ...region.depts])]);
    }
  };

  const toggleRegionExpand = (regionKey) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(regionKey)) next.delete(regionKey); else next.add(regionKey);
      return next;
    });
  };

  const selectAllDepts = () => setSelectedDepts(Object.keys(activeDepts));
  const clearAllDepts = () => setSelectedDepts([]);

  const handleCountryChange = (code) => {
    setSelectedCountry(code);
    setSelectedDepts([]);
    setExpandedRegions(new Set());
    setDeptSearch('');
  };

  const handleTypeSelect = (type) => {
    setSearchType(type);
    setSelectedDepts([]);
    setStep(1);
  };

  const [freeSearchInput, setFreeSearchInput] = useState('');
  const [freeSearchTerms, setFreeSearchTerms] = useState([]);
  const [nlInput, setNlInput] = useState('');
  const [nlParsing, setNlParsing] = useState(false);
  const [nlError, setNlError] = useState('');

  const handleNlSubmit = async () => {
    if (!nlInput.trim() || nlParsing) return;
    setNlParsing(true);
    setNlError('');
    try {
      const res = await fetch('/api/parse-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      if (data.terms && data.terms.length > 0) {
        setFreeSearchTerms(data.terms);
        setSearchType('custom');
        setStep(1);
      }
    } catch (err) {
      setNlError(err.message || 'Erreur lors de l\'analyse');
    } finally {
      setNlParsing(false);
    }
  };

  const addFreeSearch = () => {
    if (freeSearchInput.trim()) {
      setFreeSearchTerms((prev) => [...prev, freeSearchInput.trim()]);
      setFreeSearchInput('');
    }
  };

  const toggleDept = (code) => {
    setSelectedDepts((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    );
  };

  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCatGroupExpand = (groupName) => {
    setExpandedCatGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const toggleCatGroup = (cats) => {
    setSelectedCats((prev) => {
      const allSelected = cats.every((c) => prev.includes(c));
      if (allSelected) return prev.filter((c) => !cats.includes(c));
      return [...new Set([...prev, ...cats])];
    });
  };

  const selectAllCats = (groups) => {
    const all = Object.values(groups).flat();
    setSelectedCats((prev) => [...new Set([...prev, ...all])]);
  };

  const clearAllCats = (groups) => {
    const all = Object.values(groups).flat();
    setSelectedCats((prev) => prev.filter((c) => !all.includes(c)));
  };

  const confirmDepts = () => {
    if (selectedDepts.length === 0) return;
    if (searchType === 'custom') {
      setSelectedCats([]);
      setStep(2); // goes to free search input
    } else {
      if (searchType === 'b2b') setSelectedCats([...B2B_CATS]);
      else if (searchType === 'copro') setSelectedCats([...COPRO_CATS]);
      else setSelectedCats([...B2B_CATS, ...COPRO_CATS]);
      setStep(2);
    }
  };

  const confirmCats = () => {
    if (searchType === 'custom') {
      if (freeSearchTerms.length === 0) return;
    } else {
      if (selectedCats.length === 0) return;
    }
    setStep(3);
  };

  const addCustom = () => {
    if (customInput.trim()) {
      setCustomQueries((prev) => [...prev, customInput.trim()]);
      setCustomInput('');
    }
  };

  const skipCustom = () => setStep(4);
  const confirmCustom = () => setStep(4);

  const selectFolder = (folder) => {
    setSelectedFolder(folder);
    setStep(5);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folder = await onCreateFolder(newFolderName.trim(), newFolderColor);
    if (folder) {
      setSelectedFolder(folder);
      setNewFolderName('');
      setShowNewFolder(false);
      setStep(5);
    }
  };

  const handleLaunch = () => {
    setConfirmed(true);
    const b2b = searchType === 'b2b' || searchType === 'both'
      ? selectedCats.filter((c) => B2B_CATS.includes(c))
      : [];
    const copro = searchType === 'copro' || searchType === 'both'
      ? selectedCats.filter((c) => COPRO_CATS.includes(c))
      : [];
    const allCustom = searchType === 'custom'
      ? [...freeSearchTerms, ...customQueries]
      : customQueries;
    onStartScraping(selectedDepts, b2b, copro, allCustom, selectedFolder?.id);
  };

  const handleReset = () => {
    setStep(0);
    setSearchType(null);
    setSelectedCountry('FR');
    setSelectedDepts([]);
    setSelectedCats([]);
    setCustomQueries([]);
    setCustomInput('');
    setFreeSearchTerms([]);
    setFreeSearchInput('');
    setNlInput('');
    setNlError('');
    setSelectedFolder(null);
    setNewFolderName('');
    setShowNewFolder(false);
    setConfirmed(false);
  };

  // ─── Company contacts / LinkedIn search ─────────────────
  const handleCompanySearch = async () => {
    if (companySearchMode === 'linkedin') {
      if (!linkedinUrl.trim()) return;
      // Validate LinkedIn URL
      if (!linkedinUrl.includes('linkedin.com/in/')) {
        setCompanyError('URL LinkedIn invalide. Format attendu : https://linkedin.com/in/nom-prenom');
        return;
      }
    } else {
      if (!companyName.trim() && !companyDomain.trim()) return;
    }

    setCompanySearching(true);
    setCompanyError('');
    setCompanyResults(null);

    try {
      const body = companySearchMode === 'linkedin'
        ? { linkedin_url: linkedinUrl.trim() }
        : {
          company_name: companyName.trim() || undefined,
          company_domain: companyDomain.trim() || undefined,
        };

      const res = await fetch('/api/company-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setCompanyError(data.error || `Erreur ${res.status}`);
        return;
      }

      setCompanyResults(data);
    } catch (err) {
      setCompanyError(err.message || 'Erreur de connexion');
    } finally {
      setCompanySearching(false);
    }
  };

  const resetCompanySearch = () => {
    setCompanySearchMode(null);
    setCompanyName('');
    setCompanyDomain('');
    setLinkedinUrl('');
    setCompanyResults(null);
    setCompanyError('');
  };

  const handlePresetSearch = (preset) => {
    const depts = preset.depts === 'ALL' ? Object.keys(DEPTS) : preset.depts;
    let cats;
    if (preset.cats === 'ALL_B2B') cats = [...B2B_CATS];
    else if (preset.cats === 'ALL_COPRO') cats = [...COPRO_CATS];
    else cats = [...preset.cats];

    setSearchType(preset.type);
    setSelectedDepts(depts);
    setSelectedCats(cats);
    setCustomQueries([]);
    setCustomInput('');
    setFreeSearchTerms([]);
    setFreeSearchInput('');
    setNlInput('');
    setNlError('');
    setSelectedFolder(null);
    setNewFolderName('');
    setShowNewFolder(false);
    setConfirmed(false);
    setStep(4);
  };

  const b2bCount = selectedCats.filter((c) => B2B_CATS.includes(c)).length;
  const coproCount = selectedCats.filter((c) => COPRO_CATS.includes(c)).length;
  const totalQueries = selectedDepts.length * selectedCats.length + customQueries.length;

  const progress = searchProgress?.total > 0
    ? (searchProgress.current / searchProgress.total) * 100
    : 0;

  const folderColorClass = (color) => {
    const map = { indigo: 'bg-indigo-500', blue: 'bg-blue-500', purple: 'bg-purple-500', green: 'bg-green-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
    return map[color] || map.indigo;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-content-primary mb-1">Recherche</h2>
        <p className="text-sm text-content-muted">Definissez votre cible en quelques etapes</p>
      </div>

      {!apiKeySet && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
          <Sparkles size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Configuration requise</p>
            <p className="text-xs text-content-tertiary mt-1">
              Definissez <code className="px-1.5 py-0.5 rounded bg-surface-elevated text-content-secondary text-[11px]">GOOGLE_PLACES_API_KEY</code> dans les variables Vercel.
            </p>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="rounded-2xl border border-line bg-surface-card overflow-hidden"
      >
        <div className="p-3 sm:p-5 space-y-4 sm:space-y-5 max-h-[calc(100vh-9rem)] overflow-y-auto">

          {/* Step 1: Type */}
          <BotMessage>
            Quel type de prospects recherchez-vous ?
          </BotMessage>

          {/* Onboarding hint for new users */}
          {step === 0 && !searchType && (
            <div className="pl-2 sm:pl-10">
              <OnboardingHint storageKey="hint_search_dismissed">
                Commencez par une recherche rapide pour decouvrir la plateforme
              </OnboardingHint>
            </div>
          )}

          {/* Quick search presets */}
          {step === 0 && !searchType && (
            <div className="pl-2 sm:pl-10 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Recherches rapides</span>
              </div>
              <p className="text-[10px] text-content-muted -mt-1">Lancez une recherche en 1 clic</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_SEARCH_PRESETS.map((preset) => {
                  const PresetIcon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSearch(preset)}
                      className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all active:scale-[0.97] text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition">
                        <PresetIcon size={15} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-content-primary truncate">{preset.name}</div>
                        <div className="text-[10px] text-content-muted">{preset.subtitle}</div>
                      </div>
                      <ArrowRight size={14} className="text-amber-500/40 group-hover:text-amber-400 transition flex-shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[10px] text-content-faint uppercase tracking-wider font-medium">ou configurez votre recherche</span>
                <div className="flex-1 h-px bg-line" />
              </div>
            </div>
          )}

          {step === 0 && !searchType && (
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pl-2 sm:pl-10 animate-in fade-in duration-300">
              <button
                onClick={() => handleTypeSelect('b2b')}
                className="flex items-center gap-2 px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-line-hover text-sm font-medium text-content-secondary hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-600/10 transition-all active:scale-[0.97]"
              >
                <Building2 size={15} />
                B2B — Entreprises
              </button>
              <button
                onClick={() => handleTypeSelect('copro')}
                className="flex items-center gap-2 px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-line-hover text-sm font-medium text-content-secondary hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-600/10 transition-all active:scale-[0.97]"
              >
                <Home size={15} />
                Copropriete — Syndics
              </button>
              <button
                onClick={() => handleTypeSelect('both')}
                className="flex items-center gap-2 px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-line-hover text-sm font-medium text-content-secondary hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all active:scale-[0.97]"
              >
                <Sparkles size={15} />
                Les deux
              </button>
            </div>
          )}

          {step === 0 && !searchType && (
            <div className="pl-2 sm:pl-10 space-y-2 animate-in fade-in duration-500">
              <p className="text-[10px] uppercase tracking-wider text-content-faint font-semibold">ou decrivez ce que vous cherchez</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <PenLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
                  <input
                    type="text"
                    value={nlInput}
                    onChange={(e) => setNlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNlSubmit()}
                    placeholder="Ex: je cherche des restaurants haut de gamme et des hotels 4 etoiles..."
                    disabled={nlParsing}
                    className="w-full pl-9 pr-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-line-hover bg-surface-input text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-amber-500/40 transition disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleNlSubmit}
                  disabled={!nlInput.trim() || nlParsing}
                  className="px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {nlParsing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {nlParsing ? 'Analyse...' : 'Analyser'}
                </button>
              </div>
              {nlError && (
                <p className="text-xs text-red-400">{nlError}</p>
              )}
            </div>
          )}

          {/* ─── Company & LinkedIn direct search ─────────────── */}
          {step === 0 && !searchType && (
            <div className="pl-2 sm:pl-10 space-y-3 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[10px] text-content-faint uppercase tracking-wider font-medium">Prospection ciblee</span>
                <div className="flex-1 h-px bg-line" />
              </div>

              {!companySearchMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setCompanySearchMode('company')}
                    className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all active:scale-[0.97] text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition">
                      <Building2 size={15} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-content-primary">Recherche entreprise</div>
                      <div className="text-[10px] text-content-muted">Trouver les contacts cles</div>
                    </div>
                    <ArrowRight size={14} className="text-emerald-500/40 group-hover:text-emerald-400 transition flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => setCompanySearchMode('linkedin')}
                    className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all active:scale-[0.97] text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition">
                      <LinkedInIcon size={15} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-content-primary">Profil LinkedIn</div>
                      <div className="text-[10px] text-content-muted">Enrichir un profil LinkedIn</div>
                    </div>
                    <ArrowRight size={14} className="text-blue-500/40 group-hover:text-blue-400 transition flex-shrink-0" />
                  </button>
                </div>
              )}

              {/* Company search form */}
              {companySearchMode === 'company' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">Recherche entreprise</span>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCompanySearch()}
                        placeholder="Nom de l'entreprise (ex: Decathlon, BNP Paribas...)"
                        className="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-xl border border-line-hover bg-surface-input text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-emerald-500/40 transition"
                      />
                    </div>
                    <div className="relative">
                      <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
                      <input
                        type="text"
                        value={companyDomain}
                        onChange={(e) => setCompanyDomain(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCompanySearch()}
                        placeholder="Domaine (ex: decathlon.fr) — optionnel"
                        className="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-xl border border-line-hover bg-surface-input text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-emerald-500/40 transition"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCompanySearch}
                      disabled={(!companyName.trim() && !companyDomain.trim()) || companySearching}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-surface-elevated disabled:text-content-faint text-white text-sm font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed"
                    >
                      {companySearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      {companySearching ? 'Recherche...' : 'Trouver les contacts'}
                    </button>
                    <button
                      onClick={resetCompanySearch}
                      className="px-3 py-2.5 min-h-[44px] rounded-xl border border-line-hover text-content-muted hover:text-content-secondary transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* LinkedIn search form */}
              {companySearchMode === 'linkedin' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <LinkedInIcon size={14} className="text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">Enrichissement profil LinkedIn</span>
                  </div>
                  <div className="relative">
                    <LinkedInIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCompanySearch()}
                      placeholder="https://linkedin.com/in/prenom-nom"
                      className="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-xl border border-line-hover bg-surface-input text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-blue-500/40 transition"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCompanySearch}
                      disabled={!linkedinUrl.trim() || companySearching}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-surface-elevated disabled:text-content-faint text-white text-sm font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed"
                    >
                      {companySearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      {companySearching ? 'Recherche...' : 'Enrichir le profil'}
                    </button>
                    <button
                      onClick={resetCompanySearch}
                      className="px-3 py-2.5 min-h-[44px] rounded-xl border border-line-hover text-content-muted hover:text-content-secondary transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {companyError && (
                <p className="text-xs text-red-400 pl-1">{companyError}</p>
              )}

              {/* Results */}
              {companyResults && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {/* Company info card */}
                  {companyResults.company && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">{companyResults.company.name || 'Entreprise'}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-content-secondary">
                        {companyResults.company.industry && (
                          <span>Secteur: {companyResults.company.industry}</span>
                        )}
                        {companyResults.company.employees && (
                          <span>Employes: ~{companyResults.company.employees}</span>
                        )}
                        {companyResults.company.domain && (
                          <span className="flex items-center gap-1">
                            <Globe size={10} />
                            {companyResults.company.domain}
                          </span>
                        )}
                        {companyResults.company.linkedin_url && (
                          <a
                            href={companyResults.company.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                          >
                            <LinkedInIcon size={10} />
                            LinkedIn
                            <ExternalLink size={9} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contacts list */}
                  {companyResults.contacts?.length > 0 ? (
                    <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-content-muted" />
                        <span className="text-[10px] uppercase tracking-wider text-content-faint font-semibold">
                          {companyResults.contacts.length} contact{companyResults.contacts.length > 1 ? 's' : ''} trouve{companyResults.contacts.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      {companyResults.contacts.map((contact, i) => (
                        <div key={i} className="rounded-xl border border-line bg-surface-card p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <User size={13} className="text-indigo-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-content-primary">
                                  {contact.name || 'Contact'}
                                </div>
                                {contact.title && (
                                  <div className="text-[10px] text-content-muted">{contact.title}</div>
                                )}
                              </div>
                            </div>
                            {contact.linkedin_url && (
                              <a
                                href={contact.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition"
                              >
                                <LinkedInIcon size={14} />
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {contact.email && (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <Mail size={10} />
                                {contact.email}
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                <Phone size={10} />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                          {contact.company && (
                            <div className="text-[10px] text-content-faint">
                              {contact.company}{contact.company_domain ? ` (${contact.company_domain})` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {companyResults.source && (
                      <div className="text-[10px] text-content-faint text-right">
                        Source : {companyResults.source === 'apollo' ? 'Apollo.io' : companyResults.source === 'serper' ? 'Serper.dev' : companyResults.source.includes('guess') ? 'Email deviné (pattern)' : companyResults.source}
                      </div>
                    )}
                  </>
                  ) : (
                    <div className="text-center py-4 text-sm text-content-muted">
                      Aucun contact trouve. Essayez avec un nom d'entreprise different ou ajoutez le domaine.
                    </div>
                  )}

                  {/* New search button */}
                  <button
                    onClick={resetCompanySearch}
                    className="flex items-center gap-2 text-sm text-content-muted hover:text-content-secondary transition"
                  >
                    <RotateCcw size={13} />
                    Nouvelle recherche
                  </button>
                </div>
              )}
            </div>
          )}

          {searchType && (
            <UserMessage>
              {searchType === 'b2b' ? 'B2B — Entreprises' : searchType === 'copro' ? 'Copropriete — Syndics' : searchType === 'custom' ? `"${nlInput}"` : 'B2B + Copropriete'}
            </UserMessage>
          )}

          {/* Step 2: Country + Departments */}
          {step >= 1 && (
            <>
              <BotMessage icon={MapPin} delay={step === 1 ? 400 : 0}>
                <div>
                  Dans quel pays et quelles zones ? <span className="text-content-muted">Selectionnez un pays puis les regions</span>
                </div>
              </BotMessage>

              {step === 1 && (
                <div className="pl-2 sm:pl-10 space-y-3">
                  {/* Country selector */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(COUNTRIES).map(([code, country]) => (
                      <button
                        key={code}
                        onClick={() => handleCountryChange(code)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 rounded-xl text-sm font-medium border transition-all active:scale-[0.97] ${
                          selectedCountry === code
                            ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                            : 'border-line-hover text-content-tertiary hover:border-content-faint hover:text-content-secondary'
                        }`}
                      >
                        <span className="text-base">{country.flag}</span>
                        {country.name}
                        <span className="text-[10px] text-content-faint font-mono">{country.zones}</span>
                      </button>
                    ))}
                  </div>

                  {/* Search + quick actions */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-faint" />
                      <input
                        type="text"
                        value={deptSearch}
                        onChange={(e) => setDeptSearch(e.target.value)}
                        placeholder={selectedCountry === 'FR' ? 'Rechercher un departement...' : selectedCountry === 'CH' ? 'Rechercher un canton...' : 'Rechercher une province...'}
                        className="w-full pl-8 pr-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 bg-surface-card border border-line rounded-lg text-xs text-content-primary placeholder-content-faint focus:outline-none focus:border-indigo-500/30 transition"
                      />
                    </div>
                    <button onClick={selectAllDepts} className="px-2.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 rounded-lg bg-surface-card border border-line text-[10px] text-content-muted hover:text-content-primary transition whitespace-nowrap">
                      Tout
                    </button>
                    <button onClick={clearAllDepts} className="px-2.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 rounded-lg bg-surface-card border border-line text-[10px] text-content-muted hover:text-content-primary transition whitespace-nowrap">
                      Aucun
                    </button>
                  </div>
                  {/* Selected count */}
                  {selectedDepts.length > 0 && (
                    <div className="text-[10px] text-indigo-400 font-medium">
                      {COUNTRIES[selectedCountry]?.flag} {selectedDepts.length} {selectedCountry === 'FR' ? 'departement' : selectedCountry === 'CH' ? 'canton' : 'province'}{selectedDepts.length > 1 ? 's' : ''} selectionne{selectedDepts.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {/* Regions */}
                  <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-1 pr-1 -webkit-overflow-scrolling-touch">
                    {Object.entries(activeRegions).map(([key, region]) => {
                      const q = deptSearch.toLowerCase();
                      const matchingDepts = region.depts.filter(code => {
                        const d = activeDepts[code];
                        if (!d) return false;
                        if (!q) return true;
                        return code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || region.name.toLowerCase().includes(q);
                      });
                      if (matchingDepts.length === 0) return null;
                      const allSelected = matchingDepts.every(d => selectedDepts.includes(d));
                      const someSelected = matchingDepts.some(d => selectedDepts.includes(d));
                      const isExpanded = expandedRegions.has(key) || deptSearch.length > 0;
                      return (
                        <div key={key} className="rounded-lg border border-line overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 bg-surface-card hover:bg-surface-hover transition cursor-pointer"
                            onClick={() => toggleRegionExpand(key)}>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleRegion(key); }}
                              className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition ${
                                allSelected ? 'bg-indigo-600 border-indigo-600 text-white' :
                                someSelected ? 'bg-indigo-600/30 border-indigo-500 text-white' :
                                'border-content-faint bg-transparent'
                              }`}
                            >
                              {allSelected ? '✓' : someSelected ? '−' : ''}
                            </button>
                            <span className="text-xs font-medium text-content-primary flex-1">{region.name}</span>
                            <span className="text-[10px] text-content-muted font-mono">
                              {matchingDepts.filter(d => selectedDepts.includes(d)).length}/{matchingDepts.length}
                            </span>
                            <ChevronRight size={12} className={`text-content-faint transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                          {isExpanded && (
                            <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-surface-base border-t border-line">
                              {matchingDepts.map(code => {
                                const d = activeDepts[code];
                                const isSelected = selectedDepts.includes(code);
                                return (
                                  <button
                                    key={code}
                                    onClick={() => toggleDept(code)}
                                    className={`px-2 py-1 rounded-md border text-[10px] font-medium transition ${
                                      isSelected
                                        ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                                        : 'border-line text-content-muted hover:border-content-faint hover:text-content-secondary'
                                    }`}
                                  >
                                    {d.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={confirmDepts}
                    disabled={selectedDepts.length === 0}
                    className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition disabled:text-content-faint disabled:cursor-not-allowed min-h-[44px] sm:min-h-0"
                  >
                    Continuer <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {step > 1 && (
                <UserMessage>
                  {COUNTRIES[selectedCountry]?.flag} {selectedDepts.length > 10
                    ? `${selectedDepts.length} zones selectionnees`
                    : selectedDepts.map((d) => activeDepts[d]?.name || d).join(', ')}
                </UserMessage>
              )}
            </>
          )}

          {/* Step 3: Categories or Free Search */}
          {step >= 2 && (
            <>
              {searchType === 'custom' ? (
                <BotMessage icon={PenLine} delay={step === 2 ? 400 : 0}>
                  <div>
                    Quels types d'entreprises recherchez-vous ? <span className="text-content-muted">Tapez vos termes de recherche</span>
                  </div>
                </BotMessage>
              ) : (
                <BotMessage icon={searchType === 'copro' ? Home : Building2} delay={step === 2 ? 400 : 0}>
                  <div>
                    Quelles categories ? <span className="text-content-muted">(toutes selectionnees par defaut)</span>
                  </div>
                </BotMessage>
              )}

              {step === 2 && searchType === 'custom' && (
                <div className="pl-2 sm:pl-10 space-y-3 animate-in fade-in duration-300">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={freeSearchInput}
                      onChange={(e) => setFreeSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addFreeSearch()}
                      placeholder="Ex: boulangerie, coiffeur, cabinet comptable, salle de sport..."
                      className="flex-1 bg-surface-deep border border-line rounded-xl px-4 py-3 sm:py-2.5 min-h-[44px] text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-amber-500/40 transition"
                    />
                    <button
                      onClick={addFreeSearch}
                      disabled={!freeSearchInput.trim()}
                      className="px-3 py-3 sm:py-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-line-hover text-content-secondary transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {freeSearchTerms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {freeSearchTerms.map((t, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                          {t}
                          <button onClick={() => setFreeSearchTerms((prev) => prev.filter((_, idx) => idx !== i))} className="text-amber-600 hover:text-amber-300">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={confirmCats}
                    disabled={freeSearchTerms.length === 0}
                    className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition disabled:text-content-faint disabled:cursor-not-allowed"
                  >
                    Continuer <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {step === 2 && searchType !== 'custom' && (
                <div className="pl-2 sm:pl-10 space-y-3">
                  {/* Search + select/deselect */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-faint" />
                      <input
                        type="text"
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="Rechercher une catégorie..."
                        className="w-full pl-7 pr-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg bg-surface-input border border-line text-xs text-content-primary placeholder:text-content-faint focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  {/* B2B groups */}
                  {(searchType === 'b2b' || searchType === 'both') && (
                    <div className="space-y-1">
                      {searchType === 'both' && (
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-wider text-blue-400/60 font-semibold">B2B — Entreprises</p>
                          <div className="flex gap-2">
                            <button onClick={() => selectAllCats(B2B_GROUPS)} className="text-[10px] text-blue-400/60 hover:text-blue-400 transition">Tout</button>
                            <button onClick={() => clearAllCats(B2B_GROUPS)} className="text-[10px] text-content-faint hover:text-content-secondary transition">Aucun</button>
                          </div>
                        </div>
                      )}
                      {searchType === 'b2b' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => selectAllCats(B2B_GROUPS)} className="text-[10px] text-blue-400/60 hover:text-blue-400 transition">Tout sélectionner</button>
                          <button onClick={() => clearAllCats(B2B_GROUPS)} className="text-[10px] text-content-faint hover:text-content-secondary transition">Tout désélectionner</button>
                        </div>
                      )}
                      {Object.entries(B2B_GROUPS).map(([groupName, cats]) => {
                        const q = catSearch.toLowerCase();
                        const matchingCats = q ? cats.filter((c) => c.toLowerCase().includes(q)) : cats;
                        if (matchingCats.length === 0) return null;
                        const selectedInGroup = matchingCats.filter((c) => selectedCats.includes(c)).length;
                        const isExpanded = expandedCatGroups.has(groupName) || !!catSearch;
                        return (
                          <div key={groupName} className="rounded-lg border border-line overflow-hidden">
                            <button
                              onClick={() => toggleCatGroupExpand(groupName)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-surface-card hover:bg-surface-hover transition"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight size={12} className={`text-content-faint transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                <span className="text-xs font-medium text-content-primary">{groupName}</span>
                                <span className="text-[10px] text-content-faint">({selectedInGroup}/{matchingCats.length})</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleCatGroup(matchingCats); }}
                                className={`text-[10px] px-2 py-0.5 rounded-md transition ${
                                  selectedInGroup === matchingCats.length
                                    ? 'text-blue-400 bg-blue-500/10'
                                    : 'text-content-faint hover:text-content-secondary'
                                }`}
                              >
                                {selectedInGroup === matchingCats.length ? 'Désélect.' : 'Tout'}
                              </button>
                            </button>
                            {isExpanded && (
                              <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-surface-base border-t border-line">
                                {matchingCats.map((cat) => {
                                  const isSelected = selectedCats.includes(cat);
                                  return (
                                    <button
                                      key={cat}
                                      onClick={() => toggleCat(cat)}
                                      className={`px-2 py-1 rounded-md border text-[10px] font-medium transition ${
                                        isSelected
                                          ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                                          : 'border-line text-content-muted hover:border-content-faint hover:text-content-secondary'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Copro groups */}
                  {(searchType === 'copro' || searchType === 'both') && (
                    <div className="space-y-1">
                      {searchType === 'both' && (
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-[10px] uppercase tracking-wider text-purple-400/60 font-semibold">Copropriété — Syndics</p>
                          <div className="flex gap-2">
                            <button onClick={() => selectAllCats(COPRO_GROUPS)} className="text-[10px] text-purple-400/60 hover:text-purple-400 transition">Tout</button>
                            <button onClick={() => clearAllCats(COPRO_GROUPS)} className="text-[10px] text-content-faint hover:text-content-secondary transition">Aucun</button>
                          </div>
                        </div>
                      )}
                      {searchType === 'copro' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => selectAllCats(COPRO_GROUPS)} className="text-[10px] text-purple-400/60 hover:text-purple-400 transition">Tout sélectionner</button>
                          <button onClick={() => clearAllCats(COPRO_GROUPS)} className="text-[10px] text-content-faint hover:text-content-secondary transition">Tout désélectionner</button>
                        </div>
                      )}
                      {Object.entries(COPRO_GROUPS).map(([groupName, cats]) => {
                        const q = catSearch.toLowerCase();
                        const matchingCats = q ? cats.filter((c) => c.toLowerCase().includes(q)) : cats;
                        if (matchingCats.length === 0) return null;
                        const selectedInGroup = matchingCats.filter((c) => selectedCats.includes(c)).length;
                        const isExpanded = expandedCatGroups.has(groupName) || !!catSearch;
                        return (
                          <div key={groupName} className="rounded-lg border border-line overflow-hidden">
                            <button
                              onClick={() => toggleCatGroupExpand(groupName)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-surface-card hover:bg-surface-hover transition"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight size={12} className={`text-content-faint transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                <span className="text-xs font-medium text-content-primary">{groupName}</span>
                                <span className="text-[10px] text-content-faint">({selectedInGroup}/{matchingCats.length})</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleCatGroup(matchingCats); }}
                                className={`text-[10px] px-2 py-0.5 rounded-md transition ${
                                  selectedInGroup === matchingCats.length
                                    ? 'text-purple-400 bg-purple-500/10'
                                    : 'text-content-faint hover:text-content-secondary'
                                }`}
                              >
                                {selectedInGroup === matchingCats.length ? 'Désélect.' : 'Tout'}
                              </button>
                            </button>
                            {isExpanded && (
                              <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-surface-base border-t border-line">
                                {matchingCats.map((cat) => {
                                  const isSelected = selectedCats.includes(cat);
                                  return (
                                    <button
                                      key={cat}
                                      onClick={() => toggleCat(cat)}
                                      className={`px-2 py-1 rounded-md border text-[10px] font-medium transition ${
                                        isSelected
                                          ? 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                                          : 'border-line text-content-muted hover:border-content-faint hover:text-content-secondary'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={confirmCats}
                    disabled={selectedCats.length === 0}
                    className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition disabled:text-content-faint disabled:cursor-not-allowed"
                  >
                    Continuer <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {step > 2 && (
                <UserMessage>
                  {searchType === 'custom'
                    ? `${freeSearchTerms.length} terme${freeSearchTerms.length > 1 ? 's' : ''} de recherche`
                    : <>
                        {selectedCats.length} categories selectionnees
                        {searchType === 'both' && ` (${b2bCount} B2B, ${coproCount} Copro)`}
                      </>
                  }
                </UserMessage>
              )}
            </>
          )}

          {/* Step 4: Custom queries */}
          {step >= 3 && (
            <>
              <BotMessage icon={Search} delay={step === 3 ? 400 : 0}>
                Voulez-vous ajouter des recherches personnalisees ? <span className="text-content-muted">(optionnel)</span>
              </BotMessage>

              {step === 3 && (
                <div className="pl-10 space-y-3 animate-in fade-in duration-300">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                      placeholder="Ex: plombier Paris, notaire Lyon, garage 33..."
                      className="flex-1 bg-surface-deep border border-line rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-indigo-500/40 transition"
                    />
                    <button
                      onClick={addCustom}
                      disabled={!customInput.trim()}
                      className="px-3 py-2.5 rounded-xl bg-surface-elevated hover:bg-line-hover text-content-secondary transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {customQueries.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customQueries.map((q, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                          {q}
                          <button onClick={() => setCustomQueries((prev) => prev.filter((_, idx) => idx !== i))} className="text-amber-600 hover:text-amber-300">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    {customQueries.length > 0 ? (
                      <button onClick={confirmCustom} className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition">
                        Continuer <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button onClick={skipCustom} className="flex items-center gap-1.5 text-sm font-medium text-content-muted hover:text-content-secondary transition">
                        Passer <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step > 3 && customQueries.length > 0 && (
                <UserMessage>
                  {customQueries.length} recherche{customQueries.length > 1 ? 's' : ''} personnalisee{customQueries.length > 1 ? 's' : ''}
                </UserMessage>
              )}
              {step > 3 && customQueries.length === 0 && (
                <UserMessage>Pas de recherche personnalisee</UserMessage>
              )}
            </>
          )}

          {/* Step 5: Folder selection */}
          {step >= 4 && (
            <>
              <BotMessage icon={Folder} delay={step === 4 ? 400 : 0}>
                Dans quelle liste stocker ces leads ?
              </BotMessage>

              {step === 4 && (
                <div className="pl-10 space-y-3 animate-in fade-in duration-300">
                  {/* Existing folders */}
                  {folders.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {folders.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => selectFolder(f)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line-hover text-sm font-medium text-content-secondary hover:border-indigo-500/30 hover:text-[#e4e4e7] hover:bg-surface-elevated transition-all active:scale-[0.97]"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${folderColorClass(f.color)}`} />
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Create new folder */}
                  {!showNewFolder ? (
                    <button
                      onClick={() => setShowNewFolder(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-line-hover text-sm font-medium text-content-muted hover:border-indigo-500/30 hover:text-indigo-400 transition-all active:scale-[0.97]"
                    >
                      <FolderPlus size={15} />
                      Creer une nouvelle liste
                    </button>
                  ) : (
                    <div className="rounded-xl bg-surface-deep border border-line p-4 space-y-3">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="Nom de la liste..."
                        autoFocus
                        className="w-full bg-transparent border border-line rounded-lg px-3 py-2 text-sm text-content-primary placeholder-content-faint focus:outline-none focus:border-indigo-500/40 transition"
                      />
                      <div className="flex gap-2">
                        {FOLDER_COLORS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setNewFolderColor(c.value)}
                            className={`w-6 h-6 rounded-full ${c.class} transition-all ${newFolderColor === c.value ? 'ring-2 ring-offset-2 ring-offset-surface-deep ring-white/30 scale-110' : 'opacity-50 hover:opacity-80'}`}
                            title={c.label}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateFolder}
                          disabled={!newFolderName.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                          Creer
                        </button>
                        <button
                          onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs text-content-muted hover:text-content-secondary transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step > 4 && selectedFolder && (
                <UserMessage>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${folderColorClass(selectedFolder.color)}`} />
                    {selectedFolder.name}
                  </span>
                </UserMessage>
              )}
            </>
          )}

          {/* Step 6: Confirm & Launch */}
          {step >= 5 && !confirmed && (
            <BotMessage icon={Sparkles} delay={400}>
              <div className="space-y-3">
                <p>Votre recherche est prete.</p>
                <div className="rounded-xl bg-surface-deep border border-line p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-content-muted">Departements</span>
                    <span className="text-content-secondary font-mono">{selectedDepts.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-content-muted">Categories</span>
                    <span className="text-content-secondary font-mono">{selectedCats.length}</span>
                  </div>
                  {customQueries.length > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-content-muted">Custom</span>
                      <span className="text-content-secondary font-mono">{customQueries.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-content-muted">Liste</span>
                    <span className="text-content-secondary flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${folderColorClass(selectedFolder?.color)}`} />
                      {selectedFolder?.name}
                    </span>
                  </div>
                  <div className="border-t border-line pt-2 flex justify-between text-xs">
                    <span className="text-content-tertiary font-medium">Total requetes</span>
                    <span className="text-indigo-400 font-bold font-mono">{totalQueries}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleLaunch}
                    disabled={!apiKeySet}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-surface-elevated disabled:text-content-faint text-white font-semibold text-sm transition-all disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 disabled:shadow-none active:scale-[0.97]"
                  >
                    <Play size={14} />
                    Lancer
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line-hover text-sm text-content-muted hover:text-content-secondary hover:border-content-faint transition active:scale-[0.97]"
                  >
                    <RotateCcw size={14} />
                    Recommencer
                  </button>
                </div>
              </div>
            </BotMessage>
          )}

          {/* Search in progress */}
          {isSearching && (
            <BotMessage icon={Search}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-content-secondary">
                    {searchProgress?.currentQuery || "Initialisation..."}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-content-faint">
                  <span>{searchProgress?.current}/{searchProgress?.total}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <button
                  onClick={onStopScraping}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 text-red-400 text-sm font-medium transition active:scale-[0.97]"
                >
                  <Square size={14} />
                  Arreter
                </button>
              </div>
            </BotMessage>
          )}

          {/* Search complete */}
          {confirmed && !isSearching && (
            <BotMessage icon={Sparkles}>
              <div className="space-y-3">
                <p>Recherche terminee !</p>
                {searchProgress?.logs?.length > 0 && (
                  <p className="text-content-muted text-xs">
                    {searchProgress.logs[searchProgress.logs.length - 1]}
                  </p>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line-hover text-sm text-content-muted hover:text-content-secondary hover:border-content-faint transition active:scale-[0.97]"
                >
                  <RotateCcw size={14} />
                  Nouvelle recherche
                </button>
              </div>
            </BotMessage>
          )}
        </div>

        {/* Logs */}
        {isSearching && searchProgress?.logs?.length > 0 && (
          <details className="border-t border-line">
            <summary className="px-5 py-2.5 text-[10px] uppercase tracking-wider text-content-faint font-semibold cursor-pointer hover:text-content-muted">
              Logs ({searchProgress.logs.length})
            </summary>
            <div className="px-5 pb-4 max-h-40 overflow-y-auto">
              <div className="font-mono text-[11px] text-content-faint space-y-0.5">
                {searchProgress.logs.slice(-20).map((log, i) => (
                  <div key={i} className={log.startsWith('Error') ? 'text-red-400/60' : ''}>
                    <span className="text-content-dim mr-2">{String(i + 1).padStart(2, '0')}</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
