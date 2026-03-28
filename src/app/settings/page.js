'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import {
  User, Lock, CreditCard, Trash2, Shield, Mail, Calendar,
  Eye, EyeOff, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, X, Sun, Moon,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const { theme, toggle: toggleTheme } = useTheme();

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
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Le mot de passe doit contenir au moins 6 caracteres', 'error');
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
        showToast('Mot de passe actuel incorrect', 'error');
        setPasswordLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        showToast(error.message || 'Erreur lors du changement de mot de passe', 'error');
      } else {
        showToast('Mot de passe mis a jour avec succes');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast('Erreur reseau', 'error');
    }
    setPasswordLoading(false);
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
        showToast(data.error || 'Erreur Stripe', 'error');
      }
    } catch (err) {
      showToast('Erreur reseau', 'error');
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
        showToast(data.error || 'Erreur Stripe', 'error');
      }
    } catch (err) {
      showToast('Erreur reseau', 'error');
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
        showToast(data.error || 'Erreur lors de la suppression', 'error');
        setDeleteLoading(false);
      }
    } catch (err) {
      showToast('Erreur reseau', 'error');
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
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  const currentPlan = PLANS[profile?.plan] || PLANS.free;
  const planId = profile?.plan || 'free';

  return (
    <div className="min-h-screen bg-[#08080c] text-content-primary">
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
              <h3 className="text-lg font-semibold">Supprimer mon compte</h3>
            </div>
            <p className="text-sm text-content-secondary mb-2">
              Cette action est irreversible. Toutes vos donnees seront definitivement supprimees :
            </p>
            <ul className="text-xs text-content-tertiary mb-4 space-y-1 ml-4 list-disc">
              <li>Tous vos prospects</li>
              <li>Vos dossiers et tags</li>
              <li>Vos donnees d'utilisation</li>
              <li>Votre compte utilisateur</li>
            </ul>
            <p className="text-sm text-content-secondary mb-3">
              Tapez <span className="font-mono text-red-400 font-semibold">SUPPRIMER</span> pour confirmer :
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
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
              >
                {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Supprimer definitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-line bg-surface-card">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <ArrowLeft className="h-4 w-4 text-content-tertiary" />
          </button>
          <User className="h-5 w-5 text-violet-400" />
          <h1 className="text-lg font-semibold">Parametres</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* === Profile Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <User className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Profil</h2>
              <p className="text-xs text-content-tertiary">Informations de votre compte</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-secondary">
                {user?.email || '--'}
              </div>
            </div>

            {/* Created at */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Date d'inscription
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-secondary">
                {formatDate(user?.created_at)}
              </div>
            </div>

            {/* Plan badge */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Plan actuel
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
                    {(currentPlan.price / 100).toFixed(0)} EUR/mois
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
              <h2 className="text-base font-semibold">Apparence</h2>
              <p className="text-xs text-content-tertiary">Personnalisez l'interface</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-content-tertiary mt-0.5">
                {theme === 'dark' ? 'Mode sombre active' : 'Mode clair active'}
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

        {/* === Onboarding Guide Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <BookOpen className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Guide de demarrage</h2>
              <p className="text-xs text-content-tertiary">Revisitez le tutoriel de prise en main</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tutoriel interactif</p>
              <p className="text-xs text-content-tertiary mt-0.5">
                Redecouvrez les fonctionnalites de Prospectia.ai etape par etape.
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
              Revoir le guide
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
              <h2 className="text-base font-semibold">Changer le mot de passe</h2>
              <p className="text-xs text-content-tertiary">Mettez a jour votre mot de passe de connexion</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="text-xs text-content-tertiary mb-1.5 block">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Votre mot de passe actuel"
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
              <label className="text-xs text-content-tertiary mb-1.5 block">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caracteres"
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
              <label className="text-xs text-content-tertiary mb-1.5 block">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repetez le mot de passe"
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
                <p className="text-[10px] text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {passwordLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Mettre a jour le mot de passe
            </button>
          </form>
        </div>

        {/* === Plan & Billing Section === */}
        <div className="rounded-xl border border-line bg-surface-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <CreditCard className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Plan & Facturation</h2>
              <p className="text-xs text-content-tertiary">Gerez votre abonnement et vos limites</p>
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
                    {(currentPlan.price / 100).toFixed(0)} EUR/mois
                  </span>
                )}
                {currentPlan.price === 0 && (
                  <span className="text-sm text-content-muted">Gratuit</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Recherches/mois</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.searches_per_month === -1 ? 'Illimite' : currentPlan.limits.searches_per_month}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Enrichissements/mois</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.enrichments_per_month === -1 ? 'Illimite' : currentPlan.limits.enrichments_per_month}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Dossiers</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.folders === -1 ? 'Illimite' : currentPlan.limits.folders}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-card border border-line">
                <div className="text-[10px] uppercase tracking-wider text-content-muted mb-1">Exports/mois</div>
                <div className="text-sm font-semibold">
                  {currentPlan.limits.exports_per_month === -1 ? 'Illimite' : currentPlan.limits.exports_per_month}
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
                Gerer l'abonnement
              </button>
            )}
            {planId === 'free' && (
              <button
                onClick={handleUpgradePro}
                disabled={billingLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-40 shadow-lg shadow-violet-500/20"
              >
                {billingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Passer au Pro
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
              <h2 className="text-base font-semibold text-red-400">Zone dangereuse</h2>
              <p className="text-xs text-content-tertiary">Actions irreversibles sur votre compte</p>
            </div>
          </div>

          <p className="text-sm text-content-secondary mb-4">
            La suppression de votre compte est definitive. Toutes vos donnees (prospects, dossiers, tags, historique) seront supprimees.
          </p>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
