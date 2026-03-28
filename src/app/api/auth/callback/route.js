import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/emailTemplates';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Create a Supabase client that can exchange the code
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            plan: 'free',
          });
      }

      // Send welcome email (fire and forget — don't block the redirect)
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;
      const template = welcomeEmail(userName);
      sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      }).catch((err) => console.error('[auth/callback] Welcome email failed:', err));
    }
  } catch (emailErr) {
    // Never block auth flow for an email error
    console.error('[auth/callback] Email logic error:', emailErr);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
