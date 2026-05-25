'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowLeft, Mail, Sparkles } from 'lucide-react';
import AuthPageShell from '@/components/AuthPageShell';

function UnsubInner() {
  const params = useSearchParams();
  const ok = params.get('ok') === '1';
  const already = params.get('already') === '1';
  const email = params.get('email');
  const reason = params.get('reason');

  return (
    <AuthPageShell contentWidth="max-w-lg">
      <div className="rounded-2xl border border-line bg-surface-elevated/40 backdrop-blur-xl p-8 sm:p-10 text-center">
        {ok ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              {already ? 'Déjà désinscrit' : 'Désinscription confirmée'}
            </h1>
            <p className="text-sm text-content-secondary leading-relaxed mb-6 max-w-md mx-auto">
              {already
                ? 'Vous n\'étiez déjà plus dans notre liste de diffusion. Aucune autre action requise.'
                : 'Vous ne recevrez plus la newsletter mensuelle de Volia. Vos données ne sont pas supprimées (vous pouvez vous réinscrire à tout moment).'}
            </p>
            {email && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated/60 border border-line text-xs text-content-secondary mb-6">
                <Mail size={11} className="text-content-secondary" />
                {email}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20">
                <ArrowLeft size={14} />
                Retour à l&apos;accueil
              </Link>
              <Link href="/newsletter" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-surface-elevated/60 text-content-secondary hover:text-content-primary text-sm font-semibold transition">
                <Sparkles size={14} />
                Se réinscrire
              </Link>
            </div>

            {/* Encart feedback (toujours utile) */}
            <div className="mt-8 pt-6 border-t border-line">
              <p className="text-xs text-content-tertiary leading-relaxed">
                Une raison particulière de partir ?<br />
                <a href="mailto:hello@volia.fr?subject=Feedback newsletter" className="text-violet-300 hover:text-violet-200 transition underline underline-offset-2">
                  Dites-le nous en 1 ligne
                </a> — on s&apos;améliore grâce à vos retours.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mb-5">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">Désinscription échouée</h1>
            <p className="text-sm text-content-secondary leading-relaxed mb-4 max-w-md mx-auto">
              Le lien de désinscription n&apos;est pas valide ou a expiré.
            </p>
            {reason && (
              <p className="inline-block px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 mb-6 font-mono">
                Code : {reason}
              </p>
            )}
            <p className="text-xs text-content-tertiary mb-5">
              Contactez <a href="mailto:hello@volia.fr" className="text-violet-300 hover:text-violet-200 transition underline">hello@volia.fr</a> pour vous désinscrire manuellement (réponse sous 24h).
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-surface-elevated/60 text-content-secondary hover:text-content-primary text-sm font-semibold transition">
              <ArrowLeft size={14} />
              Retour à l&apos;accueil
            </Link>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}

export default function NewsletterDesabonnementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-base" />}>
      <UnsubInner />
    </Suspense>
  );
}
