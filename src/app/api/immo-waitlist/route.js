// POST /api/immo-waitlist
// Body : { email, profil?, secteurs?, telephone?, budget?, source? }
//
// Inscrit un agent/mandataire à la liste d'attente Volia Immo (validation
// marché). Idempotent sur l'email. Envoie une confirmation au prospect et
// une notif à l'admin (pour suivre la traction en direct). Best-effort sur
// les emails : un échec d'envoi ne fait jamais échouer l'inscription.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALERT_TO = process.env.ALERT_EMAIL || 'contact@volia.fr';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const profil = String(body.profil || '').slice(0, 60) || null;
  const secteurs = String(body.secteurs || '').slice(0, 200) || null;
  const telephone = String(body.telephone || '').slice(0, 40) || null;
  const budget = String(body.budget || '').slice(0, 40) || null;
  const source = String(body.source || 'landing_immo').slice(0, 60);

  // On accepte les emails perso (agents/mandataires utilisent souvent gmail).
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotent : si déjà inscrit, on met à jour les infos et on renvoie ok.
  const { data: existing } = await supabase
    .from('immo_waitlist')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  let isNew = false;
  if (existing) {
    await supabase
      .from('immo_waitlist')
      .update({ profil, secteurs, telephone, budget, source })
      .eq('id', existing.id);
  } else {
    const { error } = await supabase
      .from('immo_waitlist')
      .insert({ email, profil, secteurs, telephone, budget, source });
    if (error) {
      // unique violation (course) → traiter comme déjà inscrit
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, status: 'already' });
      }
      console.error('[immo-waitlist] insert error', error);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement.' }, { status: 500 });
    }
    isNew = true;
  }

  // Emails best-effort (ne bloquent jamais la réponse).
  try {
    // 1. Confirmation au prospect
    await sendEmail({
      to: email,
      subject: '🏡 Tu es sur la liste fondateur Volia Immo',
      html: `
        <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#18181b;">
          <h2 style="color:#6d28d9;">Bienvenue parmi les fondateurs 🎉</h2>
          <p>Merci ! Ta place sur la liste d'attente <strong>Volia Immo</strong> est réservée.</p>
          <p>Volia Immo surveille les portails en temps réel et te sortira chaque matin
          <strong>les biens de particuliers à appeler en priorité</strong> sur ton secteur — classés par probabilité de mandat.</p>
          <p>Tu fais partie des premiers : <strong>-50 % à vie</strong> et accès prioritaire à la bêta (été 2026).</p>
          <p>Une question, une attente précise&nbsp;? Réponds simplement à cet email, je lis tout.</p>
          <p style="color:#71717a;font-size:13px;margin-top:24px;">— L'équipe Volia · volia.fr</p>
        </div>`,
    });
    // 2. Notif admin (traction en direct)
    if (isNew) {
      await sendEmail({
        to: ALERT_TO,
        subject: `🏡 Nouveau lead Volia Immo : ${email}`,
        html: `
          <div style="font-family:-apple-system,sans-serif;font-size:14px;color:#18181b;">
            <p><strong>Nouvelle inscription liste d'attente Volia Immo</strong></p>
            <table style="border-collapse:collapse;font-size:13px;">
              <tr><td style="padding:3px 8px;color:#71717a;">Email</td><td style="padding:3px 8px;">${esc(email)}</td></tr>
              <tr><td style="padding:3px 8px;color:#71717a;">Profil</td><td style="padding:3px 8px;">${esc(profil) || '—'}</td></tr>
              <tr><td style="padding:3px 8px;color:#71717a;">Secteur(s)</td><td style="padding:3px 8px;">${esc(secteurs) || '—'}</td></tr>
              <tr><td style="padding:3px 8px;color:#71717a;">Téléphone</td><td style="padding:3px 8px;">${esc(telephone) || '—'}</td></tr>
              <tr><td style="padding:3px 8px;color:#71717a;">Budget</td><td style="padding:3px 8px;">${esc(budget) || '—'}</td></tr>
              <tr><td style="padding:3px 8px;color:#71717a;">Source</td><td style="padding:3px 8px;">${esc(source)}</td></tr>
            </table>
          </div>`,
      });
    }
  } catch (e) {
    console.error('[immo-waitlist] email send failed (non-blocking):', e?.message || e);
  }

  return NextResponse.json({ ok: true, status: isNew ? 'subscribed' : 'updated' });
}
