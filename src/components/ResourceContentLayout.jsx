'use client';

import { useState } from 'react';
import { safeStorage } from "@/lib/safe-storage";
import Link from 'next/link';
import { ArrowLeft, Printer, Zap, Download, X } from 'lucide-react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

/**
 * Bouton "Télécharger en PDF" qui ouvre la dialog d'impression du navigateur.
 *
 * Au premier clic : affiche une petite modale d'instruction (la 1re fois
 * seulement, mémorisée en localStorage) — beaucoup d'utilisateurs ne savent
 * pas que "Imprimer → Sauvegarder en PDF" existe.
 *
 * Pourquoi pas une route serveur via Puppeteer ?
 *   → @sparticuz/chromium dépasse les 50 MB du bundle Vercel free tier
 *     et plante en prod. La solution browser est universelle et gratuite.
 */
function PrintToPdfButton() {
  const [showHint, setShowHint] = useState(false);

  const handleClick = () => {
    const hintSeen = typeof window !== 'undefined' && safeStorage.get('print-pdf-hint-seen') === '1';
    if (!hintSeen) {
      setShowHint(true);
    } else {
      window.print();
    }
  };

  const confirmAndPrint = () => {
    if (typeof window !== 'undefined') safeStorage.set('print-pdf-hint-seen', '1');
    setShowHint(false);
    // Délai court pour laisser la modale se fermer avant la dialog print
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
      >
        <Download size={14} />
        Télécharger en PDF
      </button>

      {/* Hint modale (1re fois seulement) */}
      {showHint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print" onClick={() => setShowHint(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full bg-surface-card border border-line rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                  <Printer size={16} className="text-violet-300" />
                </div>
                <h3 className="font-bold text-content-primary">Sauvegarder en PDF</h3>
              </div>
              <button onClick={() => setShowHint(false)} className="text-content-tertiary hover:text-content-primary" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-content-secondary leading-relaxed mb-4">
              Une dialog d&apos;impression va s&apos;ouvrir. Dans le champ <strong className="text-content-primary">Destination</strong>,
              choisissez <strong className="text-content-primary">&laquo; Enregistrer au format PDF &raquo;</strong> (Mac &amp; Windows).
            </p>
            <div className="rounded-lg bg-surface-elevated p-3 text-xs text-content-tertiary mb-4 font-mono">
              💡 Raccourci clavier : <kbd className="px-1.5 py-0.5 rounded bg-surface-base">⌘ + P</kbd> (Mac) / <kbd className="px-1.5 py-0.5 rounded bg-surface-base">Ctrl + P</kbd> (Windows)
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowHint(false)} className="px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-content-primary transition">
                Annuler
              </button>
              <button onClick={confirmAndPrint} className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition inline-flex items-center gap-2">
                <Printer size={14} />
                Ouvrir la dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Layout commun pour toutes les pages de contenu des ressources :
 * - /ressources/[slug]/telecharger (versions imprimables PDF-like)
 * - /ressources/[slug]/utiliser (calculateurs interactifs)
 *
 * Inclut un CSS @media print pour transformer en PDF propre (Cmd+P)
 * et une bannière "Imprimer / Sauvegarder en PDF" pour les ressources
 * imprimables.
 */
export default function ResourceContentLayout({
  resource,
  printable = false,
  children,
}) {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      {/* Print-only styles : cache le header/footer/CTA, optimise les sauts de page */}
      <style jsx global>{`
        @media print {
          /* Cache les éléments d'UI non pertinents en PDF */
          .no-print { display: none !important; }
          /* Texte noir, fond blanc pour économiser l'encre */
          body { background: #fff !important; color: #1a1a1a !important; }
          .print-bg-white { background: #fff !important; }
          .print-text-black { color: #1a1a1a !important; }
          /* Évite la coupure au milieu des sections */
          h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
          .keep-together { break-inside: avoid; page-break-inside: avoid; }
          /* Marges PDF */
          @page { margin: 1.5cm 1.2cm; }
        }
      `}</style>

      <div className="no-print">
        <ReaderHeader />
      </div>

      <main className="pt-24 pb-16 print:pt-0 print:pb-0">
        {/* Top bar : retour + print */}
        <div className="no-print max-w-4xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <Link
            href={`/ressources/${resource.slug}`}
            className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition"
          >
            <ArrowLeft size={14} />
            Retour à la description
          </Link>

          {printable && <PrintToPdfButton />}
        </div>

        {/* Contenu */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 print:max-w-none print:px-0 print-bg-white">
          {children}
        </article>

        {/* Footer CTA — caché en print */}
        <div className="no-print max-w-4xl mx-auto px-4 sm:px-6 mt-12">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-6 sm:p-8 text-center">
            <Zap size={28} className="text-violet-400 mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Au-delà de cette ressource</h2>
            <p className="text-content-secondary mb-5 max-w-xl mx-auto text-sm">
              Volia trouve les entreprises et leurs emails partout en France.
              Gratuit pour commencer · à partir de 19 €/mois.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
            >
              Démarrer gratuitement
            </Link>
          </div>
        </div>
      </main>

      <div className="no-print">
        <ReaderFooter />
      </div>
    </div>
  );
}
