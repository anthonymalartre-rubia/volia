import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { markLifecycleSent, isLifecycleCapped } from '@/lib/lifecycle-state';
import {
  templateKillerDay3Email,
  trialExpiringDay7Email,
  finalDemoDay14Email,
  crossModuleCampagnesDay5Email,
  // Copy Fable (séquence lifecycle) : A2/A4/A5 remplacent l'ancienne copy des
  // steps use_case_d1 / crossmodule_crm_d8 / upgrade_soft_d12 (mêmes clés,
  // mêmes jours → idempotence drip_emails_sent intacte).
  lifecycleA2Email,
  lifecycleA3Email,
  lifecycleA4Email,
  lifecycleA5Email,
} from '@/lib/emailTemplates';

/**
 * GET /api/cron/process-drip-emails
 *
 * Cron Vercel daily (10h UTC = 11h FR hiver / 12h FR été).
 * Envoie les emails de la drip campaign onboarding (copy Fable pour A2-A5) :
 *
 *   J+1  use_case_d1         — A2 Lire le scoring (gate : ≥1 recherche faite)
 *   J+3  template_d3         — Template cold email killer (TOUS les users)
 *   J+4  lifecycle_a3        — A3 Premier cold email (gate : ≥1 email & 0 campagne)
 *   J+5  crossmodule_campagnes_d5 — Cross-module Campagnes (gratuits)
 *   J+7  trial_expiring_d7   — Push upgrade (UNIQUEMENT users en trial actif)
 *   J+8  crossmodule_crm_d8  — A4 Réponses → CRM (gratuits)
 *   J+12 upgrade_soft_d12    — A5 Upgrade 19 € (gratuits)
 *   J+14 final_demo_d14      — CTA démo Cal.com (users non convertis)
 *
 * Le welcome (J+0) n'est PAS envoyé ici — il est déclenché par le flux signup
 * (authSignupConfirm + welcomeEmail).
 *
 * IDEMPOTENCE :
 *   - Chaque step a sa clé écrite dans user_profiles.drip_emails_sent (jsonb array)
 *   - On filtre via NOT (drip_emails_sent ? '<step_key>')
 *   - Si le cron tourne 2× le même jour, le 2e run ne fera rien (clé déjà présente)
 *
 * OPT-OUT :
 *   - On filtre drip_emails_enabled = true. Si l'user a coché OFF dans Settings,
 *     aucun drip ne lui parvient (mais les transactionnels obligatoires
 *     — paiement, mot de passe, RGPD — continuent normalement via leurs propres flux).
 *
 * FENÊTRE DE TIR :
 *   - Pour chaque step à J+N, on cible les users créés il y a >= N jours
 *     (borne supérieure : created_at <= now - N*24h).
 *   - L'idempotence est garantie par le filtre drip_emails_sent ? '<key>' :
 *     un user qui a déjà reçu le step ne le recevra plus.
 *   - Borne inférieure historique enlevée : avec l'ancienne fenêtre 24h,
 *     un signup à 11h le jour J avait son créneau J+1 calé entre 10h-1j et
 *     10h (cron daily à 10h UTC) → l'user était à "il y a 23h" → hors
 *     fenêtre, et le créneau J+2 le mettait à "47h" → encore hors fenêtre.
 *     Résultat : drip J+1 jamais envoyé pour tous les signups après 10h UTC.
 *
 * Sécurité : header Authorization: Bearer CRON_SECRET (cf. vercel.json).
 */
export const dynamic = 'force-dynamic';

function checkCronAuth(request) {
  const auth = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  return process.env.CRON_SECRET && auth === expected;
}

/**
 * Vrai si l'user est en gratuit ET pas en essai MAX actif. Cible du nurture
 * cross-module + 1er nudge upgrade : on ne nag pas un payant ni un user qui
 * teste déjà MAX (lui, c'est trial_expiring_d7 qui le gère).
 */
function isFreeNoActiveTrial(profile) {
  if (profile.plan !== 'free') return false;
  if (profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now()) return false;
  return true;
}

/**
 * Définition des steps de la drip. Ordre important : on les traite dans
 * cet ordre pour que les logs soient lisibles. Le builder reçoit le profile
 * complet pour pouvoir personnaliser (stats trial, etc.).
 */
