// Empêche d'attribuer à un prospect l'email de son PRESTATAIRE technique.
//
// Cas réels relevés en base le 30/07/2026, tous en method 'scrape' :
//   contact@azko.fr     → 8 fiches (agence web des sites de notaires)
//   support@webador.fr  → 7 fiches (constructeur de sites)
//   support@ovh.com     → 5 fiches (hébergeur)
// Le scoring seul ne les arrête pas : le bonus « préfixe générique » (+50)
// annule à moitié la pénalité de domaine étranger (-100), et le repli de
// scrapeForEmail accepte tout score > -100 — donc exactement ces -50.

const { isThirdPartyEmailDomain, THIRD_PARTY_EMAIL_DOMAINS } = require('@/lib/constants');

describe('isThirdPartyEmailDomain — cas réellement observés', () => {
  it.each([
    'contact@azko.fr',
    'support@webador.fr',
    'support@ovh.com',
  ])('bloque %s', (email) => {
    expect(isThirdPartyEmailDomain(email)).toBe(true);
  });
});

describe('isThirdPartyEmailDomain — hébergeurs et constructeurs', () => {
  it.each([
    'contact@ovh.net',
    'hello@wix.com',
    'x@monsite.wixsite.com',       // sous-domaine
    'y@gratuit-123.webadorsite.com',
    'info@ionos.fr',
    'support@squarespace.com',
    'contact@e-monsite.com',
    'a@secureserver.net',
  ])('bloque %s', (email) => {
    expect(isThirdPartyEmailDomain(email)).toBe(true);
  });

  it('accepte aussi un domaine nu, sans partie locale', () => {
    expect(isThirdPartyEmailDomain('ovh.com')).toBe(true);
    expect(isThirdPartyEmailDomain('www.ovh.com')).toBe(true);
  });
});

describe('isThirdPartyEmailDomain — ne bloque PAS les vrais prospects', () => {
  it.each([
    'contact@msrenov.fr',
    'contact@dazet-laurent.fr',
    'contact@le-madison-dancing.fr',
    'contact@belaich.notaires.fr',
    'brice.parfait@autosgm.com',
    'info@midocaz.com',
    'contact@tgn-production.com',
    // quasi-homonymes : ne doivent pas déclencher un faux positif
    'contact@ovhairstyle.fr',
    'contact@mon-wix-store.fr',
  ])('laisse passer %s', (email) => {
    expect(isThirdPartyEmailDomain(email)).toBe(false);
  });

  it('ne bronche pas sur des entrées absurdes', () => {
    for (const v of ['', null, undefined, '@', 'pasdemail', 42]) {
      expect(isThirdPartyEmailDomain(v)).toBe(false);
    }
  });
});

describe('cohérence de la liste', () => {
  it('ne contient aucun domaine de messagerie grand public', () => {
    // Ces domaines relèvent de PERSONAL_DOMAINS (filtre RGPD), pas d'ici.
    for (const d of ['gmail.com', 'orange.fr', 'outlook.com', 'yahoo.fr']) {
      expect(THIRD_PARTY_EMAIL_DOMAINS.has(d)).toBe(false);
    }
  });

  it('ne contient pas volia.fr (on ne se filtre pas soi-même)', () => {
    expect(THIRD_PARTY_EMAIL_DOMAINS.has('volia.fr')).toBe(false);
  });
});
