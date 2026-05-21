// Endpoint de capture lead + envoi du lien de téléchargement par email.
//
// Flux :
// 1. POST { resource_slug, email, first_name?, company? }
// 2. Valide email + ressource
// 3. Upsert dans resource_leads (anti-dup grâce à l'index unique)
// 4. Envoie le lien de téléchargement par email (via Resend)
// 5. Retourne 200 avec un message + URL si direct download
//
// Pour les ressources "deliveryMode: direct" (calculateurs), on n'envoie
// pas d'email et on retourne l'URL directement (no lead capture).

import { NextResponse } from 'next/server';
import { getResource } from '@/lib/resources';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL "canonique" du lead magnet (page de remerciement avec lien direct).
// Pour la v1, on pointe vers la page /ressources/[slug]/telecharger
// qui sert le PDF stocké en /public/ressources/[slug].pdf.
function downloadUrlFor(slug) {
  return `https://prospectia.cloud/ressources/${slug}/telecharger`;
}

function thankYouEmailHtml({ firstName, resource }) {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
  const dlUrl = downloadUrlFor(resource.slug);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;padding:32px;">
    <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(139,92,246,0.1);color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">
      Ressource Prospectia
    </div>
    <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.2;">
      ${resource.title}
    </h1>
    <p style="font-size:15px;line-height:1.6;color:#3a3a3c;margin:0 0 24px;">
      ${greeting}<br><br>
      Voici votre ressource gratuite. Cliquez sur le bouton ci-dessous pour la télécharger immédiatement :
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${dlUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:600;text-decoration:none;font-size:15px;">
        Télécharger ${resource.format}
      </a>
    </div>
    <p style="font-size:14px;line-height:1.6;color:#6e6e73;margin:24px 0 0;">
      <strong>Ce qu'il y a dedans :</strong><br>
      ${resource.shortDesc}
    </p>
    <hr style="border:none;border-top:1px solid #e5e5ea;margin:32px 0;">
    <p style="font-size:13px;line-height:1.6;color:#6e6e73;margin:0;">
      Vous recevez ce mail parce que vous avez demandé à télécharger une ressource sur prospectia.cloud.
      Si vous souhaitez ne plus recevoir d'emails de notre part, vous pouvez vous
      <a href="https://prospectia.cloud/opt-out" style="color:#7c3aed;">désinscrire en un clic</a>.
    </p>
    <p style="font-size:12px;color:#86868b;margin:16px 0 0;text-align:center;">
      Prospectia — Prospection B2B française · prospectia.cloud
    </p>
  </div>
</body>
</html>`;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { resource_slug, email, first_name, company, utm_source, utm_medium, utm_campaign } = body;

    // Validations
    if (!resource_slug || typeof resource_slug !== 'string') {
      return NextResponse.json({ error: 'resource_slug requis' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const resource = getResource(resource_slug);
    if (!resource) {
      return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 });
    }

    // Pour les ressources direct (calculateurs en ligne) : pas de capture,
    // on retourne juste l'URL.
    if (resource.deliveryMode === 'direct') {
      return NextResponse.json({
        ok: true,
        message: 'Accès direct',
        url: `/ressources/${resource.slug}`,
      });
    }

    // Capture le lead (upsert : si même email + même resource, on update)
    const supabase = getSupabaseAdmin();
    const normalizedEmail = email.trim().toLowerCase();
    const referrer = request.headers.get('referer') || null;
    const userAgent = request.headers.get('user-agent') || null;
    const ipCountry = request.headers.get('x-vercel-ip-country') || null;

    const { error: upsertErr } = await supabase
      .from('resource_leads')
      .upsert(
        {
          resource_slug,
          email: normalizedEmail,
          first_name: first_name?.trim() || null,
          company: company?.trim() || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          referrer,
          user_agent: userAgent,
          ip_country: ipCountry,
          consent_given: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email,resource_slug' }
      );

    if (upsertErr) {
      console.error('[ressources/download] upsert error', upsertErr);
      return NextResponse.json({ error: 'Erreur enregistrement' }, { status: 500 });
    }

    // Envoie l'email de delivery via Resend
    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: `Votre ressource : ${resource.title}`,
      html: thankYouEmailHtml({ firstName: first_name, resource }),
    }).catch((err) => {
      console.error('[ressources/download] email send error', err);
      return null;
    });

    // Marque l'email comme envoyé si réussi (best effort, ne bloque pas la réponse)
    if (emailSent) {
      await supabase
        .from('resource_leads')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('email', normalizedEmail)
        .eq('resource_slug', resource_slug);
    }

    return NextResponse.json({
      ok: true,
      message: 'Lien envoyé par email',
      // On retourne aussi l'URL pour les cas où le user veut télécharger
      // immédiatement (UX premium) — l'email reste envoyé en parallèle.
      url: downloadUrlFor(resource.slug),
    });
  } catch (err) {
    console.error('[ressources/download] unexpected error', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
