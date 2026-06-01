// /api/demo-bot/chat — Sprint Revenue Engine Phase 4
// Endpoint public (pas d'auth requise) pour le chat pre-sales.
// Rate limit : 20 msg / 30 min / session + 500 msg / day global.

import { NextResponse } from 'next/server';
import { sendDemoBotMessage } from '@/lib/demo-bot';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, message, pageUrl } = body;

    // Récupère IP via headers (Vercel proxy)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || null;

    const result = await sendDemoBotMessage({
      sessionId,
      message,
      pageUrl,
      userAgent,
      ip,
    });

    const { status, ...payload } = result;
    return NextResponse.json(payload, { status: status || 200 });
  } catch (err) {
    console.error('[demo-bot/chat] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message },
      { status: 500 }
    );
  }
}
