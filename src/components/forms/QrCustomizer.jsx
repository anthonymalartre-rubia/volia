'use client';

// ─────────────────────────────────────────────────────────────────────
// QrCustomizer — preview LIVE + customization du QR code (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// Génère le QR côté client via `qrcode` lib (déjà installée). Permet :
//   - 3 tailles (256 / 512 / 1024)
//   - couleur fond + couleur premier plan
//   - error correction level (L/M/Q/H)
//   - Téléchargement PNG (canvas.toDataURL)
//   - Téléchargement SVG (qrcode.toString({type:'svg'}))
//
// Pas de dépendance externe ajoutée. Le PDF n'est pas généré (lib non
// dispo) — on note pour V2 dans le commentaire.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, FileImage, FileCode2, RefreshCcw } from 'lucide-react';

const SIZES = [
  { value: 256,  label: 'Petit (256)' },
  { value: 512,  label: 'Moyen (512)' },
  { value: 1024, label: 'Grand (1024)' },
];

const ERROR_LEVELS = [
  { value: 'L', label: 'L · Bas (~7 %)' },
  { value: 'M', label: 'M · Moyen (~15 %)' },
  { value: 'Q', label: 'Q · Quartile (~25 %)' },
  { value: 'H', label: 'H · Haut (~30 %)' },
];

export default function QrCustomizer({ url, slug }) {
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [level, setLevel] = useState('M');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Re-rendu canvas à chaque changement
  useEffect(() => {
    if (!canvasRef.current || !url) return;
    let cancelled = false;
    setGenerating(true);
    setError(null);
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: fgColor, light: bgColor },
    })
      .then(() => {
        if (!cancelled) setGenerating(false);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message || 'Génération impossible');
          setGenerating(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url, size, fgColor, bgColor, level]);

  async function downloadPng() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${slug}-${size}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadSvg() {
    try {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: level,
        color: { dark: fgColor, light: bgColor },
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `qrcode-${slug}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError(e.message || 'Génération SVG impossible');
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Preview */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-elevated border border-line">
        <div
          className="rounded-xl overflow-hidden border border-line bg-white shadow-sm"
          style={{ padding: 8 }}
        >
          <canvas
            ref={canvasRef}
            // affichage visuel max 240px peu importe la taille réelle
            style={{ width: 220, height: 220, display: 'block' }}
            aria-label="Aperçu QR code"
          />
        </div>
        <p className="mt-3 text-[11px] text-content-faint">
          Aperçu live · taille réelle {size}×{size} px
        </p>
        {generating && (
          <p className="mt-1 text-[11px] text-content-tertiary inline-flex items-center gap-1">
            <RefreshCcw size={10} className="animate-spin" /> Génération…
          </p>
        )}
        {error && (
          <p className="mt-1 text-[11px] text-rose-600">{error}</p>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-content-tertiary mb-1.5">
            Taille
          </label>
          <select
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary focus:outline-none focus:border-pink-500"
          >
            {SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-content-tertiary mb-1.5">
            Niveau de correction
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary focus:outline-none focus:border-pink-500"
          >
            {ERROR_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ColorInput label="Couleur QR" value={fgColor} onChange={setFgColor} />
          <ColorInput label="Couleur fond" value={bgColor} onChange={setBgColor} />
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition-colors"
          >
            <FileImage size={12} /> PNG
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface-base hover:bg-surface-elevated text-xs font-medium text-content-primary transition-colors"
          >
            <FileCode2 size={12} /> SVG
          </button>
          {/* PDF skip : aucune lib pdfkit/jspdf dispo. À ajouter en V2 si besoin. */}
          <a
            href={`/api/app/formulaires/${slug ? '__slug__' : ''}/qr`.replace('__slug__', '') || '#'}
            // Le download serveur via /api/app/formulaires/[id]/qr reste dispo pour compat
            className="hidden"
          >
            <Download size={12} />
          </a>
        </div>
        <p className="text-[11px] text-content-faint">
          Astuce : utilisez SVG pour l&apos;impression haute qualité (vectoriel),
          PNG pour le web. Le niveau H permet d&apos;ajouter un logo au centre
          sans casser la lecture (édition manuelle).
        </p>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-content-tertiary mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-line bg-surface-elevated cursor-pointer p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9A-F]{0,6}$/i.test(v)) onChange(v);
          }}
          className="flex-1 px-3 py-2 rounded-lg bg-surface-elevated border border-line text-xs font-mono text-content-primary focus:outline-none focus:border-pink-500"
          maxLength={7}
        />
      </div>
    </div>
  );
}
