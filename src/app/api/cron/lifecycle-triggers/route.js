import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';
import { getPlan } from '@/lib/plans';
import { markLifecycleSent, lifecycleSentAtMs, isLifecycleCapped } from '@/lib/lifecycle-state';
import {
  enrichNudgeEmail,
  postAhaEmail,
  powerUserMaxEmail,
  lifecycleD1Email,
  // Séquences B (upgrade) et C (win-back) câblées le 07/07/2026 — voir le
  // bloc « B/C quotidien » plus bas. B1 est envoyé par usage.js (crédits
  // épuisés) ; ici on enchaîne B2/B3 et le win-back C1→C3.
  lifecycleB2Email,
  lifecycleB3Email,
  lifecycleC1Email,
  lifecycleC2Email,
  lifecycleC3Email,
} from '@/lib/emailTemplates';

/**
 * GET /api/cron/lifecycle-triggers
 *
 * Emails lifecycle EVENT-DRIVEN (vs le drip calendaire de process-drip-emails).
 * Tourne toutes les 3h (cf. vercel.json) pour réagir vite à l'activité user.
 *
 *   D   'first_lead'     — 1er EMAIL trouvé, une seule fois À VIE (transactionnel
 *                          « aha » de la séquence lifecycle Volia). Indépendant
 *                          et PRIORITAIRE : évalué en premier, sans plafond d'âge
 *                          (contrairement aux autres triggers, limités à 30 j).
 *   A2.5 'enrich_nudge'  — a sorti des prospects mais 0 email (jamais lancé
 *                          l'enrichissement = le vrai moment de valeur). But :
 *                          débloquer l'action n°1 « récupérer les emails ».
 *                          Prioritaire sur post_aha (mutuellement exclusifs).
 *   A3 'post_aha'        — une fois >= 1 EMAIL trouvé (vrai aha, pas juste une
 *                          liste d'entreprises), ET le tuto J+1 (use_case_d1)
 *                          passé. But : enchaîner aha → enrichir le reste +
 *                          Campagnes.
 *   B3' 'power_user_max' — user GRATUIT actif sur >= 3 modules de la suite.
 *                          Signal de conversion LENT → évalué 1×/jour seulement
 *                          (run de 3h UTC) pour ne pas re-scanner 8×/jour.
 *
 * ─── Séquences B/C (câblées le 07/07/2026, évaluées 1×/jour au run de 3h) ───
 *   B2 'lifecycle_b2'    — « Fais le calcul » : J+2 après B1 (crédits épuisés,
 *                          envoyé par usage.js), toujours free.
 *   B3 'lifecycle_b3'    — « MAX, sans bullshit » : (free avec B1 ≥ J+5, OU
 *                          Prospection) ET ≥ 80 % des crédits du mois consommés.
 *   C1 'lifecycle_c1'    — win-back : free jamais converti, 0 activité 14 j
 *                          (user_profiles.last_active_at, heartbeat dans auth.js).
 *   C2 'lifecycle_c2'    — « Je le fais pour toi ? » : J+7 après C1, toujours inactif.
 *   C3 'lifecycle_c3'    — « Dernier email (promis) » : J+14 après C1, toujours
 *                          inactif. Après envoi : drip_emails_enabled=false
 *                          (« plus aucun email lifecycle », doc séquences —
 *                          ré-activable par l'user dans Settings).
 *   GARDE D'ARMEMENT : tant que LIFECYCLE_BC_LIVE != '1', la section B/C tourne
 *   en DRY-RUN — elle liste qui recevrait quoi (réponse JSON + logs) sans rien
 *   envoyer ni marquer. Armement = poser LIFECYCLE_BC_LIVE=1 sur Vercel.
 *
 * IDEMPOTENCE : clés dans user_profiles.drip_emails_sent (jsonb), partagé avec
 *   le drip calendaire → un user ne reçoit chaque trigger qu'une fois.
 *   drip_sent_at (jsonb clé→timestamp) porte la dimension temps : déclencheurs
 *   relatifs (J+2 après B1…) et cap global 1 email lifecycle / 24 h (D exempt).
 * OPT-OUT : drip_emails_enabled = true (cohérent avec process-drip-emails).
 * SÉCURITÉ : fail-CLOSED — refuse si CRON_SECRET absent.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // aligné sur les crons à volume (lead-scoring, trial-relance)

const POST_AHA_MAX_AGE_DAYS = 30; // on ne réveille pas d'anciens comptes avec un "post-aha"
const BATCH = 200;                // garde-fou coût par run et par trigger
const POWER_USER_RUN_HOUR_UTC = 3; // B3'/B2/B3/C évalués une seule fois par jour, à ce run

function checkCronAuth(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  if (!expected) return false; // fail-closed : pas de secret configuré = refus
  return request.headers.get('authorization') === `Bearer ${expected}`;
}

export async function GET(request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();
  const stats = {
    first_lead: { sent: 0, skipped: 0, failed: 0 },
    enrich_nudge: { sent: 0, skipped: 0, failed: 0 },
    post_aha: { sent: 0, skipped: 0, failed: 0 },
    power_user_max: { sent: 0, skipped: 0, failed: 0 },
    lifecycle_b2: { sent: 0, skipped: 0, failed: 0 },
    lifecycle_b3: { sent: 0, skipped: 0, failed: 0 },
    lifecycle_c1: { sent: 0, skipped: 0, failed: 0 },
    lifecycle_c2: { sent: 0, skipped: 0, failed: 0 },
    lifecycle_c3: { sent: 0, skipped: 0, failed: 0 },
  };
  // Dry-run B/C : liste { step, user_id } de ce qui SERAIT parti si
  // LIFECYCLE_BC_LIVE=1. Renvoyé dans la réponse JSON pour validation fondateur.
  const bcLive = cleanEnv(process.env.LIFECYCLE_BC_LIVE) === '1';
  const bcDryRun = [];
  // Évite 2 emails au même user dans le même run. Priorité : enrich_nudge >
  // post_aha > power_user_max.
  const emailedThisRun = new Set();

  // Compte les prospects d'un user (total, ou seulement ceux avec un email).
  const countProspects = async (userId, onlyWithEmail) => {
    let q = supabase.from('prospects').select('id', { count: 'exact', head: true }).eq('user_id', userId);
    if (onlyWithEmail) q = q.not('email', 'is', null);
    const { count } = await q;
    return count || 0;
  };

  try {
    const sinceIso = new Date(Date.now() - POST_AHA_MAX_AGE_DAYS * 86400 * 1000).toISOString();

    // ─── D : first-lead (1er EMAIL trouvé, une seule fois À VIE) ──────────
    // Transactionnel « aha » : prioritaire et sans plafond d'âge (pas de
    // gte(created_at) comme les autres triggers). Idempotent via 'first_lead'.
    // Ordonné en PREMIER pour poser la marque emailedThisRun avant post_aha
    // (les deux ciblent « ≥1 email » ; on ne veut pas les 2 le même run).
    const { data: firstLeadCandidates, error: flErr } = await supabase
      .from('user_profiles')
      .select('id, drip_emails_sent, drip_sent_at')
      .eq('drip_emails_enabled', true)
      .not('drip_emails_sent', 'cs', '["first_lead"]')
      // Audit de clôture 06/07 : un compte dont le « aha » a déjà été célébré
      // par post_aha ne doit pas recevoir « ton PREMIER lead vient d'atterrir »
      // (doublon d'intention, et message factuellement faux pour un ancien).
      .not('drip_emails_sent', 'cs', '["post_aha"]')
      .order('updated_at', { ascending: true }) // rotation équitable → pas de famine
      .limit(BATCH);
    if (flErr) console.error('[cron/lifecycle] first_lead fetch:', flErr);

    for (const profile of firstLeadCandidates || []) {
      try {
        const withEmail = await countProspects(profile.id, true);
        if (withEmail < 1) { stats.first_lead.skipped++; continue; } // pas encore de 1er email

        const outcome = await sendLifecycleEmail(supabase, profile, (name) => lifecycleD1Email(name), 'first_lead');
        if (outcome === 'sent') stats.first_lead.sent++;
        else if (outcome === 'failed') stats.first_lead.failed++;
        else stats.first_lead.skipped++;
        emailedThisRun.add(profile.id); // D exempt du cap, mais post_aha/B3 lui cèdent ce run
        await new Promise((r) => setTimeout(r, 50));
      } catch (e) {
        stats.first_lead.failed++;
        console.error('[cron/lifecycle] first_lead error', profile.id, e?.message || e);
      }
    }

    // ─── A2.5 : enrich-nudge (a des prospects mais 0 email → débloque) ─────
    const { data: nudgeCandidates, error: nudgeErr } = await supabase
      .from('user_profiles')
      .select('id, drip_emails_sent, drip_sent_at')
      .eq('drip_emails_enabled', true)
      .gte('created_at', sinceIso)
      .filter('drip_emails_sent', 'cs', '["use_case_d1"]')   // tuto J+1 passé
      .not('drip_emails_sent', 'cs', '["enrich_nudge"]')
      .not('drip_emails_sent', 'cs', '["post_aha"]')         // a déjà eu des emails → pas bloqué
      .order('created_at', { ascending: false })
      .limit(BATCH);
    if (nudgeErr) console.error('[cron/lifecycle] enrich_nudge fetch:', nudgeErr);

    for (const profile of nudgeCandidates || []) {
      try {
        const total = await countProspects(profile.id, false);
        if (total < 1) { stats.enrich_nudge.skipped++; continue; }      // pas encore cherché
        const withEmail = await countProspects(profile.id, true);
        if (withEmail > 0) { stats.enrich_nudge.skipped++; continue; }  // a des emails → pas bloqué

        const outcome = await sendLifecycleEmail(supabase, profile, (name) => enrichNudgeEmail(name, { count: total }), 'enrich_nudge');
        if (outcome === 'sent') stats.enrich_nudge.sent++;
        else if (outcome === 'failed') stats.enrich_nudge.failed++;
        else stats.enrich_nudge.skipped++;
        emailedThisRun.add(profile.id);
        await new Promise((r) => setTimeout(r, 50));
      } catch (e) {
        stats.enrich_nudge.failed++;
        console.error('[cron/lifecycle] enrich_nudge error', profile.id, e?.message || e);
      }
    }

    // ─── A3 : post-aha (>= 1 EMAIL trouvé, après le tuto J+1) ─────────────
    const { data: ahaCandidates, error: ahaErr } = await supabase
      .from('user_profiles')
      .select('id, drip_emails_sent, drip_sent_at')
      .eq('drip_emails_enabled', true)
      .gte('created_at', sinceIso)
      .filter('drip_emails_sent', 'cs', '["use_case_d1"]')   // tuto J+1 déjà envoyé → pas de collision
      .not('drip_emails_sent', 'cs', '["post_aha"]')
      .order('created_at', { ascending: false })             // signups récents d'abord
      .limit(BATCH);
    if (ahaErr) console.error('[cron/lifecycle] post_aha fetch:', ahaErr);

    for (const profile of ahaCandidates || []) {
      try {
        if (emailedThisRun.has(profile.id)) { stats.post_aha.skipped++; continue; } // déjà touché (enrich_nudge)
        const withEmail = await countProspects(profile.id, true);
        if (withEmail < 1) { stats.post_aha.skipped++; continue; } // pas encore d'email = pas le vrai aha → enrich_nudge gère
        const total = await countProspects(profile.id, false);    // taille de la liste pour le libellé

        const outcome = await sendLifecycleEmail(supabase, profile, (name) => postAhaEmail(name, { count: total }), 'post_aha');
        if (outcome === 'sent') stats.post_aha.sent++;
        else if (outcome === 'failed') stats.post_aha.failed++;
        else stats.post_aha.skipped++;
        emailedThisRun.add(profile.id); // touché ce run (même si skip) → B3 ne doublonne pas
        await new Promise((r) => setTimeout(r, 50));
      } catch (e) {
        stats.post_aha.failed++;
        console.error('[cron/lifecycle] post_aha error', profile.id, e?.message || e);
      }
    }

    // ─── B3 : power-user gratuit (>= 3 modules) → MAX — 1×/jour ───────────
    if (new Date().getUTCHours() === POWER_USER_RUN_HOUR_UTC) {
      const { data: puCandidates, error: puErr } = await supabase
        .from('user_profiles')
        .select('id, plan, trial_ends_at, drip_emails_sent, drip_sent_at')
        .eq('plan', 'free')
        .eq('drip_emails_enabled', true)
        .not('drip_emails_sent', 'cs', '["power_user_max"]')
        .order('updated_at', { ascending: true }) // rotation équitable → pas de famine
        .limit(BATCH);
      if (puErr) console.error('[cron/lifecycle] power_user_max fetch:', puErr);

      for (const profile of puCandidates || []) {
        try {
          if (emailedThisRun.has(profile.id)) { stats.power_user_max.skipped++; continue; }
          // Pas de nag si essai MAX en cours (c'est trial_expiring_d7 qui gère).
          if (profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now()) {
            stats.power_user_max.skipped++; continue;
          }
          const modulesCount = await activeModuleCount(supabase, profile.id);
          if (modulesCount < 3) { stats.power_user_max.skipped++; continue; }

          const outcome = await sendLifecycleEmail(supabase, profile, (name) => powerUserMaxEmail(name, { modulesCount }), 'power_user_max');
          if (outcome === 'sent') stats.power_user_max.sent++;
          else if (outcome === 'failed') stats.power_user_max.failed++;
          else stats.power_user_max.skipped++;
          if (outcome === 'sent') emailedThisRun.add(profile.id);
          await new Promise((r) => setTimeout(r, 50));
        } catch (e) {
          stats.power_user_max.failed++;
          console.error('[cron/lifecycle] power_user_max error', profile.id, e?.message || e);
        }
      }

      // ═══ Séquences B (upgrade) et C (win-back) — 1×/jour, dry-run gated ═══
      // Chaque step passe par processBcStep : mêmes garde-fous partout
      // (emailedThisRun, cap 24 h via drip_sent_at, idempotence par clé), et
      // en dry-run on COLLECTE au lieu d'envoyer (aucune écriture d'état).
      const dayMs = 86400 * 1000;
      const processBcStep = async (stepKey, candidates, isReady, buildTpl, afterSent) => {
        for (const profile of candidates || []) {
          try {
            if (emailedThisRun.has(profile.id)) { stats[stepKey].skipped++; continue; }
            const ready = await isReady(profile);
            if (ready === 'exit') { // séquence devenue sans objet → clé posée sans envoi
              // stamp:false — rien n'est parti, pas de timestamp fantôme qui
              // consommerait le cap 24 h du prochain email légitime.
              if (bcLive) await markLifecycleSent(supabase, profile.id, stepKey, { stamp: false });
              stats[stepKey].skipped++;
              continue;
            }
            if (!ready) { stats[stepKey].skipped++; continue; }

            if (!bcLive) {
              // DRY-RUN : on simule l'anti-rafale du run pour un volume réaliste,
              // mais on n'envoie rien et on ne marque rien.
              bcDryRun.push({ step: stepKey, user_id: profile.id });
              emailedThisRun.add(profile.id);
              continue;
            }

            const outcome = await sendLifecycleEmail(supabase, profile, buildTpl, stepKey);
            if (outcome === 'sent') stats[stepKey].sent++;
            else if (outcome === 'failed') stats[stepKey].failed++;
            else stats[stepKey].skipped++;
            if (outcome === 'sent') {
              emailedThisRun.add(profile.id);
              if (afterSent) await afterSent(profile);
            }
            await new Promise((r) => setTimeout(r, 50));
          } catch (e) {
            stats[stepKey].failed++;
            console.error(`[cron/lifecycle] ${stepKey} error`, profile.id, e?.message || e);
          }
        }
      };

      // Usage crédits du mois courant (enrichments = compteur adossé aux
      // crédits, cf. usage.js/checkLimit) rapporté à la limite du plan.
      const currentMonth = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`;
      const creditsRatio = async (profile) => {
        const limit = getPlan(profile.plan)?.limits?.enrichments_per_month;
        if (!limit || limit <= 0) return 0;
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('enrichments')
          .eq('user_id', profile.id)
          .eq('month', currentMonth)
          .maybeSingle();
        return (usage?.enrichments || 0) / limit;
      };

      // ── B2 « Fais le calcul » : J+2 après B1, toujours free ──────────────
      // Exclut les churners (churned_at posé par le webhook Stripe) : eux
      // relèvent de la séquence reactivation, pas d'un pitch 19 € tardif.
      const { data: b2Candidates, error: b2Err } = await supabase
        .from('user_profiles')
        .select('id, plan, trial_ends_at, drip_emails_sent, drip_sent_at')
        .eq('plan', 'free')
        .eq('drip_emails_enabled', true)
        .is('churned_at', null)
        .filter('drip_emails_sent', 'cs', '["lifecycle_b1"]')
        .not('drip_emails_sent', 'cs', '["lifecycle_b2"]')
        .order('updated_at', { ascending: true })
        .limit(BATCH);
      if (b2Err) console.error('[cron/lifecycle] lifecycle_b2 fetch:', b2Err);
      await processBcStep(
        'lifecycle_b2',
        b2Candidates,
        (profile) => {
          // Pas de pitch 19 € pendant un essai MAX en cours.
          if (profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now()) return false;
          const b1Ts = lifecycleSentAtMs(profile.drip_sent_at, 'lifecycle_b1');
          if (!b1Ts) return 'exit';                       // clé sans timestamp : ancre J+2 incalculable → sortie propre (pas d'attente éternelle)
          if (Date.now() - b1Ts > 30 * dayMs) return 'exit'; // ancre périmée (> 30 j : conversion/churn entre-temps) → « fais le calcul » n'a plus de contexte
          return Date.now() - b1Ts >= 2 * dayMs;
        },
        (name) => lifecycleB2Email(name),
      );

      // ── B3 « MAX, sans bullshit » : usage élevé (≥ 80 % des crédits) ─────
      // Deux portes d'entrée : free avec B1 posé depuis ≥ 5 j, ou Prospection
      // (pas de B1 chez eux — leurs crédits partent par 500). Espacement vs
      // l'autre nudge MAX (power_user_max) : 7 j mini entre les deux.
      const { data: b3Candidates, error: b3Err } = await supabase
        .from('user_profiles')
        .select('id, plan, trial_ends_at, drip_emails_sent, drip_sent_at')
        .in('plan', ['free', 'prospection'])
        .eq('drip_emails_enabled', true)
        .is('churned_at', null)
        .not('drip_emails_sent', 'cs', '["lifecycle_b3"]')
        .order('updated_at', { ascending: true })
        .limit(BATCH);
      if (b3Err) console.error('[cron/lifecycle] lifecycle_b3 fetch:', b3Err);
      await processBcStep(
        'lifecycle_b3',
        b3Candidates,
        async (profile) => {
          if (profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now()) return false;
          if (profile.plan === 'free') {
            const keys = Array.isArray(profile.drip_emails_sent) ? profile.drip_emails_sent : [];
            if (!keys.includes('lifecycle_b1')) return false;
            const b1Ts = lifecycleSentAtMs(profile.drip_sent_at, 'lifecycle_b1');
            // Clé sans timestamp = envoi ancien (convention lifecycle-state) →
            // la porte d'âge « ≥ J+5 » est considérée franchie ; seul un B1
            // horodaté RÉCENT fait attendre.
            if (b1Ts && Date.now() - b1Ts < 5 * dayMs) return false;
          }
          const puTs = lifecycleSentAtMs(profile.drip_sent_at, 'power_user_max');
          if (puTs && Date.now() - puTs < 7 * dayMs) return false; // nudge MAX trop récent
          return (await creditsRatio(profile)) >= 0.8;
        },
        (name) => lifecycleB3Email(name),
      );

      // ── C1 win-back : free jamais converti, 0 activité depuis 14 j ───────
      // churned_at IS NULL : un ex-payant qui churn appartient à la séquence
      // reactivation (J+30/60/90, COMEBACK50) — pas aux deux à la fois.
      const inactiveCutoff = new Date(Date.now() - 14 * dayMs).toISOString();
      const { data: c1Candidates, error: c1Err } = await supabase
        .from('user_profiles')
        .select('id, plan, drip_emails_sent, drip_sent_at, last_active_at')
        .eq('plan', 'free')
        .eq('drip_emails_enabled', true)
        .is('trial_converted_at', null)
        .is('churned_at', null)
        .lt('last_active_at', inactiveCutoff)
        .not('drip_emails_sent', 'cs', '["lifecycle_c1"]')
        .order('updated_at', { ascending: true })
        .limit(BATCH);
      if (c1Err) console.error('[cron/lifecycle] lifecycle_c1 fetch:', c1Err);
      await processBcStep(
        'lifecycle_c1',
        c1Candidates,
        () => true, // toutes les conditions sont déjà dans la requête
        (name) => lifecycleC1Email(name),
      );

      // ── C2/C3 : suite du win-back, ancrée sur la date d'envoi de C1 ──────
      // « Toujours inactif » = aucune activité DEPUIS C1. Si l'user est revenu,
      // le win-back a gagné → isReady renvoie 'exit' (clé posée, rien envoyé).
      const followUpReady = (daysAfterC1) => (profile) => {
        const c1Ts = lifecycleSentAtMs(profile.drip_sent_at, 'lifecycle_c1');
        if (!c1Ts) return 'exit'; // C1 pré-timestamps : pas d'ancre fiable → sortie propre
        const lastActive = profile.last_active_at ? new Date(profile.last_active_at).getTime() : 0;
        if (lastActive > c1Ts) return 'exit'; // réactivé depuis C1 → mission accomplie
        return Date.now() - c1Ts >= daysAfterC1 * dayMs;
      };
      const fetchCFollowUp = (notKey) => supabase
        .from('user_profiles')
        .select('id, plan, drip_emails_sent, drip_sent_at, last_active_at')
        .eq('plan', 'free')
        .eq('drip_emails_enabled', true)
        .filter('drip_emails_sent', 'cs', '["lifecycle_c1"]')
        .not('drip_emails_sent', 'cs', `["${notKey}"]`)
        .order('updated_at', { ascending: true })
        .limit(BATCH);

      const { data: c2Candidates, error: c2Err } = await fetchCFollowUp('lifecycle_c2');
      if (c2Err) console.error('[cron/lifecycle] lifecycle_c2 fetch:', c2Err);
      await processBcStep('lifecycle_c2', c2Candidates, followUpReady(7), (name) => lifecycleC2Email(name));

      const { data: c3Candidates, error: c3Err } = await fetchCFollowUp('lifecycle_c3');
      if (c3Err) console.error('[cron/lifecycle] lifecycle_c3 fetch:', c3Err);
      await processBcStep(
        'lifecycle_c3',
        c3Candidates,
        followUpReady(14),
        (name) => lifecycleC3Email(name),
        // « Dernier email (promis) » : après C3, plus AUCUN email lifecycle
        // (règle de sortie du doc séquences). On coupe le robinet via le flag
        // opt-out existant — l'user peut le réactiver dans Settings.
        async (profile) => {
          await supabase
            .from('user_profiles')
            .update({ drip_emails_enabled: false, updated_at: new Date().toISOString() })
            .eq('id', profile.id);
        },
      );
    }

    const finishedAt = new Date().toISOString();
    console.log('[cron/lifecycle] done', { startedAt, finishedAt, bcLive, bcDryRunCount: bcDryRun.length, ...stats });
    return NextResponse.json({ ok: true, startedAt, finishedAt, bcLive, bcDryRun, ...stats });
  } catch (err) {
    console.error('[cron/lifecycle] fatal:', err);
    return NextResponse.json({ error: 'fatal', details: err?.message }, { status: 500 });
  }
}

/**
 * Compte les modules de la suite sur lesquels l'user a au moins 1 enregistrement.
 * NB : email_campaigns appartient via owner_id (les autres via user_id).
 * CRM (deals OU contacts) compte pour 1 seul module.
 */
