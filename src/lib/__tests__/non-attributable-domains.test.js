// Garde-fou : on ne devine JAMAIS une adresse sur le domaine d'une plateforme
// tierce. Cas réels observés en base le 30/07/2026 — Google Places renvoyait
// facebook.com comme « site web » de 5 prospects, et mq.parkopedia.com pour un
// parking de Fort-de-France (domaine sans aucun MX → adresse garantie morte,
// pourtant affichée au client).

const { isNonAttributableDomain, NON_ATTRIBUTABLE_DOMAINS } = require('@/lib/constants');

describe('isNonAttributableDomain', () => {
  it.each([
    'facebook.com',
    'fr-fr.facebook.com',        // sous-domaine localisé, vu en base
    'www.facebook.com',
    'mq.parkopedia.com',         // vu en base, sans MX
    'parkopedia.com',
    'pagesjaunes.fr',
    'leboncoin.fr',
    'monresto.business.site',    // site gratuit Google
    'macboite.wixsite.com',
    'truc.wordpress.com',
    'linktr.ee',
    'sites.google.com',
  ])('bloque « %s »', (host) => {
    expect(isNonAttributableDomain(host)).toBe(true);
  });

  it.each([
    'autosgm.com',                     // vrai domaine de prospect (M365)
    'midocaz.com',
    'parking-perrinon.com',
    'restaurant-lapoulenoire.com',
    'tgn-production.com',
    'volia.fr',
    'facebooking-agency.fr',           // contient « facebook » sans en être
    'monsite-google.fr',
  ])('laisse passer « %s »', (host) => {
    expect(isNonAttributableDomain(host)).toBe(false);
  });

  it('ne bronche pas sur une entrée vide ou absurde', () => {
    for (const v of ['', null, undefined, '.', 'localhost', 42]) {
      expect(isNonAttributableDomain(v)).toBe(false);
    }
  });

  it('ne bloque PAS les exploitants/franchises (faux positifs coûteux)', () => {
    // road.io, freshmile.com… sont de vraies entreprises avec de vraies boîtes.
    // Leur problème (un domaine pour N établissements) se traite par comptage,
    // pas par liste figée — ne pas les glisser ici.
    for (const d of ['road.io', 'freshmile.com', 'totalenergies.com', 'ezdrive.fr']) {
      expect(NON_ATTRIBUTABLE_DOMAINS.has(d)).toBe(false);
      expect(isNonAttributableDomain(d)).toBe(false);
    }
  });
});
