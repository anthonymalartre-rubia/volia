'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import {
  User, Lock, CreditCard, Trash2, Shield, Mail, Calendar,
  Eye, EyeOff, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, X, Sun, Moon,
  BookOpen, BarChart3, ArrowUpRight, ShieldAlert, Filter,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const { theme, toggle: toggleTheme } = useTheme();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Billing
  const [billingLoading, setBillingLoading] = useState(false);

  // Usage data
  const [userUsage, setUserUsage] = useState(null);

  // RGPD filter
  const [filterPersonalEmails, setFilterPersonalEmails] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadUserData();
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

  async function loadUserData() {
    if (!supabase) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push('/login');
      return;
    }
    setUser(authUser);

    const { data: prof } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    setProfile(prof);
    setFilterPersonalEmails(prof?.filter_personal_emails !== false);

    // Fetch usage data for current month
    const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const { data: usageData } = await supabase
      .from('usage_tracking')
      .select('searches, enrichments, exports')
      .eq('user_id', authUser.id)
      .eq('month', month)
      .single();
    setUserUsage(usageData || { searches: 0, enrichments: 0, exports: 0 });

    setLoading(false);
  }

  // Password strength: 0-4
  function getPasswordStrength(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  }

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ['', t('settings.weak'), t('settings.medium'), t('settings.good'), t('settings.excellent')];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t('settings.passwordMismatch'), 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast(t('settings.passwordMinLength'), 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      // Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        showToast(t('settings.wrongPassword'), 'error');
        setPasswordLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        showToast(error.message || t('settings.passwordChangeError'), 'error');
      } else {
        showToast(t('settings.passwordUpdated'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(t('settings.networkError'), 'error');
    }
    setPasswordLoading(false);
  }

  async function handleToggleFilter() {
    setFilterLoading(true);
    const newValue = !filterPersonalEmails;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ filter_personal_emails: newValue })
        .eq('id', user.id);
      if (error) {
        showToast(t('settings.updateError'), 'error');
      } else {
        setFilterPersonalEmails(newValue);
        showToast(newValue
          ? t('settings.filterActiveDesc')
          : t('settings.filterInactiveDesc')
        , newValue ? 'success' : 'error');
      }
    } catch {
      showToast(t('settings.networkError'), 'error');
    }
    setFilterLoading(false);
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || t('settings.stripeError'), 'error');
      }
    } catch (err) {
      showToast(t('settings.networkError'), 'error');
    }
    setBillingLoading(false);
  }

  async function handleUpgradePro() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'pro' }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || t('settings.stripeError'), 'error');
      }
    } catch (err) {
      showToast(t('settings.networkError'), 'error');
    }
    setBillingLoading(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'SUPPRIMER') return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        await supabase.auth.signOut();
        router.push('/login');
      } else {
        showToast(data.error || t('settings.deleteError'), 'error');
        setDeleteLoading(false);
      }
    } catch (err) {
      showToast(t('settings.networkError'), 'error');
      setDeleteLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  const currentPlan = PLANS[profile?.plan] || PLANS.free;
  const planId = profile?.plan || 'free';

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

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card border border-line rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">{t('settings.deleteMyAccount')}</h3>
            </div>
            <p className="text-sm text-content-secondary mb-2">
              {t('settings.deleteIrreversible')}
            </p>
            <ul className="text-xs text-content-tertiary mb-4 space-y-1 ml-4 list-disc">
              <li>{t('settings.deleteDataProspects')}</li>
              <li>{t('settings.deleteDataFolders')}</li>
              <li>{t('settings.deleteDataUsage')}</li>
              <li>{t('settings.deleteDataAccount')}</li>
            </ul>
            <p className="text-sm text-content-secondary mb-3">
              {t('settings.typeToConfirm')} <span className="font-mono text-red-400 font-semibold">SUPPRIMER</span> {t('settings.toConfirm')}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full px-3 py-2 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-red-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 rounded-lg text-sm bg-surface-elevated hover:bg-surface-active transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
              >
                {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : t('settings.deleteForever')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-line bg-surface-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <ArrowLeft className="h-4 w-4 text-content-tertiary" />
          </button>
          <User className="h-5 w-5 text-violet-400" />
          <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* === Profile Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <User className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.profile')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.accountInfo')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {t('common.email')}
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-secondary">
                {user?.email || '--'}
              </div>
            </div>

            {/* Created at */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {t('settings.registrationDate')}
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-secondary">
                {formatDate(user?.created_at)}
              </div>
            </div>

            {/* Plan badge */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> {t('settings.currentPlan')}
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  planId === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                  planId === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-surface-elevated text-content-tertiary'
                }`}>
                  {currentPlan.name}
                </span>
                {currentPlan.price > 0 && (
                  <span className="text-xs text-content-muted">
                    {(currentPlan.price / 100).toFixed(0)} {t('settings.eurPerMonth')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === Appearance Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-violet-400" /> : <Sun className="h-5 w-5 text-violet-400" />}
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.appearance')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.customizeInterface')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('settings.theme')}</p>
              <p className="text-xs text-content-tertiary mt-0.5">
                {theme === 'dark' ? t('settings.darkActivated') : t('settings.lightActivated')}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                theme === 'light' ? 'bg-indigo-600' : 'bg-surface-elevated'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform flex items-center justify-center ${
                theme === 'light' ? 'translate-x-7' : 'translate-x-1'
              }`}>
                {theme === 'dark' ? <Moon size={10} className="text-gray-600" /> : <Sun size={10} className="text-amber-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* === RGPD Email Filter Section === */}
        <div className={`rounded-xl border ${filterPersonalEmails ? 'border-line' : 'border-amber-500/30'} bg-surface-card p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${filterPersonalEmails ? 'bg-violet-500/20' : 'bg-amber-500/20'}`}>
              <Filter className={`h-5 w-5 ${filterPersonalEmails ? 'text-violet-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.gdprEmailFilter')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.gdprEmailFilterDesc')}</p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                {filterPersonalEmails ? t('settings.filterActive') : t('settings.filterInactive')}
              </p>
              <p className="text-xs text-content-tertiary leading-relaxed">
                {filterPersonalEmails
                  ? t('settings.filterInfo')
                  : t('settings.filterWarning')
                }
              </p>
            </div>
            <button
              onClick={handleToggleFilter}
              disabled={filterLoading}
              className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                filterPersonalEmails ? 'bg-violet-600' : 'bg-surface-elevated'
              }`}
            >
              {filterLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-content-tertiary absolute top-1.5 left-1/2 -translate-x-1/2" />
              ) : (
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  filterPersonalEmails ? 'translate-x-7' : 'translate-x-1'
                }`} />
              )}
            </button>
          </div>

          {/* RGPD Warning when disabled */}
          {!filterPersonalEmails && (
            <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-400 mb-2">{t('settings.gdprWarningTitle')}</p>
                  <p className="text-xs text-content-secondary leading-relaxed mb-2">
                    {t('settings.gdprWarningP1')}
                  </p>
                  <p className="text-xs text-content-secondary leading-relaxed mb-2">
                    {t('settings.gdprWarningP2')}
                  </p>
                  <p className="text-xs text-content-secondary leading-relaxed mb-3">
                    {t('settings.gdprWarningP3')}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-amber-400/70 uppercase tracking-wider font-semibold">
                    <ShieldAlert className="h-3 w-3" />
                    {t('settings.gdprAcceptConditions')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === Onboarding Guide Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <BookOpen className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.gettingStarted')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.gettingStartedDesc')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('settings.interactiveTutorial')}</p>
              <p className="text-xs text-content-tertiary mt-0.5">
                {t('settings.interactiveTutorialDesc')}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('onboarding_completed');
                router.push('/dashboard?onboarding=1');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors shrink-0"
            >
              <BookOpen className="h-4 w-4" />
              {t('settings.reviewGuide')}
            </button>
          </div>
        </div>

        {/* === Change Password Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Lock className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.changePassword')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.changePasswordDesc')}</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block">{t('settings.currentPassword')}</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder={t('settings.currentPasswordPlaceholder')}
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block">{t('settings.newPassword')}</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={t('settings.minCharsPlaceholder')}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-surface-elevated'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] ${
                    passwordStrength <= 1 ? 'text-red-400' :
                    passwordStrength === 2 ? 'text-orange-400' :
                    passwordStrength === 3 ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block">{t('settings.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t('settings.repeatPasswordPlaceholder')}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[10px] text-red-400 mt-1">{t('settings.passwordMismatch')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {passwordLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {t('settings.updatePassword')}
            </button>
          </form>
        </div>

        {/* === Usage This Month Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.usageThisMonth')}</h2>
              <p className="text-xs text-content-tertiary">
                {t('settings.planLabel')} {currentPlan.name} — {t('settings.renewalOn')} {(() => {
                  const now = new Date();
                  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                  return nextMonth.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
                })()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: t('settings.searches'), current: userUsage?.searches || 0, limit: currentPlan.limits.searches_per_month },
              { label: t('settings.enrichments'), current: userUsage?.enrichments || 0, limit: currentPlan.limits.enrichments_per_month },
              { label: t('settings.exports'), current: userUsage?.exports || 0, limit: currentPlan.limits.exports_per_month },
            ].map(({ label, current, limit }) => {
              const isUnlimited = limit === -1;
              const pct = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
              const barColor = isUnlimited ? 'bg-violet-500'
                : pct >= 90 ? 'bg-red-500'
                : pct >= 60 ? 'bg-amber-500'
                : 'bg-emerald-500';
              const textColor = isUnlimited ? 'text-content-tertiary'
                : pct >= 90 ? 'text-red-400'
                : pct >= 60 ? 'text-amber-400'
                : 'text-emerald-400';

              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-content-secondary">{label}</span>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {current} / {isUnlimited ? '\u221e' : limit} {t('settings.used')}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  {isUnlimited && (
                    <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500/30 w-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {planId === 'free' && (
            <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
              <p className="text-sm text-content-secondary">
                {t('settings.upgradeProPrompt')}
              </p>
              <button
                onClick={handleUpgradePro}
                disabled={billingLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-40"
              >
                {billingLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                {t('settings.upgradePro')}
              </button>
            </div>
          )}
        </div>

        {/* === Plan & Billing Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <CreditCard className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t('settings.planAndBilling')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.planAndBillingDesc')}</p>
            </div>
          </div>

          {/* Current plan details */}
          <div className="rounded-lg bg-surface-base border border-line p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  planId === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                  planId === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-surface-elevated text-content-tertiary'
                }`}>
                  {currentPlan.name}
                </span>
                {currentPlan.price > 0 && (
                  <span className="text-sm text-content-secondary">
                    {(currentPlan.price / 100).toFixed(0)} {t('settings.eurPerMonth')}
                  </span>
                )}
                {currentPlan.price === 0 && (
                  <span className="text-sm text-content-muted">{t('common.free')}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">{t('settings.searchesPerMonth')}</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.searches_per_month === -1 ? t('common.unlimited') : currentPlan.limits.searches_per_month}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">{t('settings.enrichmentsPerMonth')}</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.enrichments_per_month === -1 ? t('common.unlimited') : currentPlan.limits.enrichments_per_month}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">{t('settings.folders')}</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.folders === -1 ? t('common.unlimited') : currentPlan.limits.folders}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">{t('settings.exportsPerMonth')}</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.exports_per_month === -1 ? t('common.unlimited') : currentPlan.limits.exports_per_month}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {planId !== 'free' && (
              <button
                onClick={handleManageBilling}
                disabled={billingLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40"
              >
                {billingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {t('settings.manageSubscription')}
              </button>
            )}
            {planId === 'free' && (
              <button
                onClick={handleUpgradePro}
                disabled={billingLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-40 shadow-lg shadow-violet-500/20"
              >
                {billingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {t('settings.upgradeToPro')}
              </button>
            )}
          </div>
        </div>

        {/* === Danger Zone === */}
        <div className="rounded-xl border border-red-500/20 bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-400">{t('settings.dangerZone')}</h2>
              <p className="text-xs text-content-tertiary">{t('settings.dangerZoneDesc')}</p>
            </div>
          </div>

          <p className="text-sm text-content-secondary mb-4">
            {t('settings.deleteAccountWarning')}
          </p>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t('settings.deleteMyAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
