// ─────────────────────────────────────────────────────────────────────
// src/lib/milestone-reviews.js — Wave 1.5 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Event-driven (pas un cron). Appelé depuis les hooks achievements/events
// existants quand un user atteint un milestone aha-moment :
//   - first_campaign_sent
//   - first_100_prospects_scraped
//   - first_crm_deal_created
//
// Envoie 1 email capitalisant sur le succès :
//   "Bravo ! Si tu kiffes Volia, 2 options : laisse une étoile Trustpilot
//    OU réfère un ami (3 mois gratuits pour vous 2)."
//
// Idempotent par milestone (1 email max par milestone par user).
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { logAutonomousAction } from './autonomy';

const SUPPORTED_MILESTONES = [
  'first_campaign_sent',
  'first_100_prospects_scraped',
  'first_crm_deal_created',
];

const MILESTONE_COPY = {
  first_campaign_sent: {
    title: 'tu as lancé ta première campagne email',
    accomplishment: 'C\'est le moment où Volia commence vraiment à payer.',
  },
  first_100_prospects_scraped: {
    title: 'tu as scrapé tes 100 premiers prospects',
    accomplishment: 'C\'est l\'étape qui sépare les curieux des actifs.',
  },
  first_crm_deal_created: {
    title: 'tu as créé ton premier deal CRM',
    accomplishment: 'Tu transformes les contacts en pipeline. Bravo.',
  },
};

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name
    || (email ? email.split('@')[0] : null);
  return { email, firstName };
}

function buildEmail({ firstName, milestone, referralCode }) {
  const name = firstName || 'toi';
  const copy = MILESTONE_COPY[milestone] || { title: 'tu as franchi une étape', accomplishment: 'Continue.' };
  const referralUrl = referralCode
    ? `https://volia.fr/signup?ref=${referralCode}`
    : 'https://volia.fr/parrainage';

  return {
    subject: `Bravo ${name} — tu progresses vite sur Volia 🚀`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">Bravo ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Tu viens d'atteindre une étape : <strong>${copy.title}</strong>.
  </p>
  <p style="font-size:14px;line-height:1.6;font-style:italic;color:#6b7280;">
    ${copy.accomplishment}
  </p>

  <p style="font-size:14px;line-height:1.6;margin-top:24px;">
    Si Volia te kiffe, 2 façons super simples de m'aider en retour :
  </p>

  <div style="margin:24px 0;display:grid;gap:12px;">
    <div style="padding:18px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#92400e;">⭐ Laisse une étoile Trustpilot (30 secondes)</p>
      <p style="margin:6px 0 12px;font-size:13px;color:#78350f;">
        Ça aide ÉNORMÉMENT les autres founders à oser tester Volia.
      </p>
      <a href="https://fr.trustpilot.com/evaluate/volia.fr" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:white;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Laisser un avis</a>
    </div>

    <div style="padding:18px;background:#ede9fe;border-left:4px solid #6366f1;border-radius:6px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#5b21b6;">🎁 Réfère un ami (3 mois gratuits pour vous 2)</p>
      <p style="margin:6px 0 12px;font-size:13px;color:#6b21a8;">
        Pour chaque ami qui s'inscrit avec ton lien et passe payant : 3 mois offerts.
      </p>
      <a href="${referralUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Mon lien de parrainage</a>
    </div>
  </div>

  <p style="font-size:14px;line-height:1.6;margin-top:24px;">
    Aucune des deux options ne te tente ? Pas de souci, continue à utiliser Volia normalement. C'est déjà beaucoup.
  </p>

  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Bravo ${name},

Tu viens d'atteindre une étape : ${copy.title}.

Si Volia te kiffe, 2 façons de m'aider :

⭐ Trustpilot (30 sec) : https://fr.trustpilot.com/evaluate/volia.fr

🎁 Parrainage (3 mois gratuits pour vous 2) : ${referralUrl}

Anthony — Volia`,
  };
}

/**
 * Trigger l'email milestone si pas déjà envoyé.
 * Idempotent : check milestone_review_emails_sent JSONB.
 */
export async function triggerMilestoneReview({ userId, milestone }) {
  if (!SUPPORTED_MILESTONES.includes(milestone)) {
    return { ok: false, error: 'unsupported_milestone' };
  }

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) return { ok: true, skipped: true, reason: state.reason };

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('milestone_review_emails_sent, referral_code, churned_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) return { ok: false, error: 'user_not_found' };
  if (profile.churned_at) return { ok: true, skipped: true, reason: 'churned' };

  const sent = Array.isArray(profile.milestone_review_emails_sent)
    ? profile.milestone_review_emails_sent
    : [];
  if (sent.some((m) => m.milestone === milestone)) {
    return { ok: true, skipped: true, reason: 'already_sent_for_milestone' };
  }

  const { email, firstName } = await getUserContact(supabase, userId);
  if (!email) return { ok: false, error: 'no_email' };

  const tpl = buildEmail({ firstName, milestone, referralCode: profile.referral_code });

  try {
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    const newSent = [...sent, { milestone, sent_at: new Date().toISOString() }];
    await supabase
      .from('user_profiles')
      .update({ milestone_review_emails_sent: newSent })
      .eq('id', userId);

    await logAutonomousAction({
      actionType: 'milestone_review_email',
      source: 'event:achievements',
      riskLevel: 'low',
      payload: { user_id: userId, email, milestone },
      preview: `🎉 Milestone ${milestone} → ${email}`,
      rationale: 'Capitalise aha moment pour social proof + referral',
      autoExecute: true,
    });

    return { ok: true, sent: true, email, milestone };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
