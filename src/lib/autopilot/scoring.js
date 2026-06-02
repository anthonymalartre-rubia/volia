// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/scoring.js — Phase 2 form scoring engine
// ─────────────────────────────────────────────────────────────────────
// Calcule un score 0-100 depuis les réponses au form, et le tier
// (hot ≥ 70, warm 40-69, cold < 40).
//
// Algorithme déterministe (Phase 2) :
//   - select : index de la réponse dans options → poids progressif
//     (dernière option = 100, première = 0). Inversion auto si l'option
//     contient des mots négatifs ("Non", "Pas pour le moment", "Désinscription").
//   - multiselect : nb d'options cochées / total possible × 100
//   - short_text : 100 si rempli, 0 sinon
//   - long_text : longueur du texte / 200 chars × 100, cap 100
//   - email : 100 si format valide, 0 sinon
//   - number : compare contre éventuels seuils définis par option
//
// Le score final = moyenne pondérée (chaque question = même poids).
//
// Phase 3 future : Claude analyse les réponses pour score plus nuancé,
// avec les règles textuelles `template.form.scoring` comme guide.
// ─────────────────────────────────────────────────────────────────────

// Sémantique négative → score bas (peu importe la position de l'option)
const NEGATIVE_KEYWORDS = [
  'non',
  'pas pour',
  'pas encore',
  'aucun',
  'jamais',
  'désinscription',
  'on stoppe',
  'on a stoppé',
  'plus vraiment',
  'curieux',
  'veille',
  'statu quo',
  'juste curieux',
  'pas de démo',
];

// Sémantique positive / intention forte → score haut (peu importe la position)
const POSITIVE_KEYWORDS = [
  'oui',
  'cette semaine',
  'maintenant',
  'urgent',
  'activement',
  'très intéressé',
  'important',
  '< 1 mois',
  'septembre',
  'scaler',
  'validé',
  'certain',
  'beaucoup',
];

const TIER_THRESHOLDS = {
  hot: 70,
  warm: 40,
};

/**
 * Détermine le tier basé sur le score.
 */
export function scoreToTier(score) {
  if (score >= TIER_THRESHOLDS.hot) return 'hot';
  if (score >= TIER_THRESHOLDS.warm) return 'warm';
  return 'cold';
}

/**
 * Score une réponse select.
 *
 * Priorité :
 *   1. weights explicites définis par le template (q.weights, index ||| options)
 *   2. sémantique des mots-clés (positif → 100, négatif → 0)
 *   3. bande neutre compressée 35-85 selon la position (jamais 0 sauf négatif,
 *      jamais 100 sauf positif) — car l'ordre des options n'est PAS garanti
 *      monotone (ex: "Cette semaine" est souvent en 1ère position = la meilleure).
 */
function scoreSelect(answer, options, weights) {
  if (!answer || !options || options.length === 0) return 0;
  const a = String(answer).toLowerCase();
  const idx = options.findIndex((opt) => opt === answer || opt.toLowerCase?.() === a);

  // 1. Weights explicites (template-defined) — la source de vérité si fournie
  if (Array.isArray(weights) && idx >= 0 && typeof weights[idx] === 'number') {
    return Math.min(Math.max(weights[idx], 0), 100);
  }

  // 2. Sentiment-first (ordre des options non garanti)
  const isPositive = POSITIVE_KEYWORDS.some((kw) => a.includes(kw));
  const isNegative = NEGATIVE_KEYWORDS.some((kw) => a.includes(kw));
  if (isPositive && !isNegative) return 100;
  if (isNegative && !isPositive) return 0;

  // 3. Neutre / inconnu → bande compressée 35-85
  if (idx < 0) return 45; // réponse hors options listées
  return Math.round(35 + (idx / Math.max(options.length - 1, 1)) * 50);
}

/**
 * Calcule le score d'un form_response.
 *
 * @param {object} formResponse - keys = question label, values = answer
 * @param {object} template - template autopilot avec template.form.questions
 * @returns {{ score: number, tier: 'hot'|'warm'|'cold', breakdown: object[] }}
 */
export function calculateScore(formResponse, template) {
  if (!formResponse || typeof formResponse !== 'object') {
    return { score: 0, tier: 'cold', breakdown: [], reason: 'no_response' };
  }
  const questions = template?.form?.questions || [];
  if (questions.length === 0) {
    // Pas de questions définies → fallback : si form rempli = warm
    const hasAnyAnswer = Object.values(formResponse).some((v) => v !== null && v !== undefined && v !== '');
    return {
      score: hasAnyAnswer ? 50 : 0,
      tier: hasAnyAnswer ? 'warm' : 'cold',
      breakdown: [],
      reason: 'no_questions_defined',
    };
  }

  let totalPoints = 0;
  let totalWeight = 0;
  const breakdown = [];

  for (const q of questions) {
    const answer = formResponse[q.label];
    let points = 0;

    if (answer === undefined || answer === null || answer === '') {
      breakdown.push({ label: q.label, points: 0, reason: 'unanswered' });
      totalWeight += 100;
      continue;
    }

    switch (q.type) {
      case 'select':
        points = scoreSelect(answer, q.options || [], q.weights);
        break;
      case 'multiselect': {
        const selected = Array.isArray(answer) ? answer.length : 1;
        const total = (q.options || []).length || 1;
        points = Math.min(Math.round((selected / total) * 100), 100);
        break;
      }
      case 'long_text': {
        const len = String(answer).trim().length;
        points = Math.min(Math.round((len / 200) * 100), 100);
        break;
      }
      case 'short_text':
        points = String(answer).trim().length > 0 ? 100 : 0;
        break;
      case 'email':
        points = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(answer)) ? 100 : 0;
        break;
      case 'number': {
        const num = parseFloat(answer);
        // Default : 0-100 range, à raffiner par template
        points = isNaN(num) ? 0 : Math.min(Math.max(num, 0), 100);
        break;
      }
      default:
        points = String(answer).trim().length > 0 ? 50 : 0;
    }

    totalPoints += points;
    totalWeight += 100;
    breakdown.push({ label: q.label, answer, points });
  }

  const score = totalWeight > 0 ? Math.round((totalPoints / totalWeight) * 100) : 0;
  const tier = scoreToTier(score);
  return { score, tier, breakdown };
}

/**
 * Routing depuis branching rules dans workflow.config.branching.
 * Si pas de branching custom, retourne le routing par défaut basé sur le tier.
 *
 * Format branching custom (Business+ uniquement) :
 *   {
 *     hot: { crm_stage: 'Hot', slack_notif: true, coupon_code: 'HOTLEAD50' },
 *     warm: { crm_stage: 'Warm', drip_template_id: 'nurture_monthly' },
 *     cold: { crm_stage: 'Cold', archive_after_days: 180 },
 *   }
 */
export function resolveRouting(tier, workflowConfig, template) {
  const customBranching = workflowConfig?.branching;
  if (customBranching && customBranching[tier]) {
    return { source: 'custom', ...customBranching[tier], tier };
  }

  // Default routing depuis template.routing
  const defaultMap = {
    hot: { crm_stage: 'Hot', tag: 'autopilot_hot' },
    warm: { crm_stage: 'Warm', tag: 'autopilot_warm' },
    cold: { crm_stage: 'Cold', tag: 'autopilot_cold' },
  };
  return {
    source: 'default',
    ...defaultMap[tier],
    tier,
    template_routing: template?.routing?.[tier] || null,
  };
}
