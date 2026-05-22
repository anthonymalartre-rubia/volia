/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses (gzip/brotli)
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Security + caching headers
  async headers() {
    // Content-Security-Policy (P2 audit) :
    // - 'unsafe-inline' sur style/script reste requis tant qu'on utilise
    //   Tailwind JIT runtime + Next.js inline scripts d'hydratation.
    // - On whitelist explicitement les domaines tiers utilisés :
    //   Supabase (auth + REST), Stripe (checkout iframe), Resend (rien
    //   côté front), Google Fonts, Vercel Analytics, Vercel Insights.
    // - img-src 'self' data: blob: https: pour les OG images, avatars,
    //   et tout fetch d'image externe (Google Places, etc.).
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(js|css|woff2|woff|ttf|ico|png|jpg|jpeg|svg|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Reduce bundle: don't include server-only packages in client
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Inline critical CSS dans le <head> (économise ~600ms de blocage rendu sur mobile).
    // Powered by Critters — supprime le round-trip réseau sur le CSS critique.
    optimizeCss: true,
  },

  // Redirections gérées nativement dans Vercel :
  // - getprospectia.com → prospectia.cloud (configuré côté Vercel)
  // - scraping-dom-ezdrive.vercel.app → prospectia.cloud (à configurer)
  // - www.prospectia.cloud → prospectia.cloud (à configurer)
};

module.exports = nextConfig;
