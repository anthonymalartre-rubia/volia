// ─────────────────────────────────────────────────────────────────────
// src/lib/publishers/webhook.js — Publication via webhook générique
// ─────────────────────────────────────────────────────────────────────
//
// Permet de plug n8n / Make / Zapier / IFTTT à la place (ou en doublon)
// d'une intégration native LinkedIn. Le founder reçoit le payload sur
// son endpoint et fait ce qu'il veut (poster sur LinkedIn entreprise,
// Slack, Discord, etc.).
//
// Credentials :
//   {
//     url: "https://hook.eu1.make.com/abc123",
//     secret?: "shared_secret",   // si présent, on signe en HMAC SHA-256
//     platform_hint?: "linkedin"  // hint pour le receiver
//   }
//
// Payload envoyé :
//   {
//     platform: "linkedin" | "twitter" | "custom",
//     text: "...",
//     source: "volia-autonomy",
//     action_id: "uuid",
//     metadata: {...}
//   }
// ─────────────────────────────────────────────────────────────────────

import crypto from 'crypto';

export async function publishToWebhook(text, credentials, opts = {}) {
  const { url, secret, platform_hint } = credentials || {};

  if (!url) return { ok: false, error: 'credentials.url manquant' };

  const payload = {
    platform: opts.platform || platform_hint || 'custom',
    text,
    source: 'volia-autonomy',
    action_id: opts.action_id || null,
    metadata: opts.metadata || {},
    timestamp: new Date().toISOString(),
  };

  const bodyJson = JSON.stringify(payload);

  const headers = { 'Content-Type': 'application/json' };
  if (secret) {
    // HMAC SHA-256 sur le body brut, hex
    const signature = crypto
      .createHmac('sha256', secret)
      .update(bodyJson)
      .digest('hex');
    headers['X-Volia-Signature'] = signature;
  }

  try {
    const res = await fetch(url, { method: 'POST', headers, body: bodyJson });
    if (!res.ok) {
      const errBody = await res.text();
      return {
        ok: false,
        error: `Webhook ${res.status} : ${errBody.slice(0, 200)}`,
        status: res.status,
      };
    }
    const responseText = await res.text();
    return {
      ok: true,
      post_url: null, // webhook = pas d'URL prévisible
      raw: { status: res.status, body: responseText.slice(0, 500) },
    };
  } catch (err) {
    return { ok: false, error: `Fetch error : ${err.message}` };
  }
}
