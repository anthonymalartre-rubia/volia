// src/lib/usage.js
import { getPlan, isLimitReached } from './plans';
import { sendEmail } from './email';
import { createNotification, NOTIF_TYPES } from './notifications';
import { usageWarningEmail, usageLimitReachedEmail, lifecycleB1Email } from './emailTemplates';
import { getEffectivePlan } from './trial';
import { getQuotaMemberIds } from './teams';
import { getSupabaseAdmin } from './supabase-admin';
import { markLifecycleSent } from './lifecycle-state';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ⚠️ usage_tracking a RLS activée SANS policy INSERT/UPDATE (la migration
// harden_security_p0_audit a retiré la policy permissive). Écrire via le client
// USER échoue donc SILENCIEUSEMENT → les compteurs n'étaient jamais incrémentés,
// les quotas mensuels jamais appliqués. On écrit en SERVICE-ROLE (bypass RLS) ;
// fallback sur le client passé si la clé admin est absente.
function getWriteClient(fallback) {
  try {
    return getSupabaseAdmin() || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Calcule l'usage cumulé d'une team (somme des usages individuels de chaque member)
 * pour le mois en cours. Si le user n'est pas dans une team, retourne son propre usage.
 *
 * @returns {Promise<{ searches: number, enrichments: number, exports: number, verifications: number, phones: number, emails_sent: number, form_submissions: number }>}
 */
async function getTeamUsageSum(supabase, userId) {
  const memberIds = await getQuotaMemberIds(userId);
  const month = getCurrentMonth();

  if (memberIds.length <= 1) {
    // Pas de team → comportement classique
    return getUsage(supabase, userId);
  }

  const { data } = await supabase
    .from('usage_tracking')
    .select('searches, enrichments, exports, verifications, phones, emails_sent, form_submissions')
    .in('user_id', memberIds)
    .eq('month', month);

  const sum = {
    searches: 0, enrichments: 0, exports: 0, verifications: 0, phones: 0,
    emails_sent: 0, form_submissions: 0,
  };
  (data || []).forEach((row) => {
    sum.searches += row.searches || 0;
    sum.enrichments += row.enrichments || 0;
    sum.exports += row.exports || 0;
    sum.verifications += row.verifications || 0;
    sum.phones += row.phones || 0;
    sum.emails_sent += row.emails_sent || 0;
    sum.form_submissions += row.form_submissions || 0;
  });
  return sum;
}

// Get or create usage record for current month
export async function getUsage(supabase, userId) {
  const month = getCurrentMonth();

  const { data } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .single();

  if (data) return data;

  // Create if not exists (service-role : RLS n'autorise pas l'INSERT user).
  const { data: newData, error: insErr } = await getWriteClient(supabase)
    .from('usage_tracking')
    .insert({ user_id: userId, month })
    .select()
    .single();

  if (insErr) console.error('[usage] getUsage insert error', insErr.message);
  return newData || { searches: 0, enrichments: 0, exports: 0 };
}

// Get user plan
// Inclut le trial : un user en trial 14j voit son trial_plan (MAX) renvoyé tant que
// trial_ends_at est dans le futur. À l'expiration (ou si converti déjà payant),
// on retombe sur profile.plan.
export async function getUserPlan(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', userId)
    .single();

  return getPlan(getEffectivePlan(data));
}

// Check if user can perform an action
// Avant : 2 roundtrips séquentiels (getUserPlan puis getUsage) = ~300-600ms.
// Cumulé sur un waterfall de 80 prospects = 24-48s perdus. Maintenant en parallèle.
//
// Multi-utilisateurs (MAX / legacy Business) : si l'user appartient à une team,
// on aggrège l'usage de tous les members. Le quota du plan est partagé.
export async function checkLimit(supabase, userId, action) {
  const [{ data: profileRow }, usage] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at, credit_balance')
      .eq('id', userId)
      .single(),
    getTeamUsageSum(supabase, userId),
  ]);
  const plan = getPlan(getEffectivePlan(profileRow));
  const limit = plan.limits[`${action}_per_month`];
  const current = usage[action] || 0;
  const monthlyAllowed = !isLimitReached(limit, current);

  // ─── Crédits achetés (packs one-time, pivot freemium 11/06/2026) ──
  // Uniquement pour les enrichissements (la donnée a un coût API réel).
  // Le solde acheté (sans expiration) prend le relais quand le quota
  // mensuel du plan est épuisé — consommation dans incrementUsage() via
  // le RPC increment_usage_atomic (débit PARTIEL, plancher 0). Le solde
  // draine donc réellement à chaque appel : plus de « allowed » infini
  // quand le solde résiduel est inférieur au montant demandé.
  const creditBalance = action === 'enrichments' ? profileRow?.credit_balance || 0 : 0;
  const usingPurchasedCredits = !monthlyAllowed && creditBalance > 0;

  return {
    allowed: monthlyAllowed || usingPurchasedCredits,
    current,
    limit,
    plan: plan.id,
    // Quand on tourne sur les crédits achetés, `remaining` reflète le solde
    // réel restant (et non 0) : les callers qui plafonnent leurs lots dessus
    // (ex. enrichment-jobs) continuent tant qu'il reste des crédits.
    remaining: limit === -1
      ? -1
      : usingPurchasedCredits
        ? creditBalance
        : Math.max(0, limit - current),
    creditBalance,
    usingPurchasedCredits,
  };
}

// Increment usage counter and send warning emails if thresholds are crossed
// ⚠️ Incrément ATOMIQUE via le RPC increment_usage_atomic : l'ancien
// read-modify-write JS (SELECT count puis UPDATE) perdait des écritures en cas
// d'appels parallèles (waterfall, jobs, one/run) → l'utilisateur n'était
// facturé qu'une fois au lieu de N. Le RPC gère aussi le relais crédits
// achetés dans la MÊME transaction : la part de l'incrément qui dépasse le
// quota mensuel est débitée PARTIELLEMENT du solde (drainé jusqu'à 0, jamais
// négatif) — uniquement pour les enrichissements, règle encodée côté SQL.
// Corrige aussi le chevauchement de borne : à 24/25, un incrément de 8 débite
// désormais 7 crédits au lieu d'écrire 32 sans toucher au solde.
export async function incrementUsage(supabase, userId, action, amount = 1) {
  const month = getCurrentMonth();

  // Plan (trial inclus) : la limite mensuelle est passée au RPC pour qu'il
  // calcule lui-même le dépassement à débiter du solde acheté (-1 = illimité,
  // aucun débit). Réutilisée plus bas pour les emails de seuil.
  const plan = await getUserPlan(supabase, userId);
  const limit = plan.limits[`${action}_per_month`] ?? -1;

  // Écriture en service-role : RLS n'a pas de policy INSERT/UPDATE sur
  // usage_tracking, et le RPC n'est exécutable que par service_role (un user
  // authentifié ne doit pas pouvoir incrémenter/drainer un autre compte).
  const writeDb = getWriteClient(supabase);
  const { data: rpcResult, error: rpcErr } = await writeDb.rpc('increment_usage_atomic', {
    p_user_id: userId,
    p_month: month,
    p_action: action,
    p_amount: amount,
    p_monthly_limit: limit,
  });
  if (rpcErr) {
    console.error('[usage] increment_usage_atomic error', rpcErr.message);
    return; // pas de compteur fiable → pas d'email de seuil
  }

  const newCount = rpcResult?.new_count ?? 0;
  const previousCount = Math.max(0, newCount - amount);

  // ─── Usage warning emails ──────────────────────────────────────────────────
  // Send emails when crossing the 80% or 100% threshold.
  // We check that the previous count was below the threshold to avoid duplicates.
  try {
    // Skip for unlimited plans
    if (limit === -1) return;

    const prevPercent = Math.floor((previousCount / limit) * 100);
    const newPercent = Math.floor((newCount / limit) * 100);

    // Determine which threshold was just crossed
    let thresholdCrossed = null;
    if (newPercent >= 100 && prevPercent < 100) {
      thresholdCrossed = 100;
    } else if (newPercent >= 80 && prevPercent < 80) {
      thresholdCrossed = 80;
    }

    if (thresholdCrossed) {
      // ─── Fetch user email via auth.admin ─────────────────────────────────
      // user_profiles n'a PAS de colonne email / full_name (cf. schéma).
      // Avant on faisait .select('email, full_name') qui retournait null
      // sans erreur → email d'alerte jamais envoyé. On lit maintenant
      // depuis auth.users via le service role (pattern utilisé aussi
      // dans /api/cron/expire-trials et /api/cron/drip-onboarding).
      const supabaseAdmin = getSupabaseAdmin();
      const { data: { user: authUser } = {} } =
        await supabaseAdmin.auth.admin.getUserById(userId);
      const email = authUser?.email;
      const fullName =
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        email?.split('@')[0] ||
        'utilisateur';

      if (email) {
        const limitType = action; // 'searches', 'enrichments', 'exports'
        const firstName = fullName && fullName !== 'utilisateur' ? fullName.split(' ')[0] : null;
        let template;
        let isB1 = false;
        if (thresholdCrossed === 100) {
          // B1 (séquence lifecycle Volia) — « Bon signe » : quand un gratuit
          // épuise ses crédits (= enrichissements, seul compteur adossé au
          // solde crédits, cf. checkLimit), on sert le template lifecycle B1
          // au lieu du corps générique. UNE SEULE FOIS À VIE (clé
          // lifecycle_b1 + timestamp — ancre de B2 « J+2 après B1 » et de B3,
          // cf. lifecycle-triggers) ; les mois suivants, et si l'user a coupé
          // les emails drip, le générique quota reprend (info de service).
          if (plan.id === 'free' && action === 'enrichments') {
            const { data: dripState } = await supabaseAdmin
              .from('user_profiles')
              .select('drip_emails_enabled, drip_emails_sent')
              .eq('id', userId)
              .maybeSingle();
            const sentKeys = Array.isArray(dripState?.drip_emails_sent) ? dripState.drip_emails_sent : [];
            isB1 = dripState?.drip_emails_enabled !== false && !sentKeys.includes('lifecycle_b1');
          }
          if (isB1) {
            template = lifecycleB1Email(firstName);
          } else {
            template = usageLimitReachedEmail(fullName, plan.name, limitType);
          }
        } else {
          template = usageWarningEmail(fullName, thresholdCrossed, plan.name, limitType);
        }
        // Awaité (et pas fire-and-forget) : sur Vercel, une promesse détachée
        // peut être gelée avec la lambda AVANT le marquage → B1 re-envoyé le
        // mois suivant et ancre J+2 de B2 faussée. Rare (1 fois par
        // franchissement de seuil), donc le coût de latence est négligeable.
        // NB : B1 est volontairement HORS cap 24 h lifecycle — il remplace un
        // email de quota transactionnel qui partirait de toute façon.
        try {
          const sendResult = await sendEmail({ to: email, subject: template.subject, html: template.html });
          if (sendResult?.success && isB1) {
            await markLifecycleSent(supabaseAdmin, userId, 'lifecycle_b1');
          }
        } catch (err) {
          console.error(`[usage] ${thresholdCrossed}% email failed:`, err);
        }
      }

      // ─── In-app notification (en plus de l'email) ────────────────────────
      // L'utilisateur la verra dans le NotificationBell la prochaine fois
      // qu'il ouvre le dashboard, même s'il n'ouvre pas son mail.
      const actionLabel = {
        searches: 'recherches',
        enrichments: 'enrichissements',
        exports: 'exports',
        phones: 'téléphones',
        verifications: 'vérifications email',
        emails_sent: 'emails envoyés',
        form_submissions: 'soumissions de formulaires',
      }[action] || action;

      if (thresholdCrossed === 100) {
        createNotification(userId, {
          type: NOTIF_TYPES.QUOTA_REACHED,
          title: `Quota ${actionLabel} atteint`,
          body: `Vous avez utilisé 100% de vos ${actionLabel} ce mois sur le plan ${plan.name}. Passez à un plan supérieur pour continuer.`,
          link: '/settings#plan',
          metadata: { action, plan: plan.name, threshold: 100 },
        }).catch((err) => console.error('[usage] notif 100% failed:', err));
      } else {
        createNotification(userId, {
          type: NOTIF_TYPES.QUOTA_WARNING,
          title: `Quota ${actionLabel} bientôt atteint (80%)`,
          body: `Plus que 20% disponible ce mois sur le plan ${plan.name}.`,
          link: '/settings#plan',
          metadata: { action, plan: plan.name, threshold: 80 },
        }).catch((err) => console.error('[usage] notif 80% failed:', err));
      }
    }
  } catch (emailErr) {
    // Never let email errors affect usage tracking
    console.error('[usage] Warning email error:', emailErr);
  }
}
