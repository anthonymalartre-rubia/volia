// ─────────────────────────────────────────────────────────────────────
// src/lib/nps-auto.js — Wave 2.4 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Cron daily 10h CET. Pour chaque user dont l'account créé = 30 jours
// pile (et nps_sent_at NULL) → envoie email NPS avec 11 boutons (0-10).
//
// Branching à la réponse (via /api/nps/respond) :
//   - score 9-10 (promoter) : email "push referral 3 mois gratuits"
//   - score 7-8  (passive)  : email "Ravi ! Si tu kiffes, partage Volia"
//   - score 0-6  (detractor): email "Urgent call avec moi, 15 min ?"
//
// Cible : alimente social proof + détecte detractors AVANT churn.
// ─────────────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 50;
const TARGET_DAYS_AFTER_SIGNUP = 30;

/**
 * Génère un token signed permettant de logger une réponse NPS sans login.
 * Format : userId:score:expiresEpoch:hmac
 */
export function generateNpsToken(userId, score) {
  const secret = process.env.NPS_TOKEN_SECRET || process.env.CRON_SECRET || 'volia-nps-fallback';
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 86400; // 60 jours
  const payload = `${userId}:${score}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 24);
  return `${payload}:${hmac}`;
}

export function verifyNpsToken(token) {
  try {
    const parts = String(token).split(':');
    if (parts.length !== 4) return { valid: false, error: 'malformed' };
    const [userId, scoreStr, expiresStr, hmac] = parts;
    const secret = process.env.NPS_TOKEN_SECRET || process.env.CRON_SECRET || 'volia-nps-fallback';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${userId}:${scoreStr}:${expiresStr}`)
      .digest('hex')
      .slice(0, 24);
    if (hmac !== expected) return { valid: false, error: 'bad_signature' };
    const expires = parseInt(expiresStr, 10);
    if (expires < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'expired' };
    }
    const score = parseInt(scoreStr, 10);
    if (isNaN(score) || score < 0 || score > 10) {
      return { valid: false, error: 'bad_score' };
    }
    return { valid: true, userId, score };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name
    || (email ? email.split('@')[0] : null);
  return { email, firstName };
}

