'use client';

// Composant capture email newsletter — réutilisable dans footer, blog,
// ressources, etc. Variants : compact (1 ligne) ou card (full block).

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function NewsletterCapture({
  variant = 'card', // 'card' | 'compact' | 'inline'
  source = 'unknown',
  title = '1 email par mois, le meilleur de la prospection B2B',
  subtitle = 'Stats sectorielles, templates qui convertissent, retours d\'expérience. Désinscription 1 clic.',
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Erreur — réessayez');
        return;
      }
      setStatus('success');
      setMessage(
        data.status === 'reactivated'
          ? 'Bon retour ! Vous êtes ré-inscrit.'
          : data.status === 'already_subscribed'
          ? 'Vous êtes déjà inscrit, parfait.'
          : 'C\'est bon ! Vous recevrez la prochaine édition.'
      );
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Erreur réseau');
    }
  }

  // Variant compact : 1 ligne inline (pour footer ou sidebar)
  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="email"
          required
          placeholder="votre@email.pro"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="flex-1 px-3 py-2 rounded-lg bg-surface-base/30 border border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 transition"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success' || !email}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition whitespace-nowrap"
        >
          {status === 'loading' ? <Loader2 size={12} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={12} /> : <Mail size={12} />}
          {status === 'success' ? 'Inscrit' : 'S\'inscrire'}
        </button>
        {status === 'error' && <p className="text-xs text-red-400 sm:basis-full">⚠ {message}</p>}
        {status === 'success' && variant === 'compact' && <p className="text-xs text-emerald-400 sm:basis-full">✓ {message}</p>}
      </form>
    );
  }

  // Variant card : bloc complet avec titre + description
  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.08] p-6 sm:p-7">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-violet-300" />
        <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider">Newsletter mensuelle</span>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">{title}</h3>
      <p className="text-sm text-content-secondary leading-relaxed mb-5">{subtitle}</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="votre@email.pro"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="flex-1 px-4 py-3 rounded-xl bg-surface-base/40 border border-white/10 text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 transition"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success' || !email}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20 whitespace-nowrap"
        >
          {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={14} /> : <Mail size={14} />}
          {status === 'success' ? 'Inscrit ✓' : 'M\'inscrire'}
        </button>
      </form>
      {status === 'error' && <p className="text-xs text-red-300 mt-2">⚠ {message}</p>}
      {status === 'success' && <p className="text-xs text-emerald-300 mt-2">✓ {message}</p>}
      <p className="text-[10px] text-content-tertiary mt-3">
        🔒 Aucun spam · 1 email/mois max · désinscription 1 clic. RGPD compliant.
      </p>
    </div>
  );
}
