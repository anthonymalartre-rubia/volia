'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Plus, ChevronRight, Loader2, ShieldOff, LogIn,
  Send, Pause, Clock, CheckCircle2, XCircle, Eye, MousePointerClick,
  Upload, Globe, Rocket, Circle,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import NoAdminScreen from '@/components/NoAdminScreen';
import { CAMPAGNES_ALLOWED_PLANS } from '@/lib/campagnes-access';
import { CardListSkeleton } from '@/components/ui';
import ImportCsvModal from '@/components/campagnes/ImportCsvModal';

const STATUS_META = {
  draft:     { label: 'Brouillon',  color: 'text-content-tertiary', bg: 'bg-content-tertiary/10', icon: <Clock size={11} /> },
  scheduled: { label: 'Planifiée',  color: 'text-blue-400',         bg: 'bg-blue-500/10',          icon: <Clock size={11} /> },
  sending:   { label: 'En cours',   color: 'text-amber-600',        bg: 'bg-amber-500/10',         icon: <Send size={11} /> },
  paused:    { label: 'En pause',   color: 'text-orange-600',       bg: 'bg-orange-500/10',        icon: <Pause size={11} /> },
  sent:      { label: 'Envoyée',    color: 'text-emerald-400',      bg: 'bg-emerald-500/10',       icon: <CheckCircle2 size={11} /> },
  failed:    { label: 'Échouée',    color: 'text-red-400',          bg: 'bg-red-500/10',           icon: <XCircle size={11} /> },
};

