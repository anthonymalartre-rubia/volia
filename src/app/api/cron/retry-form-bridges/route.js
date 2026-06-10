// ─────────────────────────────────────────────────────────────────────
// Cron Vercel : retry worker pour les bridges form_responses échoués.
// Sprint F6.
// ─────────────────────────────────────────────────────────────────────
//
// Stratégie :
//   - Tourne toutes les 10 min (vercel.json)
//   - Récupère max BATCH_SIZE form_responses en bridge_status='failed' dont
//     le bridge_retry_count < 3 et dont bridge_next_retry_at est passé
//   - Pour chacune : re-fetch le form parent (état à jour des bridges
//     CRM/Campagnes), parse l'erreur précédente pour savoir quel bridge
//     re-tenter (succès partiel possible), re-exécute les bridges manquants.
//   - Si tout réussit → status='succeeded'
//   - Sinon → retry_count++, next_retry_at = NOW() + 10 * 2^retry_count min
//     (exponential backoff : 20min → 40min → 80min)
//   - À retry_count=3 → status reste 'failed', next_retry_at=NULL (abandon).
//     Email best-effort au form owner (throttlé à 1/jour/form via
//     forms.last_bridge_failure_notified_at).
//
// Auth : Bearer CRON_SECRET.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';
import { reportError } from '@/lib/errorReporting';
import { emitWebhookEvent } from '@/lib/webhooks/emitter';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MIN = 10; // 10 * 2^count : 20, 40, 80 min

export async function GET(request) {
  try {
    return await handleCron(request);
  } catch (err) {
    reportError(err, { cron: 'retry-form-bridges' });
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}

// ─── Helpers bridges (dupliqués de submit/route.js pour ne pas dépendre
//     d'un import circulaire — ces fonctions sont des extraits idempotents).

async function bridgeCrm({ supabaseAdmin, ownerId, form, responseId, contactInfo }) {
  if (!form.crm_auto_create_contact) return { skipped: true };
  if (!contactInfo.email && !contactInfo.phone) {
    return { skipped: true, reason: 'no_email_or_phone' };
  }

  const { data: existingByRef } = await supabaseAdmin
    .from('crm_contacts')
    .select('id')
    .eq('user_id', ownerId)
    .eq('source_ref_id', responseId)
    .maybeSingle();

  if (existingByRef) {
    return { success: true, contactId: existingByRef.id, deduped: true };
  }

  let existingContact = null;
  if (contactInfo.email) {
    const { data } = await supabaseAdmin
      .from('crm_contacts')
      .select('id, name, tags')
      .eq('user_id', ownerId)
      .ilike('email', contactInfo.email)
      .limit(1)
      .maybeSingle();
    existingContact = data;
  }

  let contactId;
  if (existingContact) {
    contactId = existingContact.id;
  } else {
    const insertRow = {
      user_id: ownerId,
      name: contactInfo.name || contactInfo.email || contactInfo.phone || 'Contact form',
      email: contactInfo.email,
      phone: contactInfo.phone,
      company: contactInfo.company,
      source: 'form_volia',
      source_ref_id: responseId,
      tags: ['form'],
    };
    const { data: inserted, error } = await supabaseAdmin
      .from('crm_contacts')
      .insert(insertRow)
      .select('id')
      .single();
    if (error || !inserted) {
      throw new Error(`crm_insert: ${error?.message || 'unknown'}`);
    }
    contactId = inserted.id;
  }

  try {
    await supabaseAdmin.from('crm_activities').insert({
      user_id: ownerId,
      contact_id: contactId,
      type: 'note',
      content: `Soumis via formulaire « ${form.name} » (retry)`,
      completed_at: new Date().toISOString(),
      metadata: {
        source: 'form_volia',
        form_id: form.id,
        form_slug: form.slug,
        form_response_id: responseId,
        retry: true,
      },
    });
  } catch (e) {
    console.warn('[retry-form-bridges] crm activity insert failed', e.message);
  }

  return { success: true, contactId };
}

async function bridgeCampagnes({ supabaseAdmin, ownerId, form, contactInfo }) {
  if (!form.campagnes_list_id) return { skipped: true };
  if (!contactInfo.email && !contactInfo.phone) {
    return { skipped: true, reason: 'no_email_or_phone' };
  }

  if (contactInfo.email) {
    const { data: existing } = await supabaseAdmin
      .from('prospect_contacts')
      .select('id')
      .eq('list_id', form.campagnes_list_id)
      .ilike('email', contactInfo.email)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return { success: true, contactId: existing.id, deduped: true };
    }
  }

  const insertRow = {
    list_id: form.campagnes_list_id,
    email: contactInfo.email,
    phone: contactInfo.phone,
    first_name: contactInfo.firstName,
    last_name: contactInfo.lastName,
    company: contactInfo.company,
    custom_fields: {
      source: 'form_volia',
      form_id: form.id,
      form_slug: form.slug,
      retry: true,
    },
  };
  const { data: inserted, error } = await supabaseAdmin
    .from('prospect_contacts')
    .insert(insertRow)
    .select('id')
    .single();
  if (error || !inserted) {
    throw new Error(`campagnes_insert: ${error?.message || 'unknown'}`);
  }

  try {
    await supabaseAdmin.rpc('increment_list_contacts_count', {
      p_list_id: form.campagnes_list_id,
    });
  } catch {}

  return { success: true, contactId: inserted.id };
}

