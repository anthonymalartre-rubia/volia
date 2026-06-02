'use client';

// /admin/linkedin-dm-queue — Wave 2.1 mode manuel
// Workflow : cron linkedin-engagers détecte → ici tu envoies en 3 clics

import { useEffect, useState } from 'react';
import {
  Loader2, RefreshCw, Briefcase, CheckCircle2, X, ExternalLink, Copy, MessageSquare,
  TrendingUp, AlertCircle,
} from 'lucide-react';

const TABS = [
  { key: 'pending', label: 'À envoyer', icon: AlertCircle, color: 'amber' },
  { key: 'sent', label: 'Envoyés', icon: CheckCircle2, color: 'emerald' },
  { key: 'replied', label: 'Répondu', icon: MessageSquare, color: 'indigo' },
  { key: 'skipped', label: 'Ignorés', icon: X, color: 'slate' },
];

function buildDmTemplate({ firstName }) {
  const name = firstName || 'toi';
  return `Salut ${name}, j'ai vu que tu likes mes posts sur Volia. Curieux d'avoir ton avis si jamais tu testes ? volia.fr/signup (trial 14j sans CB). Anthony`;
}

function getFirstName(fullName) {
  if (!fullName) return null;
  return fullName.split(' ')[0];
}

function getLinkedInProfileUrl(item) {
  // L'URN urn:li:person:XXX ne donne pas d'URL profil directe.
  // On utilise LinkedIn search by name (fallback safe)
  if (item.li_name) {
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(item.li_name)}`;
  }
  // Si pas de nom, ouvre le post original (le founder peut voir l'engageur dans les likes)
  if (item.li_post_id) {
    const postId = item.li_post_id.replace(/^urn:li:(activity|share|ugcPost):/, '');
    return `https://www.linkedin.com/feed/update/urn:li:activity:${postId}`;
  }
  return 'https://www.linkedin.com';
}

