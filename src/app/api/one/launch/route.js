// ─────────────────────────────────────────────────────────────────────
// POST /api/one/launch — Volia One : « Tout lancer »
// ─────────────────────────────────────────────────────────────────────
// Transforme les leads rédigés sur /one en VRAIE campagne d'envoi.
// Réutilise le pipeline Campagnes existant (cron process-email-campaigns)
// avec un email pré-rédigé PAR destinataire (subject_override/body_override
// posés sur chaque email_sends — voix du client, pas de template partagé).
//
// Body: { domain, icp, leads }  (leads = ceux retournés par /api/one/run)
// Authz : admin uniquement (phase de test — contrôle des coûts).
//
// GARDE-FOUS (rien ne part sans) :
//   1. le clic + la confirmation côté UI ;
//   2. un domaine d'envoi VÉRIFIÉ pour l'admin (sinon 412, message clair) ;
//   3. des leads envoyables = email FIABLE (scrape/serper) + email rédigé.
//
// L'envoi réel est délégué au cron (toutes les ~5 min) : warmup, quota,
// opt-out RGPD, reply-to inbound → CRM s'appliquent automatiquement.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const maxDuration = 30;

// "Objet: X\n\n<corps>" → { subject, html }. Le corps (texte) est converti en
// HTML simple : échappement + <p> par bloc + <br> par saut de ligne.
function parseDraft(draft) {
  const text = String(draft || '').trim();
  if (!text) return null;
  const m = text.match(/^objet\s*:\s*(.+?)\r?\n/i);
  const subject = (m ? m[1] : '').trim();
  const body = (m ? text.slice(m[0].length) : text).trim();
  if (!subject || !body) return null;
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = body
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\r?\n/g, '<br>')}</p>`)
    .join('\n');
  return { subject: subject.slice(0, 200), html };
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json(
      { error: 'Réservé admin pendant la phase de test Volia One.' },
      { status: 403 }
    );
  }

  const { domain, icp, leads } = await request.json().catch(() => ({}));
  if (!domain || typeof domain !== 'string' || !Array.isArray(leads) || leads.length === 0) {
    return NextResponse.json({ error: 'domain + leads requis' }, { status: 400 });
  }

  // ① Garde-fou : domaine d'envoi vérifié (sinon strictement rien ne peut partir)
  const { data: senders } = await supabase
    .from('email_senders')
    .select('id, domain, from_name, status, verified_at')
    .eq('user_id', user.id)
    .eq('status', 'verified')
    .order('verified_at', { ascending: false });
  const sender = (senders || [])[0];
  if (!sender) {
    return NextResponse.json(
      {
        error: 'no_sender',
        message:
          "Aucun domaine d'envoi vérifié. Configure-le dans Réglages → Domaines d'envoi avant de lancer.",
      },
      { status: 412 }
    );
  }

  // ② Ne garde que les leads envoyables : email FIABLE + email rédigé.
  //    (on n'envoie jamais sur un email "deviné" → délivrabilité + RGPD)
  const seenEmail = new Set();
  const sendable = [];
  for (const l of leads) {
    if (!l || !l.email || !l.draft) continue;
    if (l.method !== 'scrape' && l.method !== 'serper') continue;
    const email = String(l.email).trim().toLowerCase();
    if (!email.includes('@') || seenEmail.has(email)) continue;
    const parsed = parseDraft(l.draft);
    if (!parsed) continue;
    seenEmail.add(email);
    sendable.push({
      email,
      company: (l.nom || '').slice(0, 200),
      phone: l.telephone || null,
      subject: parsed.subject,
      html: parsed.html,
    });
  }

  if (sendable.length === 0) {
    return NextResponse.json(
      {
        error: 'no_sendable',
        message: 'Aucun lead envoyable (email fiable + email rédigé requis).',
      },
      { status: 400 }
    );
  }

  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 120);

  // ③ Liste de prospects
  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .insert({
      owner_id: user.id,
      name: `Volia One — ${cleanDomain} (${stamp})`,
      description: `Généré par Volia One depuis ${cleanDomain}`,
      source: 'volia_one',
      legal_basis: 'legitimate_interest',
    })
    .select('id')
    .single();
  if (listErr || !list) {
    return NextResponse.json(
      { error: listErr?.message || 'Création de la liste impossible' },
      { status: 500 }
    );
  }

  // ④ Contacts (dédup list_id+email — la liste est neuve, tout est inséré)
  const { data: contacts, error: contactsErr } = await supabase
    .from('prospect_contacts')
    .upsert(
      sendable.map((s) => ({
        list_id: list.id,
        email: s.email,
        phone: s.phone,
        company: s.company || null,
        opt_out: false,
      })),
      { onConflict: 'list_id,email', ignoreDuplicates: true }
    )
    .select('id, email');
  if (contactsErr) {
    return NextResponse.json({ error: contactsErr.message }, { status: 500 });
  }
  const idByEmail = new Map((contacts || []).map((c) => [c.email, c.id]));

  // ⑤ Campagne — status 'sending' → prise par le cron au prochain tick.
  //    subject/body_html = placeholders : chaque send porte son propre override.
  const fromName = (sender.from_name || icp?.activite || cleanDomain).slice(0, 80);
  const { data: campaign, error: campErr } = await supabase
    .from('email_campaigns')
    .insert({
      owner_id: user.id,
      list_id: list.id,
      name: `Volia One — ${cleanDomain} (${stamp})`,
      subject: 'Volia One',
      body_html: '<p>Volia One</p>',
      from_name: fromName,
      from_email: `noreply@${sender.domain}`,
      email_sender_id: sender.id,
      status: 'sending',
      started_at: new Date().toISOString(),
      total_recipients: sendable.length,
      smart_scheduling: false,
    })
    .select('id')
    .single();
  if (campErr || !campaign) {
    return NextResponse.json(
      { error: campErr?.message || 'Création de la campagne impossible' },
      { status: 500 }
    );
  }

  // ⑥ Sends pré-composés (override par destinataire), pending → envoyés par le cron
  const sendsPayload = sendable
    .map((s) => {
      const cid = idByEmail.get(s.email);
      if (!cid) return null;
      return {
        campaign_id: campaign.id,
        contact_id: cid,
        email: s.email,
        status: 'pending',
        subject_override: s.subject,
        body_override: s.html,
      };
    })
    .filter(Boolean);

  const { error: sendsErr } = await supabase.from('email_sends').insert(sendsPayload);
  if (sendsErr) {
    return NextResponse.json({ error: sendsErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    campaign_id: campaign.id,
    list_id: list.id,
    queued: sendsPayload.length,
    sender_domain: sender.domain,
  });
}
