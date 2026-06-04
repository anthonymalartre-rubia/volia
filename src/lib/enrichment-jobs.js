// ─────────────────────────────────────────────────────────────────────
// src/lib/enrichment-jobs.js — Enrichissement en arrière-plan (serveur)
// ─────────────────────────────────────────────────────────────────────
// Une "file" enrichment_jobs traitée par le cron /api/cron/process-enrichment.
// L'utilisateur lance un job → ferme l'onglet → le cron enrichit par lots,
// sauvegarde chaque prospect au fil de l'eau (idempotent : re-requête
// email IS NULL → jamais de doublon), respecte le quota mensuel, et envoie
// un email à la fin. Reprise auto après crash (le cron reprend au tick suivant).
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { enrichEmail } from '@/lib/enrich-core';
import { validateUrl } from '@/lib/url-validation';
import { sendEmail } from '@/lib/email';

const BATCH_SIZE = 40;       // prospects récupérés par lot
const CONCURRENCY = 8;       // enrichissements en parallèle dans un lot
const TIME_BUDGET_MS = 240000; // 4 min (maxDuration cron = 300s)

// ── Sélecteur des prospects à enrichir (a un site, pas d'email, non archivé) ──
function pendingQuery(supabase, userId, scope) {
  let q = supabase
    .from('prospects')
    .select('id, site_web', { count: 'exact' })
    .eq('user_id', userId)
    .not('site_web', 'is', null)
    .neq('site_web', '')
    .is('archived_at', null)
    .or('email.is.null,email.eq.');
  if (scope?.folder_id) q = q.eq('folder_id', scope.folder_id);
  if (scope?.departement) q = q.eq('departement', scope.departement);
  return q;
}

export async function countPending(supabase, userId, scope) {
  const { count } = await pendingQuery(supabase, userId, scope).limit(1);
  return count || 0;
}

