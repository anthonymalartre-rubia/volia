// Checklist warmup de domaine cold email — 28 jours.

import { CoverPage, Toc } from './CoverAndToc';

const DNS_RECORDS = [
  { name: 'SPF', purpose: 'Liste les serveurs autorisés à envoyer en votre nom', example: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all' },
  { name: 'DKIM', purpose: 'Signature cryptographique des emails', example: 'Activée dans Google Workspace ou Microsoft 365 — pas de config manuelle' },
  { name: 'DMARC', purpose: 'Politique en cas d\'échec SPF/DKIM. Commencer par "none".', example: 'v=DMARC1; p=none; rua=mailto:dmarc@votredomaine.com' },
  { name: 'MX', purpose: 'Pointage vers vos serveurs de mail', example: 'Géré par Google Workspace / Microsoft 365' },
  { name: 'BIMI', purpose: 'Affiche votre logo dans Gmail/Outlook (CTR boost) — optionnel', example: 'Nécessite un certificat VMC payant (~1000 €/an)' },
];

const PHASES = [
  {
    title: 'PRÉ-WARMUP (J-7 à J0)',
    color: 'amber',
    goal: 'Configuration DNS + sous-domaine dédié, avant tout envoi.',
    checklist: [
      'Créer un sous-domaine dédié au cold email (ex: hello.votredomaine.com). NE JAMAIS utiliser le domaine principal.',
      'Configurer SPF sur le sous-domaine',
      'Activer DKIM dans Google Workspace ou Microsoft 365',
      'Configurer DMARC avec p=none (mode observation au début)',
      'Configurer MX records pointant vers Google/Microsoft',
      'Tester la configuration avec mxtoolbox.com — score "deliverable"',
      'Tester avec mail-tester.com — score > 8/10',
      'Inscrire le sous-domaine dans Google Postmaster Tools',
      'Créer 1-2 boîtes mail sur le sous-domaine (pierre@hello.votredomaine.com)',
    ],
  },
  {
    title: 'PHASE 1 — SOFT LAUNCH (J+1 à J+7)',
    color: 'blue',
    goal: 'Démarrer doucement, laisser Gmail/Outlook reconnaître votre domaine.',
    volume: '10-30 emails/jour, par boîte d\'envoi',
    checklist: [
      'Activer un outil de warmup automatique (Lemwarm, Smartlead, Instantly — tous incluent ce service)',
      'Envoyer 10 emails le J+1, 15 le J+2, etc. (+5/jour)',
      'Aucun cold email vrai pendant cette phase — uniquement le warmup auto',
      'Surveiller Google Postmaster : domaine doit passer de "Unknown" à "Good"',
      'Bounce rate target : 0%',
      'Spam complaints target : 0%',
      'Open rate target : > 30% (warmup auto)',
      'Si bounce > 2% ou spam > 0.1% : ARRÊTER et investiguer',
    ],
  },
  {
    title: 'PHASE 2 — MONTÉE PROGRESSIVE (J+8 à J+21)',
    color: 'indigo',
    goal: 'Augmenter progressivement le volume + premiers vrais cold emails.',
    volume: '30-100 emails/jour, +10-15/jour',
    checklist: [
      'Continuer le warmup auto en parallèle (40-60% du volume)',
      'Démarrer les vrais cold emails : 5-10/jour le J+8, +5/jour ensuite',
      'Diviser les vrais cold emails par 3 destinations (Gmail, Outlook, autres) pour équilibrer',
      'Personnaliser chaque cold email (variables {{prenom}}, {{société}}, etc.)',
      'Bounce rate target : < 2%',
      'Spam complaints target : < 0.1%',
      'Open rate target : > 30% (réel, attention Apple Mail Privacy)',
      'Reply rate target : > 5% (signal positif de pertinence ICP)',
      'Vérifier Google Postmaster quotidiennement : doit rester "Good" ou "High"',
      'Si dégradation : pause vrais cold emails 48h, augmenter warmup auto',
    ],
  },
  {
    title: 'PHASE 3 — CRUISE (J+22 à J+28)',
    color: 'green',
    goal: 'Atteindre le volume cible et stabiliser.',
    volume: '100-200 emails/jour (par boîte)',
    checklist: [
      'Atteindre 100-200 emails/jour (par boîte d\'envoi)',
      'Garder 10-20% de volume en warmup auto en permanence',
      'Bounce rate target : < 1.5%',
      'Spam complaints target : < 0.05%',
      'Open rate target : > 35%',
      'Reply rate target : > 8%',
      'Mettre en place un monitoring quotidien (Google Postmaster Tools)',
      'Renforcer DMARC : passer de p=none à p=quarantine (mode plus strict)',
      'Documenter la configuration finale pour pouvoir la reproduire',
      'Préparer la création d\'un 2e sous-domaine si vous voulez scaler au-delà',
    ],
  },
];

const METRICS = [
  { name: 'Bounce rate', excellent: '< 1%', good: '1-2%', warning: '2-5%', critical: '> 5%' },
  { name: 'Spam complaints', excellent: '0%', good: '< 0.1%', warning: '0.1-0.5%', critical: '> 0.5%' },
  { name: 'Open rate (réel)', excellent: '> 50%', good: '35-50%', warning: '20-35%', critical: '< 20%' },
  { name: 'Reply rate', excellent: '> 15%', good: '8-15%', warning: '3-8%', critical: '< 3%' },
  { name: 'Google Postmaster Domain Reputation', excellent: 'High', good: 'Medium', warning: 'Low', critical: 'Bad' },
];

export default function ChecklistWarmup() {
  const tocItems = [
    { id: 'dns', label: 'Configuration DNS (à faire en premier)', meta: '5 records' },
    ...PHASES.map((p, i) => ({ id: `phase-${i}`, label: p.title })),
    { id: 'metrics', label: 'Métriques de référence', meta: '5 KPI' },
    { id: 'maintenance', label: 'Maintenance après warmup' },
  ];

  return (
    <div>
      <CoverPage
        title="Checklist warmup domaine cold email"
        subtitle="Protocole complet en 28 jours pour warmer un nouveau domaine d'envoi : DNS, volumes, métriques, outils."
        tagline="🔥 28 jours · 4 phases · 0% spam"
      />

      <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/[0.04] p-4 text-sm text-content-secondary keep-together">
        ⚠️ <strong className="text-content-primary">Règle absolue :</strong>{' '}
        créez TOUJOURS un sous-domaine dédié au cold email (ex: <code>hello.votredomaine.com</code>).
        Si le sous-domaine tombe en spam, votre domaine principal reste intact.
      </div>

      <Toc items={tocItems} />

      {/* DNS records */}
      <section id="dns" className="mb-10 keep-together scroll-mt-24">
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-line">
          📡 Configuration DNS (à faire en premier)
        </h2>
        <div className="space-y-3">
          {DNS_RECORDS.map((r) => (
            <div key={r.name} className="rounded-xl border border-line bg-surface-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded font-mono font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs">
                  {r.name}
                </span>
                <span className="text-sm text-content-primary">{r.purpose}</span>
              </div>
              <code className="text-xs text-content-secondary block bg-surface-elevated rounded px-2 py-1 mt-2 break-all">
                {r.example}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Phases */}
      {PHASES.map((phase, i) => (
        <section key={i} id={`phase-${i}`} className="mb-10 keep-together scroll-mt-24">
          <div className={`border-l-4 border-${phase.color}-500 pl-4 mb-4`}>
            <h2 className="text-2xl font-bold mb-1">{phase.title}</h2>
            <p className="text-sm text-content-secondary italic">{phase.goal}</p>
            {phase.volume && (
              <p className="text-sm text-content-tertiary mt-1">
                <strong>Volume :</strong> {phase.volume}
              </p>
            )}
          </div>
          <ul className="space-y-3">
            {phase.checklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 border-content-tertiary inline-block" />
                <span className="text-content-primary">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Métriques de référence */}
      <section id="metrics" className="mb-10 keep-together scroll-mt-24">
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-line">
          📊 Métriques de référence (à surveiller en permanence)
        </h2>
        <table className="w-full text-sm border border-line rounded">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="text-left p-2 font-semibold">Métrique</th>
              <th className="text-left p-2 font-semibold text-green-400">Excellent</th>
              <th className="text-left p-2 font-semibold text-blue-400">Bon</th>
              <th className="text-left p-2 font-semibold text-amber-600">Warning</th>
              <th className="text-left p-2 font-semibold text-red-400">Critique</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.name} className="border-t border-line">
                <td className="p-2 font-medium text-content-primary">{m.name}</td>
                <td className="p-2 font-mono text-xs">{m.excellent}</td>
                <td className="p-2 font-mono text-xs">{m.good}</td>
                <td className="p-2 font-mono text-xs">{m.warning}</td>
                <td className="p-2 font-mono text-xs">{m.critical}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Maintenance après warmup */}
      <section id="maintenance" className="mb-10 keep-together scroll-mt-24">
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-line">
          🔧 Maintenance après warmup (J+29 et au-delà)
        </h2>
        <ul className="space-y-3">
          {[
            'Vérifier Google Postmaster Tools 1× par semaine',
            'Laisser 10-20% de volume en warmup auto en permanence (Smartlead/Lemlist le font automatiquement)',
            'Si reply rate baisse sous 5% : revoir l\'ICP, pas augmenter le volume',
            'Si nouvelle baisse de reputation : pause 24-48h, baisser le volume de 50%, relancer doucement',
            'Renforcer DMARC tous les 3 mois : none → quarantine → reject',
            'Tester un nouvel objet ou template uniquement après 7 jours de stabilité',
            'Préparer un 2e sous-domaine si vous atteignez 500+ emails/jour (split-testing + redondance)',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 border-content-tertiary inline-block" />
              <span className="text-content-primary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 pt-6 border-t border-line text-sm text-content-tertiary keep-together">
        <p className="mb-2">
          <strong className="text-content-primary">Outils recommandés :</strong>{' '}
          <a href="https://mxtoolbox.com" className="text-violet-500 hover:underline">MXToolbox</a> ·
          <a href="https://mail-tester.com" className="text-violet-500 hover:underline ml-1">Mail Tester</a> ·
          <a href="https://postmaster.google.com" className="text-violet-500 hover:underline ml-1">Google Postmaster Tools</a> ·
          Lemwarm / Smartlead / Instantly (warmup auto inclus).
        </p>
        <p>
          © Volia 2026 · Licence Creative Commons BY 4.0 · Libre de reproduction avec mention de la source.
          Source : <a href="https://volia.fr/ressources/checklist-warmup-domaine-cold-email" className="text-violet-500 hover:underline">volia.fr/ressources/checklist-warmup-domaine-cold-email</a>
        </p>
      </footer>
    </div>
  );
}