const DRIP_STEPS = [
  {
    // Copy Fable A2 « Lire le scoring » (remplace l'ancien tutorial use case).
    // La copy présuppose une 1ʳᵉ recherche faite (« Tu as vu tes premiers
    // leads ») → gate sur ≥1 search_session. asyncGate=false ne marque PAS la
    // clé : un non-activé est ré-évalué chaque jour et reçoit A2 le lendemain
    // de sa première recherche. Le nudge « fais ta 1ʳᵉ recherche », lui, est
    // le rôle de stuck-user-detection (48 h).
    key: 'use_case_d1',
    daysSinceSignup: 1,
    label: 'J+1 A2 Lire le scoring',
    isEligible: () => true,
    asyncGate: async (supabase, profile) => {
      const { count } = await supabase
        .from('search_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      return (count || 0) >= 1;
    },
    build: ({ fullName }) => lifecycleA2Email(fullName),
  },
  {
    key: 'template_d3',
    daysSinceSignup: 3,
    label: 'J+3 Template killer',
    isEligible: () => true,
    build: ({ fullName }) => templateKillerDay3Email(fullName),
  },
  {
    key: 'trial_expiring_d7',
    daysSinceSignup: 7,
    label: 'J+7 Trial expiring',
    /**
     * Réservé aux users en trial (14 jours de MAX) actif :
     *   - trial_ends_at est dans le futur (trial pas encore expiré)
     *   - trial_converted_at est null (pas encore upgradé)
     * Si l'user a déjà converti ou n'a jamais eu de trial → skip.
     */
    isEligible: ({ profile }) => {
      if (!profile.trial_ends_at) return false;
      if (profile.trial_converted_at) return false;
      const endsAt = new Date(profile.trial_ends_at).getTime();
      return endsAt > Date.now();
    },
    build: ({ fullName, profile, stats }) => {
      const msRemaining = new Date(profile.trial_ends_at).getTime() - Date.now();
      const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
      return trialExpiringDay7Email(fullName, {
        prospectsFound: stats.prospectsFound,
        emailsEnriched: stats.emailsEnriched,
        daysRemaining,
      });
    },
  },
  {
    // A3 (séquence lifecycle Volia) — Premier cold email.
    // J+4 est un créneau libre : pas de collision de jour avec les steps
    // existants (J+1/3/5/7/8/12/14). Réservé aux gratuits hors essai MAX
    // actif (activation). Condition métier « ≥1 email trouvé & 0 campagne »
    // → asyncGate (requêtes DB, comme le fait le loop pour trial_expiring_d7).
    key: 'lifecycle_a3',
    daysSinceSignup: 4,
    label: 'J+4 A3 Premier cold email',
    isEligible: ({ profile }) => isFreeNoActiveTrial(profile),
    // Vrai si l'user a au moins 1 prospect AVEC email et AUCUNE campagne.
    // asyncGate=false ne marque PAS la clé (contrairement à isEligible) : la
    // condition peut mûrir plus tard et le step sera renvoyé — cf. le loop.
    asyncGate: async (supabase, profile) => {
      const { count: withEmail } = await supabase
        .from('prospects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .not('email', 'is', null);
      if (!withEmail || withEmail < 1) return false; // pas encore d'email trouvé
      const { count: campaigns } = await supabase
        .from('email_campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', profile.id);
      return (campaigns || 0) === 0; // déjà une campagne → A3 sans objet
    },
    build: ({ fullName }) => lifecycleA3Email(fullName),
  },
  {
    key: 'crossmodule_campagnes_d5',
    daysSinceSignup: 5,
    label: 'J+5 Cross-module Campagnes',
    /** Nurture suite : réservé aux gratuits hors essai MAX actif. */
    isEligible: ({ profile }) => isFreeNoActiveTrial(profile),
    build: ({ fullName }) => crossModuleCampagnesDay5Email(fullName),
  },
  {
    // Copy Fable A4 « Les réponses atterrissent » (même intention que
    // l'ancien cross-module CRM/Forms : découverte CRM + modules inclus).
    key: 'crossmodule_crm_d8',
    daysSinceSignup: 8,
    label: 'J+8 A4 Réponses → CRM',
    isEligible: ({ profile }) => isFreeNoActiveTrial(profile),
    build: ({ fullName }) => lifecycleA4Email(fullName),
  },
  {
    // Copy Fable A5 « La version sans frein » (1er nudge upgrade 19 €/mois —
    // même intention que l'ancien upgrade soft ; J+12 conservé, le doc disait
    // J+13, on garde le créneau existant pour ne pas bousculer les voisins).
    key: 'upgrade_soft_d12',
    daysSinceSignup: 12,
    label: 'J+12 A5 Upgrade 19 €',
    isEligible: ({ profile }) => isFreeNoActiveTrial(profile),
    build: ({ fullName }) => lifecycleA5Email(fullName),
  },
  {
    key: 'final_demo_d14',
    daysSinceSignup: 14,
    label: 'J+14 Final demo',
    /**
     * On évite d'envoyer le push démo aux users déjà convertis (clients
     * payants) — ils n'ont pas besoin d'un CTA "réservez une démo".
     */
    isEligible: ({ profile }) => profile.plan === 'free' || !profile.trial_converted_at,
    build: ({ fullName }) => finalDemoDay14Email(fullName),
  },
];

/**
 * Calcule la borne supérieure (created_at <= to) pour un step à J+N.
 * Pas de borne inférieure : tout user créé il y a au moins N jours est éligible,
 * et l'idempotence est garantie par drip_emails_sent ? '<key>'.
 *
 * Voir le bloc FENÊTRE DE TIR plus haut pour la justification du changement.
 */
function windowForStep(daysSinceSignup) {
  const now = Date.now();
  const to = new Date(now - daysSinceSignup * 86400 * 1000).toISOString();
  return { to };
}

export async function GET(request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();
  const globalStats = { steps: {}, totalSent: 0, totalSkipped: 0, totalFailed: 0 };

  // Garde anti-rafale (audit de clôture 06/07) : 1 email drip MAX par user et
  // par run. Sans elle, un user éligible à plusieurs steps le même jour
  // (backfill d'une clé nouvelle, rattrapage d'un compte ancien) recevait tous
  // les steps d'un coup. Le step sauté n'est PAS marqué → il partira au
  // prochain run, étalé naturellement à 1 email/jour (cron daily).
  const emailedThisRun = new Set();

  try {
    for (const step of DRIP_STEPS) {
      const stepStats = { eligible: 0, sent: 0, skipped: 0, failed: 0 };
      const { to } = windowForStep(step.daysSinceSignup);

      // 1. Fetch candidats : créés il y a au moins N jours, opt-in actif,
      //    pas encore destinataires de ce step précis (idempotence via jsonb ?).
      //    Le filtre `drip_emails_sent` côté SQL utilise l'opérateur jsonb `?`
      //    qui matche "la clé existe dans le tableau" (PostgreSQL natif).
      const { data: profiles, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id, created_at, plan, trial_ends_at, trial_converted_at, drip_emails_sent, drip_sent_at, company_name')
        .eq('drip_emails_enabled', true)
        .lte('created_at', to)
        .not('drip_emails_sent', 'cs', `["${step.key}"]`);

      if (fetchError) {
        console.error(`[cron/drip] fetch error for ${step.key}:`, fetchError);
        globalStats.steps[step.key] = { ...stepStats, error: fetchError.message };
        continue;
      }

      console.log(`[cron/drip] ${step.label}: ${profiles?.length || 0} candidates`);

      for (const profile of profiles || []) {
        try {
          // Double-check côté JS : certains filtres jsonb peuvent rater des
          // edge cases. On revérifie qu'on n'a pas déjà envoyé.
          const already = Array.isArray(profile.drip_emails_sent)
            ? profile.drip_emails_sent.includes(step.key)
            : false;
          if (already) {
            stepStats.skipped++;
            continue;
          }

          // Cap 1 email/run : déjà servi par un step précédent de ce run →
          // on saute SANS marquer la clé (envoi au prochain run).
          if (emailedThisRun.has(profile.id)) {
            stepStats.skipped++;
            continue;
          }

          // Cap global doc séquences : 1 email lifecycle / 24 h / user, tous
          // crons confondus (un trigger event-driven a pu envoyer il y a
          // quelques heures). Non marqué → repart au prochain run daily.
          if (isLifecycleCapped(profile.drip_sent_at)) {
            stepStats.skipped++;
            continue;
          }

          // Critère d'éligibilité spécifique au step (trial actif, etc.)
          if (!step.isEligible({ profile })) {
            stepStats.skipped++;
            // On marque quand même la clé pour ne pas re-évaluer demain ce
            // même user (sinon il serait recalculé tous les jours sans fin).
            // stamp:false — aucun email n'est parti, pas de timestamp fantôme
            // qui consommerait le cap 24 h du prochain envoi légitime.
            await markLifecycleSent(supabase, profile.id, step.key, { stamp: false });
            continue;
          }

          // Gate asynchrone optionnel (requêtes DB : ex. A3 « ≥1 email & 0
          // campagne »). Contrairement à isEligible, false ne marque PAS la
          // clé : la condition peut devenir vraie plus tard (l'user enrichit
          // un email dans la fenêtre J+4→now), on veut pouvoir renvoyer.
          if (step.asyncGate) {
            const passes = await step.asyncGate(supabase, profile);
            if (!passes) {
              stepStats.skipped++;
              continue;
            }
          }

          stepStats.eligible++;

          // Récupère l'email + le nom auth (les profils n'ont pas l'email).
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
          if (!userData?.user?.email) {
            stepStats.skipped++;
            await markLifecycleSent(supabase, profile.id, step.key, { stamp: false }); // compte fantôme, rien envoyé
            continue;
          }
          const email = userData.user.email;
          const fullName =
            userData.user.user_metadata?.full_name ||
            userData.user.user_metadata?.name ||
            null;
          const firstName = fullName ? fullName.split(' ')[0] : null;

          // Stats user (uniquement nécessaires pour J+7 trial expiring).
          // On les charge à la demande pour économiser des queries.
          let userStats = { prospectsFound: 0, emailsEnriched: 0 };
          if (step.key === 'trial_expiring_d7') {
            userStats = await fetchUserStats(supabase, profile.id);
          }

          const tpl = step.build({
            fullName: firstName || fullName,
            profile,
            stats: userStats,
          });

          const result = await sendEmail({
            to: email,
            subject: tpl.subject,
            html: tpl.html,
            tags: [
              { name: 'category', value: 'drip_onboarding' },
              { name: 'step', value: step.key },
            ],
          });

          if (result.success) {
            await markLifecycleSent(supabase, profile.id, step.key);
            stepStats.sent++;
            emailedThisRun.add(profile.id);
          } else {
            stepStats.failed++;
            console.warn(`[cron/drip] ${step.key} send failed for ${email}:`, result.error);
          }

          // Throttle Resend : 50ms = 20 emails/sec, safe pour le plan free.
          await new Promise((r) => setTimeout(r, 50));
        } catch (err) {
          stepStats.failed++;
          console.error(`[cron/drip] ${step.key} error for ${profile.id}:`, err);
        }
      }

      globalStats.steps[step.key] = stepStats;
      globalStats.totalSent += stepStats.sent;
      globalStats.totalSkipped += stepStats.skipped;
      globalStats.totalFailed += stepStats.failed;
    }

    const finishedAt = new Date().toISOString();
    console.log('[cron/drip] done', { startedAt, finishedAt, ...globalStats });
    return NextResponse.json({ ok: true, startedAt, finishedAt, ...globalStats });
  } catch (err) {
    console.error('[cron/drip] fatal:', err);
    return NextResponse.json({ error: 'fatal', details: err?.message }, { status: 500 });
  }
}

// Le marquage clé + timestamp vit désormais dans lib/lifecycle-state.js
// (markLifecycleSent), partagé avec lifecycle-triggers et usage.js (B1) —
// il relit l'état frais avant l'update au lieu du snapshot du fetch.

/**
 * Compte les prospects récupérés et emails enrichis par l'user.
 * Utilisé pour personnaliser le J+7 trial expiring.
 */
async function fetchUserStats(supabase, userId) {
  try {
    const { count: prospectsFound } = await supabase
      .from('prospects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    const { count: emailsEnriched } = await supabase
      .from('prospects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('email', 'is', null);
    return {
      prospectsFound: prospectsFound || 0,
      emailsEnriched: emailsEnriched || 0,
    };
  } catch (err) {
    console.warn('[cron/drip] fetchUserStats failed:', err);
    return { prospectsFound: 0, emailsEnriched: 0 };
  }
}
