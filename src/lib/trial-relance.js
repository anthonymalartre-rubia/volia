// ─────────────────────────────────────────────────────────────────────
// src/lib/trial-relance.js — Sprint Revenue Engine Phase 2
// ─────────────────────────────────────────────────────────────────────
// Cron daily 9h CET. Pour chaque user en trial actif :
//   - J+3 (3 jours après trial_started_at) : check-in soft
//   - J+7 (mi-trial) : best practices + démo Cal.com offer
//   - J+12 (2j avant fin) : last chance + CTA Stripe checkout
//
// Templates personnalisés selon usage :
//   - Si lead_score >= 50 : ton confiant, push fort
//   - Si lead_score < 50 : ton plus pédagogique, demande feedback
//
// Garde-fous :
//   - Skip si déjà converti
//   - Skip si déjà churned
//   - Skip si email déjà envoyé pour cette step
//   - Max 100 emails / run
//   - Quota daily 200
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isAutonomyEnabled, enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 100;

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name ||
    authUser?.user?.user_metadata?.full_name?.split(' ')[0] ||
    (email ? email.split('@')[0] : null);
  return { email, firstName };
}

function buildStep1Email({ firstName, leadScore }) {
  const name = firstName || 'toi';
  const isHot = (leadScore || 0) >= 50;
  return {
    subject: isHot
      ? `Comment se passe tes 3 premiers jours sur Volia ${name} ?`
      : `${name}, premier check-in après 3 jours sur Volia`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ça fait 3 jours que tu testes Volia. Pas de pression, pas de spam : juste un check-in.
  </p>
  ${isHot ? `<p style="font-size:14px;line-height:1.6;background:#ecfdf5;padding:12px;border-left:3px solid #10b981;border-radius:4px;">
    👀 Je vois que tu as déjà bien utilisé Volia. Si tu veux que je passe en revue ta première liste prospects ou ta config campagne, dis-moi.
  </p>` : `<p style="font-size:14px;line-height:1.6;">
    Tu n'as pas encore beaucoup utilisé l'app — c'est normal au début. Si tu galères avec un truc précis (config domaine email, premier scrape Google Places, import CSV...), réponds-moi, je débloque en 1 mail.
  </p>`}
  <p style="font-size:14px;line-height:1.6;">
    Ton trial dure 11 jours encore. Profite-en pour tester ce que tu n'oseras plus tester en payant.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    👉 <a href="https://volia.fr/dashboard" style="color:#6366f1;">Reprendre où tu en étais</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Ça fait 3 jours que tu testes Volia. Pas de pression, juste un check-in.

${isHot
  ? `Je vois que tu as déjà bien utilisé Volia. Si tu veux que je passe en revue ta première liste prospects ou ta config campagne, dis-moi.`
  : `Tu n'as pas encore beaucoup utilisé l'app — c'est normal au début. Si tu galères avec un truc précis (config domaine email, premier scrape, import CSV...), réponds-moi.`}

Ton trial dure 11 jours encore. Profite-en pour tester ce que tu n'oseras plus tester en payant.

→ Reprendre où tu en étais : https://volia.fr/dashboard

Anthony — Fondateur Volia`,
  };
}

function buildStep2Email({ firstName, leadScore }) {
  const name = firstName || 'toi';
  const isHot = (leadScore || 0) >= 50;
  return {
    subject: isHot
      ? `${name}, on cale 15 min pour optimiser ta config Volia ?`
      : `Mi-trial : les 3 réflexes Volia qui font la diff`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Mi-trial. Voici les 3 réflexes qui transforment Volia d'un outil "ok" en machine à RDV :
  </p>
  <ol style="font-size:14px;line-height:1.7;color:#374151;">
    <li><strong>Catégorise tes listes par persona / dept</strong>, pas "tout en vrac". Permet de personnaliser les campagnes.</li>
    <li><strong>Configure ton domaine d'envoi propre</strong> (resend, pas @gmail). Sinon tes mails partent en spam.</li>
    <li><strong>Push direct dans le CRM</strong> les prospects qui ont répondu, pour les gérer en pipeline.</li>
  </ol>
  ${isHot ? `<div style="margin:24px 0;padding:18px;background:#ede9fe;border-left:4px solid #6366f1;border-radius:6px;">
    <p style="margin:0;font-size:15px;font-weight:600;color:#5b21b6;">📞 Tu veux qu'on regarde ta config ensemble ?</p>
    <p style="margin:8px 0 0;font-size:13px;color:#6b21a8;">15 min, gratuit, je te montre 1-2 trucs qui te font gagner du temps.</p>
    <p style="margin:12px 0 0;"><a href="https://cal.com/anthony-volia/15min" style="display:inline-block;padding:10px 18px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Réserver 15 min</a></p>
  </div>` : `<p style="font-size:14px;line-height:1.6;background:#fef3c7;padding:12px;border-left:3px solid #f59e0b;border-radius:4px;">
    💡 Si tu n'as pas encore lancé ta première campagne, c'est le bon moment. Tu as 7 jours encore avant fin du trial.
  </p>`}
  <p style="font-size:14px;line-height:1.6;">
    👉 <a href="https://volia.fr/dashboard" style="color:#6366f1;">Continuer sur Volia</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Mi-trial. Voici les 3 réflexes qui transforment Volia d'un outil "ok" en machine à RDV :

1. Catégorise tes listes par persona / dept (pas "tout en vrac"). Permet de personnaliser.
2. Configure ton domaine d'envoi propre (resend, pas @gmail). Sinon spam.
3. Push direct dans le CRM les prospects qui ont répondu pour gérer le pipeline.

${isHot
  ? `Tu veux qu'on regarde ta config ensemble ? 15 min, gratuit : https://cal.com/anthony-volia/15min`
  : `Si tu n'as pas encore lancé ta première campagne, c'est le bon moment. 7 jours restants.`}

→ https://volia.fr/dashboard

Anthony — Fondateur Volia`,
  };
}

function buildStep3Email({ firstName, leadScore, trialEndsAt }) {
  const name = firstName || 'toi';
  const isHot = (leadScore || 0) >= 50;
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt) - new Date()) / (86400 * 1000)))
    : 2;
  return {
    subject: isHot
      ? `${name}, on souscrit ? (J-${daysLeft} fin de trial)`
      : `Ton trial Volia finit dans ${daysLeft} jours`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ton trial Volia se termine dans <strong>${daysLeft} jours</strong>.
  </p>
  ${isHot ? `<p style="font-size:14px;line-height:1.6;">
    Vu comment tu utilises l'app, ça vaut le coup de continuer. Voici un récap simple :
  </p>` : `<p style="font-size:14px;line-height:1.6;">
    Si tu hésites encore : voici ce que tu perds en repassant en Free :
  </p>`}
  <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:8px;text-align:left;border:1px solid #e5e7eb;">Plan</th>
        <th style="padding:8px;text-align:left;border:1px solid #e5e7eb;">Prix</th>
        <th style="padding:8px;text-align:left;border:1px solid #e5e7eb;">Ce qui change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Pro</strong></td>
        <td style="padding:8px;border:1px solid #e5e7eb;">49€/mois</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">1 200 enrichissements + 1 module</td>
      </tr>
      <tr style="background:#ecfdf5;">
        <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Business</strong> ⭐</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">179€/mois</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">SEUL plan qui débloque les 4 modules (Prospection + Campagnes + CRM + Forms)</td>
      </tr>
    </tbody>
  </table>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://volia.fr/pricing" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Choisir mon plan →</a>
  </p>
  ${isHot ? `<p style="font-size:13px;color:#6b7280;text-align:center;">
    Tu peux annuler à tout moment. Si t'es coincé, réponds-moi.
  </p>` : `<p style="font-size:13px;color:#6b7280;">
    Si tu veux qu'on échange avant : <a href="https://cal.com/anthony-volia/15min" style="color:#6366f1;">15 min sur Cal.com</a>.
  </p>`}
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Ton trial Volia se termine dans ${daysLeft} jours.

Pro    : 49€/mois  — 1200 enrichissements + 1 module
Business : 179€/mois — SEUL plan qui débloque les 4 modules ⭐

→ Choisir mon plan : https://volia.fr/pricing

${isHot
  ? `Tu peux annuler à tout moment. Si t'es coincé, réponds-moi.`
  : `Si tu veux qu'on échange avant : 15 min sur Cal.com : https://cal.com/anthony-volia/15min`}

