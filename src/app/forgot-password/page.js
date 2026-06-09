'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { mapApiAuthStatus } from '@/lib/auth-errors';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AuthBackgroundDecor from '@/components/AuthBackgroundDecor';
import { LogoIcon } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Demande de reset via notre endpoint /api/auth/forgot-password (qui
  // envoie l'email brandé Volia via Resend, et non plus l'email plain text
  // de Supabase). L'endpoint retourne TOUJOURS success pour ne pas leaker
  // l'existence d'un compte → on affiche un message neutre côté UI.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await res.json().catch(() => ({}));

      if (!res.ok) {
        // Jamais le message brut de l'API (FR) sur la version EN — on mappe
        // le statut HTTP vers une clé i18n (incident messages FR-sur-EN).
        setError(t(mapApiAuthStatus(res.status)));
      } else {
        // Toujours success pour ne pas leaker — l'utilisateur voit le même
        // message qu'un email existe ou non.
        setSuccess(true);
      }
    } catch (err) {
      setError(t('auth.genericError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div translate="no" className="notranslate min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackgroundDecor />
      <ThemeToggle className="absolute top-4 right-4" />
        <div
          className={`w-full max-w-sm space-y-6 text-center transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-content-primary">{t('auth.emailSent')}</h1>
            <p className="text-sm text-content-tertiary leading-relaxed">
              {t('auth.resetEmailSent')}{' '}
              <span className="text-content-primary font-medium">{email}</span>.
              <br />
              {t('auth.resetClickLink')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div translate="no" className="notranslate min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackgroundDecor />
      <ThemeToggle className="absolute top-4 right-4" />
      <div
        className={`w-full max-w-sm space-y-8 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="text-center">
          <LogoIcon size="lg" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-content-primary">{t('auth.forgotTitle')}</h1>
          <p className="mt-2 text-sm text-content-tertiary">
            {t('auth.forgotDesc')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-secondary mb-1.5">
              {t('common.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-line bg-surface-card pl-10 pr-4 py-2.5 text-sm text-content-primary placeholder-content-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 disabled:bg-indigo-600/50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('auth.sending')}</span>
              </>
            ) : (
              t('auth.sendLink')
            )}
          </button>
        </form>

        <p className="text-center text-sm text-content-tertiary">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('auth.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
