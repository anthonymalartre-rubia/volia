import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    // Rate-limit anti-sabotage (P1 audit) : sans ça, n'importe qui peut
    // POSTer en masse une liste d'emails connus et déclencher la suppression
    // de tous les leads correspondants chez tous les utilisateurs.
    // 3 req max / IP / heure suffit largement pour un usage légitime.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rate = checkRateLimit(`opt-out:${ip}`, 3, 60 * 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de demandes. Reessayez dans 1 heure.' },
        { status: 429 }
      );
    }

    const { email, company, reason } = await request.json();

    // Validation email plus stricte
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
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
