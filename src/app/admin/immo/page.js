'use client';

// /admin/immo — Liste d'attente Volia Immo : voir, filtrer, exporter (CSV).
// Réservé aux admins (user_profiles.is_admin). Données via /api/admin/immo.

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, Search, Loader2, ShieldOff, LogIn,
  Users, Phone, Wallet, CalendarClock, MapPin,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

const PAYING_BUDGETS = new Set(['50 à 100 €/mois', '100 à 200 €/mois']);

function StatCard({ label, value, color = 'text-content-primary', icon = null }) {
  return (
    <div className="rounded-xl border border-line bg-surface-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-content-tertiary mb-1">{icon}{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export default function AdminImmoPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState(null); // null | guest | no-admin | ok
  const [currentEmail, setCurrentEmail] = useState(null);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [profilFilter, setProfilFilter] = useState('all');

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('guest'); setLoading(false); return; }
      setCurrentEmail(user.email);

      const { data: profile } = await supabase
        .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
      if (!profile?.is_admin) { setAuthState('no-admin'); setLoading(false); return; }

      setAuthState('ok');
      const res = await fetch('/api/admin/immo?limit=2000');
      if (res.ok) { const data = await res.json(); setLeads(data.leads || []); }
      setLoading(false);
    })();
  }, [router, supabase]);

  const profils = useMemo(() => {
    const set = new Set(leads.map((l) => l.profil).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (profilFilter !== 'all' && l.profil !== profilFilter) return false;
      if (q) {
        const hay = `${l.email} ${l.secteurs || ''} ${l.profil || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, profilFilter]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return {
      total: leads.length,
      withPhone: leads.filter((l) => l.telephone).length,
      paying: leads.filter((l) => PAYING_BUDGETS.has(l.budget)).length,
      thisWeek: leads.filter((l) => l.created_at && new Date(l.created_at).getTime() > weekAgo).length,
    };
  }, [leads]);

  function downloadCsv() {
    window.location.href = '/api/admin/immo?format=csv&limit=5000';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center text-content-secondary">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  if (authState === 'guest') {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-line bg-surface-card p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4">
            <LogIn size={20} className="text-violet-300" />
          </div>
          <h1 className="text-xl font-bold mb-2">Connexion requise</h1>
          <p className="text-sm text-content-secondary mb-6">Page réservée aux administrateurs.</p>
          <Link href="/login?return=/admin/immo" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition">
            <LogIn size={14} /> Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (authState === 'no-admin') {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-amber-400 bg-amber-50 p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 border border-amber-400 flex items-center justify-center mb-4">
            <ShieldOff size={20} className="text-amber-700" />
          </div>
          <h1 className="text-xl font-bold mb-2">Accès admin requis</h1>
          <p className="text-sm text-content-secondary mb-6">
            Connecté en tant que <strong className="text-content-primary">{currentEmail}</strong>, sans droits admin.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/dashboard" className="px-4 py-2 rounded-xl border border-line text-content-secondary hover:bg-surface-elevated text-sm font-medium transition">Dashboard</Link>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login?return=/admin/immo'); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition">
              <LogIn size={14} /> Changer de compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition mb-2">
              <ArrowLeft size={14} /> Admin
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Liste d&apos;attente Volia Immo</h1>
            <p className="text-sm text-content-secondary mt-1">
              Inscrits via la landing <Link href="/immo" className="text-violet-500 hover:underline">/immo</Link> — validation marché agents immobiliers.
            </p>
          </div>
          <button onClick={downloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20">
            <Download size={14} /> Exporter CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Inscrits" value={stats.total} icon={<Users size={14} className="text-violet-500" />} />
          <StatCard label="7 derniers jours" value={stats.thisWeek} color="text-violet-600" icon={<CalendarClock size={14} className="text-violet-500" />} />
          <StatCard label="Avec téléphone" value={stats.withPhone} color="text-emerald-600" icon={<Phone size={14} className="text-emerald-500" />} />
          <StatCard label="Prêts à payer ≥ 50 €" value={stats.paying} color="text-amber-600" icon={<Wallet size={14} className="text-amber-500" />} />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher email, secteur, profil…"
              className="w-full rounded-lg border border-line bg-surface-card pl-9 pr-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <select value={profilFilter} onChange={(e) => setProfilFilter(e.target.value)}
            className="rounded-lg border border-line bg-surface-card px-3 py-2 text-sm focus:border-violet-500 focus:outline-none">
            {profils.map((p) => <option key={p} value={p}>{p === 'all' ? 'Tous les profils' : p}</option>)}
          </select>
          <span className="text-xs text-content-tertiary">{filtered.length} / {leads.length}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line bg-surface-elevated/40">
              <tr className="text-left text-xs uppercase tracking-wider text-content-tertiary">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Profil</th>
                <th className="px-4 py-3">Secteur(s)</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Budget</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-content-tertiary">
                  Aucun inscrit pour l&apos;instant. Diffuse <Link href="/immo" className="text-violet-500 hover:underline">volia.fr/immo</Link> pour lancer le test marché.
                </td></tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-b border-line/60 hover:bg-surface-elevated/30">
                  <td className="px-4 py-3 text-content-tertiary whitespace-nowrap text-xs">
                    {l.created_at ? new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <a href={`mailto:${l.email}`} className="hover:text-violet-500">{l.email}</a>
                  </td>
                  <td className="px-4 py-3 text-content-secondary">{l.profil || '—'}</td>
                  <td className="px-4 py-3 text-content-secondary">
                    {l.secteurs ? <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-content-muted" />{l.secteurs}</span> : '—'}
                  </td>
                  <td className="px-4 py-3 text-content-secondary whitespace-nowrap">
                    {l.telephone ? <a href={`tel:${l.telephone}`} className="hover:text-emerald-600">{l.telephone}</a> : <span className="text-content-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {l.budget ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAYING_BUDGETS.has(l.budget) ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>{l.budget}</span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
