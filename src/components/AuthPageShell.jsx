// Shell visuel réutilisable pour les pages auth + RGPD + désabonnement.
// Apporte un fond cohérent (gradient blobs + grid pattern) + nav + footer.
// Le contenu central reçoit children, généralement un <div> card-style.

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LogoIcon } from '@/components/ui';

export default function AuthPageShell({
  children,
  backHref = '/',
  backLabel = 'Volia',
  showSignupCta = true,
  contentWidth = 'max-w-md', // 'max-w-md' | 'max-w-lg' | 'max-w-2xl' | 'max-w-3xl'
}) {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary overflow-hidden">
      {/* Background blobs animés (cohérent avec /parrainage, /newsletter) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top nav minimaliste */}
      <nav className="fixed top-0 w-full z-50 bg-surface-base/70 backdrop-blur-2xl border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={backHref} className="flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition">
            <ArrowLeft size={14} />
            {backLabel}
          </Link>
          <Link href="/" className="flex items-center gap-1">
            <LogoIcon size="sm" className="mr-1.5" />
            <span className="text-lg font-bold tracking-tight">Volia</span>
            <span className="text-violet-400 text-xs font-semibold">.fr</span>
          </Link>
          {showSignupCta ? (
            <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition">
              Essayer gratuit
            </Link>
          ) : (
            <div className="w-[100px]" /> /* spacer pour équilibrer la nav */
          )}
        </div>
      </nav>

      <main className={`relative pt-24 pb-16 px-4 sm:px-6 min-h-[calc(100vh-4rem)] flex items-center justify-center`}>
        <div className={`w-full ${contentWidth}`}>
          {children}
        </div>
      </main>

      <footer className="border-t border-line py-6 bg-surface-base/50 backdrop-blur-xl relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-content-tertiary">
          <span>© 2026 Volia.fr — Prospection B2B France · Belgique · Suisse</span>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-content-secondary transition">CGU</Link>
            <Link href="/confidentialite" className="hover:text-content-secondary transition">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-content-secondary transition">RGPD</Link>
            <Link href="/status" className="hover:text-content-secondary transition">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