function buildNpsEmail({ firstName, userId }) {
  const name = firstName || 'toi';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://volia.fr';

  // 11 boutons cliquables 0-10, chacun avec son token signed
  const buttons = Array.from({ length: 11 }, (_, score) => {
    const token = generateNpsToken(userId, score);
    const url = `${baseUrl}/api/nps/respond?token=${encodeURIComponent(token)}`;
    const color =
      score >= 9 ? '#10b981' :
      score >= 7 ? '#f59e0b' :
      '#ef4444';
    return `<a href="${url}" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;background:${color};color:white;text-decoration:none;font-weight:bold;font-size:14px;border-radius:6px;margin:2px;">${score}</a>`;
  }).join('');

  return {
    subject: `${name}, ça fait 30 jours sur Volia. Sur 10, tu nous mets combien ?`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ça fait 30 jours que tu utilises Volia. Une question vite fait :
  </p>
  <p style="font-size:16px;line-height:1.6;font-weight:600;color:#111827;text-align:center;margin:32px 0 16px;">
    Sur une échelle de 0 à 10, recommanderais-tu Volia à un collègue ou ami ?
  </p>

  <div style="text-align:center;margin:24px 0;line-height:1;">
    ${buttons}
  </div>

  <p style="font-size:11px;text-align:center;color:#9ca3af;margin-top:4px;">
    ↑ 0 = absolument pas · 10 = avec enthousiasme
  </p>

  <p style="font-size:13px;line-height:1.6;color:#6b7280;margin-top:32px;">
    Clique juste sur le chiffre, c'est enregistré. Pas de formulaire à remplir.
  </p>

  <p style="font-size:14px;line-height:1.6;margin-top:24px;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Ça fait 30 jours sur Volia. Sur 10, tu nous mets combien ?

(Clique sur un score : ${baseUrl}/api/nps/respond?token=${generateNpsToken(userId, 0)} pour 0 ... 10)

Anthony — Volia`,
  };
}

function buildFollowupEmail({ firstName, score, referralCode }) {
  const name = firstName || 'toi';
  const referralUrl = referralCode
    ? `https://volia.fr/signup?ref=${referralCode}`
    : 'https://volia.fr/parrainage';

  if (score >= 9) {
    // PROMOTER
    return {
      subject: `Merci ${name} ! 🎉 (et une petite faveur)`,
      html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">${score}/10 — merci ${name} !</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ça fait vraiment plaisir. Si tu kiffes Volia à ce point-là, voici comment tu peux m'aider en retour (et te faire plaisir au passage) :
  </p>
  <div style="margin:24px 0;padding:20px;background:#ede9fe;border-left:4px solid #6366f1;border-radius:6px;">
    <p style="margin:0;font-size:14px;font-weight:600;color:#5b21b6;">🎁 Parrainage Volia</p>
    <p style="margin:8px 0 12px;font-size:13px;color:#6b21a8;">
      Pour chaque ami qui s'inscrit avec ton lien et passe payant : <strong>3 mois offerts pour vous 2</strong>.
    </p>
    <a href="${referralUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Mon lien de parrainage</a>
  </div>
  <p style="font-size:14px;line-height:1.6;">
    Tu peux aussi laisser une étoile Trustpilot — 30 secondes mais ça change tout pour les autres founders qui hésitent.
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:16px 0;">
    <a href="https://fr.trustpilot.com/evaluate/volia.fr" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:white;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">⭐ Laisser un avis</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Volia</p>
</body></html>`,
      text: `${score}/10 — merci ${name} !

Si tu kiffes Volia, 2 façons de m'aider :

🎁 Parrainage : 3 mois offerts pour vous 2 → ${referralUrl}
⭐ Trustpilot : https://fr.trustpilot.com/evaluate/volia.fr

Anthony — Volia`,
    };
  } else if (score >= 7) {
    // PASSIVE
    return {
      subject: `${score}/10 — merci ${name}, c'est précieux`,
      html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">${score}/10 — merci ${name}</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ravi que Volia fonctionne pour toi. Une question : qu'est-ce qui te ferait passer à 9 ou 10 ?
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Réponds-moi en 1 ligne, ça m'aide vraiment à savoir où prioriser.
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Volia</p>
</body></html>`,
      text: `${score}/10 — merci ${name}. Qu'est-ce qui te ferait passer à 9 ou 10 ? Réponds en 1 ligne. Anthony — Volia`,
    };
  } else {
    // DETRACTOR
    return {
      subject: `${score}/10 — merci ${name}, on peut en parler ?`,
      html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">${score}/10 — ${name}, j'aimerais comprendre</h1>
  <p style="font-size:14px;line-height:1.6;">
    Pas vexant : ce score est précieux pour moi. Si Volia te déçoit, je veux savoir précisément ce qui ne va pas.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    On peut prendre 15 minutes ensemble cette semaine ? Je vois ce qu'on peut faire — et si rien n'est faisable, au moins j'aurai compris.
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://cal.com/anthony-volia/15min" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">15 min ensemble</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Ou réponds-moi simplement en 2 lignes : qu'est-ce qui te déçoit le plus ?
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
      text: `${score}/10 — ${name}, on peut en parler ?

Pas vexant, ton score est précieux. 15 min ensemble cette semaine ? https://cal.com/anthony-volia/15min

Ou réponds-moi en 2 lignes : qu'est-ce qui te déçoit le plus ?

Anthony — Volia`,
    };
  }
}

export async function runNpsAuto() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('nps_auto_send', { perDay: 50 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();

  // Users dont l'account a 28-32 jours (window de tolérance) + pas encore NPS
  const upperBound = new Date(Date.now() - 28 * 86400 * 1000).toISOString();
  const lowerBound = new Date(Date.now() - 32 * 86400 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from('user_profiles')
    .select('id, created_at')
    .gte('created_at', lowerBound)
    .lt('created_at', upperBound)
    .is('nps_sent_at', null)
    .is('churned_at', null)
    .limit(MAX_PER_RUN);

  if (!candidates || candidates.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { sent: [], skipped: [], errors: [] };

  for (const user of candidates) {
    const { email, firstName } = await getUserContact(supabase, user.id);
    if (!email) {
      results.skipped.push({ user_id: user.id, reason: 'no_email' });
      continue;
    }
    const tpl = buildNpsEmail({ firstName, userId: user.id });
    try {
      await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      await supabase
        .from('user_profiles')
        .update({ nps_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      results.sent.push({ user_id: user.id, email });
      await logAutonomousAction({
        actionType: 'nps_auto_send',
        source: 'cron/nps-auto',
        riskLevel: 'low',
        payload: { user_id: user.id, email },
        preview: `📊 NPS J+30 → ${email}`,
        rationale: 'Mesure satisfaction + détecte detractors avant churn',
        autoExecute: true,
      });
    } catch (err) {
      results.errors.push({ user_id: user.id, error: err.message });
    }
  }

  return { ok: true, ...results, startedAt };
}

/**
 * Appelée depuis /api/nps/respond après vérif du token.
 * Stocke score + envoie follow-up branché selon le score.
 */
export async function recordNpsResponse({ userId, score }) {
  const supabase = getSupabaseAdmin();

  // Idempotent : si déjà répondu, skip
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nps_responded_at, referral_code')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) return { ok: false, error: 'user_not_found' };
  if (profile.nps_responded_at) {
    return { ok: true, already_responded: true, recorded_score: score };
  }

  await supabase
    .from('user_profiles')
    .update({
      nps_score: score,
      nps_responded_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Envoie follow-up branché
  const { email, firstName } = await getUserContact(supabase, userId);
  if (email) {
    const followup = buildFollowupEmail({
      firstName,
      score,
      referralCode: profile.referral_code,
    });
    try {
      await sendEmail({
        to: email,
        subject: followup.subject,
        html: followup.html,
        text: followup.text,
      });
      await supabase
        .from('user_profiles')
        .update({ nps_followup_sent_at: new Date().toISOString() })
        .eq('id', userId);

      await logAutonomousAction({
        actionType: 'nps_followup_send',
        source: 'api/nps/respond',
        riskLevel: 'low',
        payload: { user_id: userId, email, score },
        preview: `📊 NPS ${score}/10 + followup → ${email}`,
        rationale: `Branching : ${score >= 9 ? 'promoter push referral' : score >= 7 ? 'passive push improvement' : 'detractor call urgent'}`,
        autoExecute: true,
      });
    } catch (err) {
      console.error('[nps-auto] followup send failed', err);
    }
  }

  return { ok: true, recorded_score: score };
}
