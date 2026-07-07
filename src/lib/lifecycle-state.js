// ─────────────────────────────────────────────────────────────────────
// État d'envoi des emails lifecycle — helpers partagés entre les crons
// (process-drip-emails, lifecycle-triggers) et usage.js (B1).
//
// Deux colonnes sur user_profiles :
//   - drip_emails_sent (jsonb ARRAY de clés) : la source d'IDEMPOTENCE
//     historique. Un step marqué n'est jamais renvoyé.
//   - drip_sent_at (jsonb OBJET clé → ISO timestamp) : la dimension TEMPS,
//     ajoutée le 07/07/2026 (migration lifecycle_bc_wiring). Sert aux
//     déclencheurs relatifs (B2 = J+2 après B1, C2/C3 = J+7/J+14 après C1)
//     et au cap global « 1 email lifecycle / 24 h / user ».
//
// Les envois antérieurs au 07/07/2026 n'ont PAS de timestamp : les clés
// existent dans l'array sans entrée dans drip_sent_at. Tout code temporel
// doit traiter « timestamp absent » comme « envoi ancien » (pas récent).
// ─────────────────────────────────────────────────────────────────────

/**
 * Marque un step lifecycle : ajoute la clé à drip_emails_sent et, si
 * `stamp` (défaut), stampe drip_sent_at[clé]. Idempotent : si la clé est
 * déjà présente, ne touche à rien (on ne réécrit pas le timestamp d'origine).
 *
 * `stamp: false` sert aux poses de clé SANS envoi réel (compte fantôme,
 * inéligible définitif, sortie de séquence 'exit') : la clé bloque bien le
 * re-traitement, mais aucun timestamp fantôme ne vient consommer le cap
 * anti-spam de hoursSinceLastLifecycle (revue adversariale 07/07).
 *
 * Re-lit l'état FRAIS juste avant l'update (pas un snapshot du fetch du
 * caller) pour ne pas écraser une clé posée entre-temps par un autre
 * trigger du même run ou par le cron concurrent. NB : read-modify-write non
 * atomique — deux écrivains STRICTEMENT simultanés sur le même profil
 * peuvent se perdre une clé (backlog : RPC SQL « append si absent »).
 */
export async function markLifecycleSent(supabase, userId, stepKey, { stamp = true } = {}) {
  const { data } = await supabase
    .from('user_profiles')
    .select('drip_emails_sent, drip_sent_at')
    .eq('id', userId)
    .maybeSingle();
  const arr = Array.isArray(data?.drip_emails_sent) ? data.drip_emails_sent : [];
  if (arr.includes(stepKey)) return;
  const update = {
    drip_emails_sent: [...arr, stepKey],
    updated_at: new Date().toISOString(),
  };
  if (stamp) {
    const sentAt = (data?.drip_sent_at && typeof data.drip_sent_at === 'object') ? data.drip_sent_at : {};
    update.drip_sent_at = { ...sentAt, [stepKey]: new Date().toISOString() };
  }
  await supabase
    .from('user_profiles')
    .update(update)
    .eq('id', userId);
}

/**
 * Timestamp (ms epoch) d'envoi d'un step, ou null si jamais envoyé / envoi
 * antérieur au 07/07/2026 (clé sans timestamp).
 */
export function lifecycleSentAtMs(dripSentAt, stepKey) {
  const iso = dripSentAt && typeof dripSentAt === 'object' ? dripSentAt[stepKey] : null;
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Heures écoulées depuis le DERNIER email lifecycle envoyé (tous steps
 * confondus). Infinity si aucun envoi horodaté — les envois pré-timestamps
 * comptent donc comme « anciens », ce qui est le comportement voulu pour un
 * cap anti-spam (on ne bloque que ce qu'on sait récent).
 */
export function hoursSinceLastLifecycle(dripSentAt) {
  if (!dripSentAt || typeof dripSentAt !== 'object') return Infinity;
  let latest = 0;
  for (const iso of Object.values(dripSentAt)) {
    const ms = new Date(iso).getTime();
    if (Number.isFinite(ms) && ms > latest) latest = ms;
  }
  if (!latest) return Infinity;
  return (Date.now() - latest) / 3600000;
}

/**
 * Cap global doc séquences : « Maximum 1 email lifecycle par 24 h par
 * utilisateur (D exempt) ». Retourne true si un envoi doit être RETENU
 * (sans marquer la clé — le step repartira naturellement au run suivant).
 *
 * Seuil à 20 h et non 24 h : les crons tournent à heure fixe (drip à 10h,
 * triggers B/C au run de 3h). Avec un seuil strict à 24 h, un envoi stampé
 * hier à 10:00:05 serait encore « cappé » aujourd'hui à 10:00:02 → journée
 * entière sautée par jitter d'exécution. 20 h garde l'esprit « ~1/jour »
 * sans dégénérer en 1 email / 2 jours (revue adversariale 07/07).
 */
export function isLifecycleCapped(dripSentAt) {
  return hoursSinceLastLifecycle(dripSentAt) < 20;
}
