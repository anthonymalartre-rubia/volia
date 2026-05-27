# Brand Copy V3-A — Pages additionnelles (EN + docs + persona + comparatif)

Sprint Brand Copy V3-A : refonte du ton sur les 4 catégories non couvertes par V2.

## Référence de ton

### EN — style Plausible US + Cal.com US
- "Apollo costs $99/month. Volia is $20. You do the math."
- "Try it. No credit card. No tricks."
- "We coded this in a French apartment."
- Pas de jargon enterprise ("leverage your synergy" = no go)
- Phrases courtes, "You" partout

### Docs — pédagogique direct
- Tutoiement
- Exemples concrets, pas de blabla "bienvenue dans notre doc complète..."
- "Voici comment importer ton CSV"
- "3 erreurs courantes (et comment les éviter)"

### Persona — pitch direct au persona
- Tutoiement
- "Toi, freelance, tu galères avec Apollo qui te coûte 99$/mois..."
- 1 problème + 1 solution + 1 témoignage

### Comparatif — punchy, factuel, honnête
- Critique OK sur faits vérifiables (prix, manque de fonctionnalité)
- Jamais d'attaque ad personam
- Tableau avant/après honnête

---

## Fichiers modifiés

### EN (4 fichiers de contenu — métadata des pages laissées intactes)
- `src/components/LandingContentEN.jsx` — H1, FAQs, stack comparison, features, final CTA
- `src/components/PricingContentEN.jsx` — taglines, descriptions plans, FAQ
- `src/app/en/products/prospection/page.js` — metadata + content
- `src/app/en/products/campaigns/page.js` — metadata + content
- `src/app/en/products/crm/page.js` — metadata + content
- `src/app/en/products/forms/page.js` — metadata + content

### Docs (2 fichiers)
- `src/app/docs/page.js` — index docs (hero + section intro)
- `src/app/docs/[slug]/page.js` — page slug + composants UI

### Persona (2 fichiers)
- `src/lib/personas.js` — refonte intro, painPoints, idealPlan.why, ctaLabel pour les 6 personas
- `src/components/PersonaPage.jsx` — copy structure (si nécessaire)

### Comparatif (3 fichiers)
- `src/lib/competitors.js` — taglines, descriptions, strengths/weaknesses honest punchy
- `src/components/CompetitorVsPage.jsx` — copy comparatif
- `src/app/vs/[competitor]/page.js` — metadata

---

## Notes structurelles

Aucune modification structurelle (UI, className) — uniquement les chaînes texte.
Si BRAND TODO ajoutés, listés ici :
- (rien pour le moment)
