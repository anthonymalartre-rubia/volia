'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function OptOutPage() {
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
        setEmail('');
        setCompany('');
        setReason('');
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
    <div className="min-h-screen bg-surface-base text-content-primary">
      {/* Header */}
      <div className="border-b border-line px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition"
          >
            <ArrowLeft size={16} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Droit d&apos;opposition &mdash; RGPD</h1>
            <p className="text-sm text-content-secondary">Suppression de vos données personnelles</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-6 rounded-2xl border border-line bg-surface-card mb-10">
          <h2 className="font-semibold text-lg mb-3">Pourquoi cette page ?</h2>
          <div className="space-y-3 text-sm text-content-secondary leading-relaxed">
            <p>
              Conformément au <strong className="text-content-primary">Règlement Général sur la Protection des Données (RGPD)</strong>,
              vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition
              concernant vos données personnelles.
            </p>
            <p>
              Prospectia.ai collecte des informations professionnelles publiquement disponibles
              (nom d&apos;entreprise, adresse, téléphone, email professionnel) via Google Places et
              des sources publiques, dans le cadre de la prospection B2B.
            </p>
            <p>
              Si vous souhaitez que vos données soient supprimées de notre base et ne soient plus
              collectées à l&apos;avenir, remplissez le formulaire ci-dessous. Votre demande sera
              traitée sous <strong className="text-content-primary">48 heures</strong>.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl border border-line bg-surface-card">
          <h2 className="font-semibold text-lg mb-6">Demande de suppression</h2>

          {status === 'success' && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-400">Demande enregistrée</p>
                <p className="text-sm text-green-400/80 mt-1">{message}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400">Erreur</p>
                <p className="text-sm text-red-400/80 mt-1">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Adresse email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
              />
              <p className="text-xs text-content-tertiary mt-1.5">
                L&apos;email que vous souhaitez supprimer de notre base de données.
              </p>
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Nom de l&apos;entreprise <span className="text-content-tertiary">(optionnel)</span>
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nom de votre entreprise"
                className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
              />
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Motif <span className="text-content-tertiary">(optionnel)</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Précisez la raison de votre demande si vous le souhaitez..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer ma demande de suppression'}
            </button>
          </form>
        </div>

        {/* Legal note */}
        <p className="text-xs text-content-tertiary mt-8 leading-relaxed text-center">
          En soumettant ce formulaire, votre email sera supprimé de notre base de prospects
          et ajouté à notre liste d&apos;exclusion pour empêcher toute collecte future.
          Pour toute question, contactez-nous à{' '}
          <a href="mailto:contact@prospectia.ai" className="text-violet-400 hover:underline">
            contact@prospectia.ai
          </a>.
        </p>
      </main>
    </div>
  );
}
