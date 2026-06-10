'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MessageSquare, Loader2, Send, AlertTriangle, CheckCircle2,
  XCircle, Clock, Pause, Trash2, RefreshCw, Users, Calendar, BarChart3,
  AlertCircle, Euro, Hash, LogIn,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { CAMPAGNES_ALLOWED_PLANS } from '@/lib/campagnes-access';
import NoAdminScreen from '@/components/NoAdminScreen';

const STATUS_META = {
  draft:     { label: 'Brouillon',  color: 'text-content-tertiary', bg: 'bg-content-tertiary/10', icon: <Clock size={12} /> },
  scheduled: { label: 'Planifiée',  color: 'text-blue-400',         bg: 'bg-blue-500/10',          icon: <Clock size={12} /> },
  sending:   { label: 'En cours',   color: 'text-amber-600',        bg: 'bg-amber-500/10',         icon: <Send size={12} /> },
  paused:    { label: 'En pause',   color: 'text-orange-600',       bg: 'bg-orange-500/10',        icon: <Pause size={12} /> },
  sent:      { label: 'Envoyée',    color: 'text-emerald-400',      bg: 'bg-emerald-500/10',       icon: <CheckCircle2 size={12} /> },
  failed:    { label: 'Échouée',    color: 'text-red-400',          bg: 'bg-red-500/10',           icon: <XCircle size={12} /> },
};

const SEND_STATUS_META = {
  pending:   { label: 'En attente', color: 'text-content-tertiary' },
  sent:      { label: 'Envoyé',     color: 'text-emerald-400' },
  delivered: { label: 'Délivré',    color: 'text-emerald-300' },
  failed:    { label: 'Échec',      color: 'text-red-400' },
};

