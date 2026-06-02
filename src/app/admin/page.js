'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import {
  Shield, Users, Mail, CreditCard, Search, ArrowLeft, Crown, RefreshCw,
  Trash2, KeyRound, Eye, EyeOff, Ban, CheckCircle, AlertTriangle, X,
  ChevronDown, ChevronUp, Clock, Globe, UserCheck, UserX,
  BarChart3, TrendingUp, Activity, DollarSign, Zap, Download, Database,
  Bot, Flame, Brain, Lightbulb, ListChecks, Send, Layers, Palette, Newspaper,
  Briefcase, Rocket
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProspects: 0, proUsers: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  async function checkAdminAndLoad() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/dashboard');
      return;
    }

    setIsAdmin(true);
    await Promise.all([loadUsers(), loadDashboardStats()]);
    setLoading(false);
  }

  async function loadDashboardStats() {
    setDashboardLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    }
    setDashboardLoading(false);
  }

  async function loadUsers() {
    // Load all user profiles
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profiles) return;

    // Load prospect counts per user
    const { data: prospectCounts } = await supabase
      .from('prospects')
      .select('user_id');

    // Load usage data
    const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const { data: usageData } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('month', month);

    // Build counts
    const prospectCountMap = {};
    (prospectCounts || []).forEach(p => {
      prospectCountMap[p.user_id] = (prospectCountMap[p.user_id] || 0) + 1;
    });

    const usageMap = {};
    (usageData || []).forEach(u => {
      usageMap[u.user_id] = u;
    });

    // Fetch user details from admin API
    let authMap = {};
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const { users: authUsers } = await res.json();
        authMap = authUsers || {};
      }
    } catch (e) {
      console.error('Failed to load auth users', e);
    }

    const enrichedUsers = profiles.map(p => ({
      ...p,
      email: authMap[p.id]?.email || 'N/A',
      auth_created_at: authMap[p.id]?.created_at,
      last_sign_in_at: authMap[p.id]?.last_sign_in_at,
      email_confirmed_at: authMap[p.id]?.email_confirmed_at,
      provider: authMap[p.id]?.provider || 'email',
      prospectCount: prospectCountMap[p.id] || 0,
      usage: usageMap[p.id] || { searches: 0, enrichments: 0, exports: 0 },
    }));

    setUsers(enrichedUsers);
    setStats({
      totalUsers: profiles.length,
      totalProspects: Object.values(prospectCountMap).reduce((a, b) => a + b, 0),
      proUsers: profiles.filter(p => p.plan !== 'free').length,
    });
  }

  async function adminAction(action, userId, data = {}) {
    setActionLoading(`${action}-${userId}`);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, data }),
      });
      const result = await res.json();
      if (res.ok) {
        showToast(result.message || 'OK.', 'success');
        // Send notification email via Resend when password is set
        if (action === 'set_password') {
          const targetUser = users.find(u => u.id === userId);
          if (targetUser?.email) {
            fetch('/api/admin/send-reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: targetUser.email, type: 'reset' }),
            }).catch(() => {});
          }
        }
        await loadUsers();
      } else {
        showToast(result.error || 'Ça plante.', 'error');
      }
    } catch (err) {
      showToast('Réseau cassé.', 'error');
    }
    setActionLoading(null);
    setConfirmDialog(null);
    setNewPassword('');
  }

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.plan || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function timeAgo(dateStr) {
    if (!dateStr) return 'Jamais';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `il y a ${days}j`;
    return formatDate(dateStr);
  }

  function formatLimit(limit) {
    if (limit === -1) return '\u221E';
    return limit;
  }

  function getMonthLabel(monthStr) {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  }

  function navigateToUser(userId) {
    setActiveTab('users');
    setExpandedUser(userId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Compute top users from dashboardStats
  const topUsers = (() => {
    if (!dashboardStats?.usagePerUser) return [];
    const usageMap = {};
    dashboardStats.usagePerUser.forEach(u => {
      usageMap[u.user_id] = u;
    });
    return [...users]
      .map(u => ({
        ...u,
        totalActivity: (usageMap[u.id]?.searches || 0) + (usageMap[u.id]?.enrichments || 0),
        statsSearches: usageMap[u.id]?.searches || 0,
        statsEnrichments: usageMap[u.id]?.enrichments || 0,
        statsExports: usageMap[u.id]?.exports || 0,
        statsProspects: usageMap[u.id]?.prospects || u.prospectCount || 0,
      }))
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10);
  })();

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-line rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${confirmDialog.danger ? 'bg-red-500/20' : 'bg-violet-500/20'}`}>
                {confirmDialog.danger ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <KeyRound className="h-5 w-5 text-violet-400" />}
              </div>
              <h3 className="text-lg font-semibold">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-content-secondary mb-4">{confirmDialog.description}</p>
            {confirmDialog.email && (
              <p className="text-xs font-mono bg-surface-base rounded-lg px-3 py-2 mb-4 text-content-tertiary">{confirmDialog.email}</p>
            )}

            {confirmDialog.showPasswordInput && (
              <div className="mb-4">
                <label className="text-xs text-content-tertiary mb-1.5 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="6 caractères min"
                    className="w-full px-3 py-2 pr-10 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setConfirmDialog(null); setNewPassword(''); }}
                className="px-4 py-2 rounded-lg text-sm bg-surface-elevated hover:bg-surface-active transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmDialog.onConfirm()}
                disabled={confirmDialog.showPasswordInput && newPassword.length < 6}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                  confirmDialog.danger
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-line bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
              <ArrowLeft className="h-4 w-4 text-content-tertiary" />
            </button>
            <Shield className="h-5 w-5 text-violet-400" />
            <h1 className="text-lg font-semibold">Cockpit admin</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-400">Anthony only</span>
          </div>
          <button onClick={() => { loadUsers(); loadDashboardStats(); showToast('Données refresh.'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-surface-elevated hover:bg-surface-active transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs — version étendue avec toutes les pages admin */}
      <div className="border-b border-line bg-surface-card overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-content-tertiary hover:text-content-secondary'
            }`}
          >
            <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-content-tertiary hover:text-content-secondary'
            }`}
          >
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Utilisateurs</span>
          </button>
          <Link
            href="/admin/leads"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Leads</span>
          </Link>
          <Link
            href="/admin/metrics"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Metrics biz</span>
          </Link>
          <Link
            href="/admin/insights"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Insights</span>
          </Link>
          {/* Séparateur visuel : pages autonomy */}
          <span className="w-px bg-line my-2 mx-2" />
          <Link
            href="/admin/auto-queue"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><Bot className="h-4 w-4" /> Auto-queue</span>
          </Link>
          <Link
            href="/admin/lead-scoring"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><Flame className="h-4 w-4" /> Hot leads</span>
          </Link>
          <Link
            href="/admin/meta-autonomy"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Méta-autonomie</span>
          </Link>
          <Link
            href="/admin/recommendations"
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-content-tertiary hover:text-content-secondary whitespace-nowrap"
          >
            <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Recos</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <>
            {/* App launcher — accès rapide à toutes les pages admin */}
            <div className="rounded-xl border border-line bg-surface-card p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-3 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Modules admin
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {[
                  { href: '/admin/auto-queue',     label: 'Auto-queue',    icon: Bot,         color: 'violet',  desc: 'Queue actions IA' },
                  { href: '/admin/lead-scoring',   label: 'Hot leads',     icon: Flame,       color: 'orange',  desc: 'Top 50 scores' },
                  { href: '/admin/insights',       label: 'Insights',      icon: TrendingUp,  color: 'emerald', desc: 'MRR · Churn · Cohorts' },
                  { href: '/admin/meta-autonomy',  label: 'Méta-autonomie',icon: Brain,       color: 'fuchsia', desc: 'ROI par boucle' },
                  { href: '/admin/recommendations',label: 'Recos Claude',  icon: Lightbulb,   color: 'amber',   desc: 'Recos new boucles' },
                  { href: '/admin/leads',          label: 'Leads',         icon: Mail,        color: 'blue',    desc: 'Lead magnets' },
                  { href: '/admin/metrics',        label: 'Metrics biz',   icon: BarChart3,   color: 'indigo',  desc: 'KPIs business' },
                  { href: '/admin/prospection',    label: 'Prospection',   icon: ListChecks,  color: 'teal',    desc: 'Listes + dogfood' },
                  { href: '/admin/forms',          label: 'Forms',         icon: Newspaper,   color: 'cyan',    desc: 'Formulaires' },
                  { href: '/admin/linkedin-dm-queue', label: 'LinkedIn DM', icon: Briefcase, color: 'indigo', desc: 'Top engageurs à DM manuellement' },
                  { href: '/admin/ph-launch',      label: 'PH Launch',     icon: Rocket,      color: 'orange',  desc: 'Product Hunt launch cockpit' },
                  { href: '/admin/publishers',     label: 'Publishers',    icon: Send,        color: 'pink',    desc: 'LinkedIn tokens' },
                  { href: '/admin/design-system',  label: 'Design system', icon: Palette,     color: 'rose',    desc: 'Tokens UI' },
                ].map(({ href, label, icon: Icon, color, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    title={desc}
                    className={`group flex flex-col items-center gap-1.5 p-3 rounded-lg border border-line bg-surface-base hover:border-${color}-400 hover:bg-${color}-50/30 dark:hover:bg-${color}-900/10 transition-all`}
                  >
                    <Icon className={`h-5 w-5 text-${color}-500 group-hover:scale-110 transition-transform`} />
                    <span className="text-[11px] font-semibold text-content-strong text-center leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {dashboardLoading && !dashboardStats ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
              </div>
            ) : dashboardStats ? (
              <>
                {/* Row 1 — KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Total Utilisateurs */}
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-violet-500/20">
                        <Users className="h-4 w-4 text-violet-400" />
                      </div>
                      <span className="text-xs text-content-tertiary">Utilisateurs</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.global.totalUsers}</div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-content-muted">
                      <span className="px-1.5 py-0.5 rounded bg-surface-elevated">{dashboardStats.revenue.planCounts.free} free</span>
                      <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">{dashboardStats.revenue.planCounts.pro} pro</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">{dashboardStats.revenue.planCounts.enterprise} ent.</span>
                    </div>
                  </div>

                  {/* MRR */}
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-xs text-content-tertiary">MRR</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.revenue.mrr}<span className="text-sm font-normal text-content-tertiary ml-1">&euro;/mois</span></div>
                    <div className="text-[10px] text-content-muted mt-1.5">
                      {dashboardStats.revenue.planCounts.pro} Pro + {dashboardStats.revenue.planCounts.enterprise} Enterprise
                    </div>
                  </div>

                  {/* Total Prospects */}
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <Database className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-content-tertiary">Total Prospects</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.global.totalProspects.toLocaleString('fr-FR')}</div>
                    <div className="text-[10px] text-content-muted mt-1.5">
                      {dashboardStats.global.totalWithEmail > 0
                        ? `${Math.round((dashboardStats.global.totalWithEmail / dashboardStats.global.totalProspects) * 100)}% avec email`
                        : '0% avec email'}
                    </div>
                  </div>

                  {/* Recherches ce mois */}
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/20">
                        <Search className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-xs text-content-tertiary">Recherches (mois)</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.global.totalSearches}</div>
                  </div>

                  {/* Enrichissements ce mois */}
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-pink-500/20">
                        <Zap className="h-4 w-4 text-pink-400" />
                      </div>
                      <span className="text-xs text-content-tertiary">Enrichissements</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.global.totalEnrichments}</div>
                  </div>

                  {/* Exports ce mois */}
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20">
                        <Download className="h-4 w-4 text-cyan-400" />
                      </div>
                      <span className="text-xs text-content-tertiary">Exports (mois)</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.global.totalExports}</div>
                  </div>
                </div>

                {/* Row 2 — Two side-by-side panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Sources d'enrichissement */}
                  <div className="rounded-xl border border-line bg-surface-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-4 w-4 text-violet-400" />
                      <h2 className="text-sm font-semibold">Sources enrichissement</h2>
                    </div>
                    {(() => {
                      const sources = dashboardStats.enrichmentSources || {};
                      const entries = Object.entries(sources).sort((a, b) => b[1] - a[1]);
                      const maxVal = entries.length > 0 ? entries[0][1] : 1;
                      const colors = {
                        scrape: 'bg-emerald-500',
                        apollo: 'bg-violet-500',
                        serper: 'bg-blue-500',
                        waterfall: 'bg-amber-500',
                        guess: 'bg-orange-500',
                        deep: 'bg-pink-500',
                        manual: 'bg-cyan-500',
                        enrichly: 'bg-lime-500',
                        anymail: 'bg-rose-500',
                        findymail: 'bg-indigo-500',
                        unknown: 'bg-gray-500',
                      };
                      if (entries.length === 0) {
                        return <p className="text-xs text-content-muted">Vide pour ce mois.</p>;
                      }
                      return (
                        <div className="space-y-3">
                          {entries.map(([method, count]) => (
                            <div key={method}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-content-secondary capitalize">{method}</span>
                                <span className="text-xs font-mono text-content-muted">{count.toLocaleString('fr-FR')}</span>
                              </div>
                              <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${colors[method] || 'bg-gray-500'}`}
                                  style={{ width: `${Math.max((count / maxVal) * 100, 2)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right: Activite recente — last 6 months */}
                  <div className="rounded-xl border border-line bg-surface-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-violet-400" />
                      <h2 className="text-sm font-semibold">Activité (6 derniers mois)</h2>
                    </div>
                    {(() => {
                      const history = dashboardStats.usageHistory || {};
                      const months = Object.keys(history).sort();
                      const allSearches = months.map(m => history[m].searches);
                      const allEnrichments = months.map(m => history[m].enrichments);
                      const maxVal = Math.max(...allSearches, ...allEnrichments, 1);
                      return (
                        <div className="space-y-4">
                          {/* Legend */}
                          <div className="flex items-center gap-4 text-[10px] text-content-muted">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" /> Recherches</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-pink-500 inline-block" /> Enrichissements</span>
                          </div>
                          {months.map(m => (
                            <div key={m}>
                              <div className="text-[10px] text-content-muted mb-1.5 font-medium">{getMonthLabel(m)}</div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 flex-1 rounded-full bg-surface-elevated overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-violet-500 transition-all"
                                      style={{ width: `${Math.max((history[m].searches / maxVal) * 100, 1)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-content-muted w-10 text-right">{history[m].searches}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 flex-1 rounded-full bg-surface-elevated overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-pink-500 transition-all"
                                      style={{ width: `${Math.max((history[m].enrichments / maxVal) * 100, 1)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-content-muted w-10 text-right">{history[m].enrichments}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Row 3 — API Costs */}
                <div className="rounded-xl border border-line bg-surface-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                      <h2 className="text-sm font-semibold">Coûts API ce mois</h2>
                    </div>
                    {dashboardStats.apiCosts && (
                      <span className="text-lg font-bold text-amber-600">
                        {(dashboardStats.apiCosts.totalThisMonth / 100).toFixed(2)} €
                      </span>
                    )}
                  </div>
                  {(() => {
                    const apiCosts = dashboardStats.apiCosts?.thisMonth || {};
                    const entries = Object.entries(apiCosts).sort((a, b) => b[1].cost_cents - a[1].cost_cents);
                    const maxCost = entries.length > 0 ? Math.max(...entries.map(([, v]) => v.cost_cents)) : 1;
                    const serviceColors = {
                      google_places: { bar: 'bg-blue-500', text: 'Google Places' },
                      anthropic: { bar: 'bg-amber-600', text: 'Anthropic Claude' },
                      serper: { bar: 'bg-emerald-500', text: 'Serper.dev' },
                      apollo: { bar: 'bg-violet-500', text: 'Apollo.io' },
                      enrichly: { bar: 'bg-yellow-500', text: 'Enrichly' },
                      anymail: { bar: 'bg-pink-500', text: 'Anymail Finder' },
                      findymail: { bar: 'bg-teal-500', text: 'Findymail' },
                      resend: { bar: 'bg-purple-500', text: 'Resend' },
                      millionverifier: { bar: 'bg-orange-500', text: 'MillionVerifier' },
                    };
                    if (entries.length === 0) {
                      return <p className="text-xs text-content-muted">Pas encore d&apos;appel API ce mois. Les couts s&apos;afficheront ici.</p>;
                    }
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: cost bars */}
                        <div className="space-y-3">
                          {entries.map(([service, data]) => {
                            const info = serviceColors[service] || { bar: 'bg-gray-500', text: service };
                            return (
                              <div key={service}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-content-secondary">{info.text}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-content-muted">{data.calls.toLocaleString('fr-FR')} appels</span>
                                    <span className="text-xs font-mono font-medium text-amber-600">{(data.cost_cents / 100).toFixed(2)} €</span>
                                  </div>
                                </div>
                                <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${info.bar}`}
                                    style={{ width: `${Math.max((data.cost_cents / maxCost) * 100, 2)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Right: cost history (6 months) */}
                        <div>
                          <h3 className="text-xs text-content-muted mb-3 font-medium">Historique coûts (6 mois)</h3>
                          {(() => {
                            const costHistory = dashboardStats.apiCosts?.history || {};
                            const months = Object.keys(costHistory).sort();
                            const maxMonthCost = Math.max(...months.map(m => costHistory[m].total_cents), 1);
                            return (
                              <div className="space-y-3">
                                {months.map(m => (
                                  <div key={m}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-content-muted font-medium">{getMonthLabel(m)}</span>
                                      <span className="text-xs font-mono font-medium text-content-secondary">{(costHistory[m].total_cents / 100).toFixed(2)} €</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-amber-500 transition-all"
                                        style={{ width: `${Math.max((costHistory[m].total_cents / maxMonthCost) * 100, 1)}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Row 4 — Top Users table */}
                <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-line flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <h2 className="text-sm font-semibold">Top 10 users actifs ce mois</h2>
                  </div>
                  {topUsers.length === 0 ? (
                    <div className="p-8 text-center text-xs text-content-muted">Personne d&apos;actif ce mois.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-line bg-surface-base">
                            <th className="text-left px-4 py-2.5 text-content-muted font-medium">Email</th>
                            <th className="text-left px-4 py-2.5 text-content-muted font-medium">Plan</th>
                            <th className="text-right px-4 py-2.5 text-content-muted font-medium">Leads</th>
                            <th className="text-right px-4 py-2.5 text-content-muted font-medium">Recherches</th>
                            <th className="text-right px-4 py-2.5 text-content-muted font-medium">Enrichissements</th>
                            <th className="text-right px-4 py-2.5 text-content-muted font-medium">Exports</th>
                            <th className="text-right px-4 py-2.5 text-content-muted font-medium">Dernière connexion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topUsers.map((u, i) => {
                            const plan = PLANS[u.plan] || PLANS.free;
                            return (
                              <tr
                                key={u.id}
                                onClick={() => navigateToUser(u.id)}
                                className="border-b border-line last:border-0 hover:bg-surface-elevated cursor-pointer transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-content-muted font-mono w-4">{i + 1}.</span>
                                    <span className="text-content-primary font-medium truncate max-w-[200px]">{u.email}</span>
                                    {u.is_admin && <Crown className="h-3 w-3 text-amber-600 shrink-0" />}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    u.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-600' :
                                    u.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                                    'bg-surface-elevated text-content-tertiary'
                                  }`}>
                                    {plan.name}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-content-secondary font-mono">{u.statsProspects}</td>
                                <td className="px-4 py-3 text-right text-content-secondary font-mono">{u.statsSearches}</td>
                                <td className="px-4 py-3 text-right text-content-secondary font-mono">{u.statsEnrichments}</td>
                                <td className="px-4 py-3 text-right text-content-secondary font-mono">{u.statsExports}</td>
                                <td className="px-4 py-3 text-right text-content-muted">{u.last_sign_in_at ? timeAgo(u.last_sign_in_at) : 'Jamais'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-line bg-surface-card p-8 text-center text-xs text-content-muted">
                Stats injoignables.
              </div>
            )}
          </>
        )}

        {/* ==================== USERS TAB ==================== */}
        {activeTab === 'users' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-line bg-surface-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-violet-400" />
                  <span className="text-xs text-content-tertiary">Users</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </div>
              <div className="rounded-xl border border-line bg-surface-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-violet-400" />
                  <span className="text-xs text-content-tertiary">Prospects (total)</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalProspects}</div>
              </div>
              <div className="rounded-xl border border-line bg-surface-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-violet-400" />
                  <span className="text-xs text-content-tertiary">Users Pro</span>
                </div>
                <div className="text-2xl font-bold">{stats.proUsers}</div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Email, user ID ou plan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-card border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Users list */}
            <div className="space-y-3">
              {filteredUsers.map(u => {
                const plan = PLANS[u.plan] || PLANS.free;
                const isExpanded = expandedUser === u.id;
                const isEmailConfirmed = !!u.email_confirmed_at;

                return (
                  <div key={u.id} className="rounded-xl border border-line bg-surface-card overflow-hidden transition-colors hover:border-[#2a2a32]">
                    {/* User row — clickable */}
                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left"
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        u.is_admin ? 'bg-amber-500/20 text-amber-600' : 'bg-violet-500/15 text-violet-400'
                      }`}>
                        {(u.email || '?')[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{u.email}</span>
                          {u.is_admin && <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                          {!isEmailConfirmed && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-orange-500/20 text-orange-600 shrink-0">Non confirmé</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-content-muted font-mono">{u.id.slice(0, 12)}...</span>
                          <span className="text-[11px] text-content-muted">Inscrit {timeAgo(u.auth_created_at || u.created_at)}</span>
                        </div>
                      </div>

                      {/* Plan badge */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                        u.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-600' :
                        u.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                        'bg-surface-elevated text-content-tertiary'
                      }`}>
                        {plan.name}
                      </span>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-xs text-content-tertiary shrink-0">
                        <span>{u.prospectCount} leads</span>
                        <span>{u.usage?.searches || 0} rech.</span>
                      </div>

                      {/* Expand icon */}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-content-muted shrink-0" /> : <ChevronDown className="h-4 w-4 text-content-muted shrink-0" />}
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-line bg-surface-alt">
                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Email</div>
                            <div className="text-sm text-content-primary break-all">{u.email}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">User ID</div>
                            <div className="text-xs font-mono text-content-secondary break-all">{u.id}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Inscription</div>
                            <div className="text-sm text-content-secondary">{formatDate(u.auth_created_at || u.created_at)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Dernière connexion</div>
                            <div className="text-sm text-content-secondary">{u.last_sign_in_at ? timeAgo(u.last_sign_in_at) : 'Jamais'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Email confirmé</div>
                            <div className="flex items-center gap-1.5">
                              {isEmailConfirmed
                                ? <><UserCheck className="h-3.5 w-3.5 text-emerald-400" /><span className="text-sm text-emerald-400">Oui</span></>
                                : <><UserX className="h-3.5 w-3.5 text-orange-600" /><span className="text-sm text-orange-600">Non</span></>
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Provider</div>
                            <div className="text-sm text-content-secondary capitalize">{u.provider}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Prospects</div>
                            <div className="text-sm text-content-primary font-medium">{u.prospectCount}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Usage (ce mois)</div>
                            <div className="text-xs text-content-secondary">
                              {u.usage?.searches || 0} rech. / {u.usage?.enrichments || 0} enrich. / {u.usage?.exports || 0} exports
                            </div>
                          </div>
                        </div>

                        {/* Usage progress bars */}
                        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Searches progress */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-content-muted">Recherches</span>
                              <span className="text-[10px] font-mono text-content-muted">
                                {u.usage?.searches || 0} / {formatLimit(plan.limits.searches_per_month)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  plan.limits.searches_per_month !== -1 && (u.usage?.searches || 0) >= plan.limits.searches_per_month
                                    ? 'bg-red-500' : 'bg-violet-500'
                                }`}
                                style={{
                                  width: plan.limits.searches_per_month === -1
                                    ? '100%'
                                    : `${Math.min(((u.usage?.searches || 0) / plan.limits.searches_per_month) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                          {/* Enrichments progress */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-content-muted">Enrichissements</span>
                              <span className="text-[10px] font-mono text-content-muted">
                                {u.usage?.enrichments || 0} / {formatLimit(plan.limits.enrichments_per_month)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  plan.limits.enrichments_per_month !== -1 && (u.usage?.enrichments || 0) >= plan.limits.enrichments_per_month
                                    ? 'bg-red-500' : 'bg-pink-500'
                                }`}
                                style={{
                                  width: plan.limits.enrichments_per_month === -1
                                    ? '100%'
                                    : `${Math.min(((u.usage?.enrichments || 0) / plan.limits.enrichments_per_month) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                          {/* Exports progress */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-content-muted">Exports</span>
                              <span className="text-[10px] font-mono text-content-muted">
                                {u.usage?.exports || 0} / {formatLimit(plan.limits.exports_per_month)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  plan.limits.exports_per_month !== -1 && (u.usage?.exports || 0) >= plan.limits.exports_per_month
                                    ? 'bg-red-500' : 'bg-cyan-500'
                                }`}
                                style={{
                                  width: plan.limits.exports_per_month === -1
                                    ? '100%'
                                    : `${Math.min(((u.usage?.exports || 0) / plan.limits.exports_per_month) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stripe customer ID */}
                        {u.stripe_customer_id && (
                          <div className="px-5 pb-3">
                            <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Stripe Customer</div>
                            <a
                              href={`https://dashboard.stripe.com/customers/${u.stripe_customer_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <CreditCard className="h-3 w-3" />
                              {u.stripe_customer_id.length > 20
                                ? `${u.stripe_customer_id.slice(0, 20)}...`
                                : u.stripe_customer_id}
                            </a>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 px-5 pb-5">
                          {/* Plan selector */}
                          <select
                            value={u.plan || 'free'}
                            onChange={e => adminAction('update_plan', u.id, { plan: e.target.value })}
                            className="px-3 py-2 rounded-lg text-xs bg-surface-base border border-line text-content-primary focus:outline-none focus:border-violet-500 cursor-pointer"
                          >
                            <option value="free">Starter</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>

                          {/* Toggle admin */}
                          <button
                            onClick={() => adminAction('toggle_admin', u.id)}
                            disabled={actionLoading === `toggle_admin-${u.id}`}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                              u.is_admin
                                ? 'bg-amber-500/20 text-amber-600 hover:bg-amber-500/30'
                                : 'bg-surface-elevated text-content-tertiary hover:text-content-primary hover:bg-surface-active'
                            }`}
                          >
                            <Crown className="h-3.5 w-3.5" />
                            {u.is_admin ? 'Retirer admin' : 'Promouvoir admin'}
                          </button>

                          {/* Confirm email */}
                          {!isEmailConfirmed && (
                            <button
                              onClick={() => adminAction('confirm_email', u.id)}
                              disabled={actionLoading === `confirm_email-${u.id}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Confirmer email
                            </button>
                          )}

                          {/* Send password reset email */}
                          <button
                            onClick={() => setConfirmDialog({
                              title: 'Reset password',
                              description: 'Un email de reset va partir vers ce user.',
                              email: u.email,
                              danger: false,
                              onConfirm: () => adminAction('reset_password', u.id),
                            })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-surface-elevated text-content-secondary hover:text-content-primary hover:bg-surface-active transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Envoyer reset
                          </button>

                          {/* Set password directly */}
                          <button
                            onClick={() => setConfirmDialog({
                              title: 'Set password manuel',
                              description: 'Force un nouveau mot de passe pour ce user.',
                              email: u.email,
                              showPasswordInput: true,
                              danger: false,
                              onConfirm: () => adminAction('set_password', u.id, { password: newPassword }),
                            })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-surface-elevated text-content-secondary hover:text-content-primary hover:bg-surface-active transition-colors"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Set mdp
                          </button>

                          {/* Delete user */}
                          <button
                            onClick={() => setConfirmDialog({
                              title: 'Supprimer ce user',
                              description: 'Irréversible. Prospects, usage, compte — tout part.',
                              email: u.email,
                              danger: true,
                              onConfirm: () => adminAction('delete_user', u.id),
                            })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="rounded-xl border border-line bg-surface-card p-8 text-center text-xs text-content-muted">
                  Personne ne matche ta recherche.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
