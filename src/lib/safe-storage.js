// ─────────────────────────────────────────────────────────────────────
// safe-storage.js — accès localStorage tolérant aux pannes
// ─────────────────────────────────────────────────────────────────────
// Dans certains navigateurs in-app (WebView LinkedIn/Instagram sur Android,
// Safari en navigation privée stricte, navigateurs avec stockage désactivé),
// `window.localStorage` peut être `null` OU jeter une SecurityError au simple
// accès. Un appel direct `localStorage.getItem(...)` y plante alors avec
// « Cannot read properties of null (reading 'getItem') » → l'erreur remonte
// au boundary `global-error` de Next et CASSE toute la page (vu en prod le
// 3 juin 2026 sur le trafic Android de la pub LinkedIn → landing /produits/autopilot).
//
// Ce wrapper avale silencieusement toute erreur : lecture → null, écriture →
// no-op. Le site fonctionne juste sans persistance (acceptable : thème, locale,
// session anonyme du chat… rien de critique).
// ─────────────────────────────────────────────────────────────────────

export const safeStorage = {
  get(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* stockage indisponible — on ignore */
    }
  },
  remove(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* stockage indisponible — on ignore */
    }
  },
};
