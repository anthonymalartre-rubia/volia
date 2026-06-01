'use client';

// ─────────────────────────────────────────────────────────────────────
// KitImprimable.jsx — Press kit imprimable (PDF via window.print)
// ─────────────────────────────────────────────────────────────────────
// Page rendue en une longue colonne A4-optimized. Le journaliste clique
// "Télécharger en PDF" → window.print() → dialog navigateur → "Enregistrer
// en PDF" → fichier .pdf généré localement.
//
// Pourquoi ce pattern (vs Puppeteer serverless) :
//   - Bundle Puppeteer trop lourd pour Vercel free tier (cf. commentaire
//     dans /api/ressources/[slug]/pdf/route.js qui est désactivé)
//   - PDF natif de qualité = sélection texte + liens + recherche
//   - Aucune dépendance externe
//   - Le journaliste peut aussi imprimer sur papier s'il préfère
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { useEffect } from 'react';
import { Printer, ArrowLeft, Mail, MapPin, Code2, ExternalLink, Quote, Award, FileText } from 'lucide-react';
import {
  BOILERPLATE,
  KEY_NUMBERS,
  FOUNDER_QUOTES,
  FOUNDER_BIO,
  PRESS_CONTACT,
  PRESS_ANGLES,
} from '@/lib/press-kit';

