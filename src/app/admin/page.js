'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import { Shield, Users, Mail, CreditCard, Search, ArrowLeft, Crown, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProspects: 0, proUsers: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = getSupabase();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Check admin status
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
    await loadUsers();
    setLoading(false);
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

    // Build user list with counts
    const prospectCountMap = {};
    (prospectCounts || []).forEach(p => {
      prospectCountMap[p.user_id] = (prospectCountMap[p.user_id] || 0) + 1;
    });

    const usageMap = {};
    (usageData || []).forEach(u => {
      usageMap[u.user_id] = u;
    });

    // Fetch user emails from admin API
    let emailMap = {};
    try {
      const emailRes = await fetch('/api/admin/users');
      if (emailRes.ok) {
        const { users: userEmails } = await emailRes.json();
        emailMap = userEmails || {};
      }
    } catch (e) {
      console.error('Failed to load emails', e);
    }

    const enrichedUsers = profiles.map(p => ({
      ...p,
      email: emailMap[p.id]?.email || 'N/A',
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

  async function updateUserPlan(userId, newPlan) {
    await supabase
      .from('user_profiles')
      .update({ plan: newPlan, updated_at: new Date().toISOString() })
      .eq('id', userId);
    await loadUsers();
  }

  async function toggleAdmin(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    await supabase
      .from('user_profiles')
      .update({ is_admin: !user.is_admin, updated_at: new Date().toISOString() })
      .eq('id', userId);
    await loadUsers();
  }

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.plan || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#08080c] text-[#fafafa]">
      {/* Header */}
      <div className="border-b border-[#1e1e24] bg-[#111114]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-[#1e1e24] transition-colors">
              <ArrowLeft className="h-4 w-4 text-[#71717a]" />
            </button>
            <Shield className="h-5 w-5 text-violet-400" />
            <h1 className="text-lg font-semibold">Administration</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-400">Admin</span>
          </div>
          <button onClick={loadUsers} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-[#1e1e24] hover:bg-[#2a2a32] transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-[#71717a]">Utilisateurs</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
          <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-[#71717a]">Total prospects</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalProspects}</div>
          </div>
          <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-[#71717a]">Utilisateurs Pro</span>
            </div>
            <div className="text-2xl font-bold">{stats.proUsers}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par email, ID ou plan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111114] border border-[#1e1e24] text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e24] bg-[#0d0d10]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Prospects</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Recherches</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Enrichissements</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const plan = PLANS[u.plan] || PLANS.free;
                return (
                  <tr key={u.id} className="border-b border-[#1e1e24] hover:bg-[#0d0d10] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#fafafa]">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#a1a1aa]">{u.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                        u.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                        'bg-[#1e1e24] text-[#71717a]'
                      }`}>
                        {plan.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{u.prospectCount}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{u.usage?.searches || 0}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{u.usage?.enrichments || 0}</td>
                    <td className="px-4 py-3">
                      {u.is_admin && <Crown className="h-4 w-4 text-amber-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.plan || 'free'}
                          onChange={e => updateUserPlan(u.id, e.target.value)}
                          className="px-2 py-1 rounded text-xs bg-[#09090b] border border-[#1e1e24] text-[#fafafa] focus:outline-none focus:border-violet-500"
                        >
                          <option value="free">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <button
                          onClick={() => toggleAdmin(u.id)}
                          title={u.is_admin ? 'Retirer admin' : 'Promouvoir admin'}
                          className={`p-1.5 rounded text-xs transition-colors ${
                            u.is_admin ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-[#1e1e24] text-[#52525b] hover:text-[#fafafa]'
                          }`}
                        >
                          <Crown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#52525b]">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