// ─── extractContactInfo (extrait de submit/route.js) ─────────────────

function normalizeEmail(v) {
  if (!v) return null;
  return String(v).trim().toLowerCase();
}

function extractContactInfo(answers, schemaFields) {
  const lookup = (keys) => {
    for (const k of keys) {
      if (answers[k] != null && answers[k] !== '') return answers[k];
    }
    return null;
  };

  let email = lookup(['email', 'mail', 'e_mail']);
  if (!email) {
    const emailField = (schemaFields || []).find((f) => (f.type || f.field_type) === 'email');
    if (emailField) email = answers[emailField.key || emailField.field_key];
  }
  let phone = lookup(['phone', 'tel', 'telephone', 'mobile']);
  if (!phone) {
    const telField = (schemaFields || []).find((f) => (f.type || f.field_type) === 'tel');
    if (telField) phone = answers[telField.key || telField.field_key];
  }
  const name = lookup(['nom', 'name', 'full_name', 'fullname', 'prenom_nom']);
  const firstName = lookup(['prenom', 'first_name', 'firstname']);
  const lastName = lookup(['lastname', 'last_name']);
  const company = lookup(['company', 'societe', 'entreprise', 'organisation']);

  const composedName =
    name ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    null;

  return {
    email: normalizeEmail(email),
    phone: phone ? String(phone).trim() : null,
    name: composedName,
    firstName: firstName ? String(firstName).trim() : null,
    lastName: lastName ? String(lastName).trim() : null,
    company: company ? String(company).trim() : null,
  };
}

// ─── Parse de bridge_error JSON ──────────────────────────────────────
// Format attendu : `{"crm":"ok"|"skipped"|"error: ...","campagnes":"ok"|...}`
function parseBridgeError(bridgeError) {
  if (!bridgeError) return { crm: null, campagnes: null };
  try {
    const parsed = typeof bridgeError === 'string' ? JSON.parse(bridgeError) : bridgeError;
    return {
      crm: parsed.crm ?? null,
      campagnes: parsed.campagnes ?? null,
    };
  } catch {
    return { crm: 'error: unknown', campagnes: 'error: unknown' };
  }
}

function isOk(status) {
  return status === 'ok' || status === 'skipped' || status === null;
}

// ─── Notification email après abandon (throttlé 1/jour/form) ─────────

