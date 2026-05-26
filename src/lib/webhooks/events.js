// ─────────────────────────────────────────────────────────────────────
// Catalogue des events webhooks Volia — client-safe.
// ─────────────────────────────────────────────────────────────────────
// Ce fichier ne dépend QUE de constantes JS pures (zéro import Node), donc
// peut être importé depuis un composant client React (UI picker).
//
// Garder en sync avec la doc /api publique en cas d'ajout.
// L'emitter (server-only) re-export pour la compat des imports existants.

export const WEBHOOK_EVENTS = [
  { id: '*', label: 'Tous les events', module: 'Global', description: 'Wildcard — recevra TOUS les events Volia.' },

  // Prospection
  { id: 'prospect.created', label: 'Prospect créé', module: 'Prospection', description: 'Un nouveau prospect a été ajouté.' },
  { id: 'prospect.enriched', label: 'Prospect enrichi', module: 'Prospection', description: 'Email ou téléphone trouvé via le waterfall.' },
  { id: 'prospect.opt_out', label: 'Prospect opt-out', module: 'Prospection', description: "Un prospect s'est désinscrit (RGPD)." },
  { id: 'search.completed', label: 'Recherche terminée', module: 'Prospection', description: 'Une session de recherche est terminée.' },

  // Campagnes
  { id: 'campaign.sent', label: 'Campagne envoyée', module: 'Campagnes', description: 'Une campagne email/SMS a démarré son envoi.' },
  { id: 'campaign.completed', label: 'Campagne terminée', module: 'Campagnes', description: 'Tous les emails ont été envoyés.' },
  { id: 'email.delivered', label: 'Email délivré', module: 'Campagnes', description: 'Resend confirme la délivrance.' },
  { id: 'email.opened', label: 'Email ouvert', module: 'Campagnes', description: 'Premier tracking pixel chargé.' },
  { id: 'email.clicked', label: 'Email cliqué', module: 'Campagnes', description: 'Un destinataire a cliqué un lien tracké.' },
  { id: 'email.bounced', label: 'Email bounce', module: 'Campagnes', description: 'Email rejeté par le serveur destinataire.' },
  { id: 'email.replied', label: 'Email répondu', module: 'Campagnes', description: 'Un destinataire a répondu (inbound parsing).' },
  { id: 'sms.delivered', label: 'SMS délivré', module: 'Campagnes', description: 'Twilio confirme la délivrance.' },
  { id: 'sms.replied', label: 'SMS répondu', module: 'Campagnes', description: 'Réponse SMS reçue.' },

  // Sequences
  { id: 'sequence.enrolled', label: 'Séquence : inscription', module: 'Séquences', description: 'Un prospect est entré dans une séquence.' },
  { id: 'sequence.completed', label: 'Séquence terminée', module: 'Séquences', description: 'Le prospect a atteint la dernière étape.' },

  // CRM
  { id: 'crm.contact.created', label: 'Contact CRM créé', module: 'CRM', description: 'Auto-créé depuis une réponse email/SMS ou manuel.' },
  { id: 'crm.deal.created', label: 'Deal CRM créé', module: 'CRM', description: 'Nouvelle opportunité.' },
  { id: 'crm.deal.stage_changed', label: 'Deal CRM : étape changée', module: 'CRM', description: 'Un deal a bougé dans le pipeline.' },
  { id: 'crm.deal.won', label: 'Deal CRM gagné', module: 'CRM', description: 'Un deal est passé en stage "won".' },
  { id: 'crm.deal.lost', label: 'Deal CRM perdu', module: 'CRM', description: 'Un deal est passé en stage "lost".' },
];

// Groupes module → events (pour le picker UI organisé en sections).
export function groupEventsByModule() {
  const map = new Map();
  for (const e of WEBHOOK_EVENTS) {
    const arr = map.get(e.module) || [];
    arr.push(e);
    map.set(e.module, arr);
  }
  return Array.from(map.entries());
}

// Couleur de badge par module (semantic, pas hardcoded marque).
export function moduleColor(module) {
  switch (module) {
    case 'Prospection':
      return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    case 'Campagnes':
      return 'bg-violet-500/15 text-violet-600 border-violet-500/30';
    case 'Séquences':
      return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
    case 'CRM':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    case 'Global':
    default:
      return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
  }
}
