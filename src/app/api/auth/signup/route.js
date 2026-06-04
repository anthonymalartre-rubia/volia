import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { authSignupConfirm } from '@/lib/emailTemplates';

/**
 * POST /api/auth/signup
 * Body: { email: string, password: string }
 *
 * Crée un nouveau compte Supabase (email non confirmé) via l'admin API
 * et envoie un email de confirmation brandé Volia via Resend.
 *
 * Important : ce flow REMPLACE supabase.auth.signUp() côté client. Il faut
 * désactiver les emails de confirmation par défaut de Supabase dans
 * Authentication > Email Templates pour ne pas envoyer 2 emails.
 *
 * Le cookie volia_ref (parrainage) reste géré côté client via
 * /api/referrals/track AFTER login (cf. signup page).
 */
export async function POST(request) {
  try {
    // Rate-limit anti-abuse : 5 tentatives / 15 min par IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rate = checkRateLimit(`auth-signup:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives d\'inscription. Réessayez dans 15 minutes.', code: 'rate_limited' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json().catch(() => ({}));

    // Validation
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = getSupabaseAdmin();

    // generateLink({ type: 'signup', email, password }) fait DEUX choses en
    // un seul call atomique côté Supabase :
    //   1. Crée l'utilisateur (email_confirmed_at = null, donc non confirmé)
    //   2. Génère le lien de confirmation (token magique, valable 24h)
    //
    // Erreur précédente : on appelait admin.createUser() PUIS generateLink()
    // → la 2e échouait avec "user already registered" car la 1ère venait de
    // créer l'utilisateur. La doc Supabase dit clairement que generateLink
    // type:signup gère la création — pas besoin de createUser séparé.
    //
    // Bénéfice secondaire : atomique. Si generateLink échoue (rate limit,
    // network, etc.), aucun user fantôme orphelin n'est créé en DB.
    const origin = request.headers.get('origin') || `https://${request.headers.get('host')}` || 'https://volia.fr';
    const genOpts = {
      type: 'signup',
      email: normalizedEmail,
      password,
      options: {
        // Page client-side qui gère le #access_token= hash de Supabase Verify
        // puis redirige vers /dashboard. Sans ça, le user atterrit sur
        // /dashboard, le middleware Next ne voit pas de cookie session
        // (le token est dans le HASH, invisible côté serveur) et le redirige
        // vers /login → mauvaise UX, doit re-saisir ses identifiants.
        redirectTo: `${origin}/auth/confirm?next=/dashboard`,
      },
    };

    // Résilience : un blip réseau/Supabase (timeout) peut faire échouer
    // generateLink. On retente UNE fois avant d'abandonner — évite de perdre
    // une inscription sur un simple transitoire (cf. incident signup 06/2026).
    let linkData = null, linkError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await admin.auth.admin.generateLink(genOpts)
        .catch((e) => ({ data: null, error: { message: e?.message || String(e), _thrown: true } }));
      linkData = r.data; linkError = r.error;
      if (!linkError) break;
      const m = (linkError.message || '').toLowerCase();
      // Inutile de retenter si le compte existe déjà.
      if (m.includes('already') || m.includes('exists') || m.includes('registered') || m.includes('duplicate')) break;
      if (attempt === 0) await new Promise((res) => setTimeout(res, 500));
    }

    if (linkError) {
      const msg = (linkError.message || '').toLowerCase();
      // Compte déjà existant → 409
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered') || msg.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Un compte existe déjà avec cet email.', code: 'already_exists' },
          { status: 409 }
        );
      }
      // Rate-limit côté Supabase (throttle anti-abus) → message clair, pas "erreur serveur".
      if (linkError.status === 429 || msg.includes('rate limit') || msg.includes('rate_limit') || msg.includes('too many') || msg.includes('over_')) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Réessaie dans quelques minutes.', code: 'rate_limited' },
          { status: 429 }
        );
      }
      console.error('[auth/signup] generateLink error (after retry):', linkError);
      return NextResponse.json(
        { error: 'Impossible de créer le compte. Réessayez ou contactez le support.', code: 'server_error' },
        { status: 500 }
      );
    }

    if (!linkData?.properties?.action_link) {
      console.error('[auth/signup] generateLink returned no action_link:', linkData);
      return NextResponse.json(
        { error: 'Lien de confirmation non disponible. Contactez le support.', code: 'server_error' },
        { status: 500 }
      );
    }

    const confirmUrl = linkData.properties.action_link;
    const created = linkData.user; // {id, email, ...} si présent dans la réponse

    // 3. Envoyer l'email brandé via Resend
    const { subject, html } = authSignupConfirm({ confirmUrl, email: normalizedEmail });
    const sendResult = await sendEmail({ to: normalizedEmail, subject, html });

    if (!sendResult.success) {
      // L'utilisateur EST déjà créé en base. On log + retourne une 500
      // avec un message qui invite à utiliser "Renvoyer l'email".
      console.error('[auth/signup] Resend send failed for', normalizedEmail, sendResult.error);
      return NextResponse.json(
        {
          error: 'Compte créé mais l\'email de confirmation n\'a pas pu être envoyé. Cliquez sur "Renvoyer l\'email" ou contactez le support.',
          partial: true,
          code: 'email_send_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de confirmation envoyé.',
      userId: created?.id || null,
    });
  } catch (err) {
    console.error('[auth/signup] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erreur interne. Réessayez dans quelques instants.', code: 'server_error' },
      { status: 500 }
    );
  }
}
