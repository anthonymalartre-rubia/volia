'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeStorage } from "@/lib/safe-storage";

/**
 * Hook qui combine 3 sources de vérité pour l'état d'un calculateur :
 *
 * 1. URL params (?nbSdr=5&dealSize=500...) — priorité haute (partage)
 * 2. localStorage (persistance entre visites)
 * 3. defaults (1ère visite)
 *
 * Au moindre changement utilisateur :
 *   - Met à jour le state React
 *   - Persist dans localStorage
 *   - Met à jour l'URL (replaceState, sans reload)
 *
 * Retourne aussi :
 *   - setMany() pour charger un preset complet (TPE / PME / Enterprise)
 *   - reset() pour revenir aux defaults
 *   - getShareUrl() pour le bouton partage
 */
export function useCalculatorState(storageKey, defaults) {
  // Init côté serveur avec les defaults — l'hydratation sera réconciliée côté client
  const [state, setState] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);

  // Hydratation côté client : URL > localStorage > defaults
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let next = { ...defaults };

    // Étape 1 : localStorage
    try {
      const stored = safeStorage.get(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        next = { ...next, ...parsed };
      }
    } catch {}

    // Étape 2 : URL params (override localStorage)
    const url = new URL(window.location.href);
    const params = url.searchParams;
    for (const key of Object.keys(defaults)) {
      const val = params.get(key);
      if (val !== null) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) next[key] = parsed;
      }
    }

    setState(next);
    setHydrated(true);
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist + URL update à chaque changement (mais pas avant hydratation)
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;

    // localStorage
    try {
      safeStorage.set(storageKey, JSON.stringify(state));
    } catch {}

    // URL — debounced via replaceState pour ne pas polluer l'historique
    const url = new URL(window.location.href);
    for (const [key, val] of Object.entries(state)) {
      url.searchParams.set(key, String(val));
    }
    window.history.replaceState(null, '', url.toString());
  }, [state, storageKey, hydrated]);

  // Setter pour un champ unique
  const setField = useCallback((key, val) => {
    setState((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Setter pour plusieurs champs (preset / scenario load)
  const setMany = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    setState({ ...defaults });
  }, [defaults]);

  // Builder d'URL partageable
  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }, []);

  return { state, setField, setMany, reset, getShareUrl, hydrated };
}
