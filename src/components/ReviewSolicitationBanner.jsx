'use client';

// ReviewSolicitationBanner — encart non-intrusif dans le dashboard pour
// inciter les power users à laisser un avis Trustpilot.
//
// Stratégie : "Strike when the iron is hot" — on demande l'avis au moment
// précis où l'user a perçu la valeur du produit (1er export = il a obtenu
// ses prospects). Best practice e-commerce/SaaS.
//
// Affiche le WIDGET OFFICIEL Trustpilot Review Collector (5 étoiles
// cliquables, branding officiel, formulaire intégré au lieu de redirect).
// Script Trustpilot chargé en lazy load via next/script — n'impacte donc
// PAS le TTI du dashboard (chargé après idle).
//
// Conditions cumulatives d'affichage :
// - Trustpilot configuré (TRUSTPILOT_BUSINESS_UNIT_ID set, fallback en
//   hardcode dans trustpilot-data.js → toujours vrai en prod)
// - L'user a déjà fait au moins 1 export CSV réussi
// - L'user n'a pas dismiss dans les 30 derniers jours (localStorage)

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { X } from 'lucide-react';
import {
  TRUSTPILOT_BUSINESS_UNIT_ID,
  TRUSTPILOT_REVIEW_COLLECTOR_TOKEN,
  TRUSTPILOT_PROFILE_URL,
} from '@/lib/trustpilot-data';

const DISMISS_KEY = 'volia_trustpilot_solicitation_dismissed_v1';
const DISMISS_DURATION_DAYS = 30;

// Template officiel Trustpilot "Review Collector" — 5 étoiles cliquables
const TRUSTPILOT_REVIEW_COLLECTOR_TEMPLATE_ID = '56278e9abfbbba0bdcd568bc';

export default function ReviewSolicitationBanner({ exportsCount = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Conditions cumulatives
    if (!TRUSTPILOT_BUSINESS_UNIT_ID) return;
    if (exportsCount < 1) return;

    // Vérifie dismiss (avec date d'expiration 30 jours)
    try {
      const dismissedAtStr = localStorage.getItem(DISMISS_KEY);
      if (dismissedAtStr) {
        const dismissedAt = parseInt(dismissedAtStr, 10);
        const expiresAt = dismissedAt + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() < expiresAt) return;
      }
    } catch {}

    setVisible(true);
  }, [exportsCount]);

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Script Trustpilot bootstrap — chargé en lazy (après idle) pour
          ne PAS impacter le TTI/LCP du dashboard. Présent une seule fois
          dans la page (Next.js dédupplique automatiquement). */}
      <Script
        id="trustpilot-bootstrap"
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
      />

      <div className="fixed bottom-4 left-4 z-40 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-emerald-500/30 bg-surface-card shadow-2xl shadow-emerald-500/10 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-bold text-content-primary">
                Vous aimez Volia ?
              </h3>
              <p className="text-[12px] text-content-secondary leading-relaxed mt-0.5">
                Notez-nous en 1 clic ci-dessous. 30 secondes pas plus.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-content-tertiary hover:text-content-secondary transition flex-shrink-0 mt-0.5"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Widget Trustpilot Review Collector officiel.
              Initialisé par le script bootstrap (cible tous les `.trustpilot-widget`). */}
          <div
            className="trustpilot-widget"
            data-locale="fr-FR"
            data-template-id={TRUSTPILOT_REVIEW_COLLECTOR_TEMPLATE_ID}
            data-businessunit-id={TRUSTPILOT_BUSINESS_UNIT_ID}
            data-style-height="52px"
            data-style-width="100%"
            data-token={TRUSTPILOT_REVIEW_COLLECTOR_TOKEN}
          >
            {/* Fallback link affiché tant que le script n'est pas chargé */}
            <a
              href={TRUSTPILOT_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-emerald-300 hover:text-emerald-200 py-3 underline underline-offset-2"
            >
              Laisser un avis sur Trustpilot →
            </a>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="block w-full text-center mt-2 text-[11px] text-content-tertiary hover:text-content-secondary transition"
          >
            Plus tard
          </button>
        </div>
      </div>
    </>
  );
}