export async function getActiveJob(supabase, userId) {
  const { data } = await supabase
    .from('enrichment_jobs')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['queued', 'running', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

export async function getLatestJob(supabase, userId) {
  const { data } = await supabase
    .from('enrichment_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

// ── Pool de concurrence ──
async function processWithConcurrency(items, worker, concurrency) {
  let idx = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      await worker(items[i]);
    }
  });
  await Promise.all(runners);
}

async function getUserEmail(supabase, userId) {
  try {
    const { data } = await supabase.auth.admin.getUserById(userId);
    return data?.user?.email || null;
  } catch {
    return null;
  }
}

function completionEmail({ job, total, found }) {
  const subject = `✅ Enrichissement terminé — ${found} emails trouvés`;
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#374151;">
    <h1 style="font-size:20px;color:#111827;">Ton enrichissement est terminé 🎉</h1>
    <p style="font-size:14px;line-height:1.6;">Volia a fini d'enrichir ta base en arrière-plan.</p>
    <div style="margin:20px 0;padding:16px;background:#ede9fe;border-radius:10px;">
      <table style="width:100%;font-size:14px;">
        <tr><td>Prospects traités</td><td style="text-align:right;font-weight:bold;color:#5b21b6;">${job.processed}</td></tr>
        <tr><td>Emails trouvés</td><td style="text-align:right;font-weight:bold;color:#5b21b6;">${found}</td></tr>
      </table>
    </div>
    <p style="font-size:14px;"><a href="https://volia.fr/dashboard" style="display:inline-block;padding:11px 22px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Voir mes prospects</a></p>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;">Tu peux relancer un enrichissement à tout moment depuis ton dashboard.</p>
  </body></html>`;
  const text = `Enrichissement terminé. ${job.processed} prospects traités, ${found} emails trouvés. → https://volia.fr/dashboard`;
  return { subject, html, text };
}

// ── Traitement d'UN job jusqu'au budget temps ou épuisement ──
async function processJob(supabase, job, deadline) {
  // Préférence filtrage emails perso
  const { data: prof } = await supabase
    .from('user_profiles')
    .select('filter_personal_emails')
    .eq('id', job.user_id)
    .maybeSingle();
  const filterPersonal = prof?.filter_personal_emails !== false;

  let processed = job.processed || 0;
  let found = job.found || 0;

  // marque running
  await supabase.from('enrichment_jobs')
    .update({ status: 'running', started_at: job.started_at || new Date().toISOString(), last_tick_at: new Date().toISOString(), paused_reason: null, updated_at: new Date().toISOString() })
    .eq('id', job.id);

  while (Date.now() < deadline) {
    // Re-check annulation
    const { data: fresh } = await supabase.from('enrichment_jobs').select('status').eq('id', job.id).maybeSingle();
    if (!fresh || fresh.status === 'canceled') return { processed, found, ended: 'canceled' };

    // Quota
    const lim = await checkLimit(supabase, job.user_id, 'enrichments');
    if (!lim.allowed) {
      await supabase.from('enrichment_jobs')
        .update({ status: 'paused', paused_reason: 'quota', processed, found, last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id);
      return { processed, found, ended: 'quota' };
    }
    const cap = lim.remaining === -1 ? BATCH_SIZE : Math.min(BATCH_SIZE, lim.remaining);
    if (cap <= 0) {
      await supabase.from('enrichment_jobs')
        .update({ status: 'paused', paused_reason: 'quota', processed, found, last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id);
      return { processed, found, ended: 'quota' };
    }

    // Prochain lot
    const { data: batch } = await pendingQuery(supabase, job.user_id, job.scope).limit(cap);
    if (!batch || batch.length === 0) {
      await supabase.from('enrichment_jobs')
        .update({ status: 'done', processed, found, finished_at: new Date().toISOString(), last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id);
      // Email de fin
      const to = await getUserEmail(supabase, job.user_id);
      if (to) {
        try {
          const tpl = completionEmail({ job: { ...job, processed }, total: job.total, found });
          await sendEmail({ to, subject: tpl.subject, html: tpl.html, text: tpl.text });
        } catch { /* email best-effort */ }
      }
      return { processed, found, ended: 'done' };
    }

    let batchAttempted = 0;
    await processWithConcurrency(batch, async (p) => {
      batchAttempted++;
      const v = validateUrl(p.site_web);
      if (!v.valid) return;
      try {
        const res = await enrichEmail(v.url, filterPersonal);
        if (res.email) {
          await supabase.from('prospects')
            .update({ email: res.email, email_method: res.method })
            .eq('id', p.id);
          found++;
        }
      } catch { /* item-level error → on continue */ }
    }, CONCURRENCY);

    processed += batchAttempted;
    // Comptabilise l'usage (1 enrichissement = 1 tentative, comme /api/enrich)
    try { await incrementUsage(supabase, job.user_id, 'enrichments', batchAttempted); } catch { /* non bloquant */ }

    await supabase.from('enrichment_jobs')
      .update({ processed, found, last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', job.id);
  }

  return { processed, found, ended: 'budget' };
}

// ── Entrée du cron : traite les jobs actifs dans le budget temps global ──
export async function runEnrichmentBatch() {
  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();
  const deadline = Date.now() + TIME_BUDGET_MS;

  // NB : PAS de .order('last_tick_at', { nullsFirst: true }) ici — sur cette
  // version de supabase-js, combiné au filtre .in(), il renvoie 0 ligne quand
  // la colonne est entièrement NULL (jobs jamais tickés) → jobs bloqués en file.
  // On trie en JS à la place (jamais-tické d'abord, puis last_tick le + ancien).
  const { data: jobs, error: selectErr } = await supabase
    .from('enrichment_jobs')
    .select('*')
    .in('status', ['queued', 'running'])
    .limit(10);

  if (selectErr) {
    console.error('[enrichment] select active jobs FAILED:', selectErr.message || selectErr);
    return { ok: false, error: `select failed: ${selectErr.message || selectErr}`, startedAt };
  }

  if (!jobs || jobs.length === 0) {
    return { ok: true, processedJobs: 0, startedAt };
  }

  // Tri équitable : les jobs jamais tickés (last_tick_at null) en premier,
  // puis du tick le plus ancien au plus récent.
  jobs.sort((a, b) => {
    const ta = a.last_tick_at ? new Date(a.last_tick_at).getTime() : 0;
    const tb = b.last_tick_at ? new Date(b.last_tick_at).getTime() : 0;
    return ta - tb;
  });

  const results = [];
  for (const job of jobs) {
    if (Date.now() >= deadline) break;
    try {
      const r = await processJob(supabase, job, deadline);
      results.push({ jobId: job.id, ...r });
    } catch (err) {
      await supabase.from('enrichment_jobs')
        .update({ status: 'error', error: String(err?.message || err).slice(0, 500), updated_at: new Date().toISOString() })
        .eq('id', job.id);
      results.push({ jobId: job.id, ended: 'error', error: String(err?.message || err) });
    }
  }

  return { ok: true, processedJobs: results.length, results, startedAt };
}
