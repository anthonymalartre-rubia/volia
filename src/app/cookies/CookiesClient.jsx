'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, Download, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import {
  CATEGORIES,
  useCookieConsent,
  downloadConsentHistory,
} from '@/lib/cookieConsent';

export default function CookiesClient() {
  const { hydrated, consent, openModal, revoke, consentDate, expiresDate } = useCookieConsent();

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch (e) {
      return d.toISOString();
    }
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition mb-10"
        >
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Cookie size={22} className="text-violet-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Gestion des cookies</h1>
            <p className="text-content-secondary text-sm mt-2">
              Liste exhaustive et transparente — conformité CNIL stricte
            </p>
          </div>
        </div>

        <p className="text-content-secondary leading-relaxed mt-6 mb-6">
          Tous les cookies et traceurs utilisés par Volia.fr sont listés ici. Vous pouvez modifier
          votre consentement à tout moment via le bouton ci-dessous. Conformément à la CNIL, on
          vous redemande votre choix au bout de 6 mois maximum.
        </p>

        {/* En résumé global */}
        <div className="mb-10 p-5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-sm text-content-secondary leading-relaxed">
          <p className="text-content-primary font-semibold mb-2">En 2 phrases</p>
          <p>
            On dépose 4 types de cookies (strictement nécessaires, fonctionnels, analytiques,
            marketing). Vous pouvez tout accepter, tout refuser ou choisir par catégorie — modifiable
            à tout moment via le bouton ci-dessous.
          </p>
        </div>

        {/* Statut du consentement actuel */}
        <section className="mb-10 p-6 rounded-2xl border border-line bg-surface-card">
          <h2 className="text-lg font-semibold text-content-primary mb-4">Votre consentement actuel</h2>

          {!hydrated ? (
            <p className="text-sm text-content-secondary">Chargement…</p>
          ) : !consent ? (
            <div className="text-sm text-content-secondary">
              <p>
                Vous n&apos;avez pas encore exprimé de choix. Seuls les cookies strictement nécessaires
                sont déposés.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20"
                >
                  <Settings size={16} /> Définir mes préférences
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-content-tertiary text-xs">Consentement donné le</p>
                  <p className="text-content-primary font-medium">{formatDate(consentDate)}</p>
                </div>
                <div>
                  <p className="text-content-tertiary text-xs">Expire le</p>
                  <p className="text-content-primary font-medium">{formatDate(expiresDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-content-tertiary text-xs mb-2">Catégories autorisées</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(CATEGORIES).map((cat) => {
                    const on = !!consent.categories?.[cat.id];
                    return (
                      <li
                        key={cat.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm"
                      >
                        {on ? (
                          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-content-tertiary flex-shrink-0" />
                        )}
                        <span className={on ? 'text-content-primary' : 'text-content-secondary'}>
                          {cat.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20"
                >
                  <Settings size={16} /> Modifier mes préférences
                </button>
                <button
                  type="button"
                  onClick={revoke}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-content-primary bg-surface-elevated border border-line rounded-lg hover:bg-surface-hover transition"
                >
                  <RefreshCw size={16} /> Retirer mon consentement
                </button>
                <button
                  type="button"
                  onClick={downloadConsentHistory}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-content-primary bg-surface-elevated border border-line rounded-lg hover:bg-surface-hover transition"
                >
                  <Download size={16} /> Télécharger (JSON)
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Liste exhaustive des cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-content-primary mb-2">Liste exhaustive des cookies</h2>
          <p className="text-sm text-content-secondary mb-6">
            Tous les cookies que Volia.fr peut déposer, classés par catégorie. Les cookies stricts
            sont déposés systématiquement ; les autres uniquement si vous y avez consenti.
          </p>

          <div className="rounded-2xl border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-card">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Catégorie</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Finalité</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Émetteur</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(CATEGORIES).flatMap((cat) =>
                    cat.cookies.map((c) => (
                      <tr key={`${cat.id}-${c.name}`} className="border-b border-line last:border-b-0">
                        <td className="py-3 px-4 font-mono text-xs text-content-primary">{c.name}</td>
                        <td className="py-3 px-4 text-content-secondary">{cat.label}</td>
                        <td className="py-3 px-4 text-content-secondary">{c.purpose}</td>
                        <td className="py-3 px-4 text-content-secondary">{c.issuer}</td>
                        <td className="py-3 px-4 text-content-secondary">{c.duration}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Description des catégories */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-content-primary mb-4">Les 4 catégories de cookies</h2>
          <div className="space-y-4">
            {Object.values(CATEGORIES).map((cat) => (
              <div key={cat.id} className="p-5 rounded-xl border border-line bg-surface-card">
                <h3 className="font-semibold text-content-primary">{cat.label}</h3>
                <p className="text-sm text-content-secondary mt-1.5 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 p-6 rounded-2xl border border-line bg-surface-card">
          <h2 className="text-lg font-semibold text-content-primary mb-3">Vos droits</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Au titre du RGPD et de la loi Informatique et Libertés, vous pouvez à tout moment retirer
            votre consentement, changer d&apos;avis par catégorie, ou demander la suppression des
            données déjà collectées. Pour le détail, voir nos pages{' '}
            <Link href="/confidentialite" className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline">
              Confidentialité
            </Link>{' '}
            et{' '}
            <Link href="/rgpd" className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline">
              RGPD
            </Link>
            .
          </p>
        </section>

        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-content-secondary">
          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-content-primary transition">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-content-primary transition">
              Confidentialité
            </Link>
            <Link href="/rgpd" className="hover:text-content-primary transition">
              RGPD
            </Link>
          </div>
          <p className="text-content-tertiary text-xs">&copy; 2026 Volia.fr</p>
        </div>
      </div>
    </div>
  );
}