export default function LinkedInDmQueuePage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [sentThisWeek, setSentThisWeek] = useState(0);
  const [weeklyLimit, setWeeklyLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [updating, setUpdating] = useState(null);
  const [copied, setCopied] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/linkedin-dm-queue?status=${activeTab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur chargement');
      setItems(data.items || []);
      setCounts(data.counts || {});
      setSentThisWeek(data.sent_this_week || 0);
      setWeeklyLimit(data.weekly_limit || 20);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      await fetch('/api/admin/linkedin-dm-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function copyAndOpen(item) {
    const firstName = getFirstName(item.li_name);
    const dmTemplate = buildDmTemplate({ firstName });
    try {
      await navigator.clipboard.writeText(dmTemplate);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 3000);
    } catch {}
    // Ouvre LinkedIn dans nouvelle tab
    window.open(getLinkedInProfileUrl(item), '_blank', 'noopener,noreferrer');
  }

  async function triggerDetection() {
    setTriggering(true);
    try {
      const res = await fetch('/api/admin/trigger-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cron: 'linkedin-engagers' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur trigger');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setTriggering(false);
    }
  }

  useEffect(() => { load(); }, [activeTab]);

  const quotaPct = Math.min(100, (sentThisWeek / weeklyLimit) * 100);
  const quotaColor = quotaPct >= 100 ? 'red' : quotaPct >= 80 ? 'amber' : 'emerald';

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong flex items-center gap-2">
            <Briefcase className="text-indigo-500" size={24} />
            LinkedIn DM Queue
          </h1>
          <p className="text-sm text-content-soft mt-1">
            Top engageurs sur tes posts récents. Workflow : Copy template → Open profile LinkedIn → Mark sent. ~30 sec par DM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft text-content-soft text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={triggerDetection}
            disabled={triggering}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold disabled:opacity-50"
          >
            {triggering ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
            Lancer détection
          </button>
        </div>
      </div>

      {/* Quota weekly */}
      <div className="bg-surface-strong border border-line-soft rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-content-strong">DMs envoyés cette semaine</span>
          <span className={`text-sm font-bold text-${quotaColor}-600`}>
            {sentThisWeek} / {weeklyLimit}
          </span>
        </div>
        <div className="h-2 bg-surface-soft rounded overflow-hidden">
          <div
            className={`h-full bg-${quotaColor}-500 transition-all`}
            style={{ width: `${quotaPct}%` }}
          />
        </div>
        <p className="text-xs text-content-soft mt-2">
          Limite safe LinkedIn : {weeklyLimit} DMs/sem (anti-ban). Reset chaque lundi.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.key] || 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? `bg-${tab.color}-600 text-white`
                  : 'bg-surface-soft text-content-soft hover:bg-surface-strong'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isActive ? 'bg-white/20' : 'bg-surface-strong text-content-soft'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-content-soft" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-content-soft border border-dashed border-line rounded-xl">
          <Briefcase className="mx-auto opacity-30 mb-3" size={48} />
          <p className="text-sm">Aucun engageur en {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}.</p>
          {activeTab === 'pending' && (
            <p className="text-xs mt-2 text-content-soft">
              Clique <strong>Lancer détection</strong> en haut pour analyser tes posts récents.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-surface-strong border border-line-soft rounded-xl p-4 flex items-start gap-4"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-content-strong text-base">
                    {item.li_name || <span className="text-content-soft italic">Sans nom</span>}
                  </span>
                  {item.engagement_type && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-semibold">
                      {item.engagement_type}
                    </span>
                  )}
                </div>
                {item.li_headline && (
                  <p className="text-xs text-content-soft mb-2 line-clamp-1">{item.li_headline}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-content-soft">
                  <span>Détecté : {new Date(item.detected_at).toLocaleDateString('fr-FR')}</span>
                  {item.dm_sent_at && (
                    <span>Envoyé : {new Date(item.dm_sent_at).toLocaleDateString('fr-FR')}</span>
                  )}
                  {item.dm_method && (
                    <span className="px-1.5 py-0.5 rounded bg-surface-soft font-mono">{item.dm_method}</span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-[11px] text-content-soft mt-1 italic">{item.notes}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {activeTab === 'pending' && (
                  <>
                    <button
                      onClick={() => copyAndOpen(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold"
                      title="Copie le template DM dans le presse-papier et ouvre LinkedIn dans une nouvelle tab"
                    >
                      {copied === item.id ? (
                        <>
                          <CheckCircle2 size={12} /> Copié + ouvert
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy + Open LinkedIn
                        </>
                      )}
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateStatus(item.id, 'sent')}
                        disabled={updating === item.id}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold disabled:opacity-50"
                      >
                        <CheckCircle2 size={11} /> Sent
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'skipped')}
                        disabled={updating === item.id}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-600 text-white hover:bg-slate-500 text-xs font-semibold disabled:opacity-50"
                      >
                        <X size={11} /> Skip
                      </button>
                    </div>
                  </>
                )}
                {activeTab === 'sent' && (
                  <button
                    onClick={() => updateStatus(item.id, 'replied')}
                    disabled={updating === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold disabled:opacity-50"
                  >
                    <MessageSquare size={12} /> Marquer répondu
                  </button>
                )}
                {(activeTab === 'replied' || activeTab === 'skipped') && (
                  <a
                    href={getLinkedInProfileUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft text-content-soft hover:bg-surface-strong text-xs font-semibold"
                  >
                    <ExternalLink size={11} /> Voir LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper */}
      {activeTab === 'pending' && items.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-xs text-indigo-900 dark:text-indigo-200">
          <strong className="block mb-1">💡 Workflow optimal (30 sec / DM)</strong>
          <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
            <li>Clique <strong>Copy + Open LinkedIn</strong> → template copié + nouvelle tab ouverte</li>
            <li>Sur LinkedIn, clique sur le profil correct dans les résultats</li>
            <li>Bouton "Envoyer un message" → Cmd+V pour coller le template</li>
            <li>Customise 1 mot si tu veux (mention de leur post précis)</li>
            <li>Envoie + reviens ici, clique <strong>Sent</strong></li>
          </ol>
        </div>
      )}
    </div>
  );
}
