'use client';

// ─────────────────────────────────────────────────────────────────────
// /one — Volia One (public)
// Tape un domaine → ICP déduit → leads FR (email+tél) → emails rédigés.
//   - /api/one/run  : PUBLIC, rate-limité (le "wow" sans inscription)
//   - /api/one/launch : envoi RÉEL, gardé (login + domaine vérifié)
// Supporte ?domain=… (auto-lance), et un feed d'activité live après envoi.
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, Fragment } from 'react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import OneRunProgress from '@/components/OneRunProgress';

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

// ─── FAQ /one — 6 Q/R (doc copy §9) ──────────────────────────────────
// Accordéon local (état simple), distinct de <FAQSection> qui sert la FAQ
// générale (FAQ_ITEMS). Ces 6 Q/R sont spécifiques à Volia One.
const FAQ_ONE = [
  {
    q: 'C’est légal, ce scraping ?',
    a: 'Oui. La prospection B2B est légale en France, sur la base de l’intérêt légitime. Volia est construit pour rester dans les clous : données professionnelles uniquement, filtre automatique des emails personnels, page d’opt-out publique, DPA téléchargeable. On ne joue pas avec ça.',
  },
  {
    q: 'Ça marche vraiment ?',
    a: 'On ne répond pas avec des témoignages. On répond avec tes données : tape ton domaine, regarde ce qui sort. Chaque email affiche sa source. Un email court, personnalisé, signé de toi reste le canal le moins cher pour ouvrir une conversation B2B. Et si ta niche est trop étroite, tu le verras sans payer.',
  },
  {
    q: '19 €/mois, où est le piège ?',
    a: 'Pas de piège : 500 crédits, sans engagement, annulable en 2 clics. On est moins cher parce qu’on vend en volume à des TPE, pas des licences à des grands comptes. Le plan gratuit existe pour vérifier avant de payer.',
  },
  {
    q: '179 €/mois, c’est cher.',
    a: 'C’est le prix d’un outil qui prospecte 24/7 selon tes règles. Compare à l’équivalent en stack US — Apollo + Lemlist + intégrations — ou à une demi-journée de commercial. MAX99 te donne 3 mois à 99 € pour juger sur pièces.',
  },
  {
    q: 'Mes emails vont finir en spam.',
    a: 'Personne d’honnête ne te garantit l’inbox. Ce qu’on fait : warmup progressif, envoi depuis ton domaine, volumes plafonnés, désinscription propre. Les bonnes pratiques par défaut, pas en option.',
  },
  {
    q: 'J’ai déjà un CRM.',
    a: 'Parfait, garde-le. Le CRM Volia est inclus, pas imposé. Export CSV et format Zoho en un clic.',
  },
];