async function notifyOwnerOfAbandon({ supabaseAdmin, form, abandonedResponseIds }) {
  // Throttle : si déjà notifié dans les dernières 24h, skip.
  const last = form.last_bridge_failure_notified_at
    ? new Date(form.last_bridge_failure_notified_at).getTime()
    : 0;
  if (Date.now() - last < 24 * 60 * 60 * 1000) {
    return { skipped: true, reason: 'throttled' };
  }

  let ownerEmail = null;
  try {
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(form.user_id);
    ownerEmail = user?.email || null;
  } catch (e) {
    console.warn('[retry-form-bridges] getUserById failed', e.message);
  }
  if (!ownerEmail) return { skipped: true, reason: 'no_owner_email' };

  const baseUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || 'https://volia.fr';
  const url = `${baseUrl}/app/formulaires/${form.id}/responses?bridge_status=failed`;
  const n = abandonedResponseIds.length;

  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;color:#222;">
      <h2 style="color:#db2777;">Bridge formulaire en échec</h2>
      <p>Le formulaire <strong>« ${form.name} »</strong> a ${n} soumission${n > 1 ? 's' : ''} qui n'${n > 1 ? 'ont' : 'a'} pas pu être enregistrée${n > 1 ? 's' : ''} dans votre CRM ou votre liste de campagnes après 3 tentatives automatiques.</p>
      <p style="color:#666;font-size:14px;">Causes possibles : liste de campagnes supprimée, configuration CRM modifiée, ou contrainte d'unicité (email déjà existant avec un autre user_id).</p>
      <p style="margin-top:24px;">
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#db2777;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Voir les soumissions concernées
        </a>
      </p>
      <p style="margin-top:24px;color:#999;font-size:11px;">
        Les soumissions sont conservées dans Volia, vous pouvez les exporter manuellement. — <a href="https://volia.fr" style="color:#db2777;">Volia</a>
      </p>
    </div>`;

  try {
    await sendEmail({
      to: ownerEmail,
      subject: `Formulaire ${form.name} : ${n} soumission${n > 1 ? 's' : ''} non enregistrée${n > 1 ? 's' : ''} dans votre CRM`,
      html,
    });
  } catch (e) {
    console.warn('[retry-form-bridges] notify email failed', e.message);
    return { success: false, error: e.message };
  }

  await supabaseAdmin
    .from('forms')
    .update({ last_bridge_failure_notified_at: new Date().toISOString() })
    .eq('id', form.id);

  return { success: true };
}

// ─── Handler principal ──────────────────────────────────────────────

async function handleCron(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // 1) Récupère batch de responses à re-tenter.
  const nowIso = new Date().toISOString();
  const { data: responses, error: fetchError } = await supabase
    .from('form_responses')
    .select('id, form_id, user_id, answers, bridge_error, bridge_retry_count, crm_contact_id, campagnes_contact_id')
    .eq('bridge_status', 'failed')
    .lt('bridge_retry_count', MAX_RETRIES)
    .or(`bridge_next_retry_at.is.null,bridge_next_retry_at.lte.${nowIso}`)
    .order('bridge_next_retry_at', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('[retry-form-bridges] fetch responses error', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!responses || responses.length === 0) {
    return NextResponse.json({
      processed: 0,
      retried_succeeded: 0,
      retried_failed: 0,
      abandoned: 0,
      notified: 0,
    });
  }

  // 2) Pour limiter les SELECT, on cache les forms parents.
  const formCache = new Map();
  const fetchForm = async (formId) => {
    if (formCache.has(formId)) return formCache.get(formId);
    const { data } = await supabase
      .from('forms')
      .select('id, slug, name, user_id, schema, crm_auto_create_contact, campagnes_list_id, last_bridge_failure_notified_at')
      .eq('id', formId)
      .maybeSingle();
    formCache.set(formId, data || null);
    return data || null;
  };

  // Compteurs + buckets pour grouper notifications par form.
  let retriedSucceeded = 0;
  let retriedFailed = 0;
  let abandoned = 0;
  let notified = 0;
  const abandonedByForm = new Map(); // form_id → [response_id]

  for (const resp of responses) {
    const form = await fetchForm(resp.form_id);
    if (!form) {
      // Form supprimé : on abandonne définitivement la response.
      await supabase
        .from('form_responses')
        .update({
          bridge_retry_count: MAX_RETRIES,
          bridge_next_retry_at: null,
          bridge_error: JSON.stringify({ crm: 'form_deleted', campagnes: 'form_deleted' }),
        })
        .eq('id', resp.id);
      abandoned++;
      continue;
    }

    // Détermine quels bridges sont à re-tenter à partir de l'erreur précédente.
    const prev = parseBridgeError(resp.bridge_error);

    // Si un contact_id existe déjà côté CRM/Campagnes, le bridge correspondant
    // est déjà OK historiquement → on ne le retente pas.
    const crmAlreadyOk = isOk(prev.crm) || !!resp.crm_contact_id;
    const campAlreadyOk = isOk(prev.campagnes) || !!resp.campagnes_contact_id;

    // Schema fields (pour l'extraction email/phone fallback)
    const schemaFields = Array.isArray(form.schema?.fields) ? form.schema.fields : [];
    const contactInfo = extractContactInfo(resp.answers || {}, schemaFields);

    const results = { crm: prev.crm ?? null, campagnes: prev.campagnes ?? null };
    let crmContactId = resp.crm_contact_id || null;
    let campagnesContactId = resp.campagnes_contact_id || null;
    let crmOk = crmAlreadyOk;
    let campOk = campAlreadyOk;

    // Re-tentative CRM
    if (form.crm_auto_create_contact && !crmAlreadyOk) {
      try {
        const r = await bridgeCrm({
          supabaseAdmin: supabase,
          ownerId: form.user_id,
          form,
          responseId: resp.id,
          contactInfo,
        });
        results.crm = r.skipped ? 'skipped' : 'ok';
        if (r.contactId) crmContactId = r.contactId;
        crmOk = true;
      } catch (e) {
        console.error('[retry-form-bridges] CRM retry failed', resp.id, e.message);
        results.crm = `error: ${e.message}`;
        crmOk = false;
      }
    } else if (!form.crm_auto_create_contact) {
      // Config désactivée entre-temps → on considère ce bridge comme skip réussi.
      results.crm = 'skipped';
      crmOk = true;
    }

    // Re-tentative Campagnes
    if (form.campagnes_list_id && !campAlreadyOk) {
      try {
        const r = await bridgeCampagnes({
          supabaseAdmin: supabase,
          ownerId: form.user_id,
          form,
          contactInfo,
        });
        results.campagnes = r.skipped ? 'skipped' : 'ok';
        if (r.contactId) campagnesContactId = r.contactId;
        campOk = true;
      } catch (e) {
        console.error('[retry-form-bridges] Campagnes retry failed', resp.id, e.message);
        results.campagnes = `error: ${e.message}`;
        campOk = false;
      }
    } else if (!form.campagnes_list_id) {
      results.campagnes = 'skipped';
      campOk = true;
    }

    if (crmOk && campOk) {
      // Succès → update status='succeeded', clear error/next_retry
      await supabase
        .from('form_responses')
        .update({
          bridge_status: 'succeeded',
          bridge_error: null,
          bridge_next_retry_at: null,
          crm_contact_id: crmContactId,
          campagnes_contact_id: campagnesContactId,
        })
        .eq('id', resp.id);
      retriedSucceeded++;

      // Webhook : bridge succeeded
      try {
        await emitWebhookEvent({
          userId: form.user_id,
          event: 'form.bridge_succeeded',
          data: {
            form_id: form.id,
            response_id: resp.id,
            crm_contact_id: crmContactId,
            campagnes_contact_id: campagnesContactId,
          },
        });
      } catch (e) {
        console.warn('[retry-form-bridges] webhook bridge_succeeded failed', e.message);
      }
    } else {
      // Échec → incrémente le compteur, calcule le prochain retry
      const newCount = (resp.bridge_retry_count || 0) + 1;
      let nextRetryAt = null;
      if (newCount < MAX_RETRIES) {
        const delayMin = BASE_BACKOFF_MIN * Math.pow(2, newCount);
        nextRetryAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();
        retriedFailed++;
      } else {
        // Abandon définitif
        abandoned++;
        const arr = abandonedByForm.get(form.id) || [];
        arr.push(resp.id);
        abandonedByForm.set(form.id, arr);
      }

      await supabase
        .from('form_responses')
        .update({
          bridge_status: 'failed',
          bridge_error: JSON.stringify(results),
          bridge_retry_count: newCount,
          bridge_next_retry_at: nextRetryAt,
          crm_contact_id: crmContactId,
          campagnes_contact_id: campagnesContactId,
        })
        .eq('id', resp.id);

      // Webhook : bridge_failed (uniquement à l'abandon final)
      if (newCount >= MAX_RETRIES) {
        try {
          await emitWebhookEvent({
            userId: form.user_id,
            event: 'form.bridge_failed',
            data: {
              form_id: form.id,
              response_id: resp.id,
              error: results,
              retry_count: newCount,
            },
          });
        } catch (e) {
          console.warn('[retry-form-bridges] webhook bridge_failed failed', e.message);
        }
      }
    }
  }

  // 3) Notifications email groupées par form (1 email max par form/jour)
  for (const [formId, responseIds] of abandonedByForm.entries()) {
    // Re-lecture du form pour avoir le last_bridge_failure_notified_at à jour
    // (peut avoir été modifié par un précédent run dans le même batch — rare).
    const { data: freshForm } = await supabase
      .from('forms')
      .select('id, name, user_id, last_bridge_failure_notified_at')
      .eq('id', formId)
      .maybeSingle();
    if (!freshForm) continue;

    const r = await notifyOwnerOfAbandon({
      supabaseAdmin: supabase,
      form: freshForm,
      abandonedResponseIds: responseIds,
    });
    if (r?.success) notified++;
  }

  return NextResponse.json({
    processed: responses.length,
    retried_succeeded: retriedSucceeded,
    retried_failed: retriedFailed,
    abandoned,
    notified,
  });
}
