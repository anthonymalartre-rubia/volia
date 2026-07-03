#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# scripts/migrate-env.sh — Migration des variables d'env Vercel
# ─────────────────────────────────────────────────────────────────────
# Exporte les variables d'ENV de PRODUCTION depuis le projet Vercel
# actuellement lié, et génère un fichier `.env.to-import` PRÊT À COLLER
# dans un nouveau projet Vercel (Settings → Environment Variables → coller
# tout le contenu d'un coup, Vercel parse un fichier .env entier).
#
# Filtre les variables AUTO-INJECTÉES par Vercel / le build tooling
# (VERCEL_*, TURBO_*, NX_*, NODE_ENV, BUILD_TIMESTAMP) — elles NE doivent
# jamais être recopiées à la main (Vercel les régénère seul).
#
# Vérifie aussi la complétude : liste les variables utilisées dans le code
# mais absentes du pull (souvent des « Sensitive » non exportables → à
# reprendre à la source : Stripe, Supabase, Resend…).
#
# PRÉREQUIS :
#   1. Vercel CLI (sinon le script bascule sur `npx vercel`)
#   2. vercel login
#   3. vercel link   → choisir l'ANCIEN projet `volia` (compte entreprise)
#
# USAGE : bash scripts/migrate-env.sh
#
# ⚠️ Les fichiers .env* générés contiennent des SECRETS → déjà gitignorés,
#    à supprimer une fois collés dans le nouveau projet.
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

RAW=".env.vercel-prod"   # dump brut du pull (tout, y compris variables système)
OUT=".env.to-import"     # fichier filtré, prêt à coller dans le nouveau projet

# Vercel CLI dispo ? sinon npx.
if command -v vercel >/dev/null 2>&1; then
  VERCEL="vercel"
else
  echo "ℹ️  Vercel CLI non trouvée — utilisation de 'npx vercel'."
  VERCEL="npx vercel"
fi

# Garde-fou : le dossier doit être lié à un projet Vercel.
if [ ! -f ".vercel/project.json" ]; then
  echo "✋ Ce dossier n'est pas lié à un projet Vercel."
  echo "   Lance d'abord :  $VERCEL login  &&  $VERCEL link   (choisis l'ANCIEN projet volia)"
  exit 1
fi

echo "→ Pull des variables de production depuis le projet Vercel lié…"
$VERCEL env pull "$RAW" --environment=production --yes

# ── Filtrage : ne garde que les vraies variables applicatives ────────
# - lignes KEY=VALUE uniquement (retire commentaires/lignes vides)
# - retire les prefixes système/build (jamais à recopier)
grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$RAW" \
  | grep -vE '^(VERCEL|TURBO_|NX_)' \
  | grep -vE '^(NODE_ENV|BUILD_TIMESTAMP)=' \
  | sort > "$OUT"

COUNT=$(grep -c '=' "$OUT" || true)
echo "✓ $OUT généré : $COUNT variables applicatives (variables système Vercel exclues)."
echo ""
echo "Noms inclus (valeurs masquées) :"
sed -E 's/=.*/=•••/' "$OUT" | sed 's/^/   /'

# ── Vérif de complétude vs le code (alerte si une var manque au pull) ─
echo ""
echo "→ Vérification vs les variables utilisées dans le code…"
NEEDED="$(mktemp)"; HAVE="$(mktemp)"
grep -rhoE 'process\.env\.[A-Z0-9_]+' src/ 2>/dev/null \
  | sed 's/process\.env\.//' | sort -u \
  | grep -vE '^(NODE_ENV|BUILD_TIMESTAMP|VERCEL|TURBO_|NX_)$' > "$NEEDED"
cut -d= -f1 "$OUT" | sort -u > "$HAVE"
MISSING="$(comm -23 "$NEEDED" "$HAVE" || true)"
rm -f "$NEEDED" "$HAVE"

if [ -n "$MISSING" ]; then
  echo "⚠️  Utilisées dans le code mais ABSENTES du pull (à ajouter à la main —"
  echo "    souvent des « Sensitive » non exportables, ou des valeurs à défaut) :"
  echo "$MISSING" | sed 's/^/    - /'
else
  echo "✓ Toutes les variables du code sont présentes dans l'export."
fi

echo ""
echo "PROCHAINES ÉTAPES :"
echo "  1. Nouveau projet Vercel → Settings → Environment Variables"
echo "  2. Colle le CONTENU de $OUT (coche Production ; + Preview/Development si voulu)"
echo "  3. Supprime les secrets locaux :  rm $RAW $OUT"
