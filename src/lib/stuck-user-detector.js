// ─────────────────────────────────────────────────────────────────────
// src/lib/stuck-user-detector.js — Wave 1.1 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Cron daily 18h CET. Trouve les users qui ont signup il y a 48h+ mais
// n'ont fait AUCUN search → email "Besoin d'aide pour ta première liste ?"
// avec Cal.com link.
//
// Cible : sauve les trials morts-nés (30 % des signups habituellement).
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 50;
const STUCK_AFTER_HOURS = 48;
const STUCK_WINDOW_DAYS = 14; // ne cible plus quelqu'un signup il y a plus de 14j

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name
    || authUser?.user?.user_metadata?.full_name?.split(' ')[0]
    || (email ? email.split('@')[0] : null);
  return { email, firstName };
}

function buildEmail({ firstName }) {
  const name = firstName || 'toi';
  return {
    subject: `${name}, besoin d'aide pour ta 1ère liste Volia ?`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Tu as créé ton compte Volia il y a 2 jours mais tu n'as pas encore
    lancé ta première recherche. Tout va bien ?
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Les 3 trucs qui bloquent les utilisateurs en général :
  </p>
  <ol style="font-size:14px;line-height:1.7;color:#374151;">
    <li>Ils ne savent pas quelle catégorie cibler en premier</li>
    <li>Ils hésitent entre Prospection ou Campagnes pour démarrer</li>
    <li>Ils veulent voir un exemple concret avant de scraper</li>
  </ol>
  <p style="font-size:14px;line-height:1.6;">
    Si c'est un de ces blocages, on peut débloquer en 15 minutes :
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://cal.com/anthony-volia/15min" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Réserver 15 min</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Sinon, juste réponds à ce mail avec ton blocage, je débloque en 1 réponse.
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Tu as créé ton compte Volia il y a 2 jours mais tu n'as pas lancé ta 1ère recherche. Tout va bien ?

Les 3 trucs qui bloquent en général :
1. Quelle catégorie cibler en premier ?
2. Prospection ou Campagnes pour démarrer ?
3. Voir un exemple concret avant de scraper

Si c'est un de ces blocages, on débloque en 15 min :
→ https://cal.com/anthony-volia/15min

Sinon, réponds juste à ce mail avec ton blocage.

Anthony — Fondateur Volia`,
  };
}

export async function runStuckUserDetector() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('stuck_user_help_email', { perDay: 100 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const stuckCutoff = new Date(Date.now() - STUCK_AFTER_HOURS * 3600 * 1000).toISOString();
  const windowCutoff = new Date(Date.now() - STUCK_WINDOW_DAYS * 86400 * 1000).toISOString();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Find users : créés entre windowCutoff et stuckCutoff, jamais notifés
  const { data: candidates } = await supabase
    .from('user_profiles')
    .select('id, created_at, plan')
    .gte('created_at', windowCutoff)
    .lt('created_at', stuckCutoff)
    .is('stuck_user_help_email_sent_at', null)
    .is('churned_at', null)
    .limit(MAX_PER_RUN);

  if (!candidates || candidates.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { sent: [], skipped: [], errors: [] };

  for (const user of candidates) {
    // Check : 0 search ce mois ?
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('searches, enrichments')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .maybeSingle();

    const totalActivity = (usage?.searches || 0) + (usage?.enrichments || 0);
    if (totalActivity > 0) {
      // Pas stuck, marker pour ne plus checker
      await supabase
        .from('user_profiles')
        .update({ stuck_user_help_email_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      results.skipped.push({ user_id: user.id, reason: 'not_stuck' });
      continue;
    }

    const { email, firstName } = await getUserContact(supabase, user.id);
    if (!email) {
      results.skipped.push({ user_id: user.id, reason: 'no_email' });
      continue;
    }

    const tpl = buildEmail({ firstName });
    try {
      await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      await supabase
        .from('user_profiles')
        .update({ stuck_user_help_email_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      results.sent.push({ user_id: user.id, email });
      await logAutonomousAction({
        actionType: 'stuck_user_help_email',
        source: 'cron/stuck-user-detection',
        riskLevel: 'low',
        payload: { user_id: user.id, email, hours_since_signup: STUCK_AFTER_HOURS },
        preview: `🆘 Stuck user → ${email}`,
        rationale: 'Signup >48h, 0 activité — relance avec Cal.com',
        autoExecute: true,
      });
    } catch (err) {
      results.errors.push({ user_id: user.id, email, error: err.message });
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
