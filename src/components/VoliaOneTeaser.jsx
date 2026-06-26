'use client';

// ─────────────────────────────────────────────────────────────────────
// VoliaOneTeaser — section landing "entre ton domaine → vois tes prospects"
// ─────────────────────────────────────────────────────────────────────
// Volontairement SANS fetch ici : on route vers /one?domain=… (qui lance
// l'analyse, rate-limitée). Aucun appel d'API payant déclenché depuis la
// landing → pas de coût sur un crawler ou un scroll de bot.
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import MotionInView from '@/components/MotionInView';

export default function VoliaOneTeaser() {
  const { t } = useI18n();
  const router = useRouter();
  const [domain, setDomain] = useState('');

  function go() {
    const d = domain.trim();
    router.push(d ? `/one?domain=${encodeURIComponent(d)}` : '/one');
  }

  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 border-t border-line overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/40 to-white pointer-events-none" />
      <MotionInView className="max-w-3xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold mb-4">
          <Sparkles size={12} />
          {t('landing.voliaOne.label')}
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-content-primary mb-3">
          {t('landing.voliaOne.title')}
        </h2>
        <p className="text-content-secondary text-base sm:text-lg max-w-2xl mx-auto mb-7">
          {t('landing.voliaOne.desc')}
        </p>

        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-tertiary pointer-events-none" />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
              placeholder={t('landing.voliaOne.placeholder')}
              aria-label={t('landing.voliaOne.placeholder')}
              className="w-full rounded-xl border border-line bg-surface-card pl-10 pr-4 py-3 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={go}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 transition-colors whitespace-nowrap"
          >
            {t('landing.voliaOne.button')}
            <ArrowRight size={16} />
          </button>
        </div>
        <p className="text-xs text-content-tertiary mt-3">
          {t('landing.voliaOne.label')} · {t('landing.cta.sub')}
        </p>
      </MotionInView>
    </section>
  );
}
