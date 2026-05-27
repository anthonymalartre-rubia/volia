'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, CheckCircle2, AlertCircle, Mail, Loader2, Lock, Eye } from 'lucide-react';
import AuthPageShell from '@/components/AuthPageShell';

function OptOutInner() {
  const searchParams = useSearchParams();
  const oneClickOk = searchParams.get('ok') === '1';
  const alreadyOptedOut = searchParams.get('already') === '1';
  const oneClickChannel = searchParams.get('channel');
  const oneClickError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');
    try {
      const res = await fetch('/api/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail(''); setCompany(''); setReason('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      setStatus('error');
      setMessage('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell contentWidth="max-w-2xl" backLabel="Accueil" showSignupCta={false}>
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 mb-4">
          <Shield size={22} className="text-violet-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">Droit d&apos;opposition RGPD</h1>
        <p className="text-sm text-content-secondary max-w-xl mx-auto leading-relaxed">
          Retirez vos coordonnées de notre base de prospects. Traité sous 48 h, conformément à
          l&apos;article 21 du RGPD.
        </p>
      </div>

      {/* Bandeau 1-clic confirmation (depuis un lien email de campagne) */}
      {(oneClickOk || oneClickError) && (
        <div className={`mb-6 p-5 rounded-2xl border backdrop-blur-xl ${oneClickOk ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-red-500/30 bg-red-500/[0.06]'}`}>
          <div className="flex items-start gap-3">
            {oneClickOk ? (
              <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              {oneClickOk && !alreadyOptedOut && (
                <>
                  <p className="text-base font-semibold text-emerald-300 mb-1">Désinscription confirmée</p>
                  <p className="text-sm text-content-secondary leading-relaxed">
                    Vous ne recevrez plus de {oneClickChannel === 'sms' ? 'SMS' : 'mails'} de prospection.
                    Votre {oneClickChannel === 'sms' ? 'numéro' : 'adresse'} est retirée de toutes nos listes + ajoutée à notre blocklist permanente.
                  </p>
                </>
              )}
              {oneClickOk && alreadyOptedOut && (
                <>
                  <p className="text-base font-semibold text-emerald-300 mb-1">Vous étiez déjà désinscrit</p>
                  <p className="text-sm text-content-secondary leading-relaxed">Aucune action supplémentaire nécessaire.</p>
                </>
              )}
              {oneClickError && (
                <>
                  <p className="text-base font-semibold text-red-300 mb-1">Erreur lors de la désinscription</p>
                  <p className="text-sm text-content-secondary leading-relaxed">
                    Code : <code className="text-xs bg-red-500/10 px-1.5 py-0.5 rounded">{oneClickError}</code>. Utilisez le formulaire ci-dessous pour saisir manuellement votre email.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card explication */}
      <div className="rounded-2xl border border-line bg-surface-elevated/40 backdrop-blur-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Eye size={14} className="text-violet-300" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-2">Pourquoi cette page ?</h2>
            <p className="text-sm text-content-secondary leading-relaxed mb-2">
              Volia agrège des données pro publiques (email pro, nom d&apos;entreprise, téléphone)
              via Google Places pour la prospection B2B (RGPD art. 6.1.f — intérêt légitime).
            </p>
            <p className="text-sm text-content-secondary leading-relaxed">
              Au titre de l&apos;<a href="https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique" target="_blank" rel="noopener" className="text-violet-300 hover:text-violet-200 underline underline-offset-2">article 21 du RGPD</a>, vous pouvez vous y opposer à tout moment. On traite votre demande sous <strong className="text-content-primary">48 heures</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-line bg-surface-elevated/40 backdrop-blur-xl p-6 sm:p-7">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Lock size={16} className="text-violet-400" />
          Demande de suppression
        </h2>

        {status === 'success' && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Demande enregistrée</p>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">Erreur</p>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-content-secondary uppercase tracking-wider mb-2">
              Adresse email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.pro"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface-base/40 border border-white/10 text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
              />
            </div>
            <p className="text-[11px] text-content-tertiary mt-1.5">L&apos;email à supprimer de notre base.</p>
          </div>

          <div>
            <label htmlFor="company" className="block text-xs font-medium text-content-secondary uppercase tracking-wider mb-2">
              Entreprise <span className="text-content-tertiary normal-case">(optionnel)</span>
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nom de votre entreprise"
              className="w-full px-4 py-3 rounded-xl bg-surface-base/40 border border-white/10 text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-xs font-medium text-content-secondary uppercase tracking-wider mb-2">
              Motif <span className="text-content-tertiary normal-case">(optionnel)</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Précisez la raison de votre demande si vous le souhaitez (aide à améliorer nos pratiques)..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-base/40 border border-white/10 text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande de suppression'}
          </button>
        </form>

        <p className="text-[11px] text-content-tertiary mt-4 leading-relaxed text-center">
          🔒 Votre email sera supprimé de notre base + ajouté à notre liste d&apos;exclusion permanente.<br />
          Pour toute question : <a href="mailto:hello@volia.fr" className="text-violet-300 hover:underline">hello@volia.fr</a>
        </p>
      </div>
    </AuthPageShell>
  );
}

export default function OptOutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-base" />}>
      <OptOutInner />
    </Suspense>
  );
}
