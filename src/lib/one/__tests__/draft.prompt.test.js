// Vérifie le PROMPT envoyé à Claude par draftEmail, sans appeler l'API réelle
// (le client Anthropic est mocké : zéro coût, zéro appel réseau).

const create = jest.fn();

jest.mock('@/lib/anthropic', () => ({
  getAnthropic: () => ({ messages: { create } }),
}));

const { draftEmail } = require('@/lib/one/draft');

const ICP = {
  activite: 'logiciel de gestion de flotte',
  value_prop: 'réduire les coûts de carburant',
  ton: 'direct',
  ville: 'Fort-de-France',
};

function lastUserPrompt() {
  return create.mock.calls[create.mock.calls.length - 1][0].messages[0].content;
}
function lastSystemPrompt() {
  return create.mock.calls[create.mock.calls.length - 1][0].system;
}

beforeEach(() => {
  create.mockReset();
  create.mockResolvedValue({ content: [{ text: 'Objet: test\n\ncorps' }] });
});

describe('draftEmail — matière transmise à Claude', () => {
  it('transmet le métier et la ville du prospect', async () => {
        await draftEmail(
      { nom: 'Midocaz Auto', term: 'garage automobile', adresse: '12 rue X, 97200 Fort-de-France' },
      ICP
    );
    const p = lastUserPrompt();
    expect(p).toContain('Midocaz Auto');
    expect(p).toContain('métier : garage automobile');
    expect(p).toContain('ville : Fort-de-France');
  });

  it('ajoute la réputation Google quand la note est bonne et les avis nombreux', async () => {
    await draftEmail(
      { nom: 'Autos GM', term: 'concessionnaire automobile', note: 4.6, nb_avis: 128 },
      ICP
    );
    expect(lastUserPrompt()).toContain('réputation Google : 4,6/5 sur 128 avis');
  });

  it('omet la réputation si la note est faible (pas d’accroche gênante)', async () => {
    await draftEmail({ nom: 'Parking X', term: 'parking', note: 2.1, nb_avis: 240 }, ICP);
    expect(lastUserPrompt()).not.toContain('réputation Google');
  });

  it('omet la réputation si le volume d’avis est trop faible', async () => {
    await draftEmail({ nom: 'Parking Y', term: 'parking', note: 5, nb_avis: 3 }, ICP);
    expect(lastUserPrompt()).not.toContain('réputation Google');
  });

  it('nomme le décideur quand il est connu', async () => {
    await draftEmail(
      { nom: 'Autos GM', term: 'concessionnaire', contact_name: 'Brice Parfait', contact_role: 'Directeur' },
      ICP
    );
    expect(lastUserPrompt()).toContain('nommément à Brice Parfait (Directeur)');
  });

  it('interdit explicitement d’inventer des faits', async () => {
    await draftEmail({ nom: 'Z', term: 'parking' }, ICP);
    expect(lastSystemPrompt()).toContain("N'invente aucun chiffre");
  });

  it('exige un bénéfice spécifique au métier', async () => {
    await draftEmail({ nom: 'Z', term: 'parking' }, ICP);
    expect(lastUserPrompt()).toContain('concret pour un(e) parking');
  });
});
