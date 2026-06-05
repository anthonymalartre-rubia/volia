# Volia Immo — Comparatif des fournisseurs de données « pige » (annonces immobilières)
*Juin 2026 — pour décider de la couche data du SaaS sans scraper Leboncoin soi-même*

> Objectif : trouver le fournisseur qui livre, en API, les **annonces de particuliers vendeurs (FSBO)** dès leur publication, **dédoublonnées**, avec **coordonnées de l'annonceur** et **variations de prix** — au meilleur coût.
> ⚠️ La quasi-totalité des prix « API/volume » sont **sur devis** : à confirmer en contactant chaque éditeur. Les tarifs publics ci-dessous concernent souvent l'offre SaaS (app), pas l'accès API brut.

---

## 1. Tableau comparatif

| Fournisseur | Type | Couverture | FSBO (particuliers) | Dédoublonnage | Coordonnées annonceur | Temps réel / webhooks | Estimation (AVM) | Prix indicatif | Idéal pour |
|---|---|---|---|---|---|---|---|---|---|
| **Melo** | Agrégateur d'annonces | **900–950+ sources** (Leboncoin, SeLoger, PAP, ParuVendu…) | ✅ oui | ✅ oui | ✅ inclus | ✅ JSON temps réel + webhooks (prix, expiration) | ➖ non (annonces) | App dès **24–199 €/mo** ; **API sur devis** ; essai 14 j | **MVP** : le plus complet + accessible |
| **Fluximmo** | Agrégateur d'annonces | ~20 portails | ✅ oui (orienté pige) | ⚠️ partiel (IA enrichissement) | ✅ selon offre | ✅ annonces « minutes après publication » + variations prix | ➖ (widgets estim. séparés) | **Pay-per-listing**, « le moins cher », **sur devis** (admin@fluximmo.com), dispo RapidAPI | **MVP coût-à-l'usage** / test rapide |
| **Yanport** | Data + Metasearch | **30 000+ portails/agences**, 60M+ biens + historique, 20+ pays | ✅ oui | ✅ avancé | ⚠️ selon offre | ✅ API complète | ✅ **AVM intégré** | Premium, **sur devis** | Data riche + estimation, gros budget |
| **PriceHubble** | Estimation / data marché | Transactions, cadastre, PLU, indicateurs | ➖ (pas un agrégateur d'annonces) | n/a | n/a | API | ✅ **AVM de référence** | Premium, **sur devis** | **Brancher le tunnel d'estimation** |
| **Casafari** | Agrégation + dédup (EU) | Multi-pays Europe | ✅ | ✅ très avancé | ⚠️ | ✅ | ⚠️ | Premium, **sur devis** | Multi-pays / scale |
| **Stream Estate / MoteurImmo** | Agrégateurs d'annonces | Portails FR | ✅ | ✅ (MoteurImmo : dédup intelligent) | ⚠️ | ✅ | ➖ | Sur devis | Alternatives / multi-source |
| **Données publiques (DVF, DPE, Cadastre, Géorisques)** | Open data État | National | n/a | n/a | n/a | API/fichiers gratuits | base d'estimation | **Gratuit** | **Enrichir** l'estimation & la fiche bien |

---

## 2. Lecture rapide

- **Pour les annonces FSBO + contact + variation de prix → Melo ou Fluximmo.** Ce sont les deux candidats MVP.
  - **Melo** : la couverture la plus large (900+ sources), dédoublonnage et **coordonnées annonceur inclus**, webhooks de changement de prix/expiration, white-label possible. Le plus « plug-and-play » pour ton pattern cascade.
  - **Fluximmo** : modèle **pay-per-listing** (tu paies ce que tu consommes), positionné le moins cher, idéal pour **tester sans engagement** un secteur pilote ; couverture plus étroite (~20 portails) mais l'essentiel y est (Leboncoin/SeLoger/PAP).
- **Pour le tunnel d'estimation (lead magnet opt-in) → PriceHubble** (AVM de référence) ou l'AVM **Yanport**. Tu n'en as pas besoin au jour 1 : commence avec une estimation simple basée sur le **DVF gratuit** (prix réels de vente notariés) + comparables.
- **Gratuit, à brancher en enrichissement** : **DVF** (prix de vente réels), **DPE** (ADEME), **Cadastre**, **Géorisques** → fiabilisent la fiche bien et l'estimation sans coût.

---

## 3. Recommandation pour le MVP

1. **Démarre avec Fluximmo (pay-per-listing) OU Melo (14 j gratuits)** sur **1 secteur pilote** → coût quasi nul pour valider la détection FSBO + le contact.
2. **Enrichis gratuitement** avec **DVF + DPE + Cadastre** pour la fiche bien et une estimation v1.
3. **Garde l'architecture multi-source** (comme la cascade waterfall actuelle de Volia) : un `adapter` par fournisseur, pour ne **jamais dépendre d'un seul** et négocier les prix au volume.
4. **Estimation pro (AVM)** : n'ajoute PriceHubble/Yanport que **quand le tunnel convertit** (évite un coût premium prématuré).

### Points à valider en contactant les éditeurs (avant de t'engager)
- **Prix API réel au volume** (la plupart sont sur devis).
- **Droit d'usage des coordonnées annonceur** : que dit leur CGU/DPA sur la **réutilisation pour prospection** ? (clé RGPD — c'est *toi* le responsable de traitement côté contact).
- **Fraîcheur réelle** (délai publication → disponibilité API) : c'est ton avantage « speed-to-lead ».
- **Qualité du dédoublonnage** (un même bien sur 5 portails = 1 lead, pas 5).
- **Webhooks** changement de prix / expiration (signaux « vendeur pressé »).

---

## Sources
- [Melo — API](https://www.melo.io/api) · [Melo — tarifs](https://www.melo.io/pricing) · [Melo — logiciel API](https://www.melo.io/logiciel-api-immobilier)
- [Fluximmo — API annonces](https://www.fluximmo.com/api-annonces-immobilieres) · [Fluximmo — estimation](https://www.fluximmo.com/api-estimation-immobiliere) · [RapidAPI Fluximmo](https://rapidapi.com/fluximmo-fluximmo-default/api/fluximmo)
- [Yanport — API](https://www.yanport.com/solutions/api) · [Yanport — doc API](https://www.yanport.com/solutions/api/documentation)
- [PriceHubble — API immobilière](https://www.pricehubble.com/fr/api-immobiliere/)
- [Comparatif API immobilier 2026](https://www.api-immobilier.org/) · [api-immobilier.ovh](https://www.api-immobilier.ovh/) · [Liste APIs immo (GitHub)](https://gist.github.com/alexauvray/098e615e6f01e402a9e222125ef87ae1)
