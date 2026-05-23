'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AuthBackgroundDecor from '@/components/AuthBackgroundDecor';
import { GOOGLE_OAUTH_ENABLED } from '@/lib/auth-config';
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

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, labelKey: 'settings.weak', color: 'bg-red-500' };
  if (score <= 3) return { score: 2, labelKey: 'settings.medium', color: 'bg-yellow-500' };
  return { score: 3, labelKey: 'settings.strong', color: 'bg-green-500' };
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const router = useRouter();
  const supabase = getSupabase();
  const { t } = useI18n();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    setMounted(true);
    // Capture des paramètres viraux/marketing dans des cookies pour survie
    // au signup (Supabase peut rediriger via /auth/callback et perdre le
    // query string).
    try {
      const params = new URLSearchParams(window.location.search);

      // ?ref=XXX → parrainage
      const ref = params.get('ref');
      if (ref && /^[a-zA-Z0-9]{4,12}$/.test(ref)) {
        document.cookie = `prospectia_ref=${encodeURIComponent(ref)}; path=/; max-age=2592000; SameSite=Lax`;
      }

      // ?plan=solo|pro|business → user vient d'une card pricing.
      // On stocke pour déclencher un checkout post-signup automatique.
      const plan = params.get('plan');
      if (plan && ['solo', 'pro', 'business'].includes(plan)) {
        setSelectedPlan(plan);
        document.cookie = `prospectia_signup_plan=${plan}; path=/; max-age=3600; SameSite=Lax`;
      }
    } catch {}
  }, []);

  // URL post-signup — si l'user a choisi un plan, le dashboard déclenchera
  // l'upgrade automatiquement au mount.
  const postSignupRedirect = selectedPlan ? `/dashboard?upgrade=${selectedPlan}` : '/dashboard';

  // OAuth Google — bypass le signup form entièrement. Le provider doit
  // être activé dans Supabase > Auth > Providers > Google.
  const handleGoogleSignup = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(postSignupRedirect)}`,
        },
      });
      if (error) {
        setError(error.message);
        setOauthLoading(false);
      }
      // Redirection auto vers Google si OK
    } catch (err) {
      setError(t('auth.genericError'));
      setOauthLoading(false);
    }
  };

  // Helper : track le parrainage après login réussi
  async function trackReferralIfAny() {
    try {
      const m = document.cookie.match(/(?:^|;\s*)prospectia_ref=([^;]+)/);
      const ref = m ? decodeURIComponent(m[1]) : null;
      if (!ref) return;
      await fetch('/api/referrals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref }),
      });
      // Nettoie le cookie après usage
      document.cookie = 'prospectia_ref=; path=/; max-age=0';
    } catch {}
  }

  const handleResendEmail = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (!error) {
        setResendSuccess(true);
      }
    } catch (err) {
      // silently fail
    } finally {
      setResending(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data?.user?.identities?.length === 0) {
        setError(t('auth.accountExists'));
      } else if (data?.session) {
        // Auto-confirmed → track referral puis redirect (avec ?upgrade=plan
        // si l'user a cliqué depuis pricing)
        await trackReferralIfAny();
        router.push(postSignupRedirect);
      } else {
        // Email auto-confirmed by trigger but Supabase didn't return session
        // Sign in immediately since the trigger confirmed the email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError) {
          await trackReferralIfAny();
          router.push(postSignupRedirect);
        } else {
          // Fallback: show verification screen
          setSuccess(true);
        }
      }
    } catch (err) {
      setError(t('auth.genericError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
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
            <h1 className="text-2xl font-bold text-content-primary">{t('auth.verifyEmail')}</h1>
            <p className="text-sm text-content-tertiary leading-relaxed">
              {t('auth.verifyDesc')}{' '}
              <span className="text-content-primary font-medium">{email}</span>.
              <br />
              {t('auth.verifyAction')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full rounded-lg border border-line bg-surface-card px-4 py-2.5 text-sm font-medium text-content-secondary hover:bg-surface-elevated hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('auth.resendLoading')}</span>
                </>
              ) : (
                t('auth.resendEmail')
              )}
            </button>

            {resendSuccess && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{t('auth.resendSuccess')}</span>
              </div>
            )}

            <Link
              href="/login"
              className="inline-block text-sm text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-medium transition-colors duration-200"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackgroundDecor />
      <ThemeToggle className="absolute top-4 right-4 z-10" />
      <Link href="/" className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-content-primary transition">
        <ArrowLeft size={12} />
        Prospectia
      </Link>
      <div
        className={`relative w-full max-w-sm space-y-7 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="text-center">
          <LogoIcon size="lg" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-content-primary">Prospectia<span className="text-violet-400">.cloud</span></h1>
          <p className="mt-2 text-sm text-content-tertiary">
            {t('auth.signupTitle')}
          </p>
        </div>

        {/* Bandeau "plan sélectionné" si l'user vient d'une card pricing */}
        {selectedPlan && (
          <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            <span className="text-content-secondary">
              Plan <strong className="capitalize text-content-primary">{selectedPlan}</strong> sélectionné — checkout après inscription.
            </span>
          </div>
        )}

        {/* Bouton OAuth Google + séparateur — affichés uniquement si
            Google OAuth est configuré dans Supabase + Google Cloud Console.
            Voir src/lib/auth-config.js pour la procédure d'activation. */}
        {GOOGLE_OAUTH_ENABLED && (
          <>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleGoogleSignup}
              loading={oauthLoading}
              disabled={loading}
            >
              {!oauthLoading && <GoogleIcon />}
              Continuer avec Google
            </Button>

            <div className="relative">
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

        {/* Form email/password (simplifié — 1 champ password avec œil + force) */}
        <form onSubmit={handleSignup} className="space-y-4">
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
              autoComplete="new-password"
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
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength.score ? strength.color : 'bg-surface-elevated'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs transition-all duration-200 ${
                  strength.score === 1 ? 'text-red-400' :
                  strength.score === 2 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {t(strength.labelKey)}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={oauthLoading}
          >
            {loading ? t('auth.signupLoading') : t('auth.signup')}
          </Button>
        </form>

        <p className="text-center text-sm text-content-tertiary">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 hover:underline underline-offset-4 font-medium transition-colors duration-200">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
