// ─────────────────────────────────────────────────────────────────────
// /api/cron/health-canary — sonde uptime (toutes les 10 min, cf. vercel.json)
// ─────────────────────────────────────────────────────────────────────
// Ping les pages critiques en prod (/, /login, /pricing). Si l'une renvoie un
// 5xx ou time out → alerte e-mail ops. Complète :
//   - le smoke Playwright CI (crash client AVANT deploy)
//   - l'alerte /api/report-error (crash client EN prod)
// Ici : panne infra (deploy cassé, fonction down, domaine KO) APRÈS deploy.
//
// Sécurité : Bearer CRON_SECRET (header Vercel cron).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PATHS = ['/', '/login', '/pricing'];

async function probe(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'Volia-HealthCanary/1.0' },
      cache: 'no-store',
    });
    clearTimeout(t);
    // 5xx = panne. 2xx/3xx/4xx = up (307 login redirect, 401, etc. sont OK).
    return { url, status: res.status, ok: res.status < 500 };
  } catch (err) {
    clearTimeout(t);
    return { url, status: 0, ok: false, error: err.name === 'AbortError' ? 'timeout' : (err.message || 'fetch_error') };
  }
}

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || 'https://volia.fr';
  const results = await Promise.all(PATHS.map((p) => probe(`${base}${p}`)));
  const down = results.filter((r) => !r.ok);

  if (down.length > 0) {
    const to = cleanEnv(process.env.OPS_ALERT_EMAIL) || 'anthony.malartre@suraya.fr';
    try {
      await sendEmail({
        to,
        subject: `🔴 Volia DOWN — ${down.map((d) => d.url.replace(base, '') || '/').join(', ')}`,
        html: `<h2>Sonde uptime : page(s) en échec</h2>
<ul>${results.map((r) => `<li>${r.url} → <strong>${r.ok ? 'OK' : 'KO'}</strong> (status ${r.status}${r.error ? `, ${r.error}` : ''})</li>`).join('')}</ul>
<p style="color:#71717a;font-size:12px">Sonde toutes les 10 min. Vérifie le dernier déploiement Vercel.</p>`,
        tags: [{ name: 'type', value: 'uptime_alert' }],
      });
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({
    ok: down.length === 0,
    checked: results.length,
    down: down.length,
    results,
  });
}
