'use client';

// ─────────────────────────────────────────────────────────────────────
// /one — Volia One (public)
// Tape un domaine → ICP déduit → leads FR (email+tél) → emails rédigés.
//   - /api/one/run  : PUBLIC, rate-limité (le "wow" sans inscription)
//   - /api/one/launch : envoi RÉEL, gardé (login + domaine vérifié)
// Supporte ?domain=… (auto-lance), et un feed d'activité live après envoi.
// ─────────────────────────────────────────────────────────────────────

import { Suspense, useState, useEffect, useRef, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

const methodBadge = {
  decision_maker: { label: 'décideur ✓', cls: 'bg-violet-600/15 text-violet-700' },
  scrape: { label: 'vérifié (site)', cls: 'bg-emerald-500/15 text-emerald-600' },
  serper: { label: 'trouvé (Google)', cls: 'bg-blue-500/15 text-blue-600' },
  guess: { label: 'deviné', cls: 'bg-amber-500/15 text-amber-600' },
  none: { label: '—', cls: 'bg-surface-elevated text-content-tertiary' },
};

// Statut d'un lead dans le feed d'activité (après "Tout lancer")
const statusBadge = {
  pending: { label: 'en file', cls: 'bg-surface-elevated text-content-tertiary' },
  sent: { label: 'envoyé', cls: 'bg-blue-500/15 text-blue-600' },
  delivered: { label: 'délivré', cls: 'bg-sky-500/15 text-sky-600' },
  opened: { label: 'ouvert', cls: 'bg-violet-500/15 text-violet-600' },
  clicked: { label: 'cliqué', cls: 'bg-fuchsia-500/15 text-fuchsia-600' },
  replied: { label: 'répondu', cls: 'bg-emerald-500/15 text-emerald-600' },
  bounced: { label: 'rejeté', cls: 'bg-amber-500/15 text-amber-600' },
  failed: { label: 'échec', cls: 'bg-red-500/15 text-red-600' },
};
const FEED_ORDER = ['pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'];

function OneInner() {
  const sp = useSearchParams();
  const autoRan = useRef(false);

  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needSignup, setNeedSignup] = useState(false);
  const [needUpgrade, setNeedUpgrade] = useState(false); // crédits épuisés (connecté)
  const [data, setData] = useState(null);
  const [openIdx, setOpenIdx] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchMsg, setLaunchMsg] = useState(null); // { ok, text }
  const [launchedCampaignId, setLaunchedCampaignId] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [campaigns, setCampaigns] = useState([]); // historique des envois Volia One (connectés)
  const [runs, setRuns] = useState([]); // analyses persistées (connectés)

  async function loadCampaigns() {
    try {
      const r = await fetch('/api/one/campaigns');
      if (!r.ok) return; // 401 anonyme → pas d'historique
      const j = await r.json();
      setCampaigns(j.campaigns || []);
    } catch {
      /* silencieux */
    }
  }
  async function loadRuns() {
    try {
      const r = await fetch('/api/one/runs');
      if (!r.ok) return; // 401 anonyme → pas d'analyses persistées
      const j = await r.json();
      setRuns(j.runs || []);
    } catch {
      /* silencieux */
    }
  }
  // Rouvre une analyse persistée SANS la relancer (donc sans re-consommer de crédits)
  async function openRun(id) {
    if (loading) return;
    setError(null);
    setNeedSignup(false);
    setOpenIdx(null);
    setLaunchMsg(null);
    setLaunchedCampaignId(null);
    setStatusData(null);
    try {
      const r = await fetch(`/api/one/runs?id=${id}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Analyse introuvable');
      setDomain(j.run.domain || '');
      setData({ icp: j.run.icp, leads: j.run.leads, counts: j.run.counts });
    } catch (err) {
      setError(err.message || 'Erreur');
    }
  }
  useEffect(() => {
    loadCampaigns();
    loadRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leads réellement envoyables : email fiable (site/Google) + email rédigé.
  // (mêmes critères que la route /api/one/launch côté serveur)
  const sendable = (data?.leads || []).filter(
    (l) => l.draft && l.email && (l.method === 'scrape' || l.method === 'serper' || l.method === 'decision_maker')
  );

  async function run(e, domainOverride) {
    e?.preventDefault?.();
    const d = (typeof domainOverride === 'string' ? domainOverride : domain).trim();
    if (!d || loading) return;
    setLoading(true);
    setError(null);
    setNeedSignup(false);
    setNeedUpgrade(false);
    setData(null);
    setOpenIdx(null);
    setLaunchMsg(null);
    setLaunchedCampaignId(null);
    setStatusData(null);
    try {
      const res = await fetch('/api/one/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      });
      const json = await res.json();
      if (!res.ok) {
        const code = json.error;
        if (code === 'rate_limit_exceeded' || code === 'global_quota_exceeded' || code === 'one_unavailable') {
          setNeedSignup(true);
        } else if (code === 'credits_exhausted') {
          setNeedUpgrade(true);
        }
        throw new Error(json.message || json.error || 'Erreur');
      }
      setData(json);
      loadRuns(); // la nouvelle analyse apparaît dans l'historique (connectés)
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  // Auto-lance si on arrive avec ?domain= (depuis le teaser landing)
  useEffect(() => {
    if (autoRan.current) return;
    const d = sp.get('domain');
    if (d) {
      autoRan.current = true;
      setDomain(d);
      run(null, d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  async function launch() {
    if (launching || !data || sendable.length === 0) return;
    setLaunching(true);
    setLaunchMsg(null);
    try {
      const res = await fetch('/api/one/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), icp: data.icp, leads: data.leads }),
      });
      const json = await res.json();
      if (!res.ok) {
        let text = json.message || json.error || 'Échec du lancement';
        if (res.status === 401) text = 'Connecte-toi (gratuit) pour lancer ta campagne.';
        throw new Error(text);
      }
      setConfirmOpen(false);
      setLaunchedCampaignId(json.campaign_id);
      loadCampaigns(); // l'envoi apparaît aussitôt dans l'historique
      const cappedNote = json.capped_to != null
        ? ` (plafonné à ${json.capped_to} selon ton quota du mois)`
        : '';
      setLaunchMsg({
        ok: true,
        text: `${json.queued} email${json.queued > 1 ? 's' : ''} en file — envoi depuis ${json.sender_domain} dans les minutes qui suivent${cappedNote}.`,
      });
    } catch (err) {
      setLaunchMsg({ ok: false, text: err.message || 'Échec du lancement' });
    } finally {
      setLaunching(false);
    }
  }

  // Feed d'activité live : poll le statut de la campagne après lancement
  useEffect(() => {
    if (!launchedCampaignId) return;
    let active = true;
    let polls = 0;
    const tick = async () => {
      polls += 1;
      try {
        const r = await fetch(`/api/one/status?campaign_id=${launchedCampaignId}`);
        if (!active) return;
        const j = await r.json();
        if (r.ok) setStatusData(j);
      } catch {
        /* on retentera au prochain tick */
      }
      if (polls >= 60) clearInterval(iv); // ~5 min de feed live puis stop
    };
    tick();
    const iv = setInterval(tick, 5000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [launchedCampaignId]);

  return (
    <div className="min-h-screen bg-surface-base">
      <ReaderHeader />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-4">
            Volia One
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-content-primary mb-2">
            Entre ton domaine
          </h1>
          <p className="text-content-secondary">Je trouve à qui vendre, et je rédige le 1er email. Gratuit.</p>
        </div>

        <form onSubmit={run} className="flex gap-2 max-w-xl mx-auto mb-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="agence-web-bordeaux.fr"
            className="flex-1 rounded-xl border border-line bg-surface-card px-4 py-3 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
          >
            {loading ? 'Analyse…' : 'Lancer'}
          </button>
        </form>
        <p className="text-center text-xs text-content-tertiary mb-8">
          ~20-40s : scrape du site, déduction ICP, recherche Places, enrichissement, rédaction.
        </p>

        {/* Analyses persistées — rouvrir sans relancer (donc sans re-consommer de crédits) */}
        {runs.length > 0 && (
          <div className="max-w-xl mx-auto mb-6">
            <div className="text-xs uppercase tracking-wide text-content-tertiary mb-2">Tes analyses récentes</div>
            <ul className="space-y-1.5">
              {runs.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => openRun(r.id)}
                    className="w-full text-left rounded-lg border border-line px-3 py-2 text-sm text-content-secondary hover:bg-surface-elevated transition-colors"
                  >
                    <span className="text-content-primary">{r.domain}</span>
                    <span className="text-content-tertiary"> · {r.counts?.total || 0} leads</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Historique des envois Volia One (utilisateurs connectés) */}
        {campaigns.length > 0 && (
          <div className="max-w-xl mx-auto mb-6">
            <div className="text-xs uppercase tracking-wide text-content-tertiary mb-2">Tes envois Volia One</div>
            <ul className="space-y-1.5">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setLaunchedCampaignId(c.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                      launchedCampaignId === c.id
                        ? 'border-violet-500 bg-violet-500/5 text-content-primary'
                        : 'border-line text-content-secondary hover:bg-surface-elevated'
                    }`}
                  >
                    {c.name.replace(/^Volia One — /, '')}
                    <span className="text-content-tertiary"> · {c.total_recipients} env.</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feed d'activité live (nouvel envoi OU envoi rouvert depuis l'historique) */}
        {statusData && (
          <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-line bg-surface-card p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs uppercase tracking-wide text-content-tertiary">Activité en direct</div>
              <div className="flex items-center gap-1.5 text-xs text-content-tertiary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                live
              </div>
            </div>
            {statusData.campaign?.name && (
              <div className="text-sm text-content-primary mb-3">{statusData.campaign.name.replace(/^Volia One — /, '')}</div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {FEED_ORDER.filter((k) => (statusData.stats?.[k] || 0) > 0).map((k) => (
                <span key={k} className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge[k].cls}`}>
                  {statusData.stats[k]} {statusBadge[k].label}
                </span>
              ))}
            </div>
            <ul className="divide-y divide-line/60">
              {(statusData.leads || []).map((l, i) => {
                const b = statusBadge[l.status] || statusBadge.pending;
                return (
                  <li key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-content-secondary">{l.email}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${b.cls}`}>{b.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 px-4 py-3 text-sm">
            {error}
            {needSignup && (
              <>
                {' '}
                <a href="/signup" className="underline font-medium">
                  Créer un compte gratuit
                </a>
              </>
            )}
            {needUpgrade && (
              <>
                {' '}
                <a href="/pricing" className="underline font-medium">
                  Recharger des crédits
                </a>
              </>
            )}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <div className="text-xs uppercase tracking-wide text-content-tertiary mb-2">ICP déduit</div>
              <p className="text-content-primary font-medium">{data.icp?.activite}</p>
              <p className="text-content-secondary text-sm mt-1">{data.icp?.value_prop}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="px-2 py-1 rounded-md bg-surface-elevated text-content-secondary">📍 {data.icp?.ville}</span>
                {(data.icp?.places_terms || []).map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-600">{t}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-content-secondary">
              <span><strong className="text-content-primary">{data.counts?.total}</strong> leads</span>
              <span><strong className="text-content-primary">{data.counts?.email_verified}</strong> emails fiables</span>
              <span><strong className="text-content-primary">{data.counts?.email_guessed}</strong> devinés</span>
              <span><strong className="text-content-primary">{data.counts?.with_phone}</strong> avec tél</span>
              {data.counts?.decision_makers > 0 && (
                <span><strong className="text-content-primary">{data.counts.decision_makers}</strong> décideurs</span>
              )}
              {data.credits_charged != null && (
                <span className="text-content-tertiary">· {data.credits_charged} crédit{data.credits_charged > 1 ? 's' : ''} utilisé{data.credits_charged > 1 ? 's' : ''}</span>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={sendable.length === 0 || launching}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 transition-colors"
                >
                  Tout lancer ({sendable.length})
                </button>
              </div>
            </div>

            {launchMsg && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  launchMsg.ok
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                    : 'border-red-500/30 bg-red-500/10 text-red-600'
                }`}
              >
                {launchMsg.text}
                {!launchMsg.ok && launchMsg.text.toLowerCase().includes('domaine') && (
                  <>
                    {' '}
                    <a href="/settings/email-senders" className="underline font-medium">
                      Configurer un domaine
                    </a>
                  </>
                )}
                {!launchMsg.ok && launchMsg.text.toLowerCase().includes('connecte-toi') && (
                  <>
                    {' '}
                    <a href="/signup" className="underline font-medium">
                      Créer un compte
                    </a>
                  </>
                )}
                {!launchMsg.ok && launchMsg.text.toLowerCase().includes('plan') && (
                  <>
                    {' '}
                    <a href="/pricing" className="underline font-medium">
                      Voir les plans
                    </a>
                  </>
                )}
              </div>
            )}

            <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-content-tertiary border-b border-line">
                    <th className="font-medium px-4 py-3">Fit</th>
                    <th className="font-medium px-4 py-3">Entreprise</th>
                    <th className="font-medium px-4 py-3">Téléphone</th>
                    <th className="font-medium px-4 py-3">Email</th>
                    <th className="font-medium px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {(data.leads || []).map((l, i) => {
                    const b = methodBadge[l.method] || methodBadge.none;
                    return (
                      <Fragment key={i}>
                        <tr className="border-b border-line/60">
                          <td className="px-4 py-3 text-content-secondary tabular-nums">{l.fit}</td>
                          <td className="px-4 py-3 text-content-primary">
                            {l.nom}
                            {l.contact_name && (
                              <div className="text-xs text-content-tertiary mt-0.5">
                                {l.contact_name}{l.contact_role ? ` · ${l.contact_role}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-content-secondary">{l.telephone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-content-primary">{l.email || '—'}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[11px] ${b.cls}`}>{b.label}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {l.draft && (
                              <button
                                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                className="text-violet-600 hover:underline text-xs"
                              >
                                {openIdx === i ? 'Masquer' : 'Voir l\'email'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {openIdx === i && l.draft && (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 bg-surface-elevated">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-content-secondary leading-relaxed">{l.draft}</pre>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-line bg-surface-card p-6 shadow-xl">
              <h2 className="text-lg font-bold text-content-primary mb-2">Envoyer pour de vrai ?</h2>
              <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                Tu vas envoyer <strong className="text-content-primary">{sendable.length} cold email{sendable.length > 1 ? 's' : ''}</strong> réel{sendable.length > 1 ? 's' : ''}, un par entreprise (objet + texte déjà rédigés).
                Départ échelonné par le moteur d&apos;envoi (warmup, opt-out RGPD et anti-spam appliqués), depuis ton domaine vérifié.
              </p>
              <p className="text-xs text-content-tertiary mb-5">
                Seuls les leads avec un email fiable sont inclus. Les emails devinés sont ignorés.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={launching}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-content-secondary hover:bg-surface-elevated transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={launch}
                  disabled={launching}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  {launching ? 'Envoi…' : `Confirmer l'envoi (${sendable.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      <ReaderFooter />
    </div>
  );
}

export default function VoliaOnePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-base" />}>
      <OneInner />
    </Suspense>
  );
}
