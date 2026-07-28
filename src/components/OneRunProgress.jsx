'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

/**
 * Progression affichée pendant un run Volia One (~30 s).
 *
 * Le bouton passait simplement à « Analyse… » : sur 30 secondes, rien ne
 * distinguait un traitement en cours d'une page plantée. On affiche donc les
 * étapes que le serveur exécute réellement, dans l'ordre où il les exécute.
 *
 * HONNÊTETÉ — à lire avant de modifier :
 * /api/one/run répond d'un bloc (aucun streaming, aucune route de progression
 * pendant le run). L'ORDRE des étapes est donc vrai, mais le MOMENT des
 * transitions est estimé sur le temps écoulé. En conséquence :
 *   - aucun pourcentage, aucun compteur de leads (ce serait un chiffre inventé,
 *     cf. bible de marque : « chiffres uniquement vrais et vérifiables ») ;
 *   - la dernière étape n'est JAMAIS cochée « terminée », puisqu'on ne peut pas
 *     le confirmer — elle reste active jusqu'à ce que la réponse arrive et que
 *     le composant soit démonté par le parent.
 * Si un jour la route émet sa vraie progression (SSE), brancher `current`
 * dessus et supprimer les seuils ci-dessous.
 *
 * Monté uniquement pendant le chargement : le remontage suffit à repartir de
 * zéro à chaque run, aucun reset à gérer.
 */

// Seuils estimés (ms depuis le montage), calés sur le coût relatif des appels :
// lecture du site (court) → Places + cascade d'enrichissement (le plus long) →
// rédaction Claude.
const STEPS = [
  {
    at: 0,
    label: 'One lit ton site',
    hint: 'Il comprend ce que tu vends, et à qui.',
  },
  {
    at: 5000,
    label: 'One cherche tes prospects',
    hint: 'Son site, puis une recherche Google, puis les formats d’adresse classiques.',
  },
  {
    at: 20000,
    label: 'One rédige tes brouillons',
    hint: 'Un cold email court, écrit à partir de ton activité.',
  },
];

// Au-delà, on le dit plutôt que de laisser croire à un blocage. 30 s est la
// durée annoncée sous le champ ; 45 s est donc factuellement « plus long ».
const SLOW_AFTER_MS = 45000;

export default function OneRunProgress() {
  const [elapsed, setElapsed] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false);
    const startedAt = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 500);
    return () => clearInterval(id);
  }, []);

  // Étape en cours = la dernière dont le seuil est franchi (jamais au-delà de
  // la dernière : on ne prétend pas que le run est fini).
  let current = 0;
  for (let i = 0; i < STEPS.length; i += 1) {
    if (elapsed >= STEPS[i].at) current = i;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-xl mx-auto mb-8 rounded-xl border border-line bg-surface-card p-5"
    >
      <ul className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step.label} className="flex gap-3">
              <span className="flex-none w-5 flex justify-center pt-0.5" aria-hidden="true">
                {done ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      active
                        ? `bg-violet-500${reduce ? '' : ' animate-pulse'}`
                        : 'bg-line'
                    }`}
                  />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-medium ${
                    active
                      ? 'text-content-primary'
                      : done
                        ? 'text-content-secondary'
                        : 'text-content-tertiary'
                  }`}
                >
                  {step.label}
                </span>
                {active && (
                  <span className="block text-xs text-content-tertiary mt-0.5">{step.hint}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {elapsed >= SLOW_AFTER_MS && (
        <p className="text-xs text-content-tertiary mt-4 pt-3 border-t border-line">
          C&apos;est plus long que d&apos;habitude. On continue — ne recharge pas la page.
        </p>
      )}
    </div>
  );
}