Anthony — Fondateur Volia`,
  };
}

const STEPS = [
  {
    step: 1,
    daysAfterStart: 3,
    columnSentAt: 'trial_email_step_1_sent_at',
    builder: buildStep1Email,
  },
  {
    step: 2,
    daysAfterStart: 7,
    columnSentAt: 'trial_email_step_2_sent_at',
    builder: buildStep2Email,
  },
  {
    step: 3,
    daysAfterStart: 12,
    columnSentAt: 'trial_email_step_3_sent_at',
    builder: buildStep3Email,
  },
];

export async function runTrialRelance() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  try {
    await enforceQuotaOrThrow('trial_relance_email_send', { perDay: 200 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const results = { sent: [], skipped: [], errors: [] };
  let totalSent = 0;

  for (const step of STEPS) {
    if (totalSent >= MAX_PER_RUN) break;

    // Find users en trial actif depuis >= daysAfterStart, pas notifés pour cette step
    const thresholdDate = new Date(Date.now() - step.daysAfterStart * 86400 * 1000).toISOString();
    const { data: candidates, error } = await supabase
      .from('user_profiles')
      .select('id, lead_score, trial_started_at, trial_ends_at')
      .not('trial_started_at', 'is', null)
      .lt('trial_started_at', thresholdDate)
      .gt('trial_ends_at', new Date().toISOString())
      .is('trial_converted_at', null)
      .is('churned_at', null)
      .is(step.columnSentAt, null)
      .order('lead_score', { ascending: false })
      .limit(MAX_PER_RUN - totalSent);

    if (error) {
      results.errors.push({ step: step.step, error: error.message });
      continue;
    }
    if (!candidates || candidates.length === 0) continue;

    for (const user of candidates) {
      const { email, firstName } = await getUserContact(supabase, user.id);
      if (!email) {
        results.skipped.push({ user_id: user.id, step: step.step, reason: 'no_email' });
        continue;
      }
      const tpl = step.builder({
        firstName,
        leadScore: user.lead_score,
        trialEndsAt: user.trial_ends_at,
      });
      try {
        await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
        await supabase
          .from('user_profiles')
          .update({ [step.columnSentAt]: new Date().toISOString() })
          .eq('id', user.id);
        results.sent.push({ user_id: user.id, email, step: step.step, lead_score: user.lead_score });
        totalSent++;

        await logAutonomousAction({
          actionType: 'trial_relance_email_send',
          source: 'cron/trial-relance',
          riskLevel: 'low',
          payload: {
            user_id: user.id,
            email,
            step: step.step,
            days_into_trial: step.daysAfterStart,
            lead_score: user.lead_score,
          },
          preview: `📧 Trial J+${step.daysAfterStart} → ${email} (score ${user.lead_score})`,
          rationale: `Auto-relance trial, step ${step.step}/3`,
          autoExecute: true,
        });
      } catch (err) {
        console.error(`[trial-relance] step ${step.step} failed for ${email}`, err);
        results.errors.push({ user_id: user.id, email, step: step.step, error: err.message });
      }
    }
  }

  return {
    ok: true,
    sent_count: results.sent.length,
    skipped_count: results.skipped.length,
    errors_count: results.errors.length,
    results,
    startedAt,
  };
}