export default function CampaignsHubPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [authState, setAuthState] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [listsCount, setListsCount] = useState(0);
  const [verifiedSendersCount, setVerifiedSendersCount] = useState(0);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('guest'); setLoading(false); return; }
      setCurrentEmail(user.email);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();
      const allowed = profile?.plan && CAMPAGNES_ALLOWED_PLANS.includes(profile.plan.toLowerCase());
      if (!allowed) { router.push('/dashboard?upgrade=campagnes'); return; }
      setAuthState('ok');

      // Fetch en parallèle : campagnes + listes + senders (onboarding checklist
      // P1-2). On a besoin des 3 pour cocher chaque étape :
      //  - 1 liste min → step "Importer ma liste" coché
      //  - 1 sender verified min → step "Brancher mon domaine" coché
      //  - 1 campagne `sent` min → step "Envoyer ma 1ère campagne" coché
      const [campRes, listsRes, sendersRes] = await Promise.all([
        fetch('/api/app/campagnes/email-campaigns'),
        fetch('/api/app/campagnes/lists'),
        fetch('/api/email-senders').catch(() => null),
      ]);
      if (campRes.ok) {
        const data = await campRes.json();
        setCampaigns(data.campaigns || []);
      }
      if (listsRes.ok) {
        const data = await listsRes.json();
        setListsCount((data.lists || []).length);
      }
      if (sendersRes && sendersRes.ok) {
        const data = await sendersRes.json();
        const senders = data.senders || data.email_senders || [];
        setVerifiedSendersCount(senders.filter((s) => s.status === 'verified').length);
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  // Callback après import CSV réussi : on push direct vers le wizard avec
  // le list_id pré-rempli — flow continu, l'utilisateur n'a rien à re-choisir.
  function handleImportSuccess(listId) {
    setImportModalOpen(false);
    router.push(`/app/campagnes/campaigns/new?list=${listId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base text-content-primary p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 space-y-3">
            <div className="h-3 w-24 bg-zinc-200/80 dark:bg-zinc-700/40 rounded animate-pulse" />
            <div className="h-8 w-64 bg-zinc-200/80 dark:bg-zinc-700/40 rounded animate-pulse" />
          </div>
          <CardListSkeleton count={4} />
        </div>
      </div>
    );
  }
  if (authState === 'guest') return <GuestScreen />;
  if (authState === 'no-admin') return <NoAdminScreen email={currentEmail} signOut={async () => { await supabase.auth.signOut(); router.push('/login?return=/app/campagnes/campaigns'); }} />;

  // ── Onboarding checklist (P1-2) ───────────────────────────────────
  // Affichée tant qu'au moins une étape n'est pas validée. Persona cible :
  // freelance 45 ans qui découvre le module — il a besoin de voir d'un coup
  // d'oeil ce qu'il reste à faire AVANT de pouvoir envoyer.
  const sentCampaigns = campaigns.filter((c) => c.status === 'sent').length;
  const hasList = listsCount > 0;
  const hasVerifiedSender = verifiedSendersCount > 0;
  const hasSentCampaign = sentCampaigns > 0;
  const onboardingComplete = hasList && hasVerifiedSender && hasSentCampaign;

  return (
    <div className="min-h-screen bg-surface-base text-content-primary p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link href="/app/campagnes" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition mb-2">
              <ArrowLeft size={14} />
              Prospection
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Mail size={24} className="text-violet-400" />
              Campagnes email
            </h1>
            <p className="text-sm text-content-secondary mt-1">
              Envoie, suis les ouvertures, les clics, les réponses. C&apos;est tout.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-line bg-surface-card hover:border-violet-500/40 hover:bg-surface-elevated text-content-secondary hover:text-content-primary text-sm font-medium transition"
            >
              <Upload size={14} />
              Importer un CSV
            </button>
            <Link
              href="/app/campagnes/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
            >
              <Plus size={14} />
              Nouvelle campagne
            </Link>
          </div>
        </div>

        {/* Onboarding checklist — visible tant que les 3 étapes ne sont pas cochées */}
        {!onboardingComplete && (
          <OnboardingChecklist
            hasList={hasList}
            hasVerifiedSender={hasVerifiedSender}
            hasSentCampaign={hasSentCampaign}
            onImportCsvClick={() => setImportModalOpen(true)}
          />
        )}

        {campaigns.length === 0 ? (
          listsCount === 0 ? (
            // Pas encore de liste → CTA principal = ouvrir la modale d'import
            // (P1-1 — plus de redirection vers /app/campagnes).
            <div className="rounded-2xl border border-dashed border-line p-12 text-center">
              <Mail size={28} className="mx-auto mb-2 text-content-tertiary opacity-50" />
              <p className="text-content-tertiary mb-1">Avant la campagne, il te faut une liste.</p>
              <p className="text-xs text-content-tertiary mb-4">
                Une campagne sans destinataires, ça envoie pas grand-chose. Commence par là.
              </p>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
              >
                <Upload size={14} />
                Pas de liste ? Importer un CSV
              </button>
              <p className="text-[11px] text-content-tertiary mt-3">
                Ou{' '}
                <Link href="/app/campagnes" className="text-violet-400 hover:underline">
                  utiliser une liste existante
                </Link>
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-12 text-center">
              <Mail size={28} className="mx-auto mb-2 text-content-tertiary opacity-50" />
              <p className="text-content-tertiary mb-1">Pas encore de campagne. Plus elle est petite, mieux c&apos;est pour commencer.</p>
              <p className="text-xs text-content-tertiary mb-4">
                {listsCount} liste{listsCount > 1 ? 's' : ''} dispo{listsCount > 1 ? 's' : ''}. Une cible bien choisie vaut mieux qu&apos;un blast à 10k.
              </p>
              <Link href="/app/campagnes/campaigns/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition">
                <Plus size={14} />
                Première campagne
              </Link>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-line bg-surface-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated text-xs text-content-tertiary uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Campagne</th>
                  <th className="text-left px-4 py-3 font-semibold">Statut</th>
                  <th className="text-right px-4 py-3 font-semibold">Destinataires</th>
                  <th className="text-right px-4 py-3 font-semibold">Envoyés</th>
                  <th className="text-right px-4 py-3 font-semibold">Ouvertures</th>
                  <th className="text-right px-4 py-3 font-semibold">Clics</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const meta = STATUS_META[c.status] || STATUS_META.draft;
                  const openRate = c.sent_count > 0 ? Math.round((c.opened_count / c.sent_count) * 100) : 0;
                  const clickRate = c.sent_count > 0 ? Math.round((c.clicked_count / c.sent_count) * 100) : 0;
                  return (
                    <tr key={c.id} className="border-t border-line hover:bg-surface-elevated/50 transition group">
                      <td className="px-4 py-3">
                        <Link href={`/app/campagnes/campaigns/${c.id}`} className="block group-hover:text-violet-400 transition">
                          <div className="font-semibold text-content-primary">{c.name}</div>
                          <div className="text-xs text-content-tertiary truncate max-w-md">{c.subject}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${meta.bg} ${meta.color}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-content-secondary">
                        {c.total_recipients || 0}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-content-secondary">
                        {c.sent_count || 0}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="text-content-primary">{c.opened_count || 0}</span>
                        {c.sent_count > 0 && (
                          <span className="text-content-tertiary text-xs ml-1">({openRate}%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="text-content-primary">{c.clicked_count || 0}</span>
                        {c.sent_count > 0 && (
                          <span className="text-content-tertiary text-xs ml-1">({clickRate}%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/app/campagnes/campaigns/${c.id}`}
                          className="inline-flex items-center gap-1 text-content-tertiary group-hover:text-violet-400 transition"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-content-tertiary mt-6 leading-relaxed">
          <strong className="text-content-primary">Cadence :</strong> le cron envoie ~50 emails toutes les 5 minutes (limite Resend ~10/sec, marge de sécurité).
          Pour une liste de 1 000 contacts, comptez ~2h. Vous pouvez planifier une heure d&apos;envoi (RGPD : éviter nuit/weekend).
        </p>
      </div>

      {/* Modale d'import CSV — fix P1-1 audit UX */}
      <ImportCsvModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Onboarding checklist — P1-2 fix audit UX
// ─────────────────────────────────────────────────────────────────────
// Affichée si au moins une étape manque. Disparaît une fois tout coché.
// Chaque étape = un état (done/pending) + un CTA contextualisé.
function OnboardingChecklist({ hasList, hasVerifiedSender, hasSentCampaign, onImportCsvClick }) {
  const steps = [
    {
      done: hasList,
      label: '1. Importer ma liste',
      description: 'Upload ton CSV de prospects pour avoir des destinataires.',
      cta: hasList ? null : { label: 'Importer un CSV', onClick: onImportCsvClick },
      icon: Upload,
    },
    {
      done: hasVerifiedSender,
      label: '2. Brancher mon domaine',
      description: 'Pour que Gmail/Outlook ne te mettent pas en spam.',
      cta: hasVerifiedSender ? null : { label: 'Connecter mon domaine', href: '/settings/email-senders' },
      icon: Globe,
    },
    {
      done: hasSentCampaign,
      label: '3. Envoyer ma 1ère campagne',
      description: 'C\'est le moment. Une cible bien choisie, un message court.',
      cta: hasSentCampaign ? null : {
        label: 'Nouvelle campagne',
        href: '/app/campagnes/campaigns/new',
        disabled: !hasList || !hasVerifiedSender,
        disabledHint: !hasList
          ? 'Importe d\'abord une liste'
          : !hasVerifiedSender
          ? 'Branche d\'abord ton domaine'
          : null,
      },
      icon: Rocket,
    },
  ];
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="mb-6 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.06] via-indigo-500/[0.04] to-surface-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-violet-400 font-semibold mb-1">
            Avant ma 1ère campagne
          </div>
          <h2 className="text-base font-semibold text-content-primary">
            {completedCount}/3 étapes complétées
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 w-10 rounded-full transition-colors ${
                s.done ? 'bg-violet-500' : 'bg-surface-elevated'
              }`}
            />
          ))}
        </div>
      </div>

      <ol className="space-y-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isDisabledCta = step.cta?.disabled;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                step.done
                  ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                  : 'border-line bg-surface-card'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.done ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className="text-content-tertiary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon size={13} className={step.done ? 'text-emerald-500' : 'text-violet-400'} />
                  <span
                    className={`text-sm font-medium ${
                      step.done ? 'text-content-secondary line-through' : 'text-content-primary'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {!step.done && (
                  <p className="text-xs text-content-tertiary mt-1 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
              {step.cta && (
                <div className="flex-shrink-0">
                  {step.cta.href ? (
                    isDisabledCta ? (
                      <button
                        type="button"
                        disabled
                        title={step.cta.disabledHint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-surface-elevated text-content-tertiary border border-line cursor-not-allowed opacity-60"
                      >
                        {step.cta.label}
                      </button>
                    ) : (
                      <Link
                        href={step.cta.href}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 transition"
                      >
                        {step.cta.label}
                        <ChevronRight size={12} />
                      </Link>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={step.cta.onClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 transition"
                    >
                      {step.cta.label}
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CenteredSpinner() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center text-content-secondary">
      <Loader2 className="animate-spin" size={20} />
    </div>
  );
}

function GuestScreen() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-line bg-surface-card p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4">
          <LogIn size={20} className="text-violet-300" />
        </div>
        <h1 className="text-xl font-bold mb-2">Connexion requise</h1>
        <p className="text-sm text-content-secondary mb-6">Cette page est réservée aux administrateurs.</p>
        <Link href="/login?return=/app/campagnes/campaigns" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition">
          <LogIn size={14} />
          Se connecter
        </Link>
      </div>
    </div>
  );
}

// NoAdminScreen partagé — voir src/components/NoAdminScreen.jsx (QW5).
