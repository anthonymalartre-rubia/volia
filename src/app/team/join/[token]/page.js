'use client';

// /team/join/[token]
// Page publique d'acceptation d'invitation team.
// Comportement :
//   - Fetch les infos publiques de l'invite (team name + email)
//   - Si user pas logué → redirige vers /signup?invite=token&email=xxx
//   - Si user logué → bouton "Accepter" qui POST l'accept

import { useEffect, useState, use as usePromise } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Users, CheckCircle2, AlertTriangle, Loader2, LogIn } from 'lucide-react';

export default function TeamJoinPage({ params }) {
  const { token } = usePromise(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1. Charge les infos de l'invite (GET ne consomme pas)
        const r = await fetch(`/api/teams/invitations/${token}/accept`);
        const j = await r.json();
        if (!r.ok) {
          setError(j.error || 'Invitation invalide.');
        } else {
          setInvite(j.invitation);
          setTeam(j.team);
        }

        // 2. Charge le user courant (s'il est logué)
        const supa = getSupabase();
        if (supa) {
          const { data: { user } } = await supa.auth.getUser();
          setCurrentUser(user || null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const r = await fetch(`/api/teams/invitations/${token}/accept`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok) {
        if (j.need_auth) {
          // Pas logué → on signup avec preset email
          router.push(`/signup?invite=${token}&email=${encodeURIComponent(invite?.email || '')}`);
          return;
        }
        throw new Error(j.error || 'Erreur acceptation');
      }
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-content-tertiary">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h1 className="text-xl font-semibold text-content-primary mb-2">Invitation indisponible</h1>
          <p className="text-sm text-content-tertiary mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-emerald-600" size={28} />
          </div>
          <h1 className="text-xl font-semibold text-content-primary mb-2">Bienvenue dans l&apos;équipe !</h1>
          <p className="text-sm text-content-tertiary">Redirection vers le dashboard…</p>
        </div>
      </div>
    );
  }

  // User pas logué : propose login OU signup pre-remplied
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              <Users className="text-violet-600" size={26} />
            </div>
            <h1 className="text-2xl font-semibold text-content-primary mb-1">
              Rejoignez {team?.name || 'l\'équipe'}
            </h1>
            <p className="text-sm text-content-tertiary">
              Vous avez été invité en tant que{' '}
              <strong className="text-content-primary">
                {invite?.role === 'admin' ? 'Administrateur' : 'Membre'}
              </strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-line bg-surface-card mb-4">
            <p className="text-xs text-content-tertiary mb-2">Invitation envoyée à</p>
            <p className="text-sm font-medium text-content-primary mb-4">{invite?.email}</p>

            <div className="space-y-2">
              <Link
                href={`/signup?invite=${token}&email=${encodeURIComponent(invite?.email || '')}`}
                className="block w-full px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium text-center transition-colors"
              >
                Créer mon compte et accepter
              </Link>
              <Link
                href={`/login?invite=${token}&email=${encodeURIComponent(invite?.email || '')}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-line hover:bg-surface-elevated text-content-primary text-sm font-medium transition-colors"
              >
                <LogIn size={14} />
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User logué
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Users className="text-violet-600" size={26} />
          </div>
          <h1 className="text-2xl font-semibold text-content-primary mb-1">
            Rejoindre {team?.name || 'l\'équipe'} ?
          </h1>
          <p className="text-sm text-content-tertiary">
            Invitation pour <strong className="text-content-primary">{invite?.email}</strong> en tant que{' '}
            <strong className="text-content-primary">
              {invite?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </strong>
          </p>
        </div>

        {currentUser.email?.toLowerCase() !== invite?.email?.toLowerCase() && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Vous êtes connecté en tant que <strong>{currentUser.email}</strong> mais l&apos;invitation a été
              envoyée à <strong>{invite?.email}</strong>. Déconnectez-vous et reconnectez-vous avec le bon compte.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-5 rounded-2xl border border-line bg-surface-card">
          <button
            onClick={accept}
            disabled={accepting || currentUser.email?.toLowerCase() !== invite?.email?.toLowerCase()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {accepting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 size={14} />}
            Accepter l&apos;invitation
          </button>
        </div>
      </div>
    </div>
  );
}
