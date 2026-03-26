'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <span className="text-2xl text-white">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Vérifiez votre email</h1>
          <p className="text-sm text-[#71717a]">
            Un lien de confirmation a été envoyé à <span className="text-[#fafafa] font-medium">{email}</span>.
            Cliquez dessus pour activer votre compte.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-lg font-bold text-white">LG</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#fafafa]">Créer un compte</h1>
          <p className="mt-2 text-sm text-[#71717a]">
            Commencez à générer des leads
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#1e1e24] bg-[#111114] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-[#1e1e24] bg-[#111114] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-[#1e1e24] bg-[#111114] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Création...' : 'Créer un compte'}
          </button>
        </form>

        <p className="text-center text-sm text-[#71717a]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
