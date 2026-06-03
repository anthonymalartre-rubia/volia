'use client';

// ─────────────────────────────────────────────────────────────────────
// LivePipelinePanel — "ce que l'Autopilot a fait pour toi" (aujourd'hui + 7j).
// Monté en tête de /app/autopilot. Rend la valeur visible.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Loader2, Search, Mail, ClipboardCheck, Flame, Database } from 'lucide-react';

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex-1 min-w-[120px] rounded-xl border border-line bg-surface-base px-3 py-3">
      <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${accent || 'text-content-soft'}`}>
        <Icon size={12} /> {label}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums text-content-strong">{value}</p>
    </div>
  );
}

export default function LivePipelinePanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/app/autopilot/stats')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { if (d.success) setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-surface-card p-4 flex items-center gap-2 text-sm text-content-soft">
        <Loader2 size={15} className="animate-spin" /> Chargement du pipeline…
      </div>
    );
  }
  if (!data) return null;

  const t = data.today;
  const w = data.last7d;
  const nothingYet = data.workflows === 0 || (w.prospects + w.emails + w.forms + w.crm === 0);

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-surface-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-content-strong">Pipeline en direct</h2>
        <span className="text-[11px] text-content-soft">Aujourd&apos;hui · (7 derniers jours)</span>
      </div>

      {nothingYet ? (
        <p className="text-sm text-content-soft">
          Ton Autopilot n&apos;a pas encore tourné. Crée un workflow et Volia commencera à scraper, écrire et qualifier pour toi — les chiffres s&apos;afficheront ici.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          <Stat icon={Search} label="Prospects" value={`${t.prospects} (${w.prospects})`} accent="text-violet-600" />
          <Stat icon={Mail} label="Emails envoyés" value={`${t.emails} (${w.emails})`} accent="text-blue-600" />
          <Stat icon={ClipboardCheck} label="Formulaires" value={`${t.forms} (${w.forms})`} accent="text-amber-600" />
          <Stat icon={Flame} label="Leads chauds 7j" value={data.hot_leads_7d} accent="text-rose-600" />
          <Stat icon={Database} label="Poussés au CRM" value={`${t.crm} (${w.crm})`} accent="text-emerald-600" />
        </div>
      )}
    </div>
  );
}
