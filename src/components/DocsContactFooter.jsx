// ─────────────────────────────────────────────────────────────────────
// DocsContactFooter — bloc "Vous ne trouvez pas votre réponse ?"
// ─────────────────────────────────────────────────────────────────────
// Affiché en fin de chaque page docs (hub + article). CTA Cal.com pour
// les comptes Pro/Business + email support@volia.fr pour tous.
// Server component pur (pas de state).
// ─────────────────────────────────────────────────────────────────────

import { Calendar, Mail, MessageCircle } from 'lucide-react';

export default function DocsContactFooter() {
  return (
    <section className="mt-16 rounded-2xl border border-line bg-surface-card p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400">
          <MessageCircle size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-content-primary mb-1">
            Tu ne trouves pas ta réponse&nbsp;?
          </h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Écris-nous. On répond en moins de 24 h ouvrées (4 h sur Pro / Business).
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <a
          href="mailto:support@volia.fr"
          className="flex items-center gap-3 p-4 rounded-xl border border-line bg-surface-base hover:border-violet-500/40 hover:bg-surface-elevated transition group"
        >
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400 group-hover:bg-violet-500/20 transition">
            <Mail size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-content-primary">Email support</p>
            <p className="text-xs text-content-muted truncate">support@volia.fr</p>
          </div>
        </a>

        <a
          href="https://calendar.app.google/AN4reEL1poDB6KmW8"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-line bg-surface-base hover:border-violet-500/40 hover:bg-surface-elevated transition group"
        >
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400 group-hover:bg-violet-500/20 transition">
            <Calendar size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-content-primary">Réserver un call (15 min)</p>
            <p className="text-xs text-content-muted truncate">Pro &amp; Business</p>
          </div>
        </a>
      </div>
    </section>
  );
}
