// src/lib/email.js
// Lightweight email utility using Resend REST API (no SDK dependency)

const FROM_ADDRESS = 'Prospectia.ai <noreply@prospectia.ai>';
const FALLBACK_FROM = 'Prospectia.ai <onboarding@resend.dev>';

/**
 * Send a transactional email via Resend API.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  // Use fallback sender when testing with Resend's test key
  const from = apiKey.startsWith('re_test_') ? FALLBACK_FROM : FROM_ADDRESS;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[email] Resend API error:', data);
      return { success: false, error: data.message || 'Resend API error' };
    }

    console.log(`[email] Sent "${subject}" to ${to} (id: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[email] Failed to send email:', err);
    return { success: false, error: err.message };
  }
}
