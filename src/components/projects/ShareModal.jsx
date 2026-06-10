'use client';

// ─────────────────────────────────────────────────────────────────────
// ShareModal — partage client + livrables d'un projet.
// 1 lien actif à la fois (copier / révoquer). Livrables : nom + upload
// fichier (Supabase Storage, path {userId}/{projectId}/...) + statut.
// ─────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { X, Link2, Copy, Check, Ban, Loader2, Plus, Upload, PackageCheck } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function ShareModal({ project, userId, onClose, onChanged }) {
  const [share, setShare] = useState(
    (project.shares || []).find((s) => !s.revoked_at) || null
  );
  const [deliverables, setDeliverables] = useState(project.deliverables || []);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const shareUrl = share ? `https://volia.fr/p/${share.token}` : null;

  async function createLink() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/shares`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setShare(json.data);
        onChanged?.();
      }
    } finally {
      setBusy(false);
    }
  }

  async function revokeLink() {
    if (!confirm('Révoquer le lien ? Le client ne pourra plus accéder au suivi.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/shares`, { method: 'DELETE' });
      if (res.ok) {
        setShare(null);
        onChanged?.();
      }
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function addDeliverable() {
    const name = newName.trim();
    if (!name) return;
    setNewName('');
    const res = await fetch(`/api/projects/${project.id}/deliverables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.success) {
      setDeliverables((d) => [...d, json.data]);
      onChanged?.();
    }
  }

  function pickFile(deliverableId) {
    uploadTargetRef.current = deliverableId;
    fileInputRef.current?.click();
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    const deliverableId = uploadTargetRef.current;
    e.target.value = '';
    if (!file || !deliverableId || !userId) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('Fichier trop lourd (max 25 Mo).');
      return;
    }
    setUploadingId(deliverableId);
    try {
      // Upload direct Storage (policy : dossier racine = auth.uid()).
      const supabase = getSupabase();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
      const path = `${userId}/${project.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from('project-files')
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      // Lie le fichier au livrable + passe en "livré".
      const res = await fetch(`/api/projects/deliverables/${deliverableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          status: 'delivered',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDeliverables((list) => list.map((d) => (d.id === deliverableId ? json.data : d)));
        onChanged?.();
      }
    } catch (err) {
      alert(`Upload impossible : ${err.message || 'erreur'}`);
    } finally {
      setUploadingId(null);
    }
  }

  async function toggleDelivered(d) {
    const next = d.status === 'delivered' ? 'pending' : 'delivered';
    const res = await fetch(`/api/projects/deliverables/${d.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const json = await res.json();
    if (json.success) {
      setDeliverables((list) => list.map((x) => (x.id === d.id ? json.data : x)));
      onChanged?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label="Partage client et livrables"
    >
      <div className="w-full max-w-lg bg-surface-raised border border-line rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
            <Link2 size={20} className="text-amber-500" />
            Partage client
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-base text-content-tertiary"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lien de partage */}
        <div className="mb-6">
          <p className="text-sm text-content-secondary mb-3">
            Votre client suit l&apos;avancement (progression, étapes clés, livrables) via un lien
            — <strong>sans créer de compte</strong>.
          </p>
          {share ? (
            <>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface-base border border-line text-xs text-content-secondary font-mono truncate"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="p-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-400 transition-colors"
                  aria-label="Copier le lien"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={revokeLink}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium"
              >
                <Ban size={12} /> Révoquer le lien
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={createLink}
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
              Générer le lien de suivi
            </button>
          )}
        </div>

        {/* Livrables */}
        <div className="border-t border-line pt-5">
          <h3 className="text-sm font-bold text-content-primary flex items-center gap-2 mb-3">
            <PackageCheck size={16} className="text-amber-500" />
            Livrables
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDeliverable()}
              placeholder="Ex : Rapport final, PV de réception…"
              className="flex-1 px-3 py-2 rounded-xl bg-surface-base border border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <button
              type="button"
              onClick={addDeliverable}
              disabled={!newName.trim()}
              className="p-2 rounded-xl bg-amber-500 text-white disabled:opacity-40 hover:bg-amber-400"
              aria-label="Ajouter le livrable"
            >
              <Plus size={16} />
            </button>
          </div>

          {deliverables.length === 0 ? (
            <p className="text-xs text-content-tertiary">
              Aucun livrable. Ajoutez ce que le client recevra en fin de projet.
            </p>
          ) : (
            <ul className="space-y-2">
              {deliverables.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-base border border-line"
                >
                  <button
                    type="button"
                    onClick={() => toggleDelivered(d)}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                      d.status === 'delivered'
                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                        : 'bg-surface-raised text-content-tertiary border border-line hover:border-emerald-500/40'
                    }`}
                    title="Basculer livré / à venir"
                  >
                    {d.status === 'delivered' ? 'Livré' : 'À venir'}
                  </button>
                  <span className="text-sm text-content-primary flex-1 truncate">{d.name}</span>
                  <button
                    type="button"
                    onClick={() => pickFile(d.id)}
                    disabled={uploadingId === d.id}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-500 shrink-0"
                  >
                    {uploadingId === d.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {d.attachment_id ? 'Remplacer' : 'Fichier'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
