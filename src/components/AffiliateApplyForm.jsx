'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AffiliateApplyForm() {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', motivation: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Connexion impossible. Réessaie ou écris à contact@volia.fr.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <h3 className="text-xl font-bold text-content-primary">Candidature reçue 🤝</h3>
        <p className="mt-2 text-content-secondary">
          On revient vers toi très vite par email avec ton lien d'affiliation et ton tableau de bord.
        </p>
      </div>
    );
  }

  const input =
    'w-full rounded-lg border border-line bg-surface-base px-4 py-3 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-violet-500';

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={input} placeholder="Ton nom *" value={form.name} onChange={update('name')} required />
        <input className={input} type="email" placeholder="Email *" value={form.email} onChange={update('email')} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={input} placeholder="Société (optionnel)" value={form.company} onChange={update('company')} />
        <input className={input} placeholder="Téléphone (optionnel)" value={form.phone} onChange={update('phone')} />
      </div>
      <textarea
        className={`${input} min-h-[110px] resize-y`}
        placeholder="Comment comptes-tu promouvoir Volia ? (réseau, audience, secteur…)"
        value={form.motivation}
        onChange={update('motivation')}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
      >
        {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
        Postuler au programme
      </button>
      <p className="text-center text-xs text-content-tertiary">
        Candidature validée manuellement. Tu recevras ton lien par email une fois approuvé·e.
      </p>
    </form>
  );
}