async function activeModuleCount(supabase, userId) {
  const head = (table, col) =>
    supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, userId).limit(1);
  const [pros, camp, deals, contacts, forms, projects] = await Promise.all([
    head('prospects', 'user_id'),
    head('email_campaigns', 'owner_id'),
    head('crm_deals', 'user_id'),
    head('crm_contacts', 'user_id'),
    head('forms', 'user_id'),
    head('projects', 'user_id'),
  ]);
  const crm = (deals.count || 0) > 0 || (contacts.count || 0) > 0;
  return [
    (pros.count || 0) > 0,
    (camp.count || 0) > 0,
    crm,
    (forms.count || 0) > 0,
    (projects.count || 0) > 0,
  ].filter(Boolean).length;
}

/**
 * Récupère l'email/nom via Auth Admin, envoie le template (builder (name)=>tpl),
 * marque la clé + son timestamp (markLifecycleSent, partagé avec le cron drip).
 * Retourne 'sent' | 'skipped' | 'failed'. Marque la clé même si pas d'email
 * (compte fantôme) pour ne pas re-traiter ce profil indéfiniment.
 *
 * Cap doc séquences « 1 email lifecycle / 24 h / user » : refusé AVANT envoi
 * si drip_sent_at contient un envoi < 24 h — sauf 'first_lead' (D exempt,
 * transactionnel). Le step retenu n'est PAS marqué : il repart au run suivant.
 */
async function sendLifecycleEmail(supabase, profile, buildTpl, stepKey) {
  if (stepKey !== 'first_lead' && isLifecycleCapped(profile.drip_sent_at)) {
    return 'skipped'; // cap 24 h — non marqué, ré-évalué au prochain run
  }
  const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
  const email = userData?.user?.email;
  if (!email) {
    // stamp:false — rien n'est parti, la clé bloque le re-traitement sans
    // consommer le cap 24 h par un timestamp fantôme.
    await markLifecycleSent(supabase, profile.id, stepKey, { stamp: false });
    return 'skipped';
  }
  const fullName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null;
  const firstName = fullName ? fullName.split(' ')[0] : null;
  const built = buildTpl(firstName);

  const result = await sendEmail({
    to: email,
    subject: built.subject,
    html: built.html,
    tags: [
      { name: 'category', value: 'lifecycle_trigger' },
      { name: 'step', value: stepKey },
    ],
  });

  if (result.success) {
    await markLifecycleSent(supabase, profile.id, stepKey);
    return 'sent';
  }
  console.warn(`[cron/lifecycle] ${stepKey} send failed for ${email}:`, result.error);
  return 'failed';
}
