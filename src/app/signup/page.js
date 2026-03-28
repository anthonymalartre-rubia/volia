'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Faible', color: 'bg-red-500' };
  if (score <= 3) return { score: 2, label: 'Moyen', color: 'bg-yellow-500' };
  return { score: 3, label: 'Fort', color: 'bg-green-500' };
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  /*
   * Google OAuth — Prérequis :
   * 1. Activer le provider Google dans Supabase Dashboard > Authentication > Providers
   * 2. Ajouter les identifiants OAuth Google (Client ID + Secret) depuis Google Cloud Console
   * 3. Ajouter l'URL de callback Supabase aux URI de redirection autorisées dans Google :
   *    https://<votre-projet>.supabase.co/auth/v1/callback
   */
  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
      // If successful, the browser will redirect — no need to setGoogleLoading(false)
    } catch (err) {
      setError('Impossible de se connecter avec Google. Réessayez.');
      setGoogleLoading(false);
    }
  };

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data?.user?.identities?.length === 0) {
        setError('Un compte existe deja avec cet email.');
      } else if (data?.session) {
        // Auto-confirmed → redirect to dashboard
        router.push('/dashboard');
      } else {
        // Email auto-confirmed by trigger but Supabase didn't return session
        // Sign in immediately since the trigger confirmed the email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError) {
          router.push('/dashboard');
        } else {
          // Fallback: show verification screen
          setSuccess(true);
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative">
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
            <h1 className="text-2xl font-bold text-content-primary">Vérifiez votre email</h1>
            <p className="text-sm text-content-tertiary leading-relaxed">
              Un lien de confirmation a été envoyé à{' '}
              <span className="text-content-primary font-medium">{email}</span>.
              <br />
              Cliquez dessus pour activer votre compte.
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
                  <span>Envoi...</span>
                </>
              ) : (
                'Renvoyer l\'email'
              )}
            </button>

            {resendSuccess && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Email renvoyé avec succes</span>
              </div>
            )}

            <Link
              href="/login"
              className="inline-block text-sm text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-medium transition-colors duration-200"
            >
              Retour a la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div
        className={`w-full max-w-sm space-y-8 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-content-primary">Créer un compte</h1>
          <p className="mt-2 text-sm text-content-tertiary">
            Commencez à générer des leads
          </p>
        </div>

        {/* Google OAuth */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>Continuer avec Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-content-muted uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-line" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-secondary mb-1.5">
              Email
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
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-content-secondary mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-line bg-surface-card pl-10 pr-10 py-2.5 text-sm text-content-primary placeholder-content-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-content-secondary mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-line bg-surface-card pl-10 pr-10 py-2.5 text-sm text-content-primary placeholder-content-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary transition-colors duration-200"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
                <span>Création...</span>
              </>
            ) : (
              'Créer un compte'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-content-tertiary">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-medium transition-colors duration-200">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
