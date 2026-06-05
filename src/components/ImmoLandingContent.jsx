'use client';

// ─────────────────────────────────────────────────────────────────────
// /immo — Landing de validation Volia Immo (waitlist)
// ─────────────────────────────────────────────────────────────────────
// Objectif : mesurer la demande d'un SaaS de prospection pour agents/
// mandataires immobiliers AVANT de construire le produit. Le formulaire
// poste sur /api/immo-waitlist (table immo_waitlist + emails).
// Forcé en light mode (cohérence pages marketing Volia).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, ArrowRight, Radar, Brain, Phone, FileSearch, KanbanSquare,
  ShieldCheck, Clock, MapPin, Sparkles, Star, ChevronDown,
} from 'lucide-react';
import { useForceLightTheme } from '@/lib/use-force-light-theme';
import { LogoIcon } from '@/components/ui';

const STATS = [
  { value: '1 sur 3', label: 'ventes démarrent entre particuliers' },
  { value: '900+', label: 'portails surveillés en temps réel' },
  { value: '5 min', label: 'pour voir tes biens à appeler du jour' },
  { value: '−50 %', label: 'à vie pour les 50 fondateurs' },
];

const STEPS = [
  { icon: Radar, title: '1. On détecte', desc: 'Volia surveille 900+ portails (Leboncoin, SeLoger, PAP…). Dès qu’un particulier publie sur ton secteur, tu le sais — avant les autres agences.' },
  { icon: Brain, title: '2. On priorise', desc: 'Notre IA te dit lesquels appeler en premier : fraîcheur, prix vs marché, signaux « vendeur pressé » (baisse de prix, re-publication).' },
  { icon: Phone, title: '3. Tu signes', desc: 'File d’appels prête, scripts, relances automatiques, tunnel d’estimation pour capter les vendeurs, et CRM pour suivre jusqu’au mandat.' },
];

const BENEFITS = [
  { icon: FileSearch, t: 'Ta liste d’appels du jour', d: 'Classée par probabilité de mandat. Tu arrêtes de scroller, tu appelles les bons.' },
  { icon: Clock, t: 'Alerte instantanée', d: 'À chaque nouveau bien de particulier sur ton secteur. Speed-to-lead = mandat.' },
  { icon: FileSearch, t: 'Tunnel d’estimation', d: 'Fais venir les vendeurs à toi avec une estimation en ligne — et reste conforme à la loi 2026.' },
  { icon: KanbanSquare, t: 'CRM mandats intégré', d: 'Pipeline, relances, activités. Fini les tableurs et les post-it.' },
  { icon: ShieldCheck, t: 'Conforme Bloctel & RGPD', d: 'La conformité est intégrée, pas à ta charge. Tu prospectes l’esprit tranquille.' },
  { icon: MapPin, t: 'Pensé pour le terrain', d: 'Indépendants, mandataires, petites agences. Setup en 5 min, pas un usine à gaz.' },
];

const FAQ = [
  { q: 'C’est disponible quand ?', a: 'La bêta arrive à l’été 2026. Les inscrits fondateurs y entrent en premier et choisissent leur secteur en exclusivité.' },
  { q: 'C’est légal de récupérer ces annonces ?', a: 'On passe par des sources agrégées et on est conformes Bloctel + RGPD. La conformité est intégrée à l’outil — tu n’as pas à t’en occuper.' },
  { q: 'En quoi c’est différent de la pige classique ?', a: 'La pige seule te donne une liste brute. Volia Immo te dit lequel appeler en priorité, déclenche les relances et suit jusqu’au mandat. La pige n’est qu’une brique.' },
  { q: 'Et la loi 2026 sur le démarchage ?', a: 'Justement : notre tunnel d’estimation capte le consentement des vendeurs. Tu restes le seul à pouvoir les recontacter légalement. On t’y prépare.' },
  { q: 'Ça coûtera combien ?', a: 'À partir de 79 €/mois (agent solo). Les 50 premiers inscrits obtiennent -50 % à vie. Le prix d’un seul mandat rembourse plusieurs années.' },
];

