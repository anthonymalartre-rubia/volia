'use client';

// ─────────────────────────────────────────────────────────────────────
// PublishedModal — Modale "Formulaire publié" affichée après publish (P1-6)
// ─────────────────────────────────────────────────────────────────────
// Affiche : URL publique + bouton copier · QR code (via /api/app/formulaires/[id]/qr)
// · code embed iframe + bouton copier · CTA "Voir le formulaire".
// Pattern Tally/Typeform : on retient l'utilisateur dans le contexte builder.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Code2, Sparkles, Download } from 'lucide-react';

export default function PublishedModal({ open, formId, slug, onClose }) {
  const [copied, setCopied] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !slug) return null;

  const publicUrl = `${baseUrl}/f/${slug}`;
  const embedCode = `<iframe src="${publicUrl}?embed=true" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`;
  const qrSrc = `/api/app/formulaires/${formId}/qr`;

  function copy(text, key) {
    try {
      navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Best effort, do nothing on failure
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="published-modal-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        aria-label="Fermer"
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-base rounded-2xl shadow-2xl border border-line">
        {/* Header */}
        <div className="relative px-6 pt-7 pb-5 text-center bg-gradient-to-b from-pink-50/70 to-transparent border-b border-line">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-md text-content-faint hover:bg-surface-card hover:text-content-primary transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 mb-3">
            <Sparkles size={22} />
          </div>
          <h2
            id="published-modal-title"
            className="text-xl font-bold text-content-primary"
          >
            Formulaire publié !
          </h2>
          <p className="mt-1 text-sm text-content-tertiary">
            Ton formulaire est en ligne. Partage-le ou intègre-le où tu veux.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* URL publique */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted mb-1.5">
              URL publique
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-card border border-line text-sm text-content-primary font-mono"
              />
              <button
                type="button"
                onClick={() => copy(publicUrl, 'url')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors"
              >
                {copied === 'url' ? <Check size={13} /> : <Copy size={13} />}
                {copied === 'url' ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted mb-1.5 flex items-center gap-1">
              <QrCode size={11} /> QR Code
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code du formulaire"
                width={96}
                height={96}
                className="w-24 h-24 rounded-md bg-white border border-line"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-content-primary font-medium">
                  Scannable depuis n&apos;importe quel smartphone.
                </p>
                <p className="mt-1 text-[11px] text-content-tertiary">
                  Idéal pour flyers, vitrines, salons.
                </p>
                <a
                  href={qrSrc}
                  download={`qrcode-${slug}.png`}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-pink-700 hover:text-pink-800 font-medium"
                >
                  <Download size={11} /> Télécharger PNG
                </a>
              </div>
            </div>
          </div>

          {/* Code embed */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-muted mb-1.5 flex items-center gap-1">
              <Code2 size={11} /> Code embed iframe
            </label>
            <div className="flex items-start gap-2">
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-card border border-line text-[11px] text-content-primary font-mono resize-none"
              />
              <button
                type="button"
                onClick={() => copy(embedCode, 'embed')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                {copied === 'embed' ? <Check size={13} /> : <Copy size={13} />}
                {copied === 'embed' ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-line bg-surface-card/50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-card border border-line hover:bg-surface-elevated text-xs font-medium text-content-primary transition-colors"
          >
            Fermer
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <ExternalLink size={12} /> Voir le formulaire
          </a>
        </div>
      </div>
    </div>
  );
}
