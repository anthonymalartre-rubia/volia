'use client';

// ─────────────────────────────────────────────────────────────────────
// CrispChat — widget de live chat in-app (crisp.chat)
// ─────────────────────────────────────────────────────────────────────
// - Chargé en `lazyOnload` (non bloquant pour le TTI)
// - Activé uniquement sur les pages logged-in (via AppShell)
// - Gated par le consentement cookies (catégorie "marketing")
// - Auto-identification du user (email + plan + team_id)
// - Graceful degradation si NEXT_PUBLIC_CRISP_WEBSITE_ID manquant
//
// Le composant peut être monté en permanence : il ne fait rien si :
//   1. La variable d'env n'est pas définie, OU
//   2. `enabled` est explicitement false, OU
//   3. Le consentement marketing n'a pas été donné.
// ─────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '@/lib/cookieConsent';

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

export default function CrispChat({ user, plan = null, enabled = true }) {
  const { hasConsent, hydrated } = useCookieConsent();
  const marketingAllowed = hydrated && hasConsent('marketing');
  const active = Boolean(CRISP_WEBSITE_ID) && enabled && marketingAllowed;

  // Auto-identification dès que le user / plan change.
  // Les commandes sont bufferisées par Crisp (queue `$crisp`) même si
  // le script n'est pas encore chargé — pas besoin d'attendre.
  useEffect(() => {
    if (!active) return;
    if (typeof window === 'undefined') return;

    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    if (user?.email) {
      window.$crisp.push(['set', 'user:email', [user.email]]);
      window.$crisp.push([
        'set',
        'user:nickname',
        [user.user_metadata?.full_name || user.email.split('@')[0]],
      ]);
    }

    // Custom data visible côté agent : plan, date inscription, team
    const sessionData = [];
    if (plan) sessionData.push(['plan', String(plan)]);
    if (user?.created_at) sessionData.push(['created_at', String(user.created_at)]);
    if (user?.user_metadata?.team_id) {
      sessionData.push(['team_id', String(user.user_metadata.team_id)]);
    }
    if (user?.id) sessionData.push(['user_id', String(user.id)]);
    if (sessionData.length > 0) {
      window.$crisp.push(['set', 'session:data', [sessionData]]);
    }
  }, [active, user?.email, user?.id, user?.created_at, user?.user_metadata?.team_id, user?.user_metadata?.full_name, plan]);

  if (!active) return null;

  return (
    <Script
      id="crisp-loader"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp = window.$crisp || [];
          window.CRISP_WEBSITE_ID = "${CRISP_WEBSITE_ID}";
          (function() {
            var d = document; var s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js"; s.async = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  );
}
