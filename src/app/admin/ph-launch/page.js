'use client';

// Wave 3.1 Growth Loops — Product Hunt launch cockpit
// Workflow checklist 15 items + génération maker comment Claude + templates

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Rocket, CheckCircle2, Circle, Sparkles, Copy, Plus } from 'lucide-react';
import { LAUNCH_CHECKLIST, TEMPLATES } from '@/lib/product-hunt-launcher';

const STATUS_OPTIONS = ['planning', 'preparing', 'launching_today', 'launched', 'archived'];

export default function PhLaunchPage() {
  const [launches, setLaunches] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  const active = launches.find((l) => l.id === activeId) || launches[0];

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ph-launch');
      const data = await res.json();
      setLaunches(data.launches || []);
      if (data.launches?.[0] && !activeId) setActiveId(data.launches[0].id);
    } finally {
      setLoading(false);
    }
  }

  async function createLaunch() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ph-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: `Launch ${new Date().toLocaleDateString('fr-FR')}` }),
      });
      const data = await res.json();
      if (data.ok) {
        await load();
        setActiveId(data.launch.id);
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateActive(updates) {
    if (!active) return;
    setSaving(true);
    try {
      await fetch('/api/admin/ph-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: active.id, ...updates }),
      });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleChecklist(itemId) {
    const state = active.checklist_state || {};
    const newState = { ...state, [itemId]: !state[itemId] };
    await updateActive({ checklist_state: newState });
  }

  async function generateComment() {
    if (!active) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/ph-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_maker_comment',
          tagline: active.tagline || TEMPLATES.taglineSeeds[0],
          description: active.description || TEMPLATES.descriptionSeed,
        }),
      });
      const data = await res.json();
      const comment = data.comment || data.fallback;
      await updateActive({ maker_comment_draft: comment });
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(text, label) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="px-6 py-12 text-center">
      <Loader2 className="animate-spin mx-auto text-content-soft" size={32} />
    </div>
  );

  const checklistProgress = active
    ? Math.round((Object.values(active.checklist_state || {}).filter(Boolean).length / LAUNCH_CHECKLIST.length) * 100)
    : 0;

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong flex items-center gap-2">
            <Rocket className="text-orange-500" size={24} />
            Product Hunt Launch
          </h1>
          <p className="text-sm text-content-soft mt-1">
            Checklist 15 items + génération maker comment Claude + templates ready-to-copy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft text-content-soft text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={createLaunch}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-500 text-sm font-semibold disabled:opacity-50"
          >
            <Plus size={14} /> Nouveau launch
          </button>
        </div>
      </div>

      {launches.length === 0 && (
        <div className="text-center py-20 text-content-soft border border-dashed border-line rounded-xl">
          <Rocket className="mx-auto opacity-30 mb-3" size={48} />
          <p>Aucun launch planifié. Crée-en un pour démarrer le workflow.</p>
        </div>
      )}

      {active && (
        <>
          {/* Selector si plusieurs */}
          {launches.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {launches.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeId === l.id ? 'bg-orange-600 text-white' : 'bg-surface-soft text-content-soft'
                  }`}
                >
                  {l.name} {l.scheduled_date && `· ${new Date(l.scheduled_date).toLocaleDateString('fr-FR')}`}
                </button>
              ))}
            </div>
          )}

          {/* Header active launch */}
          <div className="bg-surface-strong border border-line-soft rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-content-soft uppercase tracking-wide">Nom</label>
                <input
                  type="text"
                  value={active.name || ''}
                  onChange={(e) => updateActive({ name: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line-soft bg-surface-soft text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-content-soft uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  value={active.scheduled_date || ''}
                  onChange={(e) => updateActive({ scheduled_date: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line-soft bg-surface-soft text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-content-soft uppercase tracking-wide">Status</label>
                <select
                  value={active.status}
                  onChange={(e) => updateActive({ status: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line-soft bg-surface-soft text-sm"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-content-soft uppercase tracking-wide">Progress</label>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-orange-600">{checklistProgress}%</div>
                  <div className="h-1.5 bg-surface-soft rounded mt-1 overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${checklistProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-surface-strong border border-line-soft rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> Checklist 15 items
            </h2>
            <div className="space-y-1">
              {LAUNCH_CHECKLIST.map((item) => {
                const done = !!(active.checklist_state || {})[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                      done ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'hover:bg-surface-soft'
                    }`}
                  >
                    {done ? <CheckCircle2 size={16} className="shrink-0" /> : <Circle size={16} className="text-content-soft shrink-0" />}
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-soft text-content-soft">{item.phase}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tagline + Description */}
          <div className="bg-surface-strong border border-line-soft rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold">Copy</h2>
            <div>
              <label className="text-xs font-semibold text-content-soft uppercase tracking-wide flex items-center justify-between">
                <span>Tagline (≤60 chars · {(active.tagline || '').length})</span>
              </label>
              <input
                type="text"
                maxLength={60}
                value={active.tagline || ''}
                onChange={(e) => updateActive({ tagline: e.target.value })}
                placeholder={TEMPLATES.taglineSeeds[0]}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-line-soft bg-surface-soft text-sm"
              />
              <p className="text-xs text-content-soft mt-2">Suggestions :</p>
              <ul className="mt-1 space-y-1 text-xs">
                {TEMPLATES.taglineSeeds.map((seed, i) => (
                  <li key={i}>
                    <button onClick={() => updateActive({ tagline: seed })} className="text-violet-600 hover:underline text-left">
                      → {seed}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="text-xs font-semibold text-content-soft uppercase tracking-wide">
                Description (≤260 chars · {(active.description || '').length})
              </label>
              <textarea
                maxLength={260}
                rows={3}
                value={active.description || ''}
                onChange={(e) => updateActive({ description: e.target.value })}
                placeholder={TEMPLATES.descriptionSeed}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-line-soft bg-surface-soft text-sm"
              />
            </div>
          </div>

          {/* Maker comment */}
          <div className="bg-surface-strong border border-line-soft rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles size={18} className="text-violet-500" /> Maker comment
              </h2>
              <button
                onClick={generateComment}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Générer via Claude
              </button>
            </div>
            <textarea
              rows={12}
              value={active.maker_comment_draft || ''}
              onChange={(e) => updateActive({ maker_comment_draft: e.target.value })}
              placeholder={TEMPLATES.makerCommentTemplate}
              className="w-full px-3 py-2 rounded-lg border border-line-soft bg-surface-soft text-sm font-mono"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-content-soft">{(active.maker_comment_draft || '').length} / 2000 chars</span>
              <button
                onClick={() => copyToClipboard(active.maker_comment_draft || TEMPLATES.makerCommentTemplate, 'maker_comment')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-soft text-content-soft text-xs"
              >
                {copied === 'maker_comment' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied === 'maker_comment' ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>

          {/* Templates ready-to-copy */}
          <div className="bg-surface-strong border border-line-soft rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">Templates ready-to-copy</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-soft border border-line-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-content-strong uppercase tracking-wide">Email network (J=jour)</span>
                  <button
                    onClick={() => copyToClipboard(TEMPLATES.networkEmailTemplate, 'network_email')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-strong text-content-soft text-xs"
                  >
                    {copied === 'network_email' ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                    {copied === 'network_email' ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono text-content-secondary">{TEMPLATES.networkEmailTemplate}</pre>
              </div>
            </div>
          </div>

          {/* Stats post-launch */}
          <div className="bg-surface-strong border border-line-soft rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Stats post-launch (à remplir J+1)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumberInput label="Votes" value={active.votes_count} onChange={(v) => updateActive({ votes_count: v })} />
              <NumberInput label="Rank du jour" value={active.rank_of_day} onChange={(v) => updateActive({ rank_of_day: v })} />
              <NumberInput label="Rank semaine" value={active.rank_of_week} onChange={(v) => updateActive({ rank_of_week: v })} />
              <NumberInput label="Signups attribués" value={active.signups_attributed} onChange={(v) => updateActive({ signups_attributed: v })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-content-soft uppercase tracking-wide">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line-soft bg-surface-soft text-sm"
      />
    </div>
  );
}
