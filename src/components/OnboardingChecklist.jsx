'use client';

// Widget onboarding persistant dans le dashboard.
// Affiche une liste de 5 étapes que l'user doit faire pour démarrer.
// Auto-fetch /api/onboarding/complete-step (GET) pour récupérer l'état.
// Disparait automatiquement quand toutes les étapes sont OK.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Circle, Search, Upload, Send, Download,
  User, ChevronDown, ChevronUp, X, Sparkles, ArrowRight,
} from 'lucide-react';

// adminOnly: true → l'étape n'est montrée qu'aux admins (features /admin
// non accessibles aux users standards aujourd'hui). À retirer le jour où
// CSV import et campagnes deviennent self-serve.
const STEPS = [
  {
    id: 'first_search',
    title: 'Lancez votre 1ère recherche',
    desc: 'Trouvez 50 prospects en 30 secondes : catégorie + département',
    icon: Search,
    // ?view=search déclenche handleViewChange dans le dashboard
    cta: { label: 'Démarrer une recherche', href: '/dashboard?view=search' },
  },
  {
    id: 'first_export',
    title: 'Exportez en CSV pour votre CRM',
    desc: 'Format HubSpot / Salesforce / Pipedrive prêt à l\'emploi',
    icon: Download,
    cta: { label: 'Voir mes leads', href: '/dashboard?view=results' },
  },
  {
    id: 'profile_completed',
    title: 'Complétez votre profil',
    desc: 'Ajoutez votre fonction et entreprise pour personnaliser les templates',
    icon: User,
    cta: { label: 'Aller aux réglages', href: '/settings' },
  },
  {
    id: 'first_csv_import',
    title: 'Importez votre 1ère liste CSV',
    desc: 'Récupérez vos contacts existants depuis Excel ou Notion',
    icon: Upload,
    cta: { label: 'Importer un CSV', href: '/admin/prospection' },
    adminOnly: true,
  },
  {
    id: 'first_campaign',
    title: 'Lancez votre 1ère campagne email',
    desc: 'Cold email avec templating {{first_name}} + footer RGPD auto',
    icon: Send,
    cta: { label: 'Créer une campagne', href: '/admin/prospection/campaigns/new' },
    adminOnly: true,
  },
];

export default function OnboardingChecklist({ isAdmin = false }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Local dismiss session (l'user peut masquer juste pour cette session)
    if (sessionStorage.getItem('onboarding_checklist_dismissed') === '1') {
      setDismissed(true);
    }
    (async () => {
      try {
        const res = await fetch('/api/onboarding/complete-step');
        if (res.ok) {
          const data = await res.json();
          setState(data);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Pas afficher pendant le chargement, après dismiss session, ou si tout est fait
  if (loading || dismissed || !state) return null;
  if (state.completed_at) return null;

  // Filtre admin-only pour les users standards (CSV import + campagnes
  // ne sont accessibles qu'aux admins aujourd'hui).
  const visibleSteps = STEPS.filter((s) => !s.adminOnly || isAdmin);
  const stepsDone = visibleSteps.filter((s) => state.steps?.[s.id]).length;
  const pct = Math.round((stepsDone / visibleSteps.length) * 100);

  function handleDismiss() {
    sessionStorage.setItem('onboarding_checklist_dismissed', '1');
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-violet-500/30 bg-gradient-to-br from-zinc-900 to-black shadow-2xl shadow-violet-900/20 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-white/[0.03] transition text-left"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white">Démarrez avec Prospectia</div>
            <div className="text-[11px] text-zinc-500 tabular-nums">{stepsDone}/{visibleSteps.length} étapes · {pct}%</div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="p-1 text-zinc-500 hover:text-zinc-200 transition"
            aria-label="Fermer pour cette session"
          >
            <X size={14} />
          </button>
          {collapsed ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.04]">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps list (collapsable) */}
      {!collapsed && (
        <ul className="divide-y divide-white/[0.04] max-h-[60vh] overflow-y-auto">
          {visibleSteps.map((step) => {
            const done = !!state.steps?.[step.id];
            const Icon = step.icon;
            return (
              <li key={step.id} className={`px-4 py-3 ${done ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {done ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <Circle size={16} className="text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-semibold leading-tight ${done ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-100'}`}>
                      {step.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                      {step.desc}
                    </div>
                    {!done && step.cta && (
                      <Link
                        href={step.cta.href}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-200 mt-1.5 transition"
                      >
                        <Icon size={11} />
                        {step.cta.label}
                        <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
