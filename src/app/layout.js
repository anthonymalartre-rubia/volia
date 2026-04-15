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
  metadataBase: new URL('https://scraping-dom-ezdrive.vercel.app'),
  title: {
    default: 'Prospectia.ai — Trouvez l\'email de n\'importe quelle entreprise en France',
    template: '%s | Prospectia.ai',
  },
  description: 'Prospection B2B automatisée : scraping intelligent + recherche Google. 150+ catégories, 101 départements, scoring de confiance, export CSV et Zoho CRM. À partir de 49€/mois.',
  keywords: ['prospection B2B', 'enrichissement email', 'scraping email', 'leads B2B France', 'Google Places', 'export CSV', 'Zoho CRM', 'email professionnel'],
  authors: [{ name: 'Prospectia.ai' }],
  creator: 'Prospectia.ai',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Prospectia.ai',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              if (t === 'light') document.documentElement.classList.add('light');
            } catch(e) {}
          })();
        `}} />
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