const PROFILS = ['Agent indépendant', 'Mandataire (iad, SAFTI…)', 'Agence', 'Réseau / autre'];
const BUDGETS = ['Moins de 50 €/mois', '50 à 100 €/mois', '100 à 200 €/mois', 'Selon les résultats'];

export default function ImmoLandingContent() {
  useForceLightTheme();

  const [form, setForm] = useState({ email: '', profil: '', secteurs: '', telephone: '', budget: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/immo-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'landing_immo' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Une erreur est survenue. Réessaie dans un instant.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setError('Une erreur est survenue. Réessaie dans un instant.');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      {/* ── Header minimal (focus conversion) ── */}
      <header className="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-xl border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon size="sm" />
            <span className="text-lg font-bold tracking-tight">Volia</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">IMMO</span>
          </Link>
          <a href="#form" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow shadow-violet-500/20 hover:shadow-violet-500/40 transition">
            Rejoindre la liste <ArrowRight size={14} />
          </a>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-800 mb-6">
            <Sparkles size={12} /> Bêta été 2026 · places fondateurs limitées
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            Des biens à vendre apparaissent sur ton secteur chaque jour.<br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Sois le premier à appeler.</span>
          </h1>
          <p className="text-lg sm:text-xl text-content-secondary leading-relaxed max-w-2xl mx-auto mb-8">
            Volia&nbsp;Immo surveille tous les portails en temps réel et te sort, chaque matin,
            <strong className="text-content-primary"> les biens de particuliers à appeler en priorité</strong> — classés par probabilité de mandat.
            Tu arrêtes de chercher. Tu signes.
          </p>
          <a href="#form" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-base font-semibold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition">
            🎯 Rejoindre la liste fondateur <ArrowRight size={16} />
          </a>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-content-tertiary">
            <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Sans engagement</span>
            <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> -50 % à vie pour les 50 premiers</span>
            <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> 🇫🇷 RGPD & Bloctel</span>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-surface-card p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-violet-700">{s.value}</div>
                <div className="text-xs text-content-tertiary mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROBLÈME ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20 text-center">
          <p className="text-sm font-semibold text-violet-600 mb-3">LE CONSTAT</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">La pige, c&apos;est un deuxième métier — que tu fais mal faute de temps.</h2>
          <ul className="text-left space-y-3 max-w-xl mx-auto text-content-secondary">
            {[
              'Tu scrolles Leboncoin et SeLoger le soir, à la main.',
              'Tu repères les annonces de particuliers… souvent après 3 autres agences.',
              'Tu rappelles trop tard, tu relances mal, tu perds des mandats sur un post-it oublié.',
              '1 vente sur 3 démarre entre particuliers : c’est ton gisement, et il t’échappe.',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✗</span><span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── SOLUTION ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-violet-600 mb-3">COMMENT ÇA MARCHE</p>
            <h2 className="text-3xl sm:text-4xl font-bold">De l&apos;annonce au mandat, en automatique.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-2xl border border-line bg-surface-card p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4 shadow-md">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BÉNÉFICES ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-violet-600 mb-3">CE QUE TU REÇOIS</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Tout pour rentrer plus de mandats.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.t} className="rounded-2xl border border-line bg-surface-card p-5">
                  <Icon size={20} className="text-violet-600 mb-3" />
                  <h3 className="font-semibold mb-1">{b.t}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{b.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── OFFRE FONDATEUR ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <div className="rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-8 text-center">
            <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Star size={12} fill="currentColor" /> Offre fondateur · 50 places
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Les 50 premiers inscrits obtiennent :</h2>
            <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
              <li className="flex items-start gap-2"><Check size={18} className="text-emerald-500 mt-0.5" /> <span><strong>-50 % à vie</strong> sur leur abonnement</span></li>
              <li className="flex items-start gap-2"><Check size={18} className="text-emerald-500 mt-0.5" /> <span><strong>Accès prioritaire</strong> à la bêta (été 2026)</span></li>
              <li className="flex items-start gap-2"><Check size={18} className="text-emerald-500 mt-0.5" /> <span><strong>Choix de leur secteur en exclusivité</strong> sur la bêta</span></li>
            </ul>
            <p className="text-sm text-content-tertiary">Tarif prévu : à partir de <strong className="text-content-primary">79 €/mois</strong> (solo) · <strong className="text-content-primary">199 €/mois</strong> (agence).</p>
          </div>
        </section>

        {/* ── FORMULAIRE WAITLIST ── */}
        <section id="form" className="max-w-xl mx-auto px-4 sm:px-6 mb-20 scroll-mt-20">
          <div className="rounded-3xl border border-line bg-surface-card p-6 sm:p-8 shadow-lg shadow-violet-500/5">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <Check size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Tu es sur la liste 🎉</h3>
                <p className="text-content-secondary">Tu fais partie des fondateurs. On te contacte en priorité à l&apos;ouverture de la bêta. (Vérifie ta boîte mail — un email de confirmation arrive.)</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Rejoindre la liste fondateur</h2>
                  <p className="text-sm text-content-tertiary">Places limitées · -50 % à vie · sans engagement</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-content-secondary mb-1.5">Email *</label>
                    <input id="email" type="email" required value={form.email} onChange={update('email')}
                      placeholder="toi@exemple.fr"
                      className="w-full rounded-lg border border-line bg-surface-base px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label htmlFor="profil" className="block text-sm font-medium text-content-secondary mb-1.5">Tu es…</label>
                    <select id="profil" value={form.profil} onChange={update('profil')}
                      className="w-full rounded-lg border border-line bg-surface-base px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                      <option value="">Sélectionne…</option>
                      {PROFILS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="secteurs" className="block text-sm font-medium text-content-secondary mb-1.5">Ton/tes secteur(s) <span className="text-content-muted">(ville ou codes postaux)</span></label>
                    <input id="secteurs" type="text" value={form.secteurs} onChange={update('secteurs')}
                      placeholder="Ex. Bordeaux 33000, 33200, 33300"
                      className="w-full rounded-lg border border-line bg-surface-base px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-content-secondary mb-1.5">Téléphone <span className="text-content-muted">(optionnel — pour t&apos;appeler en priorité)</span></label>
                    <input id="telephone" type="tel" value={form.telephone} onChange={update('telephone')}
                      placeholder="06 12 34 56 78"
                      className="w-full rounded-lg border border-line bg-surface-base px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-content-secondary mb-1.5">Combien serais-tu prêt(e) à investir ?</label>
                    <select id="budget" value={form.budget} onChange={update('budget')}
                      className="w-full rounded-lg border border-line bg-surface-base px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                      <option value="">Sélectionne…</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <button type="submit" disabled={status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 transition">
                    {status === 'loading' ? 'Inscription…' : 'Réserver ma place fondateur'} {status !== 'loading' && <ArrowRight size={16} />}
                  </button>
                  <p className="text-[11px] text-content-muted text-center">En t&apos;inscrivant, tu acceptes d&apos;être recontacté(e) au sujet de Volia Immo. Désinscription à tout moment.</p>
                </form>
              </>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-line bg-surface-card overflow-hidden">
                  <button type="button" onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="text-sm font-medium">{item.q}</span>
                    <ChevronDown size={16} className={`text-content-tertiary flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 -mt-1">
                      <p className="text-sm text-content-secondary leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 p-10 text-center text-white shadow-2xl shadow-violet-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Arrête de courir après les annonces.<br />Laisse-les venir à toi.</h2>
            <p className="text-violet-100 mb-6">Places fondateurs limitées · -50 % à vie</p>
            <a href="#form" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-violet-700 font-semibold hover:bg-violet-50 transition shadow-lg">
              Rejoindre la liste fondateur <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer minimal ── */}
      <footer className="border-t border-line py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-tertiary">
          <div className="flex items-center gap-1.5">
            <LogoIcon size="xs" />
            <span className="font-bold ml-1">Volia Immo</span>
            <span className="ml-2">© 2026 · Made in France</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-content-secondary">Volia.fr</Link>
            <Link href="/confidentialite" className="hover:text-content-secondary">Confidentialité</Link>
            <a href="mailto:contact@volia.fr" className="hover:text-content-secondary">contact@volia.fr</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