function OneInner() {
  const autoRan = useRef(false);
  const [faqOpen, setFaqOpen] = useState(-1);

  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  // Porte de sortie du hero : beaucoup d'artisans, syndics et TPE n'ont pas de
  // site. Sans elle, ces visiteurs n'ont rien à taper et repartent en silence.
  const [noSite, setNoSite] = useState(false);
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

  // Auto-lance si on arrive avec ?domain= (depuis le teaser landing).
  // Lu via window.location plutôt que useSearchParams : le hook à la racine
  // forçait toute la page en CSR (body SSR vide → invisible pour les
  // crawlers non-JS), alors que l'auto-run est de toute façon client-only.
  useEffect(() => {
    if (autoRan.current) return;
    const d = new URLSearchParams(window.location.search).get('domain');
    if (d) {
      autoRan.current = true;
      setDomain(d);
      run(null, d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="min-h-screen bg-surface-base flex flex-col">
      <ReaderHeader />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
        {/* ─── Hero — variante 1 « sobre » (défaut SEO) ───────────────── */}
        {/* Copy source : audit-prive/copy-one-pricing-volia.md §Hero.        */}
        {/* A/B — variantes prêtes à swapper (H1 + sous-titre + libellé CTA) :*/}
        {/*                                                                   */}
        {/* VARIANTE 2 — medium (la signature) :                             */}
        {/*   H1 : Tape ton domaine. Ton pipeline se remplit.               */}
        {/*   Sous-titre : Volia One trouve tes prospects — email et         */}
        {/*   téléphone —, écrit tes cold emails, les envoie et range les    */}
        {/*   réponses dans ton CRM. Toi, tu signes.                        */}
        {/*   CTA : Voir mes prospects · 0 €. Aucune carte bancaire.        */}
        {/*   Tu regardes, tu décides.                                      */}
        {/*                                                                   */}
        {/* VARIANTE 3 — audacieuse (trafic pub froid) :                    */}
        {/*   H1 : « Encore un outil de prospection. »                      */}
        {/*   Sous-titre : On connaît le soupir. Alors on a mis la preuve    */}
        {/*   avant le discours. Tape ton domaine, regarde ce qui sort. Si   */}
        {/*   c’est nul, tu fermes l’onglet.                                */}
        {/*   CTA : Voir avant de croire · Gratuit. Anonyme. Aucune          */}
        {/*   inscription pour l’aperçu.                                    */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-4">
            Volia One
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-content-primary mb-3">
            La prospection B2B, en un clic.
          </h1>
          {/* Phrase de mécanisme : une ligne, une durée, ce qu'on obtient. La
              version précédente empilait 4 propositions et noyait le résultat. */}
          <p className="text-content-secondary max-w-2xl mx-auto">
            Tape ton domaine. En <strong className="font-semibold text-content-primary">30 secondes</strong> : tes prospects, leurs emails, leurs téléphones, et tes premiers cold emails déjà écrits.
          </p>
        </div>

        <form onSubmit={run} className="flex gap-2 max-w-xl mx-auto mb-2">
          <input
            id="one-domain-top"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ex. : volia.fr"
            className="flex-1 rounded-xl border border-line bg-surface-card px-4 py-3 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
          >
            {loading ? 'Analyse…' : 'Voir mes prospects'}
          </button>
        </form>
        {/* Microcopy sous le champ — OBLIGATOIRE (doc §Hero) */}
        <p className="text-center text-xs text-content-tertiary mb-1">
          Gratuit. Sans carte. 30 secondes.
        </p>
        <p className="text-center text-xs text-content-tertiary mb-3">
          Essai anonyme : résultats partiellement masqués. Compte gratuit (0 €) pour tout voir.
        </p>

        {/* Porte de sortie. Volia One déduit ton activité DE ton site : sans site,
            on ne fait pas semblant — on renvoie vers la recherche par métier et
            département, qui ne demande aucun site. */}
        <div className="text-center mb-8">
          {!noSite ? (
            <button
              type="button"
              onClick={() => setNoSite(true)}
              className="text-xs text-content-secondary underline hover:text-content-primary transition-colors"
            >
              Je n&apos;ai pas de site web
            </button>
          ) : (
            <div className="max-w-xl mx-auto rounded-xl border border-line bg-surface-card px-4 py-3 text-left">
              <p className="text-sm text-content-secondary">
                One lit ton site pour comprendre ce que tu vends — sans site, il ne peut pas deviner.
                Tu peux quand même chercher tes prospects <strong className="text-content-primary font-medium">par métier et par département</strong> : c&apos;est le module Prospection, inclus dans le compte gratuit.
              </p>
              <a href="/signup" className="inline-block mt-2 text-sm font-semibold text-violet-600 hover:underline">
                Créer mon compte gratuit (0 €)
              </a>
            </div>
          )}
        </div>

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

        {/* Pendant le run (~30 s) : les étapes réelles du pipeline, sinon le
            bouton « Analyse… » seul laissait croire à une page plantée. */}
        {loading && <OneRunProgress />}

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

            {/* Ce que le run a RÉELLEMENT rapporté. Ces chiffres étaient rendus en
                text-sm, au même poids visuel que « 1 crédit utilisé » : la preuve
                que le produit a marché se lisait comme une note de bas de page.
                Les réserves (emails devinés, crédits) restent visibles, mais en
                métadonnée — on ne les célèbre pas, on ne les cache pas. */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { n: data.counts?.total ?? 0, label: 'prospects trouvés' },
                  { n: data.counts?.email_verified ?? 0, label: 'emails fiables' },
                  { n: data.counts?.with_phone ?? 0, label: 'avec téléphone' },
                  ...(data.counts?.decision_makers > 0
                    ? [{ n: data.counts.decision_makers, label: 'décideurs nommés' }]
                    : []),
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface-elevated px-4 py-3">
                    <div className="text-2xl font-semibold text-content-primary leading-tight">{s.n}</div>
                    <div className="text-xs text-content-tertiary mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
                <span className="text-xs text-content-tertiary">
                  {data.counts?.email_guessed > 0 && (
                    <>dont {data.counts.email_guessed} email{data.counts.email_guessed > 1 ? 's' : ''} probable{data.counts.email_guessed > 1 ? 's' : ''}</>
                  )}
                  {data.counts?.email_guessed > 0 && data.credits_charged != null && ' · '}
                  {data.credits_charged != null && (
                    <>{data.credits_charged} crédit{data.credits_charged > 1 ? 's' : ''} utilisé{data.credits_charged > 1 ? 's' : ''}</>
                  )}
                </span>
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

        {/* ═══════════════════════════════════════════════════════════════
            SECTIONS STATIQUES — copy source : copy-one-pricing-volia.md
            Ordre du doc : 2 anti-freins · 3 mécanisme (01→04) · 4 scoring
            · 5 ce que ça remplace · 6 ce que One ne fait pas · 7 pont
            compte gratuit · 8 prix 3 intensités · 9 FAQ · 10 RGPD · 11 CTA.
            ═══════════════════════════════════════════════════════════════ */}

        {/* ─── 2. Bandeau « avant que tu demandes » ───────────────────── */}
        <div className="max-w-3xl mx-auto mt-20 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface-card p-4">
            <p className="text-sm font-semibold text-content-primary mb-1">C&apos;est légal ?</p>
            <p className="text-sm text-content-secondary">Oui — prospection B2B, données professionnelles uniquement. Détails plus bas.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface-card p-4">
            <p className="text-sm font-semibold text-content-primary mb-1">C&apos;est gratuit ?</p>
            <p className="text-sm text-content-secondary">Oui — 0 € pour voir tes leads. Le prix complet est affiché plus bas, sur cette page.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface-card p-4">
            <p className="text-sm font-semibold text-content-primary mb-1">C&apos;est un robot qui écrit à ma place ?</p>
            <p className="text-sm text-content-secondary">Non — l&apos;IA rédige, toi tu valides. C&apos;est ton nom en bas.</p>
          </div>
        </div>

        {/* ─── 3. Ce qui se passe quand tu appuies sur Entrée ─────────── */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-2">
            Ce qui se passe quand tu appuies sur Entrée
          </h2>
          <p className="text-content-secondary text-center max-w-2xl mx-auto mb-8">
            Pas de démo à réserver. Pas de commercial à rappeler. La démo, c&apos;est ton domaine.
          </p>
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">01 — One lit ton site.</p>
              <p className="text-sm text-content-secondary">Il comprend ce que tu vends, et à qui. Pas de formulaire à remplir : ton domaine contient déjà la réponse.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">02 — One trouve tes prospects.</p>
              <p className="text-sm text-content-secondary">101 départements, 150+ catégories. Pour chaque prospect, une cascade de sources : son site web, puis une recherche Google, puis les formats d&apos;adresse classiques. Chaque fiche sort avec un email, un téléphone et un score de confiance.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">03 — One écrit tes brouillons.</p>
              <p className="text-sm text-content-secondary">Un cold email par prospect, court, rédigé à partir de TON activité. Tu relis. Tu modifies. Tu valides. Rien ne part sans ta signature.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">04 — One envoie et range.</p>
              <p className="text-sm text-content-secondary">L&apos;email part de ton domaine, après warmup progressif. Une réponse ? Le contact est créé automatiquement dans le CRM. Ta prochaine action est déjà au chaud.</p>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-content-primary mt-6">
            Trouvé → écrit → envoyé → répondu → dans ton CRM. Un seul login.
          </p>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { document.getElementById('one-domain-top')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              Voir avec mon domaine
            </button>
          </div>
        </section>

        {/* ─── 4. Chaque email a une origine. On te la montre. ────────── */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-3">
            Chaque email a une origine. On te la montre.
          </h2>
          <p className="text-content-secondary text-center max-w-2xl mx-auto mb-2">
            Aucun outil ne trouve un email fiable pour 100 % des prospects. Nous, on affiche d&apos;où vient chaque adresse.
          </p>
          <p className="text-content-secondary text-center max-w-2xl mx-auto mb-8">
            La cascade cherche dans l&apos;ordre. Elle s&apos;arrête dès qu&apos;un email est trouvé. Le score te dit où elle s&apos;est arrêtée.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-content-primary">Vérifié</span>
              </div>
              <p className="text-sm text-content-secondary">L&apos;email est écrit sur le site du prospect. On l&apos;a lu, pas deviné. Le plus solide.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-content-primary">Google</span>
              </div>
              <p className="text-sm text-content-secondary">L&apos;email apparaît dans une recherche Google. La source est consultable. Vérifie avant un envoi sensible.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-content-primary">Probable</span>
              </div>
              <p className="text-sm text-content-secondary">Aucune trace publique. On teste les formats classiques : contact@, prenom.nom@. Et on te le marque.</p>
            </div>
          </div>
          <p className="text-content-secondary text-center max-w-2xl mx-auto mt-6">
            « Probable » veut dire probable. On préfère l&apos;écrire que te le cacher. Tu filtres par score avant d&apos;envoyer.
          </p>
        </section>

        {/* ─── 5. Ce que ça remplace ──────────────────────────────────── */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-8">
            Ce que ça remplace
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">Des prospects joignables. Vraiment.</p>
              <p className="text-sm text-content-secondary">Email et téléphone sur chaque fiche, quand ils existent. Le téléphone, la plupart des outils US ne le fournissent pas sur la France. Toi, tu peux décrocher.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">Une seule chaîne, du clic au rendez-vous.</p>
              <p className="text-sm text-content-secondary">Fini le Frankenstein Apollo + Lemlist + Zapier + Notion. 5 modules branchés entre eux : Prospection, Campagnes, CRM, Formulaires, Project. Une réponse crée le contact toute seule.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">En français, dans les règles.</p>
              <p className="text-sm text-content-secondary">Interface en français, données françaises, prix en euros. Filtre automatique des emails personnels. Opt-out public. DPA téléchargeable.</p>
            </div>
          </div>
        </section>

        {/* ─── 6. Ce que One ne fait pas (bloc NOUVEAU) ───────────────── */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-8">
            Ce que One ne fait pas
          </h2>
          <ul className="space-y-4">
            <li className="rounded-xl border border-line bg-surface-card p-5">
              <span className="text-sm font-semibold text-content-primary">Il n&apos;envoie rien sans ta validation.</span>{' '}
              <span className="text-sm text-content-secondary">L&apos;IA rédige, tu signes. C&apos;est ton nom en bas.</span>
            </li>
            <li className="rounded-xl border border-line bg-surface-card p-5">
              <span className="text-sm font-semibold text-content-primary">Il ne garantit pas de résultats.</span>{' '}
              <span className="text-sm text-content-secondary">Il te donne des prospects joignables et des brouillons prêts. La vente, c&apos;est toi.</span>
            </li>
            <li className="rounded-xl border border-line bg-surface-card p-5">
              <span className="text-sm font-semibold text-content-primary">Il ne promet pas l&apos;inbox.</span>{' '}
              <span className="text-sm text-content-secondary">Personne d&apos;honnête ne le fait. Ce qu&apos;on fait : warmup progressif, envoi depuis ton domaine, volumes plafonnés, désinscription propre.</span>
            </li>
            <li className="rounded-xl border border-line bg-surface-card p-5">
              <span className="text-sm font-semibold text-content-primary">Il ne trouve pas tout.</span>{' '}
              <span className="text-sm text-content-secondary">Sur une niche très étroite, les résultats peuvent être minces. Tu le verras en gratuit, avant de payer.</span>
            </li>
            <li className="rounded-xl border border-line bg-surface-card p-5">
              <span className="text-sm font-semibold text-content-primary">Il ne décide pas à ta place.</span>{' '}
              <span className="text-sm text-content-secondary">Même l&apos;Autopilot suit tes règles : ton ton, tes secteurs, tes exclusions, tes plafonds.</span>
            </li>
          </ul>
          <p className="text-content-secondary text-center max-w-2xl mx-auto mt-6">
            Si tu cherches un outil qui « fait tout à ta place », ce n&apos;est pas ici.
          </p>
          <p className="text-content-primary text-center max-w-2xl mx-auto mt-1 font-medium">
            Si tu cherches un outil qui fait le travail ingrat pour que tu signes, tape ton domaine.
          </p>
        </section>

        {/* ─── 7. L'essai est anonyme. Le compte est gratuit. ─────────── */}
        <section className="max-w-2xl mx-auto mt-20 rounded-2xl border border-line bg-surface-card p-6 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary mb-4">
            L&apos;essai est anonyme. Le compte est gratuit.
          </h2>
          <p className="text-sm text-content-secondary mb-4">
            Sans compte : tu tapes ton domaine, tes prospects s&apos;affichent, partiellement masqués.
          </p>
          <p className="text-sm text-content-secondary mb-2">
            Avec un compte gratuit — 0 €, sans carte bancaire :
          </p>
          <ul className="space-y-1.5 mb-4 text-sm text-content-secondary">
            <li className="flex gap-2"><span className="text-violet-600" aria-hidden="true">·</span> tes leads et leurs emails, complets ;</li>
            <li className="flex gap-2"><span className="text-violet-600" aria-hidden="true">·</span> 25 crédits Prospection ;</li>
            <li className="flex gap-2"><span className="text-violet-600" aria-hidden="true">·</span> l&apos;accès aux 5 modules, avec quotas.</li>
          </ul>
          <p className="text-sm text-content-secondary mb-5">
            Tu paies quand tu veux prospecter en volume. Pas avant.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 transition-colors"
          >
            Créer mon compte gratuit
          </a>
        </section>

        {/* ─── 8. Trois intensités. Un seul produit. ──────────────────── */}
        <section className="max-w-4xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-8">
            Trois intensités. Un seul produit.
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Gratuit */}
            <div className="rounded-2xl border border-line bg-surface-card p-6 flex flex-col">
              <p className="text-sm font-semibold text-content-primary">Gratuit</p>
              <p className="font-display text-2xl font-bold text-content-primary mt-1 mb-3">0 €</p>
              <p className="text-sm text-content-secondary flex-1">
                Tape ton domaine, débloque tes leads et emails complets. 25 crédits Prospection. Les 5 modules, avec quotas. Pour voir avant de croire.
              </p>
              <a
                href="/signup"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-line hover:bg-surface-elevated text-content-primary font-semibold px-5 py-2.5 transition-colors"
              >
                Commencer gratuitement
              </a>
            </div>
            {/* Prospection */}
            <div className="rounded-2xl border border-line bg-surface-card p-6 flex flex-col">
              <p className="text-sm font-semibold text-content-primary">Prospection</p>
              <p className="font-display text-2xl font-bold text-content-primary mt-1 mb-3">19 €/mois</p>
              <p className="text-sm text-content-secondary flex-1">
                One en solo. 500 crédits par mois. Sans engagement, annulable en 2 clics. Moins cher que ton forfait mobile.
              </p>
              <a
                href="/pricing"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-line hover:bg-surface-elevated text-content-primary font-semibold px-5 py-2.5 transition-colors"
              >
                Passer à 19 €/mois
              </a>
            </div>
            {/* MAX */}
            <div className="rounded-2xl border-2 border-violet-500 bg-surface-card p-6 flex flex-col">
              <p className="text-sm font-semibold text-violet-600">MAX</p>
              <p className="font-display text-2xl font-bold text-content-primary mt-1 mb-3">179 €/mois</p>
              <p className="text-sm text-content-secondary flex-1">
                One en pilote automatique, 24/7, selon TES règles — ton ton, tes secteurs, tes exclusions, tes plafonds. 2 000 crédits par mois. Toute la suite.
              </p>
              <a
                href="/pricing"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 transition-colors"
              >
                Activer Autopilot
              </a>
              <p className="text-xs text-content-tertiary mt-3">
                Code MAX99 — 3 premiers mois à 99 € au lieu de 179 €.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-content-secondary mt-6">
            Besoin ponctuel de volume ? Des packs de crédits existent, sans abonnement.
          </p>
          <p className="text-center text-xs text-content-tertiary mt-2">
            Aucun prix barré artificiel. Aucun « à partir de ». Ce que tu lis est ce que tu paies.
          </p>
        </section>

        {/* ─── 9. FAQ — 6 Q/R (accordéon) ─────────────────────────────── */}
        <section className="max-w-2xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-8">
            Les questions qu&apos;on nous pose vraiment
          </h2>
          <ul className="space-y-2">
            {FAQ_ONE.map((item, i) => {
              const isOpen = faqOpen === i;
              return (
                <li key={i} className="rounded-xl border border-line bg-surface-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-content-primary">{item.q}</span>
                    <span className={`text-content-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">▾</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-content-secondary leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ─── 10. RGPD par construction. Pas en option. ──────────────── */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary text-center mb-8">
            RGPD par construction. Pas en option.
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">Filtre automatique.</p>
              <p className="text-sm text-content-secondary">Les emails personnels (@gmail et compagnie) n&apos;entrent jamais dans tes listes. Le B2B reste du B2B.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">Opt-out public.</p>
              <p className="text-sm text-content-secondary">Un prospect veut sortir ? Une page, un clic, c&apos;est fait. Définitivement.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <p className="text-sm font-semibold text-content-primary mb-1">DPA téléchargeable.</p>
              <p className="text-sm text-content-secondary">Ton juriste veut lire ? Il peut. Tout est écrit.</p>
            </div>
          </div>
          <p className="text-content-secondary text-center max-w-2xl mx-auto mt-6">
            Tu restes responsable de tes envois. On te donne un outil propre pour le rester. Et prospecter dans les règles, c&apos;est aussi mieux prospecter — les boîtes mail le savent.
          </p>
        </section>

        {/* ─── 11. CTA final — seul ✈️ de la page ─────────────────────── */}
        <section className="max-w-2xl mx-auto mt-20 mb-4 text-center rounded-2xl border border-line bg-surface-card p-6 sm:p-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary mb-4">
            Tu doutes encore ? Parfait.
          </h2>
          <p className="text-sm text-content-secondary max-w-xl mx-auto mb-1">
            On préfère un sceptique qui teste à un convaincu qui signe les yeux fermés.
          </p>
          <p className="text-sm text-content-secondary max-w-xl mx-auto mb-1">
            Le test prend 30 secondes. Il ne coûte rien. Il ne demande pas ta carte.
          </p>
          <p className="text-sm text-content-secondary max-w-xl mx-auto mb-6">
            Tape ton domaine. Regarde ce qui sort. Décide.
          </p>
          <form onSubmit={run} className="flex gap-2 max-w-md mx-auto">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="tonentreprise.fr"
              className="flex-1 rounded-xl border border-line bg-surface-base px-4 py-3 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
            >
              {loading ? 'Analyse…' : 'Voir mes prospects'}
            </button>
          </form>
          <p className="text-xs text-content-tertiary mt-3">
            Ton pipeline est à un domaine de décoller. ✈️
          </p>
        </section>
        </div>
      </main>

      <ReaderFooter />
    </div>
  );
}

// Plus de wrapper <Suspense> : sans useSearchParams, la page est
// entièrement prerendable (SSR complet, bon pour crawlers + LCP).
export default function VoliaOnePage() {
  return <OneInner />;
}
