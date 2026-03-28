import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role to manage opt-out list
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  try {
    const { email, company, reason } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Add to opt-out list
    const { error: optOutError } = await supabase
      .from('opt_out_list')
      .upsert({
        email: email.toLowerCase().trim(),
        company: company || null,
        reason: reason || null,
        requested_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (optOutError) {
      console.error('Opt-out insert error:', optOutError);
    }

    // 2. Delete this email from all prospects
    const { error: deleteError } = await supabase
      .from('prospects')
      .update({ email: null, email_method: null })
      .eq('email', email.toLowerCase().trim());

    if (deleteError) {
      console.error('Prospect delete error:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été prise en compte. Vos données seront supprimées sous 48h.'
    });
  } catch (error) {
    console.error('Opt-out error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