export default function KitImprimable() {
  // Optionnel : auto-déclencher la dialog d'impression si ?autoprint=1
  // Permet aux journalistes de partager le lien direct vers le PDF.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autoprint') === '1') {
        // Petite latence pour laisser le DOM s'assembler complètement
        setTimeout(() => window.print(), 500);
      }
    }
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* ─── CSS print-optimized (caché à l'écran, appliqué à l'impression) ─── */}
      <style jsx global>{`
        @media print {
          /* Cacher la nav print-friendly + le bouton + les liens retour */
          .no-print { display: none !important; }

          /* Marges A4 propres */
          @page {
            size: A4;
            margin: 18mm 16mm 18mm 16mm;
          }

          /* Éviter coupures de cards en plein milieu */
          .print-block {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Section breaks volontaires entre grosses sections */
          .print-page-break {
            page-break-before: always;
            break-before: page;
          }

          /* Couleur fond imprimable (sinon Chrome n'imprime pas les gradients) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Liens : afficher l'URL après le texte pour version papier */
          a[href^="http"]::after,
          a[href^="mailto"]::after {
            content: " (" attr(href) ")";
            font-size: 0.75em;
            color: #666;
            font-weight: normal;
          }
          /* Pas d'URL pour les liens internes ou JSON-LD */
          a[href^="/"]::after,
          a[href^="#"]::after {
            content: "";
          }

          /* Forcer fond blanc + texte noir lisible */
          body, html { background: white !important; color: #111 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-100 text-content-primary">
        {/* ─── Barre supérieure (cachée à l'impression) ───────────── */}
        <div className="no-print bg-white border-b border-line sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link
              href="/presse"
              className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-700 transition"
            >
              <ArrowLeft size={16} />
              Retour à l&apos;espace presse
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 transition-all"
            >
              <Printer size={16} />
              Télécharger en PDF
            </button>
          </div>
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <p className="text-xs text-content-tertiary">
              💡 Astuce : dans la dialog d&apos;impression, sélectionne
              « Enregistrer au format PDF » comme imprimante de destination.
            </p>
          </div>
        </div>

        {/* ─── Document imprimable ─────────────────────────────────── */}
        <main className="max-w-3xl mx-auto px-6 sm:px-10 py-10 bg-white shadow-xl sm:my-8 sm:rounded-lg">
          {/* PAGE 1 — HEADER + STATS CLÉS */}
          <header className="print-block mb-8 pb-6 border-b-2 border-violet-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-violet-700 tracking-tight">
                Volia<span className="text-violet-400">.fr</span>
              </div>
              <div className="text-xs text-content-tertiary text-right">
                Press kit · {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-content-primary mb-3">
              Volia, première entreprise SaaS autonome au monde
            </h1>
            <p className="text-base text-content-secondary leading-relaxed">
              Pilotée par IA, augmentée par 1 founder, construite en 6 semaines à Marseille.
              Suite B2B de 4 modules connectés à 149 €/mois — alternative française à
              HubSpot+Apollo+Lemlist+Tally.
            </p>
          </header>

          {/* CHIFFRES CLÉS — version compacte */}
          <section className="print-block mb-8">
            <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
              <Award size={20} className="text-violet-600" />
              Chiffres clés
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {KEY_NUMBERS.slice(0, 8).map((kn) => (
                <div
                  key={kn.label}
                  className="p-3 rounded-lg border border-violet-100 bg-violet-50/40 text-center print-block"
                >
                  <div className="text-2xl font-bold text-violet-700 tabular-nums">{kn.value}</div>
                  <div className="text-[10px] text-content-tertiary leading-tight mt-1">{kn.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* BOILERPLATES (3 versions) */}
          <section className="print-block mb-8">
            <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
              <FileText size={20} className="text-violet-600" />
              Boilerplates (prêts à citer)
            </h2>
            <div className="space-y-4">
              {Object.entries(BOILERPLATE).map(([key, text]) => (
                <div key={key} className="print-block p-4 rounded-lg border border-line bg-zinc-50">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-violet-700 mb-2">
                    Version {key === 'short' ? 'courte (1 phrase)' : key === 'medium' ? 'moyenne (3 phrases)' : 'longue (paragraphe)'}
                  </div>
                  <p className="text-sm text-content-primary leading-relaxed italic">
                    « {text} »
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* PRESS ANGLES */}
          <section className="print-block mb-8">
            <h2 className="text-xl font-bold text-content-primary mb-4">
              3 angles d&apos;attaque pour les médias
            </h2>
            <div className="space-y-3">
              {PRESS_ANGLES.map((angle, idx) => (
                <div key={idx} className="print-block p-3 rounded-lg border-l-4 border-violet-500 bg-violet-50/30">
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-1">
                    Angle {String.fromCharCode(65 + idx)} — {angle.label}
                  </div>
                  <p className="text-sm text-content-primary mb-1 font-semibold">{angle.headline}</p>
                  {angle.targetMedia && (
                    <p className="text-xs text-content-tertiary">
                      <strong>Médias cibles :</strong> {angle.targetMedia}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── PAGE BREAK pour la suite ─── */}
          <div className="print-page-break"></div>

          {/* BIO FOUNDER */}
          <section className="print-block mb-8">
            <h2 className="text-xl font-bold text-content-primary mb-4">
              Anthony Malartre — Founder
            </h2>
            <div className="space-y-3">
              {FOUNDER_BIO.short && (
                <div className="print-block">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-violet-700 mb-1">
                    Bio courte (1-2 phrases)
                  </div>
                  <p className="text-sm text-content-primary leading-relaxed">{FOUNDER_BIO.short}</p>
                </div>
              )}
              {FOUNDER_BIO.medium && (
                <div className="print-block">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-violet-700 mb-1">
                    Bio moyenne (5 phrases)
                  </div>
                  <p className="text-sm text-content-primary leading-relaxed">{FOUNDER_BIO.medium}</p>
                </div>
              )}
              {FOUNDER_BIO.long && (
                <div className="print-block">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-violet-700 mb-1">
                    Bio longue (paragraphe complet)
                  </div>
                  <p className="text-sm text-content-primary leading-relaxed whitespace-pre-line">{FOUNDER_BIO.long}</p>
                </div>
              )}
            </div>
          </section>

          {/* QUOTES PRÊTES À CITER */}
          <section className="print-block mb-8">
            <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
              <Quote size={20} className="text-violet-600" />
              Citations libres de droits (avec attribution)
            </h2>
            <div className="space-y-4">
              {FOUNDER_QUOTES.map((q, idx) => (
                <blockquote
                  key={idx}
                  className="print-block p-4 rounded-lg border-l-4 border-violet-600 bg-violet-50/40"
                >
                  <p className="text-sm text-content-primary leading-relaxed italic mb-2">
                    « {q.quote} »
                  </p>
                  <footer className="text-xs text-content-tertiary not-italic">
                    — Anthony Malartre, founder Volia
                    {q.context && <span className="block text-[10px] mt-0.5">Contexte : {q.context}</span>}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          {/* ─── PAGE BREAK pour la dernière section ─── */}
          <div className="print-page-break"></div>

          {/* CONTACTS + LIENS UTILES */}
          <section className="print-block mb-8">
            <h2 className="text-xl font-bold text-content-primary mb-4">
              Contact presse & ressources
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Bloc contact */}
              <div className="print-block p-4 rounded-lg border-2 border-violet-200 bg-violet-50/60">
                <div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-3">
                  Contact direct (24 h)
                </div>
                <p className="text-sm font-semibold text-content-primary mb-1">
                  {PRESS_CONTACT?.name || 'Anthony Malartre'}
                </p>
                <p className="text-xs text-content-tertiary mb-3">
                  {PRESS_CONTACT?.role || 'Founder'}
                </p>
                <div className="space-y-1.5 text-sm">
                  <a
                    href={`mailto:${PRESS_CONTACT?.email || 'contact@volia.fr'}`}
                    className="flex items-center gap-2 text-violet-700 font-semibold hover:underline"
                  >
                    <Mail size={14} />
                    {PRESS_CONTACT?.email || 'contact@volia.fr'}
                  </a>
                  {PRESS_CONTACT?.location && (
                    <p className="flex items-center gap-2 text-content-secondary">
                      <MapPin size={14} />
                      {PRESS_CONTACT.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Bloc liens utiles */}
              <div className="print-block p-4 rounded-lg border border-line bg-zinc-50">
                <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-3">
                  Ressources publiques vérifiables
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://volia.fr" className="text-violet-700 hover:underline flex items-center gap-1.5">
                      <ExternalLink size={12} /> volia.fr (produit)
                    </a>
                  </li>
                  <li>
                    <a href="https://volia.fr/notre-histoire" className="text-violet-700 hover:underline flex items-center gap-1.5">
                      <ExternalLink size={12} /> volia.fr/notre-histoire
                    </a>
                  </li>
                  <li>
                    <a href="https://volia.fr/changelog" className="text-violet-700 hover:underline flex items-center gap-1.5">
                      <ExternalLink size={12} /> volia.fr/changelog (commits publics)
                    </a>
                  </li>
                  <li>
                    <a href="https://volia.fr/etude" className="text-violet-700 hover:underline flex items-center gap-1.5">
                      <ExternalLink size={12} /> volia.fr/etude (chiffres à citer)
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/anthonymalartre-rubia/volia" className="text-violet-700 hover:underline flex items-center gap-1.5">
                      <Code2 size={12} /> github.com/anthonymalartre-rubia/volia
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mention disponibilité */}
            <div className="print-block p-3 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 text-center">
              <p className="text-sm text-content-primary">
                <strong className="text-violet-700">Disponible pour interviews FR/EN</strong> · visio ou Marseille ·
                Réponse sous 24 h ouvrées
              </p>
            </div>
          </section>

          {/* GARDE-FOU DGCCRF (rappel transparence) */}
          <section className="print-block mb-6 p-3 rounded-lg bg-amber-50/40 border border-amber-200">
            <p className="text-xs text-content-tertiary leading-relaxed">
              <strong className="text-amber-700">Transparence :</strong> bien que pilotée par IA,
              Volia conserve une supervision humaine permanente. Anthony Malartre reste
              responsable des décisions produit, du sales et du service client. La formule
              « 1 humain décide, 1000 agents exécutent » résume le modèle.
            </p>
          </section>

          {/* FOOTER */}
          <footer className="text-center text-xs text-content-tertiary pt-6 border-t border-line">
            <p className="font-semibold text-violet-700 mb-1">Volia.fr</p>
            <p>Press kit généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} · Version imprimable</p>
            <p className="mt-2">
              Pour la version la plus à jour :{' '}
              <a href="https://volia.fr/presse" className="text-violet-700 hover:underline">
                volia.fr/presse
              </a>
            </p>
          </footer>
        </main>

        {/* ─── Bouton flottant (cachée à l'impression) ────────────── */}
        <div className="no-print fixed bottom-6 right-6 z-50">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-2xl shadow-violet-500/40 transition-all hover:scale-105 active:scale-95"
            aria-label="Télécharger le press kit en PDF"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Télécharger en PDF</span>
          </button>
        </div>
      </div>
    </>
  );
}
