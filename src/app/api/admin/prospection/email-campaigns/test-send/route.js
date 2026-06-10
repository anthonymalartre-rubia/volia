// POST /api/app/campagnes/email-campaigns/test-send
//
// Envoie un email de test à l'utilisateur courant (lui-même) pour preview
// d'une campagne en cours de création — quick win #5 du wizard.
//
// Body : { subject, body_html, sender_id?, from_name?, reply_to? }
// Réponse : { ok: true, to: 'user@email.com' } ou { error }
//
// Notes :
//  - sender_id est OBLIGATOIRE et doit être vérifié : l'email de test part
//    toujours du domaine du user (DKIM/SPF), JAMAIS de hello@volia.fr
//    (cohérent avec le garde-fou réputation campagnes/séquences/autopilot).
//  - On préfixe le subject avec [TEST] pour que le user identifie clairement
//    le mail dans sa boîte.
//  - Le body est échappé en HTML simple si l'utilisateur n'a tapé aucune
//    balise (cohérent avec le wrapper auto du wizard).

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;

  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject || '').trim();
  let bodyHtml = String(body.body_html || '').trim();
  const senderId = body.sender_id || null;
  const fromNameRaw = body.from_name ? String(body.from_name).trim().slice(0, 80) : null;
  const replyTo = body.reply_to ? String(body.reply_to).trim() : null;

  if (!subject) {
    return NextResponse.json({ error: 'Objet requis' }, { status: 400 });
  }
  if (!bodyHtml) {
    return NextResponse.json({ error: 'Corps du message requis' }, { status: 400 });
  }
  if (!user.email) {
    return NextResponse.json({ error: 'Aucune adresse email associée à votre compte' }, { status: 400 });
  }

  // Wrap auto en <p> si pas de balise HTML — même règle que le wizard.
  if (!bodyHtml.includes('<')) {
    bodyHtml = `<p>${bodyHtml.replace(/\n+/g, '</p><p>')}</p>`;
  }

  // Variables interpolées avec valeurs exemple (preview)
  const interpolate = (str) => (str || '')
    .replace(/\{\{\s*first_name\s*\}\}/g, user.email.split('@')[0] || 'Anthony')
    .replace(/\{\{\s*last_name\s*\}\}/g, 'Test')
    .replace(/\{\{\s*company\s*\}\}/g, 'Votre entreprise')
    .replace(/\{\{\s*position_title\s*\}\}/g, 'CEO');

  const interpolatedSubject = interpolate(subject);
  const interpolatedBody = interpolate(bodyHtml);

  // Garde-fou réputation : un email de test part TOUJOURS du domaine vérifié
  // du user, JAMAIS de hello@volia.fr (cohérent avec campagnes/séquences).
  // → sender_id obligatoire + vérifié.
  if (!senderId) {
    return NextResponse.json({
      error: "Sélectionne ton domaine d'envoi vérifié avant d'envoyer un test.",
      action: 'configure_sender',
      link: '/settings/email-senders',
    }, { status: 400 });
  }
  // NB: la colonne owner est `user_id` (pas owner_id) — bug corrigé.
  const { data: sender } = await supabase
    .from('email_senders')
    .select('id, domain, from_name, status')
    .eq('id', senderId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!sender || sender.status !== 'verified') {
    return NextResponse.json({
      error: "Ce domaine d'envoi n'est pas vérifié. Vérifie-le avant d'envoyer un test.",
      action: 'configure_sender',
      link: '/settings/email-senders',
    }, { status: 400 });
  }
  const displayName = fromNameRaw || sender.from_name || 'Volia';
  const fromAddress = `${displayName} <noreply@${sender.domain}>`;

  // Banner test en haut du body pour ne laisser aucun doute sur la nature de l'email
  const wrappedHtml = `
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-family:system-ui,sans-serif;font-size:12px;color:#92400e;">
      <strong>Email de test</strong> — envoyé depuis le wizard Volia Campagnes.
      Cette version est interpolée avec des valeurs exemple.
    </div>
    ${interpolatedBody}
  `;

  const result = await sendEmail({
    to: user.email,
    subject: `[TEST] ${interpolatedSubject}`,
    html: wrappedHtml,
    replyTo: replyTo || user.email,
    from: fromAddress, // toujours défini (sender vérifié) — jamais hello@volia.fr
    tags: [
      { name: 'type', value: 'campaign_test' },
      { name: 'user_id', value: user.id },
    ],
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Échec envoi email test' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    to: user.email,
    fromUsed: result.fromUsed,
    fallbackUsed: result.fallbackUsed || false,
  });
}
