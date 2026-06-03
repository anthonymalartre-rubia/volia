// POST /api/affiliates/apply
// Candidature publique au programme d'apporteurs d'affaires.
// Crée un affilié en status 'pending' → l'admin valide ensuite.

import { NextResponse } from 'next/server';
import { createAffiliateApplication } from '@/lib/affiliates';
import { sendEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const name = String(body?.name || '').trim();
  const company = String(body?.company || '').trim();
  const phone = String(body?.phone || '').trim();
  const motivation = String(body?.motivation || '').trim().slice(0, 2000);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  }

  const res = await createAffiliateApplication({ email, name, company, phone, motivation });
  if (!res.ok) {
    return NextResponse.json({ error: res.error || 'Erreur' }, { status: 500 });
  }

  // Notif admin (best-effort)
  sendEmail({
    to: 'contact@volia.fr',
    subject: `🤝 Nouvelle candidature affilié : ${name}`,
    html: `<p>Nouvelle candidature au programme apporteurs d'affaires.</p>
<ul>
<li><b>Nom :</b> ${name}</li>
<li><b>Email :</b> ${email}</li>
<li><b>Société :</b> ${company || '—'}</li>
<li><b>Téléphone :</b> ${phone || '—'}</li>
<li><b>Motivation :</b> ${motivation || '—'}</li>
</ul>
<p>Valider dans <a href="https://volia.fr/admin/affiliates">/admin/affiliates</a>.</p>`,
  }).catch((e) => console.error('[affiliates/apply] admin email failed', e));

  // Confirmation candidat (best-effort)
  if (!res.already_exists) {
    sendEmail({
      to: email,
      subject: 'Ta candidature affilié Volia est bien reçue 🤝',
      html: `<p>Salut ${name},</p>
<p>Merci pour ta candidature au programme d'apporteurs d'affaires Volia. On la regarde et on revient vers toi très vite avec ton lien et tes accès.</p>
<p>En attendant, tu peux découvrir le produit : <a href="https://volia.fr/produits/autopilot">volia.fr/produits/autopilot</a></p>
<p>À très vite,<br>Anthony · Volia</p>`,
    }).catch((e) => console.error('[affiliates/apply] applicant email failed', e));
  }

  return NextResponse.json({
    ok: true,
    already_exists: !!res.already_exists,
    status: res.affiliate?.status || 'pending',
  });
}
