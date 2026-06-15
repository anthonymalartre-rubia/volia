import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
// Note : welcomeEmail remplacé par trialStartedEmail (msg plus engageant
// qui annonce les 14j de Pro offerts au lieu du simple welcome neutre).
import { trialStartedEmail } from '@/lib/emailTemplates';
import { cleanEnv } from '@/lib/envClean';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { buildTrialPayload } from '@/lib/trial';

// Validation anti open-redirect (P1 audit sécurité).
// On n'accepte que des paths internes commençant par "/" mais pas "//"
// (qui sont protocol-relative et peuvent envoyer vers un autre domaine).
// On bloque aussi les caractères de contrôle (CR/LF) qui peuvent injecter
// des headers Location.
function safeRedirectPath(next) {
  if (typeof next !== 'string') return '/dashboard';
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/dashboard';
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(next)) return "/dashboard";
  return next;
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Create a Supabase client that can exchange the code
  const cookieStore = await cookies();
  const supabase = createServerClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error('[auth/callback] Code exchange failed:', error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const user = data.user;

  // ─── Send welcome email if user was just created ────────────────────────────
  // Supabase sets created_at on signup. If it's within the last 60 seconds,
  // this is a new user.
  try {
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const isNewUser = (now - createdAt) < 60_000; // within 60 seconds

    if (isNewUser) {
      // Ensure the user has a profile row
      const supabaseAdmin = getSupabaseAdmin();
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, trial_started_at')
        .eq('id', user.id)
        .single();

      // Trial MAX 14j sans CB : on l'attribue UNIQUEMENT si le user n'a
      // jamais eu de trial (anti double-dip si jamais on recrée le profil).
      // buildTrialPayload retourne { trial_plan, trial_started_at, trial_ends_at, plan }.
      const trialPayload = buildTrialPayload('max');

      if (!existingProfile) {
        await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: user.id,
            ...trialPayload,
          });
      } else if (!existingProfile.trial_started_at) {
        // Profil existant sans trial → on l'active (cas edge : profil créé
        // par un autre flow, par exemple un import legacy).
        await supabaseAdmin
          .from('user_profiles')
          .update(trialPayload)
          .eq('id', user.id);
      }

      // Send trial-started email (remplace l'ancien welcome — annonce les
      // 14j Pro). Fire and forget pour ne pas bloquer la redirect.
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;
      const template = trialStartedEmail(userName, trialPayload.trial_ends_at);
      sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      }).catch((err) => console.error('[auth/callback] Trial-started email failed:', err));
    }
  } catch (emailErr) {
    // Never block auth flow for an email error
    console.error('[auth/callback] Email logic error:', emailErr);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
