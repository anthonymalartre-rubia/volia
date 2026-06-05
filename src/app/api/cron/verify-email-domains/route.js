// Cron Vercel — Re-vérification automatique des domaines d'envoi 'pending'.
//
// Tourne toutes les heures. Pour chaque domaine email encore 'pending' (ou
// 'temp_failure') créé dans les 30 derniers jours :
//   1. Déclenche une re-vérification DNS côté Resend (triggerVerify = true)
//   2. Relit le statut + records, met à jour la row email_senders
//   3. Bascule en 'verified' → démarre le warmup + enrôle dans le pool peer
//
// Pourquoi ? La vérification DNS dépend de la propagation (cache négatif,
// TTL). Sans ça, l'utilisateur devait cliquer « Vérifier maintenant » en
// boucle. Désormais Volia re-sonde tout seul → le domaine passe vérifié dès
// que le DNS est propagé, sans intervention.
//
// Protégé par CRON_SECRET (header Authorization Bearer).

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanEnv } from '@/lib/envClean';
import { syncSenderFromResend } from '@/lib/email-sender-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_PER_RUN = 50;
const WINDOW_DAYS = 30;

export async function GET(request) {
  // Auth via CRON_SECRET
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const sinceIso = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000).toISOString();

  const { data: senders, error } = await supabase
    .from('email_senders')
    .select('id, user_id, domain, resend_domain_id, status, verified_at')
    .in('status', ['pending', 'temp_failure'])
    .not('resend_domain_id', 'is', null)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(MAX_PER_RUN);

  if (error) {
    console.error('[cron/verify-email-domains] select error', error);
    return NextResponse.json({ error: 'select failed' }, { status: 500 });
  }

  const list = senders || [];
  let checked = 0, verified = 0, stillPending = 0;

  // Séquentiel pour rester gentil avec le rate limit Resend.
  for (const s of list) {
    checked += 1;
    try {
      const { sender, flipped } = await syncSenderFromResend({
        supabase, sender: s, triggerVerify: true,
      });
      if (sender.status === 'verified') verified += 1;
      else stillPending += 1;
      if (flipped) {
        console.log(`[cron/verify-email-domains] ${s.domain} → verified`);
      }
    } catch (e) {
      stillPending += 1;
      console.error(`[cron/verify-email-domains] ${s.domain} sync error`, e?.message || e);
    }
  }

  return NextResponse.json({ ok: true, checked, verified, stillPending });
}
