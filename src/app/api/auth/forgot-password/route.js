import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { authPasswordReset } from '@/lib/emailTemplates';

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Génère un lien de réinitialisation de mot de passe via Supabase admin API
 * et l'envoie via Resend avec le template brandé Volia.
 *
 * Important — Sécurité :
 *   - On retourne TOUJOURS success: true même si l'email n'existe pas dans
 *     la base, pour ne pas leaker l'existence d'un compte (best practice
 *     auth, cf OWASP).
 *   - Désactiver l'email "Reset Password" par défaut dans Supabase
 *     Authentication > Email Templates pour ne pas envoyer 2 emails.
 */
export async function POST(request) {
  try {
    // Rate-limit anti-abuse : 5 tentatives / 15 min par IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rate = checkRateLimit(`auth-forgot:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans 15 minutes.' },
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

    // Génère le lien de recovery. Si l'utilisateur n'existe pas, Supabase
    // renvoie une erreur — on l'ignore silencieusement pour éviter la
    // divulgation d'information sur l'existence du compte.
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${origin}/reset-password`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      // User inexistant ou autre erreur — on log mais on répond success
      // pour ne pas leaker.
      console.warn('[auth/forgot-password] generateLink failed (silenced):', normalizedEmail, linkError?.message);
      return NextResponse.json({ success: true });
    }

    const resetUrl = linkData.properties.action_link;

    // Envoi de l'email brandé
    const { subject, html } = authPasswordReset({ resetUrl, email: normalizedEmail });
    const sendResult = await sendEmail({ to: normalizedEmail, subject, html, critical: true });

    if (!sendResult.success) {
      console.error('[auth/forgot-password] Resend send failed for', normalizedEmail, sendResult.error);
      // Même cas — on ne dit pas à l'utilisateur que l'envoi a foiré pour
      // ne pas leaker. Mais on log côté serveur pour debug.
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[auth/forgot-password] Unexpected error:', err);
    // Toujours success pour ne pas leaker. L'erreur reste loguée.
    return NextResponse.json({ success: true });
  }
}
