'use client';

import { useState } from 'react';
import { Check, Download, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

/**
 * Formulaire de capture lead pour télécharger une ressource.
 *
 * - 3 champs : email (requis), prénom (optionnel), société (optionnel)
 * - Validation côté client (regex email)
 * - Appel à POST /api/ressources/download
 * - États : idle → loading → success | error
 *
 * Sur success : affiche un message + lien direct vers le téléchargement.
 */
export default function ResourceDownloadForm({ resource }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const isDirect = resource.deliveryMode === 'direct';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state === 'loading') return;

    // Validation simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setState('error');
      setErrorMsg('Email invalide. Vérifiez votre saisie.');
      return;
    }

    setState('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ressources/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_slug: resource.slug,
          email: email.trim(),
          first_name: firstName.trim() || null,
          company: company.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState('error');
        setErrorMsg(data.error || 'Erreur inattendue. Réessayez.');
        return;
      }
      setDownloadUrl(data.url);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMsg('Erreur réseau. Vérifiez votre connexion.');
    }
  };

  // Cas calculateur (deliveryMode: direct) : pas de formulaire,
  // directement un bouton "Utiliser le calculateur"
  if (isDirect) {
    return (
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Download size={16} className="text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            Accès gratuit, sans email
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
        <p className="text-sm text-content-secondary leading-relaxed mb-6">
          {resource.shortDesc}
        </p>
        <Link
          href={`/ressources/${resource.slug}/utiliser`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
        >
          <Download size={16} />
          Utiliser le calculateur
        </Link>
      </div>
    );
  }

  // État success : confirmation + bouton de DL direct
  if (state === 'success') {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/[0.08] to-emerald-500/[0.05] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Check size={16} className="text-green-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-green-300">
            Email envoyé !
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">Vérifiez votre boîte mail</h3>
        <p className="text-sm text-content-secondary leading-relaxed mb-4">
          Le lien de téléchargement a été envoyé à <strong className="text-content-primary">{email}</strong>.
          Si vous ne le voyez pas dans les 2 minutes, vérifiez vos spams.
        </p>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
          >
            <Download size={16} />
            Ou télécharger immédiatement
          </a>
        )}
      </div>
    );
  }

  // Formulaire de capture (idle, loading, error)
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-6 sm:p-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
          Téléchargement gratuit
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
      <p className="text-sm text-content-secondary leading-relaxed mb-6">
        {resource.format} · {resource.fileSize}
        {resource.pages ? ` · ${resource.pages} pages` : ''}
      </p>

      <div className="space-y-3 mb-4">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 transition"
          aria-label="Adresse email"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            autoComplete="given-name"
            placeholder="Prénom (optionnel)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={state === 'loading'}
            className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 transition"
            aria-label="Prénom"
          />
          <input
            type="text"
            autoComplete="organization"
            placeholder="Société (optionnel)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={state === 'loading'}
            className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 transition"
            aria-label="Société"
          />
        </div>
      </div>

      {state === 'error' && errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || !email}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
      >
        {state === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Download size={16} />
            Télécharger gratuitement
          </>
        )}
      </button>

      <p className="text-xs text-content-tertiary mt-3 leading-relaxed">
        En cliquant, vous recevrez le lien par email et vous pourrez recevoir
        occasionnellement nos meilleures ressources. Désinscription en 1 clic à tout moment.
        Conforme RGPD.
      </p>
    </form>
  );
}
