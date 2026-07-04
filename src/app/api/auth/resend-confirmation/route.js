import { NextResponse } from 'next/server';
import { distributedRateLimit, getClientIP } from '@/lib/upstash';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { authResendConfirmation } from '@/lib/emailTemplates';
import { alertCritical } from '@/lib/critical-alert';

/**
 * POST /api/auth/resend-confirmation
 * Body: { email: string }
 *
 * Renvoie un nouveau lien de confirmation d'inscription via Resend, à
 * l'utilisateur qui n'a pas reçu (ou a perdu) le 1er email.
 *
 * Sécurité :
 *   - On retourne toujours success: true pour ne pas leaker l'existence
 *     ou l'état (confirmé/non confirmé) d'un compte.
 *   - Rate limit plus strict que /signup : 3 tentatives / 10 min par IP.
 */
export async function POST(request) {
  try {
    // Rate-limit DISTRIBUÉ, plus strict que /signup : 3 tentatives / 10 min par IP (WS7-A)
    const ip = getClientIP(request);
    const rate = await distributedRateLimit(ip, { max: 3, windowSec: 10 * 60, prefix: 'rl:auth:resend' });
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans 10 minutes.' },
        { status: 429 }
      );
    }

    const { email } = await request.json().catch(() => ({}));
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const origin = request.headers.get('origin') || `https://${request.headers.get('host')}` || 'https://volia.fr';
    const admin = getSupabaseAdmin();

    // Tente de générer un nouveau lien signup. Supabase échoue si l'utilisateur
    // n'existe pas OU si l'utilisateur est déjà confirmé — dans les 2 cas on
    // ne dit rien et on retourne success (pas de leak).
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'signup',
      email: normalizedEmail,
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.warn('[auth/resend-confirmation] generateLink failed (silenced):', normalizedEmail, linkError?.message);
      return NextResponse.json({ success: true });
    }

    const confirmUrl = linkData.properties.action_link;
    const { subject, html } = authResendConfirmation({ confirmUrl, email: normalizedEmail });
    const sendResult = await sendEmail({ to: normalizedEmail, subject, html, critical: true });

    if (!sendResult.success) {
      console.error('[auth/resend-confirmation] Resend send failed for', normalizedEmail, sendResult.error);
      // On répond quand même success (pas de leak), mais alerte critique
      // immédiate côté admin — un renvoi de confirmation qui échoue = user bloqué.
      await alertCritical({
        kind: 'resend_confirmation_email_failed',
        message: 'L\'email de confirmation (renvoi) n\'a pas pu être envoyé (Resend).',
        error: sendResult.error,
        context: { route: '/api/auth/resend-confirmation', stage: 'send_confirmation', email: normalizedEmail },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[auth/resend-confirmation] Unexpected error:', err);
    return NextResponse.json({ success: true });
  }
}
