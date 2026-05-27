'use client';

// ─────────────────────────────────────────────────────────────────────
// ImportContactsModal — import CSV de contacts (Quick win #6 CRM).
// ─────────────────────────────────────────────────────────────────────
// Version simplifiée (MVP) :
//   - File input → parse CSV côté client (séparateur , ou ;)
//   - Détection auto colonnes : email (required), nom (optional),
//     entreprise (optional), téléphone (optional), poste (optional)
//   - Aperçu des 3 premières lignes mappées + count total
//   - POST batch /api/crm/contacts/bulk-import (route déjà existante)
//   - Mode 'skip' par défaut (ignore doublons par email)
//
// Limitations MVP :
//   - Pas de mapping manuel (auto-détection seulement)
//   - Pas de gestion fichiers > 1000 lignes (batch max API)
//   - Pas de support Excel (.xlsx) — CSV uniquement
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  X,
  Loader2,
  Upload,
  FileText,
  AlertCircle,
  Check,
  Download,
} from 'lucide-react';

const MAX_ROWS = 1000;

// Heuristique : détecte le séparateur (, ou ;) sur la 1ère ligne.
function detectSeparator(firstLine) {
  const commas = (firstLine.match(/,/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  return semis > commas ? ';' : ',';
}

// Split CSV simple : supporte champs entre guillemets doubles
// (les "" internes deviennent "). Pas de support de retours à la ligne
// inside les fields (suffisant pour CSV "normaux").
function splitCsvLine(line, sep) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === sep) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Mapping heuristique d'un nom de colonne CSV vers un champ contact.
// Renvoie null si non reconnu.
function detectField(rawHeader) {
  const h = rawHeader.trim().toLowerCase();
  if (!h) return null;
  if (/(^|[\s_-])email([\s_-]|$)|courriel|e[-_]?mail/.test(h)) return 'email';
  if (/(^|[\s_-])nom([\s_-]|$)|name|prenom|fullname|full[-_ ]?name/.test(h)) return 'name';
  if (/(^|[\s_-])(company|entreprise|société|societe|organisation|organization)([\s_-]|$)/.test(h)) return 'company';
  if (/(^|[\s_-])(phone|tel|téléphone|telephone|mobile|portable)([\s_-]|$)/.test(h)) return 'phone';
  if (/(^|[\s_-])(position|poste|titre|title|role|fonction|job)([\s_-]|$)/.test(h)) return 'position';
  return null;
}

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function ImportContactsModal({ open, onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  // [{ name, email, phone, company, position }]
  const [rows, setRows] = useState([]);
  // { name: 'Nom complet', email: 'Email', ...} mapping headers -> field
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { created, skipped, updated, invalid }
  const [importError, setImportError] = useState('');

  useEffect(() => {
    if (open) {
      setFileName('');
      setRows([]);
      setMapping({});
      setParseError('');
      setImportError('');
      setResult(null);
      setParsing(false);
      setImporting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape' && !importing) onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, importing, onClose]);

  if (!open) return null;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setParseError('');
    setRows([]);
    setMapping({});
    setResult(null);

    try {
      const text = await file.text();
      // Normalise les fins de ligne CRLF / LF
      const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        throw new Error('Fichier vide.');
      }
      const sep = detectSeparator(lines[0]);
      const headers = splitCsvLine(lines[0], sep);
      const mapped = {};
      headers.forEach((h, idx) => {
        const f = detectField(h);
        if (f && !Object.values(mapped).includes(f)) {
          mapped[idx] = f;
        }
      });
      // L'email est requis : on alerte si pas trouvé
      const emailColIdx = Object.entries(mapped).find(([, f]) => f === 'email')?.[0];
      if (emailColIdx === undefined) {
        throw new Error(
          'Aucune colonne "email" détectée. Renomme la colonne email dans ton CSV puis réessaie.'
        );
      }

      const dataLines = lines.slice(1, MAX_ROWS + 1);
      const parsed = [];
      for (const line of dataLines) {
        const cells = splitCsvLine(line, sep);
        const obj = {};
        Object.entries(mapped).forEach(([idx, field]) => {
          const val = cells[Number(idx)];
          if (val !== undefined) obj[field] = val.trim();
        });
        // L'email est requis pour qu'on garde la ligne
        if (obj.email && isValidEmail(obj.email)) {
          // Fallback : si nom absent mais email présent, on prend la partie locale
          if (!obj.name) {
            obj.name = obj.email.split('@')[0];
          }
          parsed.push(obj);
        }
      }

      if (parsed.length === 0) {
        throw new Error(
          'Aucune ligne valide trouvée (vérifie qu\'au moins une ligne contient un email valide).'
        );
      }

      setRows(parsed);
      setMapping(mapped);
    } catch (err) {
      console.error('[ImportContactsModal] parse error', err);
      setParseError(err.message || 'Erreur de lecture du CSV');
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (importing || rows.length === 0) return;
    setImporting(true);
    setImportError('');
    setResult(null);
    try {
      const res = await fetch('/api/crm/contacts/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: rows,
          source: 'import',
          mode: 'skip',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur import');
      }
      setResult(data.data);
      onImported?.(data.data);
    } catch (err) {
      console.error('[ImportContactsModal] import error', err);
      setImportError(err.message || 'Erreur réseau');
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setFileName('');
    setRows([]);
    setMapping({});
    setParseError('');
    setImportError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const preview = rows.slice(0, 3);
  const detectedFields = Object.values(mapping);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !importing) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-contacts-title"
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-base border border-line shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface-base border-b border-line">
          <h2 id="import-contacts-title" className="text-lg font-bold text-content-primary inline-flex items-center gap-2">
            <Upload size={18} className="text-emerald-600" />
            Importer un CSV
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition-colors disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Étape 1 : sélection fichier */}
          {!fileName && !result && (
            <>
              <p className="text-sm text-content-secondary">
                Importe tes contacts depuis un CSV (Excel → Enregistrer sous → CSV).
              </p>
              <ul className="text-xs text-content-tertiary space-y-1 list-disc pl-4">
                <li>Séparateur <strong>,</strong> ou <strong>;</strong> (auto-détecté)</li>
                <li>Colonnes reconnues : <strong>email</strong> (requise), nom, entreprise, téléphone, poste</li>
                <li>Maximum {MAX_ROWS} lignes par import</li>
                <li>Les doublons (même email) sont ignorés</li>
              </ul>

              <label
                htmlFor="csv-file"
                className="cursor-pointer block border-2 border-dashed border-line hover:border-emerald-300 rounded-xl px-6 py-10 text-center transition-colors bg-surface-elevated/30 hover:bg-emerald-50/30"
              >
                <Upload size={32} className="mx-auto text-content-tertiary mb-2" />
                <p className="text-sm font-medium text-content-primary">
                  Clique pour choisir un fichier CSV
                </p>
                <p className="text-[11px] text-content-tertiary mt-1">
                  .csv uniquement
                </p>
                <input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </>
          )}

          {/* Loading parse */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 py-8 text-content-secondary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Lecture du fichier…</span>
            </div>
          )}

          {/* Erreur parse */}
          {parseError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-medium">
                <p>{parseError}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-1 text-rose-800 underline hover:text-rose-900"
                >
                  Choisir un autre fichier
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 : aperçu */}
          {fileName && !parsing && !parseError && rows.length > 0 && !result && (
            <>
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-line bg-surface-elevated/40">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-content-primary truncate">
                    {fileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-content-tertiary hover:text-content-primary underline"
                >
                  Changer
                </button>
              </div>

              <div className="text-xs text-content-secondary">
                <strong className="text-content-primary tabular-nums">{rows.length}</strong>{' '}
                contact{rows.length > 1 ? 's' : ''} prêt{rows.length > 1 ? 's' : ''} à importer.
                Colonnes détectées :{' '}
                <span className="text-content-tertiary">
                  {detectedFields.join(', ')}
                </span>
              </div>

              {/* Aperçu */}
              <div className="rounded-lg border border-line bg-surface-card overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-content-tertiary border-b border-line bg-surface-elevated/30">
                  Aperçu (3 premières lignes)
                </div>
                <div className="divide-y divide-line">
                  {preview.map((row, idx) => (
                    <div key={idx} className="px-3 py-2 text-xs">
                      <div className="font-semibold text-content-primary">
                        {row.name || <span className="text-content-muted italic">(nom auto depuis email)</span>}
                      </div>
                      <div className="text-content-tertiary text-[11px] mt-0.5 flex flex-wrap gap-x-2">
                        <span>{row.email}</span>
                        {row.company && <span>· {row.company}</span>}
                        {row.phone && <span>· {row.phone}</span>}
                        {row.position && <span>· {row.position}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {importError && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">{importError}</p>
                </div>
              )}
            </>
          )}

          {/* Étape 3 : résultat */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-900">
                    {result.created} contact{result.created > 1 ? 's' : ''} importé{result.created > 1 ? 's' : ''} ✓
                  </p>
                  <div className="text-[11px] text-emerald-800/80 mt-1 space-y-0.5">
                    {result.skipped > 0 && (
                      <p>{result.skipped} doublon{result.skipped > 1 ? 's' : ''} ignoré{result.skipped > 1 ? 's' : ''}</p>
                    )}
                    {result.invalid > 0 && (
                      <p>{result.invalid} ligne{result.invalid > 1 ? 's' : ''} invalide{result.invalid > 1 ? 's' : ''} (email manquant ou nom vide)</p>
                    )}
                  </div>
                </div>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold mb-1">Quelques erreurs :</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {result.errors.slice(0, 5).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 z-10 px-6 py-3 border-t border-line bg-surface-elevated/30 flex justify-end gap-2">
          {!result ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={importing}
                className="px-4 py-2 rounded-lg text-sm font-medium text-content-secondary hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || rows.length === 0 || parsing || !!parseError}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {importing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Import en cours…
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Importer {rows.length > 0 ? `${rows.length} contact${rows.length > 1 ? 's' : ''}` : ''}
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition-all"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
