import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { authResendConfirmation } from '@/lib/emailTemplates';

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
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rate = checkRateLimit(`auth-resend:${ip}`, 3, 10 * 60 * 1000);
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
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[auth/resend-confirmation] Unexpected error:', err);
    return NextResponse.json({ success: true });
  }
}
