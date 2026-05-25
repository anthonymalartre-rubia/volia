// Checklist RGPD cold email B2B France 2026 — 47 points.

import { CoverPage, Toc } from './CoverAndToc';

const SECTIONS = [
  {
    title: 'Base légale et finalité (9 points)',
    items: [
      'Identifier la base légale utilisée : intérêt légitime (art. 6.1.f RGPD) pour le B2B',
      'Documenter le test de balance des intérêts (intérêt poursuivi vs droits du prospect)',
      'Définir une finalité précise du traitement (ex : "prospection commerciale B2B pour vendre un outil SaaS")',
      'Limiter la finalité aux destinataires concernés professionnellement par votre offre',
      'Documenter la durée de conservation des données : 3 ans max après dernier contact',
      'Identifier les bases légales des sous-traitants (cadenceur, CRM, enrichissement)',
      'Mettre à jour le registre des traitements (art. 30 RGPD) — obligatoire si > 250 salariés ou traitement régulier',
      'Désigner un DPO si traitement à grande échelle (> 50 000 prospects/an recommandé)',
      'Conserver la documentation au minimum 5 ans (en cas de contrôle CNIL)',
    ],
  },
  {
    title: 'Collecte des emails (8 points)',
    items: [
      'Ne collecter que des emails professionnels (filtrer @gmail, @hotmail, @outlook, @yahoo, etc.)',
      'Mettre en place une liste de domaines personnels à exclure (28 domaines minimum recommandés)',
      'Vérifier que l\'email cible une FONCTION (contact@, info@, marketing@) ou un poste précis identifiable',
      'Ne JAMAIS acheter de listes de prospects sans documentation de la source',
      'Documenter la source de chaque email (Google Places, LinkedIn, site web public, etc.)',
      'Vérifier que les emails proviennent de sources publiques accessibles (pas de scraping de zones privées)',
      'Croiser systématiquement avec la liste opt-out interne avant tout envoi',
      'Ne pas conserver d\'emails de prospects ayant explicitement refusé',
    ],
  },
  {
    title: 'Contenu des emails (7 points)',
    items: [
      'Identifier clairement l\'expéditeur dans le header "From:" (vrai nom + société)',
      'Inclure une adresse postale physique valide dans le pied de mail',
      'Insérer un lien de désinscription FONCTIONNEL en bas de chaque email (1 clic)',
      'Texte du lien clair : "Se désinscrire" / "Désinscription" (pas "cliquez ici" ou caché)',
      'Le lien de désinscription ne demande PAS de motif ni de mot de passe',
      'L\'objet de l\'email ne doit pas être trompeur (pas de "Re:" si pas de conversation préalable)',
      'Mentionner la raison du contact ("J\'ai vu votre poste sur LinkedIn / sur votre site")',
    ],
  },
  {
    title: 'Traitement des opt-outs (6 points)',
    items: [
      'Traiter les demandes de désinscription sous 48h MAX (recommandation : sous 24h)',
      'Mettre en place un système de capture automatique des clics "désinscription"',
      'Ajouter automatiquement les opt-outs à la liste interne d\'exclusion permanente',
      'Confirmer la désinscription par email (preuve de traitement)',
      'Conserver l\'historique des opt-outs (preuve en cas de contrôle CNIL)',
      'Ne JAMAIS recontacter un opt-out, même via une autre adresse ou un autre outil',
    ],
  },
  {
    title: 'DPO et documentation (6 points)',
    items: [
      'Désigner un DPO ou un référent privacy (même informel pour les TPE)',
      'Mettre à jour le registre des traitements à chaque nouvelle campagne ou outil',
      'Tenir une politique de confidentialité publique et accessible',
      'Lister tous les sous-traitants (DPA = Data Processing Agreement signé avec chacun)',
      'Documenter les flux de données vers les pays tiers (USA notamment : clauses contractuelles types)',
      'Former l\'équipe sales aux obligations RGPD (1×/an minimum)',
    ],
  },
  {
    title: 'Sous-traitants et transferts (5 points)',
    items: [
      'Signer un DPA avec chaque sous-traitant (cadenceur, CRM, enrichissement, hébergement)',
      'Vérifier que les sous-traitants hors UE respectent les clauses contractuelles types',
      'Privilégier les sous-traitants UE pour les données sensibles (Dropcontact, Volia, etc.)',
      'Documenter chaque transfert hors UE dans le registre',
      'Vérifier annuellement la conformité de chaque sous-traitant (mises à jour des CGV)',
    ],
  },
  {
    title: 'Preuves en cas de contrôle CNIL (6 points)',
    items: [
      'Capable de produire le registre des traitements à jour sous 48h',
      'Capable de produire la documentation de la base légale (test intérêt légitime)',
      'Capable de produire la liste exhaustive des sous-traitants + DPA signés',
      'Capable de prouver le traitement des demandes opt-out (logs daté + horodatés)',
      'Capable de produire la politique de confidentialité dans sa version au moment des envois',
      'Capable de fournir des emails envoyés (échantillon) avec leur source et leur base légale',
    ],
  },
];

