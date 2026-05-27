'use client';

// ─────────────────────────────────────────────────────────────────────
// /auth/confirm — handler client-side du retour de Supabase Verify
// ─────────────────────────────────────────────────────────────────────
//
// Quand un user clique le lien de confirmation email (signup, magic link),
// Supabase Verify vérifie le token et redirige vers `redirectTo` avec un
// fragment `#access_token=...&refresh_token=...&type=signup`.
//
// Problème : le fragment (#) est CLIENT-ONLY. Le serveur Next.js ne le voit
// pas. Donc si redirectTo pointe directement vers /dashboard (qui check
// la session côté serveur via cookie), le middleware redirige vers /login
// avant que le supabase-js JS détecte le hash.
//
// Solution : on redirige vers /auth/confirm (page client-rendered, donc
// AUCUN check session serveur). supabase-js détecte automatiquement le
// hash, crée la session (cookies + localStorage via @supabase/ssr), puis
// on push() vers la destination finale (/dashboard par défaut, ou `next`
// query param).
//
// Refondu Sprint Brand 3 :
//   - Au lieu d'un spinner + "Email confirmé !", on affiche une animation
//     mémorable de welcome (mascotte + confetti + texte "Bienvenue dans
//     Volia, [prénom]") pendant ~1.8s avant de rediriger.
//   - L'animation joue UNIQUEMENT si le user n'a pas encore été welcomé
//     (user_profiles.welcomed_at IS NULL). Sinon, redirect direct.
//   - Erreurs (lien expiré) → fallback historique.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import ConfirmWelcome from '@/components/welcome/ConfirmWelcome';

// Extrait un prénom propre depuis un user Supabase.
// Priorité : user_metadata.full_name → user_metadata.name → email avant @.
// Capitalize Title-Case sur le 1er mot uniquement.
function extractFirstName(user) {
  if (!user) return '';
  const meta = user.user_metadata || {};
  const fullName = meta.full_name || meta.name || meta.given_name || '';
  if (fullName && typeof fullName === 'string') {
    const first = fullName.trim().split(/\s+/)[0];
    if (first) return capitalize(first);
  }
  // Fallback email : "anthony.malartre@volia.fr" → "Anthony"
  if (user.email && typeof user.email === 'string') {
    const local = user.email.split('@')[0] || '';
    const first = local.split(/[._-]/)[0];
    if (first) return capitalize(first);
  }
  return '';
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 'processing' | 'welcome' | 'success' | 'error'
  // - processing : on attend la session
  // - welcome : on joue l'animation de welcome (1er email confirmé)
  // - success : message court avant redirect (fallback / déjà welcomé)
  // - error : lien expiré / invalide
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setStatus('error');
      setErrorMsg('Configuration Supabase manquante.');
      return undefined;
    }

    let timeoutId;
    let redirected = false;

    function doRedirect() {
      if (redirected) return;
      redirected = true;
      const next = searchParams.get('next') || '/dashboard';
      router.replace(next);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' && !(event === 'INITIAL_SESSION' && session)) {
          return;
        }
        clearTimeout(timeoutId);
        subscription?.unsubscribe();

        // Trial Pro 14j : trigger DB handle_new_user attribue déjà le trial
        // au signup. /api/auth/trial-start envoie le welcome email (fire &
        // forget côté API).
        try {
          await fetch('/api/auth/trial-start', { method: 'POST' });
        } catch {
          // Silent — ne bloque pas l'auth si l'email échoue
        }

        const user = session?.user;
        setFirstName(extractFirstName(user));

        // Si le user a déjà été welcomé (rare, ex: 2e clic sur lien),
        // skip l'animation et redirect direct.
        let alreadyWelcomed = false;
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('welcomed_at')
            .eq('id', user.id)
            .maybeSingle();
          alreadyWelcomed = !!data?.welcomed_at;
        } catch {
          // Best-effort : si on n'arrive pas à check, on joue quand même
          // l'animation (ce n'est pas grave de la voir 2x).
        }

        if (alreadyWelcomed) {
          setStatus('success');
          setTimeout(doRedirect, 600);
        } else {
          setStatus('welcome');
          // doRedirect sera appelé par ConfirmWelcome via onComplete.
        }
      }
    );

    // Fallback : si après 5s pas de session, on assume que le hash était
    // invalide / expiré / déjà consommé.
    timeoutId = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        subscription?.unsubscribe();
        setStatus('error');
        setErrorMsg(
          'Lien expiré ou invalide. Demandez un nouveau lien depuis la page d\'inscription.'
        );
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleWelcomeComplete() {
    const next = searchParams.get('next') || '/dashboard';
    router.replace(next);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface-base text-content-primary">
      <div className="max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-pink-500 shadow-lg shadow-violet-500/30 flex items-center justify-center mb-6 animate-pulse">
              {/* 🚀 Fusée brand Volia — match logo + hero animation */}
              <svg viewBox="0 0 24 24" className="w-9 h-9 -rotate-45" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirmation en cours…</h1>
            <p className="text-content-secondary">
              Vérification de votre email et création de votre session.
            </p>
          </>
        )}

        {status === 'welcome' && (
          <ConfirmWelcome firstName={firstName} onComplete={handleWelcomeComplete} />
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6">
              <svg className="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Email confirmé !</h1>
            <p className="text-content-secondary">Redirection vers votre dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-6">
              <svg className="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirmation échouée</h1>
            <p className="text-content-secondary mb-6">{errorMsg}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
            >
              Aller à la connexion
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
