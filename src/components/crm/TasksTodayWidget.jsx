'use client';

// Widget « À faire aujourd'hui / en retard » (CRM P1-2).
// Liste les activités non complétées dont l'échéance est <= fin de journée
// (en retard + dues aujourd'hui), tous deals/contacts confondus. Actionnable :
// bouton ✓ pour marquer fait. Ne s'affiche que s'il y a des tâches dues.
//
// Props :
//   - onOpenDeal(dealId)  : optionnel, ouvre le deal lié au clic sur une ligne

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock, AlertTriangle, Check, Phone, Mail, Calendar, CheckSquare,
  StickyNote, ChevronRight,
} from 'lucide-react';

const TYPE_ICON = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
  note: StickyNote,
};

function dueLabel(dueAt) {
  if (!dueAt) return { text: '', overdue: false };
  const due = new Date(dueAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (due.getTime() < startOfToday) {
    const days = Math.floor((startOfToday - due.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    return { text: days <= 1 ? 'En retard (hier)' : `En retard (${days} j)`, overdue: true };
  }
  return { text: "Aujourd'hui", overdue: false };
}

export default function TasksTodayWidget({ onOpenDeal }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/crm/activities?scope=all&status=due&with_relations=1&limit=50');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        const list = (data.data || []).slice().sort(
          (a, b) => new Date(a.due_at) - new Date(b.due_at)
        );
        setTasks(list);
      }
    } catch {
      /* silencieux : widget non critique */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const markDone = useCallback(async (id) => {
    setBusyId(id);
    // Optimiste : on retire la ligne tout de suite
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/crm/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_at: true }),
      });
      if (!res.ok) setTasks(snapshot); // rollback
    } catch {
      setTasks(snapshot);
    } finally {
      setBusyId(null);
    }
  }, [tasks]);

  if (loading || tasks.length === 0) return null;

  const overdueCount = tasks.filter((t) => dueLabel(t.due_at).overdue).length;
  const todayCount = tasks.length - overdueCount;

  return (
    <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/20">
        <div className="flex items-center gap-2 text-sm font-semibold text-content-primary">
          <Clock size={15} className="text-amber-600" />
          <span>À faire</span>
          <span className="text-content-tertiary font-normal">
            {overdueCount > 0 && (
              <span className="text-red-500 font-semibold">{overdueCount} en retard</span>
            )}
            {overdueCount > 0 && todayCount > 0 && ' · '}
            {todayCount > 0 && <>{todayCount} aujourd'hui</>}
          </span>
        </div>
        <Link
          href="/app/crm/activities"
          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 hover:text-amber-800 transition"
        >
          Voir tout <ChevronRight size={12} />
        </Link>
      </div>
      <ul className="divide-y divide-amber-500/10 max-h-56 overflow-y-auto">
        {tasks.slice(0, 8).map((t) => {
          const Icon = TYPE_ICON[t.type] || CheckSquare;
          const dl = dueLabel(t.due_at);
          const dealId = t.deal_id || t.deal?.id;
          const subtitle = t.deal?.title || t.contact?.name || t.contact?.company || '';
          return (
            <li key={t.id} className="flex items-center gap-2.5 px-4 py-2">
              <Icon size={14} className="shrink-0 text-content-muted" />
              <button
                type="button"
                onClick={() => dealId && onOpenDeal?.(dealId)}
                className="min-w-0 flex-1 text-left group"
                title={subtitle}
              >
                <div className="text-xs text-content-primary truncate group-hover:text-amber-700 transition">
                  {t.content}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                  {dl.overdue ? (
                    <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold">
                      <AlertTriangle size={9} /> {dl.text}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold">{dl.text}</span>
                  )}
                  {subtitle && <span className="text-content-faint truncate">· {subtitle}</span>}
                </div>
              </button>
              <button
                type="button"
                onClick={() => markDone(t.id)}
                disabled={busyId === t.id}
                title="Marquer comme fait"
                className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-md border border-line text-content-muted hover:text-emerald-600 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition disabled:opacity-40"
              >
                <Check size={13} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
