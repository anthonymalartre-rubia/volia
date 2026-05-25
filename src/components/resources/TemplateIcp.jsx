// Template ICP B2B en 30 minutes — page imprimable.

const EXAMPLES = [
  {
    name: 'SaaS B2B (Pennylane-like, comptabilité)',
    firmographic: 'Cabinets d\'expertise comptable 5-50 salariés, France',
    pain: 'Production manuelle = 60% du temps des collaborateurs',
    trigger: 'Embauche d\'un associé / nouveau client mid-market',
    budget: '500-3 000 €/mois (sur ligne IT)',
    decision: 'Associé fondateur ou directeur de mission',
    cycle: '6-12 semaines',
  },
  {
    name: 'Outil RH (Lucca-like)',
    firmographic: 'PME 50-300 salariés, secteur tertiaire, France',
    pain: 'Gestion administrative dispersée (Excel + 5 outils différents)',
    trigger: 'Embauche d\'un DRH ou changement de DAF',
    budget: '300-2 000 €/mois',
    decision: 'DRH ou DAF (parfois CEO si < 100 salariés)',
    cycle: '4-8 semaines',
  },
  {
    name: 'Marketplace freelance (Malt-like)',
    firmographic: 'Startups et scale-ups Tech 20-200 salariés, IDF principalement',
    pain: 'Difficulté à recruter en CDI sur des skills rares (data, devops, design)',
    trigger: 'Levée de fonds < 6 mois ou départ d\'un tech lead',
    budget: '5-25 k€/mission ponctuelle',
    decision: 'CTO ou Head of Product',
    cycle: '2-4 semaines',
  },
];

