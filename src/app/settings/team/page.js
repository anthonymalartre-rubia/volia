'use client';

// /settings/team
// Page Multi-utilisateurs (Business 149€). Liste des members + invitations + modal d'invite.

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Crown,
  User as UserIcon,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Copy,
  Clock,
} from 'lucide-react';

function RoleBadge({ role }) {
  const config = {
    owner: { label: 'Owner', icon: Crown, cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    admin: { label: 'Admin', icon: ShieldCheck, cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
    member: { label: 'Membre', icon: UserIcon, cls: 'bg-surface-elevated text-content-tertiary border-line' },
  }[role] || { label: role, icon: UserIcon, cls: 'bg-surface-elevated text-content-tertiary border-line' };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border ${config.cls}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function Avatar({ email, name }) {
  const initial = (name || email || '?').slice(0, 1).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      {initial}
    </div>
  );
}

export default function TeamSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/teams/me', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erreur chargement');
      setData(j);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-4xl">
        <div className="flex items-center gap-2 text-content-tertiary">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      </div>
    );
  }

  // Pas de team → écran "passez Business"
  if (!data?.team) {
    return (
      <div className="p-6 md:p-10 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-violet-600" />
            <h1 className="text-2xl font-semibold text-content-primary">Équipe</h1>
          </div>
          <p className="text-sm text-content-tertiary">
            Invitez vos collègues, partagez le quota et collaborez sur les mêmes campagnes.
          </p>
        </header>

        <div className="relative p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.05] to-indigo-500/[0.05] overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-700 text-xs font-medium mb-4">
              <Sparkles size={12} />
              Plan Business 149€/mois
            </div>
            <h2 className="text-xl font-semibold text-content-primary mb-2">
              Multi-utilisateurs réservé au plan Business
            </h2>
            <p className="text-sm text-content-tertiary mb-6 max-w-xl leading-relaxed">
              Le plan <strong className="text-content-primary">Business</strong> débloque les équipes :
              invitez vos collègues, partagez les 10 000 prospects/mois et gérez les permissions
              (owner / admin / member).
            </p>
            <Link
              href="/settings#plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium shadow-sm shadow-violet-500/30 active:scale-95 transition-all"
            >
              <Sparkles size={14} />
              Voir le plan Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { team, role, members, invitations, can_invite } = data;

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-violet-600" />
            <h1 className="text-2xl font-semibold text-content-primary">{team.name}</h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm text-content-tertiary">
            {members.length} membre{members.length > 1 ? 's' : ''}
            {invitations.length > 0 && ` · ${invitations.length} invitation${invitations.length > 1 ? 's' : ''} en attente`}
          </p>
        </div>
        {can_invite && (
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium shadow-sm shadow-violet-500/30 active:scale-95 transition-all"
          >
            <UserPlus size={14} />
            Inviter un membre
          </button>
        )}
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Liste des members */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-content-primary mb-3">
          Membres ({members.length})
        </h2>
        <div className="rounded-xl border border-line bg-surface-card divide-y divide-line overflow-hidden">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              currentRole={role}
              onChange={load}
            />
          ))}
        </div>
      </section>

      {/* Invitations pending */}
      {invitations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-content-primary mb-3">
            Invitations en attente ({invitations.length})
          </h2>
          <div className="rounded-xl border border-line bg-surface-card divide-y divide-line overflow-hidden">
            {invitations.map((inv) => (
              <InvitationRow key={inv.id} invite={inv} canCancel={can_invite} onChange={load} />
            ))}
          </div>
        </section>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function MemberRow({ member, currentRole, onChange }) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const canManage = (currentRole === 'owner' || currentRole === 'admin') && member.role !== 'owner';
  const canChangeRoleHere = currentRole === 'owner' && member.role !== 'owner';

  const remove = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/teams/members/${member.id}`, { method: 'DELETE' });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || 'Erreur');
      } else {
        onChange?.();
      }
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  const changeRole = async (newRole) => {
    setBusy(true);
    try {
      const r = await fetch(`/api/teams/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || 'Erreur');
      } else {
        onChange?.();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar email={member.email} name={member.full_name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content-primary truncate">
          {member.full_name || member.email || 'Utilisateur'}
        </p>
        {member.email && (
          <p className="text-xs text-content-tertiary truncate">{member.email}</p>
        )}
      </div>
      <RoleBadge role={member.role} />
      {canChangeRoleHere && (
        <select
          value={member.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={busy}
          className="text-xs px-2 py-1.5 rounded-md bg-surface-base border border-line text-content-primary focus:outline-none focus:border-violet-500"
        >
          <option value="member">Membre</option>
          <option value="admin">Admin</option>
        </select>
      )}
      {canManage && (
        confirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={remove}
              disabled={busy}
              className="text-xs px-2 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirmer'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              disabled={busy}
              className="text-xs px-2 py-1.5 rounded-md text-content-tertiary hover:text-content-primary"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="p-1.5 rounded-md text-content-muted hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Retirer"
          >
            <Trash2 size={14} />
          </button>
        )
      )}
    </div>
  );
}

function InvitationRow({ invite, canCancel, onChange }) {
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/teams/invitations?id=${invite.id}`, { method: 'DELETE' });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || 'Erreur');
      } else {
        onChange?.();
      }
    } finally {
      setBusy(false);
    }
  };

  const expiresIn = Math.round((new Date(invite.expires_at) - Date.now()) / (24 * 3600 * 1000));

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        <Mail size={16} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content-primary truncate">{invite.email}</p>
        <p className="text-xs text-content-tertiary flex items-center gap-1">
          <Clock size={10} />
          Expire dans {expiresIn} jour{expiresIn > 1 ? 's' : ''}
        </p>
      </div>
      <RoleBadge role={invite.role} />
      {canCancel && (
        <button
          onClick={cancel}
          disabled={busy}
          className="p-1.5 rounded-md text-content-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label="Annuler l'invitation"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 size={14} />}
        </button>
      )}
    </div>
  );
}

function InviteModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erreur');
      setSuccess(true);
      setTimeout(onSuccess, 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface-base border border-line shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h3 className="text-base font-semibold text-content-primary flex items-center gap-2">
            <UserPlus size={16} className="text-violet-600" />
            Inviter un membre
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-elevated"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
            <p className="text-sm font-medium text-content-primary mb-1">Invitation envoyée !</p>
            <p className="text-xs text-content-tertiary">{email}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-content-tertiary mb-1.5 block">
                Email du collègue
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@entreprise.com"
                required
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg bg-surface-card border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-content-tertiary mb-1.5 block">
                Rôle
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'member', label: 'Membre', desc: 'Utilisation', icon: UserIcon },
                  { id: 'admin', label: 'Admin', desc: 'Invite + manage', icon: ShieldCheck },
                ].map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        active
                          ? 'border-violet-500 bg-violet-500/5'
                          : 'border-line bg-surface-card hover:border-line/80'
                      }`}
                    >
                      <Icon size={14} className={active ? 'text-violet-600 mb-1' : 'text-content-tertiary mb-1'} />
                      <p className="text-xs font-medium text-content-primary">{r.label}</p>
                      <p className="text-[10px] text-content-tertiary">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-start gap-2">
                <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-content-tertiary hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy || !email}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
