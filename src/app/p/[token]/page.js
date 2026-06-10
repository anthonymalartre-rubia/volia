// ─────────────────────────────────────────────────────────────────────
// /p/[token] — vue client publique d'un projet Volia Project.
// Read-only, sans login, brandée Volia. Server component : lookup du
// token via service role (les RLS bloquent l'anon), aucune donnée
// sensible exposée (pas d'emails, pas de commentaires internes).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { computeProjectStats } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Suivi de projet — Volia',
  robots: { index: false, follow: false },
};

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function notifyOwnerOfView(admin, project) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data: existing } = await admin
    .from('notifications')
    .select('id')
    .eq('user_id', project.user_id)
    .eq('type', 'project_share_viewed')
    .eq('metadata->>project_id', project.id)
    .gte('created_at', startOfDay.toISOString())
    .limit(1);
  if (existing && existing.length > 0) return;

  await admin.from('notifications').insert({
    user_id: project.user_id,
    type: 'project_share_viewed',
    title: 'Votre client a consulté son suivi de projet 👀',
    body: `Le lien de suivi de « ${project.name} » vient d'être ouvert. Bon moment pour prendre des nouvelles.`,
    link: `/app/projets/${project.id}`,
    metadata: { project_id: project.id, source: 'share_view' },
  });
}

async function getSharedProject(token) {
  // Token = 48 hex chars générés par la DB. On rejette tout le reste
  // avant de toucher la base.
  if (!/^[a-f0-9]{32,64}$/.test(token || '')) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: share } = await admin
    .from('project_shares')
    .select('project_id, revoked_at')
    .eq('token', token)
    .maybeSingle();
  if (!share || share.revoked_at) return null;

  const { data: project } = await admin
    .from('projects')
    .select(`
      id, user_id, name, description, status, created_at, updated_at,
      tasks:project_tasks(id, title, status, due_at, is_milestone, position),
      deliverables:project_deliverables(id, name, status, delivered_at, attachment_id)
    `)
    .eq('id', share.project_id)
    .maybeSingle();
  if (!project) return null;

  // Signal commercial : prévenir le propriétaire que son client a ouvert
  // le lien de suivi. Best-effort, dédupé à 1 notification / projet / jour
  // (sinon chaque refresh du client spammerait la cloche).
  notifyOwnerOfView(admin, project).catch(() => {});

  // URLs signées (24h) pour les livrables livrés avec fichier.
  const withFiles = (project.deliverables || []).filter((d) => d.attachment_id);
  const fileUrls = {};
  if (withFiles.length) {
    const { data: attachments } = await admin
      .from('project_attachments')
      .select('id, file_path, file_name')
      .in('id', withFiles.map((d) => d.attachment_id));
    for (const att of attachments || []) {
      const { data: signed } = await admin.storage
        .from('project-files')
        .createSignedUrl(att.file_path, 86400, { download: att.file_name });
      if (signed?.signedUrl) fileUrls[att.id] = { url: signed.signedUrl, name: att.file_name };
    }
  }

  return { project, fileUrls };
}

export default async function SharedProjectPage({ params }) {
  const shared = await getSharedProject(params.token);

  if (!shared) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-white mb-2">Lien expiré ou invalide</h1>
          <p className="text-sm text-zinc-400">
            Ce lien de suivi de projet n&apos;est plus actif. Contactez votre prestataire pour en
            obtenir un nouveau.
          </p>
        </div>
      </div>
    );
  }

  const { project, fileUrls } = shared;
  const tasks = (project.tasks || []).sort((a, b) => a.position - b.position);
  const stats = computeProjectStats(tasks);
  const milestones = tasks.filter((t) => t.is_milestone);
  const deliverables = project.deliverables || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Brand */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-sm font-bold tracking-tight">
            Volia<span className="text-violet-400">.fr</span>
          </span>
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
            Suivi de projet
          </span>
        </div>

        {/* Header projet */}
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        {project.description && <p className="text-zinc-400 mb-6">{project.description}</p>}
        <p className="text-xs text-zinc-500 mb-8">
          Dernière mise à jour : {fmtDate(project.updated_at)}
        </p>

        {/* Progression */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-end justify-between mb-3">
            <span className="text-sm text-zinc-400">Avancement global</span>
            <span className="text-3xl font-bold text-amber-400">{stats.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            {stats.done} tâche{stats.done > 1 ? 's' : ''} terminée{stats.done > 1 ? 's' : ''} sur {stats.total}
            {project.status === 'done' && ' — projet terminé ✅'}
          </p>
        </div>

        {/* Jalons */}
        {milestones.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Étapes clés
            </h2>
            <ul className="space-y-3">
              {milestones.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      m.status === 'done'
                        ? 'bg-emerald-500 text-white'
                        : m.status === 'doing'
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {m.status === 'done' ? '✓' : '●'}
                  </span>
                  <span className={m.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}>
                    {m.title}
                  </span>
                  {m.due_at && m.status !== 'done' && (
                    <span className="ml-auto text-[11px] text-zinc-500 shrink-0">
                      {fmtDate(m.due_at)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Livrables */}
        {deliverables.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Livrables
            </h2>
            <ul className="space-y-3">
              {deliverables.map((d) => {
                const file = d.attachment_id ? fileUrls[d.attachment_id] : null;
                return (
                  <li key={d.id} className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        d.status === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {d.status === 'delivered' ? 'Livré' : 'À venir'}
                    </span>
                    <span className="text-zinc-200 text-sm flex-1">{d.name}</span>
                    {file && (
                      <a
                        href={file.url}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0"
                      >
                        Télécharger ↓
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-600 mt-10">
          Suivi de projet propulsé par{' '}
          <Link href="https://volia.fr" className="text-zinc-400 hover:text-white font-medium">
            Volia
          </Link>{' '}
          — la suite de croissance B2B française.
        </p>
      </div>
    </div>
  );
}
