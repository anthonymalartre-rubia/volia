import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';
import { enrichNudgeEmail, postAhaEmail, powerUserMaxEmail } from '@/lib/emailTemplates';

/**
 * GET /api/cron/lifecycle-triggers
 *
 * Emails lifecycle EVENT-DRIVEN (vs le drip calendaire de process-drip-emails).
 * Tourne toutes les 3h (cf. vercel.json) pour réagir vite à l'activité user.
 *
 *   A2.5 'enrich_nudge'  — a sorti des prospects mais 0 email (jamais lancé
 *                          l'enrichissement = le vrai moment de valeur). But :
 *                          débloquer l'action n°1 « récupérer les emails ».
 *                          Prioritaire sur post_aha (mutuellement exclusifs).
 *   A3 'post_aha'        — une fois >= 1 EMAIL trouvé (vrai aha, pas juste une
 *                          liste d'entreprises), ET le tuto J+1 (use_case_d1)
 *                          passé. But : enchaîner aha → enrichir le reste +
 *                          Campagnes.
 *   B3 'power_user_max'  — user GRATUIT actif sur >= 3 modules de la suite.
 *                          Signal de conversion LENT → évalué 1×/jour seulement
 *                          (run de 3h UTC) pour ne pas re-scanner 8×/jour.
 *
 * IDEMPOTENCE : clés dans user_profiles.drip_emails_sent (jsonb), partagé avec
 *   le drip calendaire → un user ne reçoit chaque trigger qu'une fois.
 * OPT-OUT : drip_emails_enabled = true (cohérent avec process-drip-emails).
 * SÉCURITÉ : fail-CLOSED — refuse si CRON_SECRET absent.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // aligné sur les crons à volume (lead-scoring, trial-relance)

const POST_AHA_MAX_AGE_DAYS = 30; // on ne réveille pas d'anciens comptes avec un "post-aha"
const BATCH = 200;                // garde-fou coût par run et par trigger
const POWER_USER_RUN_HOUR_UTC = 3; // B3 évalué une seule fois par jour, à ce run

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
    enrich_nudge: { sent: 0, skipped: 0, failed: 0 },
    post_aha: { sent: 0, skipped: 0, failed: 0 },
    power_user_max: { sent: 0, skipped: 0, failed: 0 },
  };
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

    // ─── A2.5 : enrich-nudge (a des prospects mais 0 email → débloque) ─────
    const { data: nudgeCandidates, error: nudgeErr } = await supabase
      .from('user_profiles')
      .select('id, drip_emails_sent')
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
      .select('id, drip_emails_sent')
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
        .select('id, plan, trial_ends_at, drip_emails_sent')
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
          await new Promise((r) => setTimeout(r, 50));
        } catch (e) {
          stats.power_user_max.failed++;
          console.error('[cron/lifecycle] power_user_max error', profile.id, e?.message || e);
        }
      }
    }

    const finishedAt = new Date().toISOString();
    console.log('[cron/lifecycle] done', { startedAt, finishedAt, ...stats });
    return NextResponse.json({ ok: true, startedAt, finishedAt, ...stats });
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
 * marque la clé. Retourne 'sent' | 'skipped' | 'failed'. Marque la clé même si
 * pas d'email (compte fantôme) pour ne pas re-traiter ce profil indéfiniment.
 */
async function sendLifecycleEmail(supabase, profile, buildTpl, stepKey) {
  const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
  const email = userData?.user?.email;
  if (!email) {
    await markStepSent(supabase, profile.id, stepKey);
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
    await markStepSent(supabase, profile.id, stepKey);
    return 'sent';
  }
  console.warn(`[cron/lifecycle] ${stepKey} send failed for ${email}:`, result.error);
  return 'failed';
}

/**
 * Append idempotent de la clé dans drip_emails_sent. Re-lit l'état FRAIS juste
 * avant l'update (et pas un snapshot du fetch) pour ne pas écraser une clé posée
 * entre-temps par l'autre trigger du même run ou par le cron drip concurrent.
 */
async function markStepSent(supabase, userId, stepKey) {
  const { data } = await supabase
    .from('user_profiles')
    .select('drip_emails_sent')
    .eq('id', userId)
    .maybeSingle();
  const arr = Array.isArray(data?.drip_emails_sent) ? data.drip_emails_sent : [];
  if (arr.includes(stepKey)) return;
  await supabase
    .from('user_profiles')
    .update({ drip_emails_sent: [...arr, stepKey], updated_at: new Date().toISOString() })
    .eq('id', userId);
}
