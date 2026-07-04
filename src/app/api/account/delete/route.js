import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE() {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const userId = user.id;

    // WS10 — purge RGPD complète et TRANSACTIONNELLE des 42 tables user-owned via
    // la fonction SECURITY DEFINER purge_user_account (migration
    // 20260704_ws10_purge_user_account). Remplace l'ancienne liste de 7 tables
    // codées en dur (dont 2 aux mauvais noms folders/tags qui ne supprimaient
    // rien) qui laissait ~35 tables orphelines, dont les secrets Twilio/Resend
    // chiffrés (email_senders/sms_senders). Atomique → pas de compte à moitié
    // supprimé ; les enfants (email_sends, form_fields, crm_stages, project_tasks,
    // prospect_contacts…) partent en cascade.
    const { error: purgeError } = await admin.rpc('purge_user_account', { p_uid: userId });
    if (purgeError) {
      console.error('[account/delete] purge_user_account failed:', purgeError);
      return NextResponse.json({ error: 'Erreur lors de la suppression des donnees' }, { status: 500 });
    }

    // Supprime l'utilisateur auth en dernier (Admin API — nettoie le schéma auth).
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('[account/delete] deleteUser failed:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Compte supprime avec succes' });
  } catch (err) {
    console.error('Account delete error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
