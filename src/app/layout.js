import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import CookieConsent from '@/components/CookieConsent';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://prospectia.cloud'),
  title: {
    default: 'Prospectia — Prospection B2B France : trouvez emails & entreprises (à partir de 19 €/mois)',
    template: '%s | Prospectia',
  },
  description: 'Le ticket d\'entrée le moins cher du marché français. Découverte d\'entreprises via Google Places (150+ catégories, 101 départements) + enrichissement email automatique. À partir de 19 €/mois.',
  keywords: ['prospection B2B', 'enrichissement email', 'scraping email', 'leads B2B France', 'Google Places', 'export CSV', 'email professionnel', 'outil prospection pas cher', 'alternative Apollo France', 'prospection RGPD'],
  authors: [{ name: 'Prospectia' }],
  creator: 'Prospectia',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Prospectia',
  },
  twitter: {
    card: 'summary_large_image',
  },
  // Apple touch icon mention (en plus de src/app/apple-icon.svg auto-géré)
  appleWebApp: {
    title: 'Prospectia',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Global Schema.org Organization — appliqué partout
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Prospectia',
  alternateName: ['Prospectia.ai', 'Prospectia.cloud'],
  url: 'https://prospectia.cloud',
  logo: 'https://prospectia.cloud/icon.svg',
  description: 'Plateforme française de prospection B2B automatisée. Recherche d\'entreprises via Google Places + enrichissement email en cascade. Le ticket d\'entrée le moins cher du marché français à 19 €/mois.',
  sameAs: [],
  founder: {
    '@type': 'Person',
    name: 'Anthony Malartre',
  },
  foundingDate: '2025',
  knowsAbout: [
    'Prospection B2B',
    'Email finding',
    'Lead generation',
    'Sales intelligence',
    'RGPD',
    'Outbound marketing',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'contact@prospectia.cloud',
    availableLanguage: ['French', 'English'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Prospectia',
  url: 'https://prospectia.cloud',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://prospectia.cloud/prospection?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

// Viewport + theme-color (Next.js 14 metadata convention).
// Adapté pour mobile + dark mode default.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#08080c' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect aux domaines tiers présents sur quasi toutes les pages.
            Note: Stripe (js.stripe.com, api.stripe.com) déplacé sur /settings
            uniquement — ça ne sert à rien sur la landing et ça gaspille une
            connexion qui retarde le LCP mobile. */}
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        {/* DNS-prefetch Supabase (auth + queries client une fois loggé) */}
        <link rel="dns-prefetch" href="https://kqrarrrojdtxijkhejhg.supabase.co" />

        {/* Prevent flash of wrong theme — default = light */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              var useLight = t === 'light' || (!t && !prefersDark);
              if (useLight) document.documentElement.classList.add('light');
            } catch(e) {
              document.documentElement.classList.add('light');
            }
          })();
        `}} />
        {/* Global Organization + WebSite schemas */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="bg-surface-base min-h-screen antialiased">
        <ThemeProvider>
          <I18nProvider>
            {children}
            <CookieConsent />
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
