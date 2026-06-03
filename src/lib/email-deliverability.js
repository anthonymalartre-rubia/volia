// ─────────────────────────────────────────────────────────────────────
// src/lib/email-deliverability.js
// ─────────────────────────────────────────────────────────────────────
// Outils délivrabilité côté contenu :
//   - scanSpam(text)   : détecte les déclencheurs de spam (mots, MAJUSCULES,
//                        ponctuation excessive, liens) → score + verdict.
//   - expandSpintax(t) : résout la syntaxe {a|b|c} en une variante (variété
//                        d'envoi = meilleure réputation, moins de "même mail
//                        500x").
//   - hasSpintax / countSpintaxVariants : utilitaires UI.
//
// Pas d'appel réseau, pur déterministe (sauf expandSpintax qui peut prendre
// un seed). Utilisable côté client (composer) ET serveur (writer, cron envoi).
// ─────────────────────────────────────────────────────────────────────

// Déclencheurs de spam fréquents FR + EN (filtres anti-spam type SpamAssassin).
// severity : 2 = fort (gros risque), 1 = modéré.
const SPAM_TERMS = [
  // Argent / gains
  { re: /\b100\s*%?\s*gratuit\b/i, term: '100% gratuit', severity: 2 },
  { re: /\bgratuit\b/i, term: 'gratuit', severity: 1 },
  { re: /\bargent\s+facile\b/i, term: 'argent facile', severity: 2 },
  { re: /\bgagnez\b/i, term: 'gagnez', severity: 2 },
  { re: /\bgagner de l'argent\b/i, term: "gagner de l'argent", severity: 2 },
  { re: /\bcash\b/i, term: 'cash', severity: 1 },
  { re: /\brevenus?\s+garantis?\b/i, term: 'revenus garantis', severity: 2 },
  { re: /\bgaranti(e)?\b/i, term: 'garanti', severity: 1 },
  { re: /\b(promo|promotion)\b/i, term: 'promotion', severity: 1 },
  { re: /\b-?\s*\d{1,3}\s*%\s*(de\s*)?(remise|réduction|off)\b/i, term: 'remise %', severity: 1 },
  // Urgence
  { re: /\burgent\b/i, term: 'urgent', severity: 1 },
  { re: /\bagissez\s+(maintenant|vite)\b/i, term: 'agissez maintenant', severity: 2 },
  { re: /\b(offre|durée)\s+limitée\b/i, term: 'offre limitée', severity: 1 },
  { re: /\bderni(è|e)re\s+chance\b/i, term: 'dernière chance', severity: 1 },
  { re: /\bact\s+now\b/i, term: 'act now', severity: 2 },
  { re: /\blimited\s+time\b/i, term: 'limited time', severity: 1 },
  // CTA spammy
  { re: /\bcliquez\s+ici\b/i, term: 'cliquez ici', severity: 2 },
  { re: /\bclick\s+here\b/i, term: 'click here', severity: 2 },
  { re: /\bachetez\s+maintenant\b/i, term: 'achetez maintenant', severity: 1 },
  // Pump
  { re: /\bgagnant\b/i, term: 'gagnant', severity: 1 },
  { re: /\bfélicitations\b/i, term: 'félicitations', severity: 1 },
  { re: /\bsans\s+engagement\b/i, term: 'sans engagement', severity: 1 },
  { re: /\bspam\b/i, term: 'spam', severity: 1 },
  { re: /\bviagra\b/i, term: 'viagra', severity: 2 },
  { re: /\b€{2,}|\${2,}/, term: 'symboles €€/$$', severity: 2 },
];

/**
 * Analyse un texte (sujet + corps) pour les déclencheurs de spam.
 * @param {string} text
 * @returns {{ score:number, verdict:'ok'|'warn'|'risky', hits:Array<{term,severity}>, signals:object }}
 */
export function scanSpam(text) {
  const raw = typeof text === 'string' ? text : '';
  const hits = [];
  let score = 0;

  for (const { re, term, severity } of SPAM_TERMS) {
    if (re.test(raw)) {
      hits.push({ term, severity });
      score += severity;
    }
  }

  // MAJUSCULES excessives (mots de 3+ lettres tout en capitales)
  const words = raw.split(/\s+/).filter((w) => w.length >= 3);
  const capsWords = words.filter((w) => /^[A-ZÀ-Þ0-9!?€$]+$/.test(w) && /[A-ZÀ-Þ]/.test(w));
  const capsRatio = words.length ? capsWords.length / words.length : 0;
  if (capsRatio > 0.25 && capsWords.length >= 2) {
    score += 2;
    hits.push({ term: 'trop de MAJUSCULES', severity: 2 });
  }

  // Ponctuation excessive
  const exclam = (raw.match(/!/g) || []).length;
  if (exclam >= 3) {
    score += 1;
    hits.push({ term: `${exclam} points d'exclamation`, severity: 1 });
  }
  if (/[!?]{2,}/.test(raw)) {
    score += 1;
    hits.push({ term: 'ponctuation !!! / ???', severity: 1 });
  }

  // Beaucoup de liens
  const links = (raw.match(/https?:\/\//g) || []).length;
  if (links >= 4) {
    score += 1;
    hits.push({ term: `${links} liens`, severity: 1 });
  }

  const verdict = score >= 4 ? 'risky' : score >= 2 ? 'warn' : 'ok';
  return {
    score,
    verdict,
    hits,
    signals: { capsRatio: Math.round(capsRatio * 100), exclamations: exclam, links },
  };
}

// ─── Spintax ─────────────────────────────────────────────────────────
const SPINTAX_RE = /\{([^{}]*\|[^{}]*)\}/;

/** Y a-t-il du spintax {a|b} dans le texte ? */
export function hasSpintax(text) {
  return SPINTAX_RE.test(String(text || ''));
}

/** Nombre de combinaisons possibles (produit des options de chaque bloc). */
export function countSpintaxVariants(text) {
  let count = 1;
  const re = /\{([^{}]*\|[^{}]*)\}/g;
  let m;
  while ((m = re.exec(String(text || '')))) {
    count *= m[1].split('|').length;
  }
  return count;
}

/**
 * Résout récursivement le spintax {a|b|c} en choisissant une option.
 * @param {string} text
 * @param {() => number} [rng] - fonction 0..1 (défaut Math.random). Passer un
 *   RNG seedé côté serveur pour de la reproductibilité par destinataire.
 */
export function expandSpintax(text, rng = Math.random) {
  let out = String(text || '');
  let guard = 0;
  while (SPINTAX_RE.test(out) && guard < 100) {
    out = out.replace(SPINTAX_RE, (_full, inner) => {
      const opts = inner.split('|');
      return opts[Math.floor(rng() * opts.length)] ?? opts[0];
    });
    guard += 1;
  }
  return out;
}
