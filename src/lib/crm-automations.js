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
      // Volia Project : OPT-IN (défaut false) — on ne crée pas de projet
      // dans le dos de l'utilisateur tant qu'il ne l'a pas demandé.
      won_project: data?.crm_automation_prefs?.won_project === true,
    };
  } catch {
    return { won_onboarding: true, stale_relance: true, won_project: false };
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

/**
 * Règle 3 (synchrone, OPT-IN) : deal gagné → projet de livraison Volia Project.
 * Best-effort, idempotent (1 projet max par deal), respecte won_project.
 * Utilise le modèle système "Onboarding client" pour pré-remplir les tâches.
 */
export async function createProjectOnWon(supabase, deal) {
  if (!deal?.id || !deal?.user_id) return { skipped: 'invalid' };
  try {
    const prefs = await getAutomationPrefs(supabase, deal.user_id);
    if (!prefs.won_project) return { skipped: 'disabled' };

    // Idempotence : un projet existe déjà pour ce deal ?
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('crm_deal_id', deal.id)
      .limit(1);
    if (existing && existing.length > 0) return { skipped: 'exists' };

    const { buildTasksFromTemplate } = await import('./projects');
    const { data: template } = await supabase
      .from('project_templates')
      .select('id, name, tasks')
      .is('user_id', null)
      .eq('name', 'Onboarding client')
      .maybeSingle();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: deal.user_id,
        name: `Livraison — ${deal.title || 'nouveau client'}`,
        color: 'amber',
        crm_deal_id: deal.id,
        crm_contact_id: deal.contact_id || null,
        template_id: template?.id || null,
      })
      .select()
      .single();
    if (error) return { skipped: 'error', error: error.message };

    if (template) {
      const rows = buildTasksFromTemplate(template, project.id);
      if (rows.length) await supabase.from('project_tasks').insert(rows);
    }
    return { created: true, project };
  } catch (e) {
    return { skipped: 'error', error: e?.message };
  }
}
