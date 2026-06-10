'use client';

// ─────────────────────────────────────────────────────────────────────
// CampagnesSidebar — sidebar contextuelle pour /app/campagnes/*
// ─────────────────────────────────────────────────────────────────────
// Pattern identique à CrmSidebar (cohérence cross-modules) mais accent
// blue/violet — couleur du module Campagnes (cf. ModuleSwitcher BETA blue).
//
// Détection active via usePathname() :
//   - /app/campagnes                  → Listes (hub)
//   - /app/campagnes/lists/[id]       → Listes (encore actif)
//   - /app/campagnes/campaigns        → Campagnes email
//   - /app/campagnes/campaigns/[id]   → idem
//   - /settings/email-senders             → Domaines (lien out vers settings)
// ─────────────────────────────────────────────────────────────────────

import {
  Users,
  Mail,
  Globe,
  BarChart3,
  FileText,
  GitBranch,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'lists',
    label: 'Listes',
    description: 'Vos listes de prospects',
    href: '/app/campagnes',
    icon: Users,
    matches: (p) =>
      p === '/app/campagnes' ||
      p === '/app/campagnes/' ||
      p.startsWith('/app/campagnes/lists'),
  },
  {
    id: 'campaigns',
    label: 'Campagnes email',
    description: 'Pilotez vos envois',
    href: '/app/campagnes/campaigns',
    icon: Mail,
    matches: (p) => p.startsWith('/app/campagnes/campaigns'),
  },
  {
    id: 'sequences',
    label: 'Séquences',
    description: 'Multi-touch + stop-on-reply',
    href: '/app/campagnes/sequences',
    icon: GitBranch,
    matches: (p) => p.startsWith('/app/campagnes/sequences'),
  },
  {
    id: 'senders',
    // Rename jargon → plain french (QW4 audit UX). Le mot "Domaines d'envoi"
    // ne parle pas à un freelance 45 ans. "Brancher ma marque email" décrit
    // l'action utilisateur, pas la stack technique sous-jacente.
    label: 'Brancher ma marque email',
    description: 'Envoyer depuis ton domaine',
    href: '/settings/email-senders',
    icon: Globe,
    matches: (p) => p.startsWith('/settings/email-senders'),
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Bibliothèque emails',
    href: '/app/campagnes/templates',
    icon: FileText,
    matches: (p) => p.startsWith('/app/campagnes/templates'),
  },
  {
    id: 'stats',
    label: 'Statistiques',
    description: 'Performance globale',
    href: '/app/campagnes/stats',
    icon: BarChart3,
    soon: true,
    matches: (p) => p.startsWith('/app/campagnes/stats'),
  },
];

// Wrapper fin : tout le rendu vit dans AppSidebar (UX-2).
import AppSidebar from '@/components/AppSidebar';

export default function CampagnesSidebar({ isOpen, onClose }) {
  return (
    <AppSidebar
      accent="blue"
      title="Volia Campagnes"
      sections={[{ items: NAV_ITEMS }]}
      footer={{
        title: 'Module Campagnes',
        text: 'Séquences email avec warmup intégré, tracking opens/clicks et auto-create CRM depuis replies.',
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
