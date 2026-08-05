/**
 * Copie presse-papier qui dit la vérité.
 *
 * `navigator.clipboard.writeText` renvoie une promesse qui rejette en contexte
 * non sécurisé (http://), sans permission, ou quand le document n'a pas le
 * focus. Quatre appels du produit ne l'attendaient pas et affichaient
 * « Copié ! » quoi qu'il arrive — dont celui de la clé API, qui n'est montrée
 * qu'une seule fois et n'est jamais récupérable (seul son hash est stocké).
 *
 * Cette fonction ne lève jamais : elle renvoie `true` si le texte est
 * réellement dans le presse-papier, `false` sinon. À l'appelant de ne
 * confirmer visuellement que sur `true`.
 *
 * Voir `lib/__tests__/clipboard.test.js`.
 */
export async function copyToClipboard(text) {
  const value = text == null ? '' : String(text);
  if (!value) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Permission refusée / contexte non sécurisé → on tente le repli.
    }
  }

  // Repli historique : fonctionne là où l'API Clipboard est indisponible.
  if (typeof document === 'undefined' || !document.execCommand) return false;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy') === true;
  } catch {
    return false;
  } finally {
    // finally : sans ça, un throw laisserait un textarea invisible dans le DOM
    // à chaque tentative — le même piège que l'ancre orpheline de l'export CSV.
    document.body.removeChild(textarea);
  }
}
