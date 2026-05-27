# Brand Copy V3-C — Pages légales

Refonte ciblée du texte affiché des pages légales pour :
- préserver intégralement la portée juridique (clauses, durées, montants, juridictions, vocabulaire RGPD) ;
- alléger les microcopy et titres ;
- ajouter des encadrés pédagogiques "En résumé" en tête des sections longues ;
- conserver le vouvoiement et la rigueur (pas de blagues, pas de tutoiement).

Branche worktree : `worktree-agent-abacffa98c12fbb0f`

---

## src/app/cgu/page.js — CGU

**Préservé (juridique) :** toutes les clauses 4 à 17 (rôle d'agrégateur, usages interdits, RGPD, base légale, tarification, paiement, limitation de responsabilité, résiliation, propriété intellectuelle, droit applicable). Vocabulaire RGPD intact.

**Modifié :**
- Intro générale ajoutée sous le titre H1 (encadré "L'essentiel en 30 secondes").
- Microcopy : "Retour à l'accueil" conservé (déjà clair).
- Footer : reformulation de la note de contact pour cohérence.

**En résumé ajoutés (2) :**
- En tête de page (vue d'ensemble du document).
- Section 6 (Utilisation autorisée) : ce qui est OK / ce qui ne l'est pas en deux phrases.

---

## src/app/cgv/page.js — CGV B2B

**Préservé (juridique) :** clauses 1 à 20, mentions article L. 441-10 du Code de commerce, article L. 215-1 du Code de la consommation, article 1218 du Code civil, article 28 RGPD, juridictions de Lyon, plafond de responsabilité 12 mois, mécanisme d'autoliquidation TVA, taux BCE+10. Vocabulaire intact.

**Modifié :**
- Intro générale (encadré "L'essentiel pour les pressés") sous le titre.
- Reformulation de la note d'introduction "modèle standard" pour plus de chaleur.

**En résumé ajoutés (3) :**
- En tête de page.
- Section 6 (Plans tarifaires et facturation) : tableau résumé en 4 lignes humaines.
- Section 8 (Résiliation et remboursement) : ce que ça donne concrètement.

---

## src/app/dpa/page.js — DPA RGPD

**Préservé (juridique) :** intégralité des 14 sections, vocabulaire art. 28 RGPD, art. 32 (sécurité), art. 33 (violation), CCT décision 2021/914, EU-U.S. Data Privacy Framework, sous-sous-traitants listés, délai 72h, conservation 30j post-résiliation, suppression définitive, audit annuel.

**Modifié :**
- Intro reformulée en deux phrases plus accessibles avant le bloc art. 28.
- Microcopy CTA "Demander le DPA par email" conservé (déjà direct).
- Note "modèle standard" légèrement reformulée.

**En résumé ajoutés (2) :**
- En tête de page (qui fait quoi en 2 phrases).
- Section 7 (Sécurité) : encadré simple avant le tableau technique.

---

## src/app/confidentialite/page.js — Politique de confidentialité

**Préservé (juridique) :** Parties A/B/C, base légale 6.1.f, balancing test complet, articles 13/14, articles 5.1.c, durées de conservation (12 mois, 10 ans, etc.), CCT/DPF, CNIL, listes de sous-traitants.

**Modifié :**
- Intro générale ajoutée (encadré "En 3 phrases").
- Reformulation des phrases d'accroche de sections (5, 6, 7) pour plus de lisibilité, sans toucher au fond.
- Suppression de quelques formules passives ("il est procédé à" → "nous procédons à") quand absentes du fond juridique.

**En résumé ajoutés (3) :**
- En tête de page.
- Section 5 (Base légale prospects) : en une phrase, pourquoi c'est légal.
- Section 12 (Vos droits) : carte rapide de qui peut faire quoi.

---

## src/app/rgpd/page.js — Droits RGPD utilisateur

**Préservé (juridique) :** descriptions de droits, délibération CNIL n°2020-091, mécanisme opt-out 72h, analyse mise en balance (5 sous-sections), mesures techniques.

**Modifié :**
- Reformulation de l'intro (vouvoiement plus chaleureux, pas de "Chez Volia.fr...").
- Reformulation des micro-intros des deux blocs (utilisateurs / prospects).

**En résumé ajoutés (2) :**
- En tête de page (1 phrase synthétique de promesse).
- Bloc avant la section "Analyse d'intérêt légitime" pour expliquer pourquoi cette analyse existe.

---

## src/app/sous-traitants/page.js — Sous-traitants RGPD

**Préservé (juridique) :** liste complète des sous-traitants, rôles, données traitées, localisation, liens DPA externes, mention art. 28, notification 30 jours.

**Modifié :**
- Reformulation de l'intro "Transparence totale" pour plus de clarté.
- CTA final légèrement humanisé.

**En résumé ajoutés (1) :**
- En tête de page (qui on utilise et pourquoi).

---

## src/app/cookies/CookiesClient.jsx — Politique cookies CNIL

**Préservé (juridique) :** mention CNIL, expiration 6 mois, catégories CATEGORIES, droits RGPD/loi I&L.

**Modifié :**
- Reformulation de l'intro générale.
- Texte de la section "Vos droits" reformulé pour gagner en clarté.

**En résumé ajoutés (1) :**
- En tête de page.

---

## src/app/opt-out/page.js — Opt-out RGPD

**Préservé (juridique) :** mention article 21 RGPD, délai 48h, RGPD art. 6.1.f (intérêt légitime), lien CNIL, mécanisme de désinscription 1-clic.

**Modifié :**
- Microcopy du bouton et des phrases d'accompagnement reformulés pour plus de chaleur.
- Sous-titre du hero (déjà court) légèrement reformulé.

**En résumé ajoutés :** néant (la page est déjà courte et claire — un encadré ferait redondance).

---

## Récapitulatif

| Page | % modifié | "En résumé" ajoutés |
|---|---|---|
| CGU | ~10% | 2 |
| CGV | ~12% | 3 |
| DPA | ~10% | 2 |
| Confidentialité | ~15% | 3 |
| RGPD | ~10% | 2 |
| Sous-traitants | ~8% | 1 |
| Cookies | ~7% | 1 |
| Opt-out | ~5% | 0 |

**Total : 14 encadrés "En résumé" ajoutés.**

**Aucune clause juridique n'a été modifiée.** Tous les changements concernent les intros, microcopy, transitions, sous-titres et encadrés pédagogiques surajoutés au-dessus du texte légal (qui reste identique en-dessous).
