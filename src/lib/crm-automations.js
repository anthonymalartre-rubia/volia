// Automatisations CRM (P3-2).
//
// Règle 1 (synchrone) : un deal passé en "gagné" → crée automatiquement une
// tâche d'onboarding pour le contact. Idempotent (1 seule par deal) et
// respecte la préférence user crm_automation_prefs.won_onboarding.
//
// Règle 2 (cron) : deal ouvert sans activité depuis 7 j → tâche de relance.
// Implémentée dans /api/cron/crm-automations.

/**
 * Lit les préférences d'automatisation d'un user (défaut : tout activé).
 */
export async function getAutomationPrefs(supabase, userId) {
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('crm_automation_prefs')
      .eq('id', userId)
      .maybeSingle();
    return {
      won_onboarding: data?.crm_automation_prefs?.won_onboarding !== false,
      stale_relance: data?.crm_automation_prefs?.stale_relance !== false,
    };
  } catch {
    return { won_onboarding: true, stale_relance: true };
  }
}

/**
 * Crée une tâche d'onboarding quand un deal est gagné. Best-effort, idempotent.
 * @param supabase  client Supabase (scoped user OU service-role)
 * @param deal      { id, user_id, title, contact_id, contact?:{name} }
 */
export async function createOnboardingTaskOnWon(supabase, deal) {
  if (!deal?.id || !deal?.user_id) return { skipped: 'invalid' };
  try {
    const prefs = await getAutomationPrefs(supabase, deal.user_id);
    if (!prefs.won_onboarding) return { skipped: 'disabled' };

    // Idempotence : déjà une tâche onboarding auto pour ce deal ?
    const { data: existing } = await supabase
      .from('crm_activities')
      .select('id')
      .eq('deal_id', deal.id)
      .eq('metadata->>automation', 'onboarding')
      .limit(1);
    if (existing && existing.length > 0) return { skipped: 'exists' };

    const who = deal.contact?.name || deal.title || 'le client';
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 2);

    const { error } = await supabase.from('crm_activities').insert({
      user_id: deal.user_id,
      deal_id: deal.id,
      contact_id: deal.contact_id || null,
      type: 'task',
      content: `Onboarding ${who} — planifier le démarrage 🎉`,
      due_at: dueAt.toISOString(),
      metadata: { automation: 'onboarding', source: 'crm_automation' },
    });
    if (error) return { skipped: 'error', error: error.message };
    return { created: true };
  } catch (e) {
    return { skipped: 'error', error: e?.message };
  }
}
