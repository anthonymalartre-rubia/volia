'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

export default function EtudeCopyCitation({ studyUrl, publishedAt, studyTitle }) {
  const [copied, setCopied] = useState(null);

  const year = publishedAt ? publishedAt.slice(0, 4) : '2026';
  // Titre par défaut pour rétro-compatibilité avec l'étude prospection
  const title = studyTitle || `L'État de la Prospection B2B en France ${year}`;
  const apa = `Malartre, A. (${year}). ${title}. Volia. ${studyUrl}`;
  const html = `<p>Source : <a href="${studyUrl}">${title}</a> — Volia (${year})</p>`;
  const markdown = `[${title}](${studyUrl}) — Volia (${year})`;

  const handleCopy = async (text, label) => {
    if (!(await copyToClipboard(text))) return; // pas de « Copié » si rien n'a été copié
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const items = [
    { label: 'APA', value: apa, hint: 'Format académique standard' },
    { label: 'HTML', value: html, hint: 'Pour blog ou article web' },
    { label: 'Markdown', value: markdown, hint: 'Pour Notion, GitHub, README' },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-line bg-surface-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated/60 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">{item.label}</span>
              <span className="text-xs text-content-tertiary">— {item.hint}</span>
            </div>
            <button
              onClick={() => handleCopy(item.value, item.label)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200 transition px-2 py-1 rounded-md hover:bg-violet-500/10"
              aria-label={`Copier la citation ${item.label}`}
            >
              {copied === item.label ? (
                <>
                  <Check size={12} />
                  Copié
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copier
                </>
              )}
            </button>
          </div>
          <pre className="text-xs sm:text-[13px] text-content-secondary font-mono whitespace-pre-wrap break-words p-4 overflow-x-auto">
            {item.value}
          </pre>
        </div>
      ))}
    </div>
  );
}
