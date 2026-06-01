// /api/support-bot/chat — authentifié, pour users connectés sur /dashboard, /app/*, /admin/*

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { sendSupportBotMessage } from '@/lib/support-bot';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, message, pageUrl } = body;
    const result = await sendSupportBotMessage({
      sessionId,
      message,
      pageUrl,
      userId: user.id,
    });
    const { status, ...payload } = result;
    return NextResponse.json(payload, { status: status || 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