export default function SmsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const supabase = getSupabase();

  const [authState, setAuthState] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [sample, setSample] = useState([]);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/prospection/sms-campaigns/${id}`);
      if (!res.ok) { setError('Campagne introuvable'); setLoading(false); return; }
      const data = await res.json();
      setCampaign(data.campaign);
      setSample(data.sample_sends || []);
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('guest'); setLoading(false); return; }
      setCurrentEmail(user.email);

      const { data: profile } = await supabase
        .from('user_profiles').select('plan').eq('id', user.id).maybeSingle();
      const allowed = profile?.plan && CAMPAGNES_ALLOWED_PLANS.includes(profile.plan.toLowerCase());
      if (!allowed) { router.push('/dashboard?upgrade=campagnes'); return; }
      setAuthState('ok');

      await fetchCampaign();
    })();
  }, [supabase, fetchCampaign]);

  useEffect(() => {
    if (!campaign || !['sending', 'scheduled'].includes(campaign.status)) return;
    const t = setInterval(fetchCampaign, 30000);
    return () => clearInterval(t);
  }, [campaign, fetchCampaign]);

  async function handleSend() {
    if (sending || !campaign) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prospection/sms-campaigns/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur envoi'); setSending(false); return; }
      setConfirmSend(false);
      await fetchCampaign();
    } catch {
      setError('Erreur réseau');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!campaign) return;
    try {
      const res = await fetch(`/api/admin/prospection/sms-campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur suppression'); return; }
      router.push('/app/campagnes/sms');
    } catch {
      setError('Erreur réseau');
    }
  }

  if (loading) return <CenteredSpinner />;
  if (authState === 'guest') return <GuestScreen />;
  if (authState === 'no-admin') return <NoAdminScreen email={currentEmail} signOut={async () => { await supabase.auth.signOut(); router.push('/login?return=/app/campagnes/sms'); }} />;
  if (!campaign) return <NotFound error={error} />;

  const meta = STATUS_META[campaign.status] || STATUS_META.draft;
  const sent = campaign.sent_count || 0;
  const total = campaign.total_recipients || 0;
  const progress = total > 0 ? Math.round((sent / total) * 100) : 0;
  const remaining = Math.max(0, total - sent);
  const etaMinutes = remaining > 0 ? Math.ceil(remaining / 20) * 5 : 0;

  const deliveryRate = sent > 0 ? ((campaign.delivered_count / sent) * 100).toFixed(1) : '0.0';
  const failRate = sent > 0 ? ((campaign.failed_count / sent) * 100).toFixed(1) : '0.0';

  const estimatedCost = Number(campaign.estimated_cost_eur) || 0;
  const actualCost = Number(campaign.actual_cost_eur) || 0;
  const displayCost = actualCost > 0 ? actualCost : estimatedCost;

  const canSend = ['draft', 'paused'].includes(campaign.status);
  const canDelete = ['draft', 'paused'].includes(campaign.status);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/app/campagnes/sms" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-emerald-400 transition mb-2">
            <ArrowLeft size={14} />
            Campagnes SMS
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                {campaign.name}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchCampaign} className="p-2 rounded-lg border border-line hover:bg-surface-elevated text-content-secondary transition" title="Actualiser">
                <RefreshCw size={14} />
              </button>
              {canDelete && (
                <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 transition" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              )}
              {canSend && (
                <button
                  onClick={() => setConfirmSend(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
                >
                  <Send size={14} />
                  Lancer la campagne
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {['sending', 'scheduled'].includes(campaign.status) && (
          <div className="mb-6 rounded-2xl border border-amber-400 bg-amber-50 p-5">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="text-sm font-semibold text-amber-700">
                {campaign.status === 'sending' ? 'Envoi SMS en cours' : 'Planifiée'}
              </div>
              <div className="text-xs text-amber-700/80 tabular-nums">
                {sent} / {total} envoyés ({progress}%)
                {etaMinutes > 0 && campaign.status === 'sending' && ` · ~${etaMinutes} min restantes`}
                {campaign.scheduled_at && campaign.status === 'scheduled' && ` · démarrage ${new Date(campaign.scheduled_at).toLocaleString('fr-FR')}`}
              </div>
            </div>
            <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={<Users size={14} />} label="Destinataires" value={total} />
          <StatCard icon={<Send size={14} />} label="Envoyés" value={sent} />
          <StatCard icon={<CheckCircle2 size={14} />} label="Délivrés" value={campaign.delivered_count || 0} sub={`${deliveryRate}%`} color="text-emerald-400" />
          <StatCard icon={<XCircle size={14} />} label="Échecs" value={campaign.failed_count || 0} sub={`${failRate}%`} color="text-red-400" warn={parseFloat(failRate) > 5 && sent > 20} />
          <StatCard
            icon={<Euro size={14} />}
            label={actualCost > 0 ? 'Coût réel' : 'Coût estimé'}
            value={`${displayCost.toFixed(2)} €`}
            color="text-emerald-300"
            sub={actualCost > 0 && estimatedCost > 0 ? `prévu : ${estimatedCost.toFixed(2)} €` : null}
          />
        </div>

        {parseFloat(failRate) > 5 && sent > 20 && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/[0.04] p-4 text-sm text-red-200 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
            <div>
              <strong>Taux d&apos;échec SMS élevé ({failRate}%).</strong> Vérifiez la qualité des numéros : doivent être au format E.164 mobile FR (+33 6 / +33 7).
            </div>
          </div>
        )}

        {/* Contenu + sample */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-line bg-surface-card overflow-hidden">
            <div className="px-4 py-3 border-b border-line bg-surface-elevated text-xs font-semibold uppercase tracking-wider text-content-tertiary">
              Contenu envoyé
            </div>
            <div className="p-4">
              <div className="rounded-xl bg-surface-elevated border border-line p-3 max-w-[280px]">
                <div className="text-[10px] font-semibold text-content-tertiary mb-1">{campaign.sender_name || 'Twilio +33...'}</div>
                <div className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 p-2.5 text-xs whitespace-pre-wrap break-words text-content-primary leading-relaxed">
                  {campaign.body}
                  {'\n'}STOP au 36111 pour ne plus recevoir.
                </div>
              </div>
              <p className="text-[10px] text-content-tertiary mt-3 italic">
                Variables {`{{first_name}}`}, {`{{company}}`} remplacées à l&apos;envoi par contact.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface-card overflow-hidden">
            <div className="px-4 py-3 border-b border-line bg-surface-elevated text-xs font-semibold uppercase tracking-wider text-content-tertiary flex items-center gap-1.5">
              <BarChart3 size={12} />
              Derniers envois ({sample.length})
            </div>
            {sample.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-tertiary">Pas encore d&apos;envoi.</div>
            ) : (
              <div className="max-h-[440px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-surface-elevated text-[10px] text-content-tertiary uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Téléphone</th>
                      <th className="text-left px-3 py-2 font-semibold">Statut</th>
                      <th className="text-right px-3 py-2 font-semibold">Seg.</th>
                      <th className="text-right px-3 py-2 font-semibold">Coût</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sample.map((s) => {
                      const smeta = SEND_STATUS_META[s.status] || SEND_STATUS_META.pending;
                      return (
                        <tr key={s.id} className="border-t border-line">
                          <td className="px-3 py-2 font-mono">{s.phone}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[11px] font-medium ${smeta.color}`}>{smeta.label}</span>
                            {s.error && (
                              <div className="text-[10px] text-red-400 truncate max-w-[180px]" title={s.error}>
                                {s.error}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-content-secondary">{s.segments || '—'}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-emerald-300">
                            {s.cost_eur != null ? `${Number(s.cost_eur).toFixed(4)} €` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {confirmSend && canSend && (
          <Modal onClose={() => setConfirmSend(false)}>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Send size={18} className="text-emerald-400" />
              Lancer la campagne SMS
            </h3>
            <p className="text-sm text-content-secondary mb-2">
              <strong className="text-content-primary">{total} destinataires</strong> mobile FR recevront ce SMS.
            </p>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 mb-4 text-xs text-emerald-200 flex items-center gap-2">
              <Euro size={12} />
              Coût estimé : <strong className="text-emerald-300">{displayCost.toFixed(2)} €</strong> (facturé sur votre compte Twilio).
            </div>
            <div className="mb-4">
              <label className="block text-xs text-content-tertiary mb-1.5">Planifier (optionnel)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-base border border-line text-sm focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-content-tertiary mt-1">RGPD : éviter 20h-8h, dimanche, jours fériés.</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-400 p-3 mb-4 text-xs text-amber-700">
              <strong>Action irréversible.</strong> Footer STOP ajouté automatiquement.
              Le cron envoie ~20 SMS / 5 min.
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setConfirmSend(false)} className="px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-content-primary transition">Annuler</button>
              <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {scheduledAt ? 'Planifier' : 'Envoyer maintenant'}
              </button>
            </div>
          </Modal>
        )}

        {confirmDelete && (
          <Modal onClose={() => setConfirmDelete(false)}>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" />
              Supprimer cette campagne ?
            </h3>
            <p className="text-sm text-content-secondary mb-4">
              Le brouillon <strong className="text-content-primary">{campaign.name}</strong> sera définitivement supprimé.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-content-primary transition">Annuler</button>
              <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = 'text-content-primary', warn = false }) {
  return (
    <div className={`rounded-xl border ${warn ? 'border-red-500/30 bg-red-500/[0.04]' : 'border-line bg-surface-card'} p-3`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-content-tertiary mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-semibold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-content-tertiary mt-0.5">{sub}</div>}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-w-md w-full rounded-2xl border border-line bg-surface-card p-6" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CenteredSpinner() {
  return <div className="min-h-screen bg-surface-base flex items-center justify-center text-content-secondary"><Loader2 className="animate-spin" size={20} /></div>;
}

function NotFound({ error }) {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-line bg-surface-card p-8 text-center">
        <MessageSquare size={28} className="mx-auto mb-3 text-content-tertiary opacity-50" />
        <h1 className="text-lg font-bold mb-2">Campagne introuvable</h1>
        <p className="text-sm text-content-secondary mb-4">{error || 'Cette campagne n\'existe pas ou ne vous appartient pas.'}</p>
        <Link href="/app/campagnes/sms" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition">
          <ArrowLeft size={14} />
          Retour
        </Link>
      </div>
    </div>
  );
}

function GuestScreen() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-line bg-surface-card p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Connexion requise</h1>
        <Link href="/login?return=/app/campagnes/sms" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"><LogIn size={14} />Se connecter</Link>
      </div>
    </div>
  );
}

// NoAdminScreen partagé — voir src/components/NoAdminScreen.jsx (QW5).
