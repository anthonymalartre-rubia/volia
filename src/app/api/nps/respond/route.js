// /api/nps/respond — Wave 2.4 — landing token signed depuis email NPS
import { NextResponse } from 'next/server';
import { verifyNpsToken, recordNpsResponse } from '@/lib/nps-auto';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return htmlResponse('Token manquant.', 400);
  }
  const verif = verifyNpsToken(token);
  if (!verif.valid) {
    return htmlResponse(`Lien invalide ou expiré (${verif.error}).`, 400);
  }

  const result = await recordNpsResponse({ userId: verif.userId, score: verif.score });

  if (!result.ok) {
    return htmlResponse('Erreur enregistrement. Réessaye plus tard.', 500);
  }

  const wasAlready = result.already_responded;
  return htmlResponse(
    wasAlready
      ? `Tu as déjà répondu (score ${result.recorded_score}). Merci !`
      : `Merci pour ton ${verif.score}/10 ! Ta réponse est enregistrée. ${verif.score >= 7 ? '🎉' : ''}`,
    200,
    verif.score,
  );
}

function htmlResponse(message, status = 200, score = null) {
  const color = score === null ? '#374151' : score >= 9 ? '#10b981' : score >= 7 ? '#f59e0b' : '#ef4444';
  const emoji = score === null ? '' : score >= 9 ? '🎉' : score >= 7 ? '👍' : '🙏';
  return new Response(
    `<!DOCTYPE html>
<html><head><title>Volia — NPS</title><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;max-width:480px;margin:60px auto;padding:24px;text-align:center;">
  ${score !== null ? `<div style="font-size:64px;font-weight:900;color:${color};margin-bottom:16px;">${score}/10 ${emoji}</div>` : ''}
  <p style="font-size:16px;color:#374151;line-height:1.6;">${message}</p>
  <p style="font-size:13px;color:#9ca3af;margin-top:32px;">
    <a href="https://volia.fr/dashboard" style="color:#6366f1;text-decoration:none;font-weight:600;">← Retour au dashboard Volia</a>
  </p>
</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
