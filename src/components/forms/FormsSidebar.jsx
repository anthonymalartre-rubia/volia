'use client';

// ─────────────────────────────────────────────────────────────────────
// FormsSidebar — sidebar contextuelle pour /app/formulaires/*
// ─────────────────────────────────────────────────────────────────────
// 4e module Volia : Formulaires. Pattern identique aux sidebars
// Campagnes (blue), CRM (emerald), Prospection (indigo). Accent pink
// pour différencier visuellement le module Formulaires (Tally-like).
//
// Détection active via usePathname() :
//   - /app/formulaires                      → Mes formulaires (hub)
//   - /app/formulaires/[id]                 → idem (édition)
//   - /app/formulaires/templates            → Templates (placeholder F3)
//   - /app/formulaires/stats                → Statistiques (placeholder F4)
// ─────────────────────────────────────────────────────────────────────

import {
  FileText,
  LayoutTemplate,
  BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'forms',
    label: 'Mes formulaires',
    description: 'Créez et gérez vos forms',
    href: '/app/formulaires',
    icon: FileText,
    matches: (p) =>
      p === '/app/formulaires' ||
      p === '/app/formulaires/' ||
      (p.startsWith('/app/formulaires/') &&
        !p.startsWith('/app/formulaires/templates') &&
        !p.startsWith('/app/formulaires/stats')),
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Modèles prêts à l\'emploi',
    href: '/app/formulaires/templates',
    icon: LayoutTemplate,
    matches: (p) => p.startsWith('/app/formulaires/templates'),
  },
  {
    id: 'stats',
    label: 'Statistiques',
    description: 'Vues, conversions, bridges',
    href: '/app/formulaires/stats',
    icon: BarChart3,
    matches: (p) => p.startsWith('/app/formulaires/stats'),
  },
];

// Wrapper fin : tout le rendu vit dans AppSidebar (UX-2).
import AppSidebar from '@/components/AppSidebar';

export default function FormsSidebar({ isOpen, onClose }) {
  return (
    <AppSidebar
      accent="pink"
      title="Volia Formulaires"
      sections={[{ items: NAV_ITEMS }]}
      footer={{
        title: 'Module Formulaires',
        text: 'Forms multi-pages avec logique conditionnelle, bridge natif vers CRM et Campagnes. Tally-killer.',
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
