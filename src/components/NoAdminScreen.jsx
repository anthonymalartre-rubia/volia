'use client';

// ─────────────────────────────────────────────────────────────────────
// NoAdminScreen — écran "feature en cours de déploiement"
// ─────────────────────────────────────────────────────────────────────
// Affiché quand un user payant tente d'accéder à une page /admin/*
// (typiquement le module Campagnes) avant que son compte ait été
// ungated. Anciennement c'était un message négatif "Accès admin
// requis" qui frustrait les clients Solo/Pro légitimes.
//
// Wording positif :
//   - Titre "arrive bientôt sur votre plan"
//   - CTA primaire mailto pour rejoindre la beta privée
//   - CTA secondaire vers la page produit (pitch + features)
//
// Note : avec l'unlock plan-based (Sprint 1A), ce composant est rarement
// rendu, mais on garde la cohérence de wording pour les rares cas (ex:
// flag temporaire, bug d'accès, compte récent en cours d'activation).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { Sparkles, Mail, ArrowRight, LogIn } from 'lucide-react';

export default function NoAdminScreen({ email, signOut, productHref = '/produits/campagnes', featureName = 'Campagnes' }) {
  const subject = encodeURIComponent(`Demande accès beta ${featureName}`);
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaiterais rejoindre la beta privée du module ${featureName} sur Volia.\n\nMon compte : ${email || '(non renseigné)'}\n\nMerci !\n`
  );
  const mailto = `mailto:contact@volia.fr?subject=${subject}&body=${body}`;

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-violet-500/20 bg-surface-card p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4">
          <Sparkles size={20} className="text-violet-300" />
        </div>
        <h1 className="text-xl font-bold mb-2 text-content-primary">
          Cette fonctionnalité arrive bientôt sur votre plan
        </h1>
        <p className="text-sm text-content-secondary mb-2">
          Nous déployons progressivement le module <strong className="text-content-primary">{featureName}</strong> à tous nos clients payants. Vous serez parmi les premiers à y avoir accès.
        </p>
        {email && (
          <p className="text-xs text-content-tertiary mb-6">
            Compte connecté : <span className="text-content-secondary">{email}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 mt-6">
          <a
            href={mailto}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
          >
            <Mail size={14} />
            Rejoindre la beta privée
          </a>
          <Link
            href={productHref}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-line text-content-secondary hover:text-content-primary hover:border-violet-500/40 text-sm font-medium transition"
          >
            Découvrir le module
            <ArrowRight size={14} />
          </Link>
        </div>
        {signOut && (
          <button
            onClick={signOut}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-secondary transition"
          >
            <LogIn size={12} />
            Changer de compte
          </button>
        )}
      </div>
    </div>
  );
}
