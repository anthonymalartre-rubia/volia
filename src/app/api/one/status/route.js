// ─────────────────────────────────────────────────────────────────────
// GET /api/one/status?campaign_id=<uuid> — Volia One : feed d'activité live
// ─────────────────────────────────────────────────────────────────────
// Après "Tout lancer", la page /one poll cette route pour afficher l'état
// par lead (en file → envoyé → délivré → ouvert → cliqué → répondu) + des
// compteurs, façon Origami.
//
// OWNER-SCOPED STRICT : on ne se repose PAS sur la RLS. On vérifie d'abord
// que la campagne appartient à l'utilisateur (owner_id = user.id), puis on
// ne lit les email_sends que de CETTE campagne. Jamais anonyme : un feed
// expose des emails de prospects + des stats privées.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

// Statut effectif d'un lead, dérivé des timestamps (le plus avancé gagne).
function leadStatus(s) {
  if (s.replied_at) return 'replied';
  if (s.bounced_at) return 'bounced';
  if (s.clicked_at) return 'clicked';
  if (s.opened_at) return 'opened';
  if (s.delivered_at) return 'delivered';
  if (s.sent_at) return 'sent';
  if (s.status === 'failed') return 'failed';
  return 'pending';
}

function maskEmail(email) {
  const [local, domain] = String(email || '').split('@');
  if (!domain) return email || '';
  const head = local.slice(0, 2);
  return `${head}${local.length > 2 ? '…' : ''}@${domain}`;
}

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('campaign_id');
  if (!id) {
    return NextResponse.json({ error: 'campaign_id requis' }, { status: 400 });
  }

  // ① Ownership : la campagne doit appartenir à l'utilisateur
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select('id, name, status, total_recipients, created_at')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!campaign) {
    return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });
  }

  // ② Sends de CETTE campagne uniquement
  const { data: sends } = await supabase
    .from('email_sends')
    .select('email, status, sent_at, delivered_at, opened_at, clicked_at, replied_at, bounced_at')
    .eq('campaign_id', id)
    .order('created_at', { ascending: true })
    .limit(200);

  const stats = {
    pending: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, failed: 0,
  };
  const leads = (sends || []).map((s) => {
    const st = leadStatus(s);
    stats[st] = (stats[st] || 0) + 1;
    return { email: maskEmail(s.email), status: st };
  });

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      total_recipients: campaign.total_recipients,
    },
    stats,
    leads,
  });
}
