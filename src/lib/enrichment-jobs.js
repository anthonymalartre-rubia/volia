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
import { enrichWaterfall } from '@/lib/enrich-waterfall-core';
import { lookupGlobalContact, upsertGlobalContact, normalizeDomain } from '@/lib/global-contacts';
import { validateUrl } from '@/lib/url-validation';
import { sendEmail } from '@/lib/email';

const BATCH_SIZE = 12;       // prospects par lot (petit → progression sauvée souvent)
const CONCURRENCY = 8;       // enrichissements en parallèle dans un lot
const TIME_BUDGET_MS = 220000; // ~3min40 (marge sous maxDuration cron = 300s)
const PER_SITE_TIMEOUT_MS = 35000; // garde-temps DUR par site (waterfall = scrape multi-pages + Serper)
const DB_TIMEOUT_MS = 15000; // garde-temps DUR par requête DB (évite qu'une requête lente gèle le job)

// Borne une requête/thenable Supabase : rejette avec timeout:<label> si trop long.
function withTimeout(thenable, label, ms = DB_TIMEOUT_MS) {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout:${label}`)), ms)),
  ]);
}

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
// Chaque requête DB est bornée par withTimeout : si l'une dépasse, processJob
// throw `timeout:<étape>` → runEnrichmentBatch met le job en 'error' avec ce
// libellé (visible en base) au lieu de geler indéfiniment.
async function processJob(supabase, job) {
  const deadline = Date.now() + TIME_BUDGET_MS; // budget recalculé PAR job

  let processed = job.processed || 0;
  let found = job.found || 0;
  let writeFails = 0;       // écritures d'email échouées (diagnostic)
  let lastWriteErr = null;  // dernier message d'erreur d'écriture
  let cacheHits = 0;        // emails servis par la base commune (0 Serper)

  // Base commune (couche 0) : on n'alimente le pool que si l'enrichisseur est
  // admin (Volia) en Phase 1 — cf. lib/global-contacts. 1 seule lecture/job.
  let isAdmin = false;
  try {
    const { data: prof } = await withTimeout(
      supabase.from('user_profiles').select('is_admin').eq('id', job.user_id).maybeSingle(),
      'fetch-admin');
    isAdmin = !!prof?.is_admin;
  } catch { /* défaut non-admin */ }

  // marque running
  await withTimeout(
    supabase.from('enrichment_jobs')
      .update({ status: 'running', started_at: job.started_at || new Date().toISOString(), last_tick_at: new Date().toISOString(), paused_reason: null, error: null, updated_at: new Date().toISOString() })
      .eq('id', job.id),
    'mark-running');

  while (Date.now() < deadline) {
    // Re-check annulation
    const { data: fresh } = await withTimeout(
      supabase.from('enrichment_jobs').select('status').eq('id', job.id).maybeSingle(), 'recheck-status');
    if (!fresh || fresh.status === 'canceled') return { processed, found, ended: 'canceled' };

    // Quota
    const lim = await withTimeout(checkLimit(supabase, job.user_id, 'enrichments'), 'checkLimit');
    if (!lim.allowed || (lim.remaining !== -1 && lim.remaining <= 0)) {
      await withTimeout(supabase.from('enrichment_jobs')
        .update({ status: 'paused', paused_reason: 'quota', processed, found, last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id), 'pause-quota');
      return { processed, found, ended: 'quota' };
    }
    const cap = lim.remaining === -1 ? BATCH_SIZE : Math.min(BATCH_SIZE, lim.remaining);

    // Prochain lot (requête directe SANS count:'exact' → plus léger).
    // `nom` est nécessaire pour la requête Serper du waterfall.
    let bq = supabase.from('prospects').select('id, site_web, nom, place_id, telephone, type, departement').eq('user_id', job.user_id).not('site_web', 'is', null).or('email.is.null,email.eq.');
    if (job.scope?.folder_id) bq = bq.eq('folder_id', job.scope.folder_id);
    if (job.scope?.departement) bq = bq.eq('departement', job.scope.departement);
    const { data: batch } = await withTimeout(bq.limit(cap), 'batch-query');

    if (!batch || batch.length === 0) {
      await withTimeout(supabase.from('enrichment_jobs')
        .update({ status: 'done', processed, found, finished_at: new Date().toISOString(), last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id), 'mark-done');
      const to = await getUserEmail(supabase, job.user_id);
      if (to) {
        try {
          const tpl = completionEmail({ job: { ...job, processed }, total: job.total, found });
          await sendEmail({ to, subject: tpl.subject, html: tpl.html, text: tpl.text });
        } catch { /* email best-effort */ }
      }
      return { processed, found, ended: 'done' };
    }

    // Phase 1 — SCRAPING concurrent (rapide), aucune écriture DB ici.
    let batchAttempted = 0;
    const toWrite = [];
    await processWithConcurrency(batch, async (p) => {
      batchAttempted++;
      const v = validateUrl(p.site_web);
      if (!v.valid) return;
      const domain = normalizeDomain(p.site_web);
      try {
        // ── COUCHE 0 : base commune Volia (0 crédit Serper si hit) ──
        const cached = await lookupGlobalContact({ domain, placeId: p.place_id });
        if (cached?.email) {
          toWrite.push({ id: p.id, email: cached.email, method: 'volia_db', fromCache: true });
          return; // pas de scrape/Serper
        }
        // ── Sinon : cascade waterfall scrape → Serper (Google). Aucun guess. ──
        const res = await Promise.race([
          enrichWaterfall(p.nom, v.url),
          new Promise((resolve) => setTimeout(() => resolve({ email: null, timedOut: true }), PER_SITE_TIMEOUT_MS)),
        ]);
        if (res && res.email) {
          toWrite.push({
            id: p.id, email: res.email, method: res.method, fromCache: false,
            domain, placeId: p.place_id, companyName: p.nom,
            phone: p.telephone, sector: p.type, departement: p.departement,
          });
        }
      } catch { /* item-level error → on continue */ }
    }, CONCURRENCY);

    // Phase 2 — ÉCRITURES SÉQUENTIELLES (zéro contention → fiables).
    for (const w of toWrite) {
      try {
        const { data: upd, error: wErr } = await withTimeout(
          supabase.from('prospects').update({ email: w.email, email_method: w.method }).eq('id', w.id).select('id'),
          'save-prospect');
        if (wErr) { writeFails++; lastWriteErr = `err:${wErr.message || wErr}`; }
        else if (!upd || upd.length === 0) { writeFails++; lastWriteErr = `0rows id=${String(w.id).slice(0, 8)}`; }
        else {
          found++; // found ne compte QUE les emails réellement persistés (ligne affectée)
          if (w.fromCache) {
            cacheHits++; // servi par la base commune → 0 crédit Serper
          } else {
            // Alimente la base commune (best-effort). En Phase 1 (volia_only),
            // n'écrit réellement que si l'enrichisseur est admin (Volia).
            await upsertGlobalContact({
              domain: w.domain, placeId: w.placeId, companyName: w.companyName,
              email: w.email, emailMethod: w.method, phone: w.phone,
              sector: w.sector, departement: w.departement, isAdmin,
            });
          }
        }
      } catch (e) { writeFails++; lastWriteErr = e?.message || String(e); }
    }

    processed += batchAttempted;
    try { await withTimeout(incrementUsage(supabase, job.user_id, 'enrichments', batchAttempted), 'incrementUsage'); } catch { /* non bloquant */ }

    await withTimeout(
      supabase.from('enrichment_jobs')
        .update({ processed, found, error: lastWriteErr ? `writeFail x${writeFails}: ${lastWriteErr}`.slice(0, 200) : null, last_tick_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', job.id),
      'save-progress');
    console.log(`[enrichment] tick job=${String(job.id).slice(0, 8)} processed=${processed} found=${found} cacheHits=${cacheHits} (servis par la base commune, 0 Serper)`);
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
      const r = await processJob(supabase, job);
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