export default function TemplateIcp() {
  return (
    <div>
      <header className="mb-10 keep-together">
        <div className="text-xs uppercase tracking-wider text-violet-500 font-semibold mb-2">
          Ressource Volia · Template
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
          Template ICP B2B : définissez votre client idéal en 30 minutes
        </h1>
        <p className="text-content-secondary leading-relaxed mb-6">
          Méthode guidée en 4 étapes pour construire votre Ideal Customer Profile.
          Sans ICP clair, vous arrosez large et convertissez peu.
        </p>
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-4 text-sm text-content-secondary">
          <strong className="text-content-primary">Pourquoi c&apos;est critique :</strong>{' '}
          un bon ICP multiplie par 2-3 votre reply rate cold email + divise par 2 votre sales cycle.
          C&apos;est la fondation de toute stratégie outbound.
        </div>
      </header>

      {/* Étape 1 */}
      <section className="mb-10 keep-together">
        <div className="border-l-4 border-violet-500 pl-4 mb-4">
          <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Étape 1 / 4 — 10 minutes</div>
          <h2 className="text-2xl font-bold">Lister vos 10 meilleurs clients actuels</h2>
        </div>
        <p className="text-sm text-content-secondary mb-3">
          Critères de sélection (au moins 3/5) :
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-content-primary mb-4">
          <li>Revenu mensuel récurrent (MRR) supérieur à la moyenne</li>
          <li>Faible support (peu de tickets, autonome)</li>
          <li>Bonne ancienneté (&gt; 12 mois sans churn)</li>
          <li>Recommande votre produit (NPS &gt; 8)</li>
          <li>Croissance d&apos;usage / expansion régulière</li>
        </ul>
        <table className="w-full text-sm border border-line rounded">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="text-left p-2 font-semibold">#</th>
              <th className="text-left p-2 font-semibold">Nom client</th>
              <th className="text-left p-2 font-semibold">Secteur</th>
              <th className="text-left p-2 font-semibold">Taille</th>
              <th className="text-left p-2 font-semibold">MRR</th>
              <th className="text-left p-2 font-semibold">Ancienneté</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <tr key={n} className="border-t border-line">
                <td className="p-2 text-content-tertiary">{n}</td>
                <td className="p-2 text-content-tertiary">________________</td>
                <td className="p-2 text-content-tertiary">________________</td>
                <td className="p-2 text-content-tertiary">________________</td>
                <td className="p-2 text-content-tertiary">________________</td>
                <td className="p-2 text-content-tertiary">________________</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Étape 2 */}
      <section className="mb-10 keep-together">
        <div className="border-l-4 border-violet-500 pl-4 mb-4">
          <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Étape 2 / 4 — 10 minutes</div>
          <h2 className="text-2xl font-bold">Identifier les points communs</h2>
        </div>
        <p className="text-sm text-content-secondary mb-3">
          Pour chaque dimension, identifiez le pattern dominant parmi vos 10 meilleurs clients.
          Notez seulement ce qui se répète chez au moins <strong>6 sur 10</strong>.
        </p>
        <div className="space-y-3">
          {[
            { label: 'Secteur d\'activité', placeholder: 'Ex: SaaS B2B, e-commerce, professions libérales...' },
            { label: 'Taille (CA ou effectifs)', placeholder: 'Ex: 10-50 salariés, CA 1-10 M€' },
            { label: 'Géographie', placeholder: 'Ex: France métropolitaine, Île-de-France, EU' },
            { label: 'Maturité de l\'entreprise', placeholder: 'Ex: post-PMF, post-Série A, mid-market' },
            { label: 'Stack technique', placeholder: 'Ex: Shopify + HubSpot + Stripe, Cegid, Pennylane' },
            { label: 'Signal d\'achat (trigger)', placeholder: 'Ex: levée récente, embauche RH, migration CRM' },
            { label: 'Poste décideur', placeholder: 'Ex: CMO, Head of Sales, Founder, DAF' },
            { label: 'Budget type (mensuel ou annuel)', placeholder: 'Ex: 500-3000 €/mois, 10-50 k€/an' },
            { label: 'Cycle de décision moyen', placeholder: 'Ex: 4-8 semaines, 90 jours' },
            { label: 'Canal d\'acquisition principal', placeholder: 'Ex: cold email, SEO, recommandation' },
          ].map((d, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface-card p-3">
              <div className="text-sm font-semibold text-content-primary mb-1">{d.label}</div>
              <div className="border-b border-dashed border-content-tertiary text-sm text-content-tertiary italic">{d.placeholder}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Étape 3 */}
      <section className="mb-10 keep-together">
        <div className="border-l-4 border-violet-500 pl-4 mb-4">
          <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Étape 3 / 4 — 5 minutes</div>
          <h2 className="text-2xl font-bold">Définir l&apos;anti-ICP (qui exclure)</h2>
        </div>
        <p className="text-sm text-content-secondary mb-3">
          L&apos;anti-ICP est aussi important que l&apos;ICP. Listez les critères qui font qu&apos;un prospect
          n&apos;est <strong>JAMAIS</strong> un bon client pour vous, même s&apos;il signe.
        </p>
        <table className="w-full text-sm border border-line rounded">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="text-left p-2 font-semibold">Type d&apos;exclusion</th>
              <th className="text-left p-2 font-semibold">Critère précis</th>
              <th className="text-left p-2 font-semibold">Pourquoi (justification)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Taille', 'Trop petit (&lt; X salariés)', 'Notre produit nécessite un volume minimum pour être rentable'],
              ['Secteur', 'Secteurs régulés (banque, défense, médical)', 'Cycle de vente trop long, compliance lourde'],
              ['Géographie', 'Hors France pour la v1', 'Support en français uniquement'],
              ['Maturité', 'Pré-PMF', 'Nos clients ont besoin d\'un produit validé, pas en expérimentation'],
              ['Historique', 'Anciens clients churnés rapidement', 'Pas le bon fit'],
              ['Budget', '&lt; X € mensuel', 'CAC trop élevé pour cette taille de deal'],
            ].map(([t, c, w], i) => (
              <tr key={i} className="border-t border-line">
                <td className="p-2 text-content-primary font-medium">{t}</td>
                <td className="p-2 text-content-secondary text-xs">{c}</td>
                <td className="p-2 text-content-tertiary text-xs italic">{w}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Étape 4 */}
      <section className="mb-10 keep-together">
        <div className="border-l-4 border-violet-500 pl-4 mb-4">
          <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Étape 4 / 4 — 5 minutes</div>
          <h2 className="text-2xl font-bold">Valider l&apos;ICP avec 5 questions</h2>
        </div>
        <ol className="list-decimal list-inside space-y-3 text-sm">
          <li className="leading-relaxed"><strong className="text-content-primary">Quantité :</strong> existe-t-il au moins 500 entreprises dans le monde qui matchent cet ICP ? (Si non = trop niche)</li>
          <li className="leading-relaxed"><strong className="text-content-primary">Identifiabilité :</strong> peut-on identifier ces entreprises avec Volia / Apollo / LinkedIn Sales Navigator ? (Si non = inadressable)</li>
          <li className="leading-relaxed"><strong className="text-content-primary">Budget :</strong> ont-ils un budget allouable de minimum 3× votre prix mensuel ? (Si non = problème de fit)</li>
          <li className="leading-relaxed"><strong className="text-content-primary">Douleur :</strong> ressentent-ils une douleur urgente (pas juste &quot;nice to have&quot;) ? (Si non = sales cycle infini)</li>
          <li className="leading-relaxed"><strong className="text-content-primary">Décideur :</strong> peut-on contacter directement le décideur ? (Si non = passer par un canal différent)</li>
        </ol>
      </section>

      {/* Grille de scoring */}
      <section className="mb-10 keep-together">
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-line">📊 Grille de scoring ICP (0-100)</h2>
        <p className="text-sm text-content-secondary mb-3">
          Pour chaque nouveau prospect, calculez son fit ICP en additionnant les points.
        </p>
        <table className="w-full text-sm border border-line rounded">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="text-left p-2 font-semibold">Dimension</th>
              <th className="text-center p-2 font-semibold">Match parfait</th>
              <th className="text-center p-2 font-semibold">Match partiel</th>
              <th className="text-center p-2 font-semibold">Non-match</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line"><td className="p-2">Secteur</td><td className="p-2 text-center font-mono">25 pts</td><td className="p-2 text-center font-mono">10 pts</td><td className="p-2 text-center font-mono">0 pts</td></tr>
            <tr className="border-t border-line"><td className="p-2">Taille</td><td className="p-2 text-center font-mono">20 pts</td><td className="p-2 text-center font-mono">10 pts</td><td className="p-2 text-center font-mono">0 pts</td></tr>
            <tr className="border-t border-line"><td className="p-2">Géographie</td><td className="p-2 text-center font-mono">15 pts</td><td className="p-2 text-center font-mono">5 pts</td><td className="p-2 text-center font-mono">0 pts</td></tr>
            <tr className="border-t border-line"><td className="p-2">Trigger récent</td><td className="p-2 text-center font-mono">20 pts</td><td className="p-2 text-center font-mono">10 pts</td><td className="p-2 text-center font-mono">0 pts</td></tr>
            <tr className="border-t border-line"><td className="p-2">Stack technique</td><td className="p-2 text-center font-mono">10 pts</td><td className="p-2 text-center font-mono">5 pts</td><td className="p-2 text-center font-mono">0 pts</td></tr>
            <tr className="border-t border-line"><td className="p-2">Décideur identifiable</td><td className="p-2 text-center font-mono">10 pts</td><td className="p-2 text-center font-mono">5 pts</td><td className="p-2 text-center font-mono">0 pts</td></tr>
          </tbody>
        </table>
        <div className="mt-3 text-sm space-y-1">
          <div><strong className="text-green-400">Score 80-100</strong> : Tier 1 — prospection prioritaire, 5-10 touches max sur 30 jours</div>
          <div><strong className="text-blue-400">Score 50-79</strong> : Tier 2 — prospection standard, 3-5 touches sur 21 jours</div>
          <div><strong className="text-amber-600">Score &lt; 50</strong> : Tier 3 — ne pas prospecter activement (laisser en nurturing inbound)</div>
        </div>
      </section>

      {/* Exemples */}
      <section className="mb-10 keep-together">
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-line">🇫🇷 3 exemples d&apos;ICP réels (SaaS français anonymisés)</h2>
        <div className="space-y-4">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface-card p-4">
              <h3 className="font-bold text-violet-400 mb-2">{ex.name}</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="font-semibold pr-3 py-1 align-top">Firmographique :</td><td>{ex.firmographic}</td></tr>
                  <tr><td className="font-semibold pr-3 py-1 align-top">Douleur :</td><td>{ex.pain}</td></tr>
                  <tr><td className="font-semibold pr-3 py-1 align-top">Trigger :</td><td>{ex.trigger}</td></tr>
                  <tr><td className="font-semibold pr-3 py-1 align-top">Budget :</td><td>{ex.budget}</td></tr>
                  <tr><td className="font-semibold pr-3 py-1 align-top">Décideur :</td><td>{ex.decision}</td></tr>
                  <tr><td className="font-semibold pr-3 py-1 align-top">Cycle :</td><td>{ex.cycle}</td></tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus prompt IA */}
      <section className="mb-10 keep-together rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
        <h2 className="text-xl font-bold mb-3">🤖 Bonus : prompt ChatGPT / Claude pour générer un draft d&apos;ICP</h2>
        <p className="text-sm text-content-secondary mb-3">
          Copiez-collez dans Claude ou ChatGPT, après avoir rempli les Étapes 1 et 2 ci-dessus :
        </p>
        <pre className="font-mono text-xs bg-surface-elevated rounded p-3 whitespace-pre-wrap text-content-primary leading-relaxed">
{`Voici les caractéristiques de mes 10 meilleurs clients actuels :
[Colle ici ton tableau de l'Étape 1]

Et voici les patterns que j'observe :
[Colle ici tes notes de l'Étape 2]

Mon produit : [décris en 2 phrases ton produit + sa proposition de valeur]

À partir de ces données :
1. Synthétise mon ICP idéal en 1 paragraphe (firmographique + technographique + comportemental).
2. Génère 3 personas de décideurs avec leurs douleurs spécifiques et objections fréquentes.
3. Suggère 3 messages d'ouverture cold email (objet + 1ère ligne) ultra-personnalisés pour mon ICP.
4. Liste les 5 anti-ICP les plus dangereux pour moi.`}
        </pre>
      </section>

      <footer className="mt-12 pt-6 border-t border-line text-sm text-content-tertiary keep-together">
        <p className="mb-2">
          <strong className="text-content-primary">Maintenance :</strong>{' '}
          relisez et affinez votre ICP <strong>tous les 6 mois</strong>. Le marché évolue,
          vos meilleurs clients changent, votre produit s&apos;améliore.
        </p>
        <p>
          © Volia 2026 · Licence Creative Commons BY 4.0 · Libre de reproduction avec mention de la source.
          Source : <a href="https://volia.fr/ressources/template-icp-b2b" className="text-violet-500 hover:underline">volia.fr/ressources/template-icp-b2b</a>
        </p>
      </footer>
    </div>
  );
}