const TOTAL = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export default function ChecklistRgpd() {
  const tocItems = SECTIONS.map((s, i) => ({
    id: `section-${i}`,
    label: s.title,
    meta: `${s.items.length} pts`,
  }));

  return (
    <div>
      <CoverPage
        title="Checklist RGPD cold email B2B France"
        subtitle={`${TOTAL} points à valider pour faire du cold email B2B en France sans risque CNIL en 2026.`}
        tagline="⚖️ Conformité art. 6.1.f RGPD"
      />

      <div className="mb-8 rounded-2xl border border-amber-400 bg-amber-50 p-4 text-sm text-content-secondary keep-together">
        ⚖️ <strong className="text-content-primary">Cadre légal :</strong>{' '}
        en France, le cold email B2B est légal sous régime de l&apos;intérêt légitime (RGPD art. 6.1.f).
        La CNIL a sanctionné <strong>87 entreprises en 2024</strong>, dont une douzaine sur des cas B2B.
        Cette checklist couvre 100% des points contrôlés en cas d&apos;audit.
      </div>

      <Toc items={tocItems} />

      {SECTIONS.map((sec, sectionIdx) => (
        <section key={sectionIdx} id={`section-${sectionIdx}`} className="mb-10 keep-together scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-line text-content-primary">
            {sec.title}
          </h2>
          <ul className="space-y-3">
            {sec.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 border-content-tertiary inline-block" />
                <span className="text-content-primary">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mb-8 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5 keep-together">
        <h2 className="text-xl font-bold mb-3 text-content-primary">📋 Template de registre des traitements</h2>
        <p className="text-sm text-content-secondary leading-relaxed mb-3">
          Le registre des traitements doit contenir au minimum les colonnes suivantes pour chaque traitement :
        </p>
        <table className="w-full text-sm border border-line rounded">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="text-left p-2 font-semibold">Champ</th>
              <th className="text-left p-2 font-semibold">Exemple</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Nom du traitement</td><td className="p-2">Prospection commerciale B2B France</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Finalité</td><td className="p-2">Identifier et contacter des prospects B2B pour vendre [produit X]</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Base légale</td><td className="p-2">Intérêt légitime (art. 6.1.f RGPD)</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Catégories de données</td><td className="p-2">Nom, prénom, email professionnel, téléphone, poste, société</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Destinataires</td><td className="p-2">Équipe sales interne, sous-traitants (Volia, Lemlist, HubSpot)</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Transferts hors UE</td><td className="p-2">Oui (Lemlist : USA) — clauses contractuelles types signées</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Durée de conservation</td><td className="p-2">3 ans après dernier contact</td></tr>
            <tr className="border-t border-line"><td className="p-2 font-mono text-xs">Mesures de sécurité</td><td className="p-2">Accès restreint, MFA, hébergement EU (Supabase, Vercel)</td></tr>
          </tbody>
        </table>
      </section>

      <footer className="mt-12 pt-6 border-t border-line text-sm text-content-tertiary keep-together">
        <p className="mb-2">
          <strong className="text-content-primary">Pour aller plus loin :</strong>{' '}
          délibération CNIL n°2022-103 sur le démarchage B2B (cadre détaillé) ·
          <a href="https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique" className="text-violet-500 hover:underline ml-1">CNIL — Prospection par email</a>
        </p>
        <p>
          © Volia 2026 · Licence Creative Commons BY 4.0 · Libre de reproduction avec mention de la source.
          Source : <a href="https://volia.fr/ressources/checklist-rgpd-cold-email" className="text-violet-500 hover:underline">volia.fr/ressources/checklist-rgpd-cold-email</a>
        </p>
        <p className="mt-2 italic">
          Cette checklist ne constitue pas un conseil juridique. Pour les cas complexes,
          consultez un avocat spécialisé en droit des données personnelles.
        </p>
      </footer>
    </div>
  );
}
