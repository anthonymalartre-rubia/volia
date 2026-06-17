'use client';

// ─────────────────────────────────────────────────────────────────────
// MarketingPixels — GA4 (gtag) + Meta Pixel (fbq), gated consentement
// ─────────────────────────────────────────────────────────────────────
// Même pattern que LinkedInInsight : chargé en lazyOnload, UNIQUEMENT après
// consentement cookies « marketing » (RGPD/CNIL), et no-op tant que les IDs
// ne sont pas fournis → safe à déployer avant d'avoir créé les comptes.
//
// À renseigner sur Vercel (Production) quand les comptes pub sont prêts :
//   NEXT_PUBLIC_GA_ID         = "G-XXXXXXXXXX"   (GA4 Measurement ID)
//   NEXT_PUBLIC_META_PIXEL_ID = "1234567890..."  (Meta Pixel ID, numérique)
//
// Les ÉVÉNEMENTS de conversion (signup, purchase) sont émis depuis
// @/lib/track (trackSignup / trackPurchase). Ici on ne fait que charger
// les libs + un PageView de base.
// ─────────────────────────────────────────────────────────────────────

import Script from 'next/script';
import { useCookieConsent } from '@/lib/cookieConsent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MarketingPixels() {
  const { hasConsent, hydrated } = useCookieConsent();
  // Rien tant que pas hydraté ou pas de consentement marketing.
  if (!hydrated || !hasConsent('marketing')) return null;
  if (!GA_ID && !META_PIXEL_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            id="ga4-src"
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script
            id="ga4-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `,
            }}
          />
        </>
      )}

      {META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}
