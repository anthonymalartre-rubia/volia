'use client';

// ─────────────────────────────────────────────────────────────────────
// CrmSidebar — sidebar contextuelle pour les pages /app/crm/*.
// ─────────────────────────────────────────────────────────────────────
// Indépendante du Sidebar du dashboard Prospection (qui utilise un
// pattern activeView/onViewChange interne et qu'on ne veut PAS casser).
//
// Détection active via usePathname() :
//   - /app/crm                         → Kanban
//   - /app/crm/contacts(/*)            → Contacts
//   - /app/crm/activities(/*)          → Activités (Phase 4)
//   - /app/crm/pipelines(/*)           → Pipelines (Phase 4+)
//
// Style aligné sur Sidebar.jsx (mêmes paddings, gradients, encart bas)
// mais accent emerald/teal au lieu d'indigo.
// ─────────────────────────────────────────────────────────────────────

import {
  KanbanSquare,
  Users,
  Activity,
  GitBranch,
  Inbox,
  Sliders,
  BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'kanban',
    label: 'Kanban',
    description: 'Pipeline visuel',
    href: '/app/crm',
    icon: KanbanSquare,
    matches: (p) => p === '/app/crm' || p === '/app/crm/',
  },
  {
    id: 'contacts',
    label: 'Contacts',
    description: 'Annuaire CRM',
    href: '/app/crm/contacts',
    icon: Users,
    matches: (p) => p.startsWith('/app/crm/contacts'),
  },
  {
    id: 'activities',
    label: 'Activités',
    description: 'Notes, calls, meetings',
    href: '/app/crm/activities',
    icon: Activity,
    matches: (p) => p.startsWith('/app/crm/activities'),
  },
  {
    id: 'inbound',
    label: 'Réponses',
    description: 'Replies email & SMS',
    href: '/app/crm/inbound',
    icon: Inbox,
    matches: (p) => p.startsWith('/app/crm/inbound'),
  },
  {
    id: 'reports',
    label: 'Rapports',
    description: 'Performance commerciale',
    href: '/app/crm/reports',
    icon: BarChart3,
    matches: (p) => p.startsWith('/app/crm/reports'),
  },
];

// Configuration items — regroupés visuellement en bas de la sidebar
const CONFIG_ITEMS = [
  {
    id: 'pipelines',
    label: 'Pipelines',
    description: 'Stages & règles',
    href: '/app/crm/pipelines',
    icon: GitBranch,
    matches: (p) => p.startsWith('/app/crm/pipelines'),
  },
  {
    id: 'custom-fields',
    label: 'Champs custom',
    description: 'Personnaliser contacts/deals',
    href: '/app/crm/custom-fields',
    icon: Sliders,
    matches: (p) => p.startsWith('/app/crm/custom-fields'),
  },
];

// Wrapper fin : tout le rendu vit dans AppSidebar (UX-2).
import AppSidebar from '@/components/AppSidebar';

export default function CrmSidebar({ isOpen, onClose }) {
  return (
    <AppSidebar
      accent="emerald"
      title="Volia CRM"
      sections={[
        { items: NAV_ITEMS },
        { title: 'Configuration', items: CONFIG_ITEMS },
      ]}
      footer={{
        title: 'Plan Business',
        text: 'Pipeline natif, contacts illimités, deals tracking. Tout connecté à la Prospection.',
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
