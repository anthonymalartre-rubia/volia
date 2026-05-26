// ─────────────────────────────────────────────────────────────────────
// Crisp Chat — helpers d'API
// ─────────────────────────────────────────────────────────────────────
// Le widget Crisp expose une file d'attente globale `window.$crisp`
// qui accepte des commandes même avant le chargement du script.
// Ces helpers sont SSR-safe (guard `typeof window`).
//
// Usage :
//   import { openCrispChat, sendCrispEvent } from '@/lib/crisp';
//   openCrispChat("J'ai une erreur de paiement, pouvez-vous m'aider ?");
//   sendCrispEvent('payment_failed', { amount: 49 });
// ─────────────────────────────────────────────────────────────────────

/**
 * Ouvre la fenêtre de chat Crisp.
 * @param {string} [message=''] - Message pré-rempli dans la zone de saisie (optionnel)
 */
export function openCrispChat(message = '') {
  if (typeof window === 'undefined') return;
  // Initialise la queue si Crisp n'est pas encore chargé (commandes
  // bufferisées, exécutées au chargement du script).
  window.$crisp = window.$crisp || [];
  window.$crisp.push(['do', 'chat:open']);
  if (message) {
    window.$crisp.push(['set', 'message:text', [message]]);
  }
}

/**
 * Ferme la fenêtre de chat Crisp.
 */
export function closeCrispChat() {
  if (typeof window === 'undefined') return;
  window.$crisp = window.$crisp || [];
  window.$crisp.push(['do', 'chat:close']);
}

/**
 * Envoie un évènement custom à Crisp (visible côté agent dans la timeline).
 * @param {string} event - Nom de l'évènement (ex: 'payment_failed')
 * @param {object} [data={}] - Données associées
 */
export function sendCrispEvent(event, data = {}) {
  if (typeof window === 'undefined' || !event) return;
  window.$crisp = window.$crisp || [];
  window.$crisp.push(['set', 'session:event', [[[event, data]]]]);
}

/**
 * Met à jour la donnée de session Crisp.
 * @param {Array<[string, string]>} pairs - Tableau de paires [clé, valeur]
 */
export function setCrispSessionData(pairs) {
  if (typeof window === 'undefined' || !Array.isArray(pairs)) return;
  window.$crisp = window.$crisp || [];
  window.$crisp.push(['set', 'session:data', [pairs]]);
}
