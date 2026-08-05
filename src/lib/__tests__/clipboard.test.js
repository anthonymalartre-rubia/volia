/**
 * Même classe de bug que la régression de l'export CSV (05/08/2026) : une
 * confirmation de succès affichée sans savoir si l'action a réussi.
 *
 * `navigator.clipboard.writeText` renvoie une promesse qui REJETTE en contexte
 * non sécurisé, sans permission, ou quand le document n'a pas le focus. Quatre
 * appels du produit ne l'attendaient pas et affichaient « Copié ! » quoi qu'il
 * arrive — dont celui de la clé API, qui n'est montrée qu'une seule fois.
 */

import { copyToClipboard } from '@/lib/clipboard';

describe('copyToClipboard', () => {
  const originalClipboard = global.navigator?.clipboard;

  afterEach(() => {
    if (originalClipboard === undefined) delete global.navigator.clipboard;
    else Object.defineProperty(global.navigator, 'clipboard', { value: originalClipboard, configurable: true });
    delete document.execCommand;
  });

  function mockClipboard(writeText) {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  }

  it('renvoie true quand la copie réussit', async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    await expect(copyToClipboard('sk_live_123')).resolves.toBe(true);
  });

  it('transmet bien le texte', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    await copyToClipboard('sk_live_123');
    expect(writeText).toHaveBeenCalledWith('sk_live_123');
  });

  it('renvoie false — sans throw — quand la permission est refusée', async () => {
    mockClipboard(jest.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError')));
    await expect(copyToClipboard('secret')).resolves.toBe(false);
  });

  it('renvoie false quand l’API clipboard est absente et qu’il n’y a pas de repli', async () => {
    Object.defineProperty(global.navigator, 'clipboard', { value: undefined, configurable: true });
    await expect(copyToClipboard('secret')).resolves.toBe(false);
  });

  it('bascule sur execCommand quand l’API clipboard est absente', async () => {
    Object.defineProperty(global.navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = jest.fn().mockReturnValue(true);
    await expect(copyToClipboard('secret')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('ne laisse aucun textarea orphelin après le repli', async () => {
    Object.defineProperty(global.navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = jest.fn().mockReturnValue(true);
    await copyToClipboard('secret');
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('renvoie false pour une valeur vide plutôt que de prétendre avoir copié', async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    await expect(copyToClipboard('')).resolves.toBe(false);
    await expect(copyToClipboard(null)).resolves.toBe(false);
  });
});
