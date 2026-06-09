'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AuthBackgroundDecor from '@/components/AuthBackgroundDecor';
import { GOOGLE_OAUTH_ENABLED } from '@/lib/auth-config';
import { mapSupabaseAuthError } from '@/lib/auth-errors';
import { Button, Input, LogoIcon } from '@/components/ui';

// SVG inline Google logo officiel — pas dispo dans lucide
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  // OAuth Google — bypass login form. Provider à activer dans Supabase.
  const handleGoogleLogin = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent('/dashboard')}`,
        },
      });
      if (error) {
        // Jamais le message brut Supabase (EN) — toujours localisé.
        setError(t(mapSupabaseAuthError(error)) || t('auth.googleError'));
        setOauthLoading(false);
      }
    } catch (err) {
      setError(t('auth.genericError'));
      setOauthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase renvoie des messages EN bruts ("Invalid login credentials"…)
        // quelle que soit la locale → on mappe vers une clé i18n.
        setError(t(mapSupabaseAuthError(error)));
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(t('auth.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div translate="no" className="notranslate min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackgroundDecor />
      <ThemeToggle className="absolute top-4 right-4 z-10" />
      <Link href="/" className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-content-primary transition">
        <ArrowLeft size={12} />
        Volia
      </Link>
      <div
        className={`relative w-full max-w-sm space-y-8 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="text-center">
          <LogoIcon size="lg" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-content-primary">Volia<span className="text-violet-400">.fr</span></h1>
          <p className="mt-2 text-sm text-content-tertiary">
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Bouton OAuth Google + séparateur — affichés uniquement si
            Google OAuth est configuré dans Supabase + Google Cloud Console.
            Voir src/lib/auth-config.js pour la procédure d'activation. */}
        {GOOGLE_OAUTH_ENABLED && (
          <>
            <div className="mb-6">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleGoogleLogin}
                loading={oauthLoading}
                disabled={loading}
              >
                {!oauthLoading && <GoogleIcon />}
                Continuer avec Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface-base text-[10px] uppercase tracking-wider text-content-muted font-semibold">
                  ou avec votre email
                </span>
              </div>
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-400 animate-in fade-in">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-secondary mb-1.5">
              {t('common.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              leadingIcon={Mail}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-content-secondary mb-1.5">
              {t('common.password')}
            </label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              placeholder={t('auth.passwordPlaceholder')}
              leadingIcon={Lock}
              trailingSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-md text-content-muted hover:text-content-secondary hover:bg-surface-elevated transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-xs text-content-muted hover:text-indigo-400 transition-colors duration-200">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={oauthLoading}
          >
            {loading ? t('auth.loginLoading') : t('auth.loginAction')}
          </Button>
        </form>

        <p className="text-center text-sm text-content-tertiary">
          {t('auth.noAccount')}{' '}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 hover:underline underline-offset-4 font-medium transition-colors duration-200">
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
}
