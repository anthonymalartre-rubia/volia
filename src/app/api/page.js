import Link from 'next/link';
import { ArrowLeft, Code, Key, Zap, ExternalLink } from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'API Volia v1 — Documentation (Zapier, Make, custom)',
  description:
    "Documentation de l'API publique Volia v1 : authentification par clé API, endpoints /me, /prospects, /usage, intégrations Zapier et Make. REST + JSON.",
  alternates: { canonical: 'https://volia.fr/api' },
  keywords: [
    'api volia',
    'api prospection b2b',
    'intégration zapier prospection',
    'intégration make prospection',
    'api rest prospection france',
  ],
  openGraph: {
    title: 'API Volia v1 — Documentation',
    description: 'Intégrez Volia à votre stack avec notre API REST. Compatible Zapier et Make.',
    url: 'https://volia.fr/api',
  },
};

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'API' },
];

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/me',
    desc: 'Retourne le profil de l\'utilisateur authentifié + plan + usage du mois courant.',
    response: `{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-01-15T10:00:00Z"
  },
  "plan": {
    "id": "solo",
    "name": "Solo",
    "limits": {
      "searches_per_month": 1000,
      "enrichments_per_month": 400,
      "exports_per_month": 50
    }
  },
  "usage": {
    "month": "2026-05",
    "searches": 234,
    "enrichments": 87,
    "exports": 12
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/prospects',
    desc: 'Liste paginée des prospects du compte. Filtres : has_email, department, search_session_id, sort.',
    response: `{
  "data": [
    {
      "id": "uuid",
      "nom": "Restaurant Le Bistrot",
      "adresse": "12 rue de Rivoli, 75001 Paris",
      "telephone": "+33 1 42 60 12 34",
      "email": "contact@bistrot.fr",
      "email_method": "scrape",
      "site_web": "https://bistrot.fr",
      "note": 4.5,
      "nb_avis": 234,
      "departement": "75",
      "search_session_id": "uuid",
      "created_at": "2026-05-20T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}`,
    queryParams: [
      { name: 'limit', type: 'integer (1-100)', default: '50' },
      { name: 'offset', type: 'integer (0+)', default: '0' },
      { name: 'has_email', type: '"true" | "false"', default: '—' },
      { name: 'department', type: 'string (code FR, ex "75")', default: '—' },
      { name: 'search_session_id', type: 'uuid', default: '—' },
      { name: 'sort', type: '"newest" | "oldest"', default: '"newest"' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/usage',
    desc: 'Usage du mois (ou ?month=YYYY-MM) avec pourcentages vs limites du plan.',
    response: `{
  "month": "2026-05",
  "plan": { "id": "solo", "name": "Solo" },
  "usage": {
    "searches": {
      "used": 234,
      "limit": 1000,
      "percent": 23.4
    },
    "enrichments": { "used": 87, "limit": 400, "percent": 21.7 },
    "exports": { "used": 12, "limit": 50, "percent": 24.0 }
  }
}`,
  },
];

export default function ApiDocsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'TechArticle',
        headline: 'Documentation API Volia v1',
        description: metadata.description,
        author: { '@type': 'Organization', name: 'Volia' },
        publisher: { '@type': 'Organization', name: 'Volia', url: 'https://volia.fr' },
        url: 'https://volia.fr/api',
        inLanguage: 'fr-FR',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Accueil
          </Link>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
              <Code size={11} />
              API v1
            </span>
            <span>Stable</span>
            <span>·</span>
            <span>REST + JSON</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            API <span className="text-violet-400">Volia v1</span>
          </h1>

          <p className="text-lg text-content-secondary leading-relaxed mb-12">
            Accédez à vos prospects, votre usage et votre profil par programmation.
            Compatible Zapier, Make, n8n et scripts custom (cURL, Node, Python, etc.).
          </p>

          {/* TOC */}
          <nav className="rounded-2xl border border-line bg-surface-card p-5 mb-12">
            <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2">Sommaire</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm list-disc list-inside text-content-secondary">
              <li><a href="#auth" className="hover:text-violet-400">Authentification</a></li>
              <li><a href="#endpoints" className="hover:text-violet-400">Endpoints</a></li>
              <li><a href="#zapier" className="hover:text-violet-400">Intégration Zapier</a></li>
              <li><a href="#make" className="hover:text-violet-400">Intégration Make</a></li>
              <li><a href="#errors" className="hover:text-violet-400">Codes d&apos;erreur</a></li>
              <li><a href="#limits" className="hover:text-violet-400">Limites &amp; rate limiting</a></li>
            </ul>
          </nav>

          {/* Authentification */}
          <section id="auth" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Key size={22} className="text-violet-400" />
              Authentification
            </h2>
            <p className="text-content-secondary leading-relaxed mb-4">
              Toutes les requêtes nécessitent une clé API au format <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-violet-300">pk_xxxxxxxx</code>,
              à passer dans le header <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-violet-300">Authorization: Bearer pk_xxx</code>.
            </p>
            <p className="text-content-secondary leading-relaxed mb-4">
              Créez une clé depuis <Link href="/settings#api" className="text-violet-400 hover:underline">Paramètres → API</Link>.
              Max 5 clés actives par compte. La clé n&apos;est affichée qu&apos;une seule fois à la création.
            </p>

            <div className="rounded-2xl border border-line bg-surface-card overflow-hidden">
              <div className="px-4 py-2 border-b border-line bg-surface-elevated text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Exemple cURL
              </div>
              <pre className="text-xs text-content-secondary font-mono p-4 overflow-x-auto whitespace-pre">
{`curl https://volia.fr/api/v1/me \\
  -H "Authorization: Bearer pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}
              </pre>
            </div>
          </section>

          {/* Endpoints */}
          <section id="endpoints" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Endpoints</h2>
            <div className="space-y-8">
              {ENDPOINTS.map((ep) => (
                <div key={ep.path} className="rounded-2xl border border-line bg-surface-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-line flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-content-primary">{ep.path}</code>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-content-secondary leading-relaxed mb-3">{ep.desc}</p>

                    {ep.queryParams && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">Query params</p>
                        <table className="w-full text-xs">
                          <tbody>
                            {ep.queryParams.map((p) => (
                              <tr key={p.name} className="border-b border-line last:border-0">
                                <td className="py-1.5 pr-3 font-mono text-violet-300">{p.name}</td>
                                <td className="py-1.5 pr-3 text-content-secondary">{p.type}</td>
                                <td className="py-1.5 text-content-tertiary">default : {p.default}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1">Réponse 200</p>
                      <pre className="text-xs text-content-secondary font-mono p-3 rounded-lg bg-surface-base border border-line overflow-x-auto">
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Zapier */}
          <section id="zapier" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Intégration Zapier</h2>
            <p className="text-content-secondary leading-relaxed mb-4">
              Volia ne dispose pas encore d&apos;app native dans le Zapier directory.
              Vous pouvez néanmoins utiliser les <strong className="text-content-primary">Webhooks Premium</strong> de Zapier
              pour appeler nos endpoints :
            </p>
            <ol className="list-decimal list-inside space-y-1 text-content-secondary leading-relaxed mb-4">
              <li>Dans Zapier, créez un Zap avec action <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">Webhooks by Zapier → GET</code></li>
              <li>URL : <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">https://volia.fr/api/v1/prospects?has_email=true&limit=10</code></li>
              <li>Headers : <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">Authorization: Bearer pk_votre_clé</code></li>
              <li>Mappez ensuite les champs <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">data[].email</code> vers votre action suivante</li>
            </ol>
          </section>

          {/* Make */}
          <section id="make" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Intégration Make (ex-Integromat)</h2>
            <p className="text-content-secondary leading-relaxed mb-4">
              Utilisez le module <strong className="text-content-primary">HTTP → Make a request</strong> :
            </p>
            <div className="rounded-2xl border border-line bg-surface-card p-4 mb-4">
              <ul className="space-y-1 text-sm text-content-secondary">
                <li><strong className="text-content-primary">URL</strong> : <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">https://volia.fr/api/v1/prospects</code></li>
                <li><strong className="text-content-primary">Method</strong> : GET</li>
                <li><strong className="text-content-primary">Headers</strong> : <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">Authorization: Bearer pk_votre_clé</code></li>
                <li><strong className="text-content-primary">Parse response</strong> : Yes (auto-JSON)</li>
              </ul>
            </div>
            <p className="text-content-secondary leading-relaxed">
              Vous pouvez ensuite mapper <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">data[]</code> en boucle vers
              n&apos;importe quel module (Google Sheets, HubSpot, Pipedrive, Notion, etc.).
            </p>
          </section>

          {/* Errors */}
          <section id="errors" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Codes d&apos;erreur</h2>
            <table className="w-full text-sm border border-line rounded-xl overflow-hidden">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="text-left p-3 font-semibold">Code</th>
                  <th className="text-left p-3 font-semibold">Signification</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line"><td className="p-3 font-mono text-violet-300">200</td><td className="p-3 text-content-secondary">Succès</td></tr>
                <tr className="border-t border-line"><td className="p-3 font-mono text-amber-700">400</td><td className="p-3 text-content-secondary">Requête invalide (paramètre manquant ou format incorrect)</td></tr>
                <tr className="border-t border-line"><td className="p-3 font-mono text-red-300">401</td><td className="p-3 text-content-secondary">Clé API manquante, invalide ou révoquée</td></tr>
                <tr className="border-t border-line"><td className="p-3 font-mono text-red-300">429</td><td className="p-3 text-content-secondary">Quota du plan atteint</td></tr>
                <tr className="border-t border-line"><td className="p-3 font-mono text-red-300">500</td><td className="p-3 text-content-secondary">Erreur serveur — réessayez ou contactez-nous</td></tr>
              </tbody>
            </table>
          </section>

          {/* Limits */}
          <section id="limits" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Limites &amp; bonnes pratiques</h2>
            <ul className="list-disc list-inside space-y-2 text-content-secondary leading-relaxed">
              <li>Les quotas du plan (searches, enrichments, exports) s&apos;appliquent aussi à l&apos;API.</li>
              <li>Limit max par page : <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">100</code>. Utilisez <code className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated">offset</code> pour paginer au-delà.</li>
              <li>Max <strong>5 clés actives</strong> par compte. Révoquez les anciennes depuis <Link href="/settings#api" className="text-violet-400 hover:underline">Paramètres → API</Link>.</li>
              <li>Stockez les clés dans un gestionnaire de mots de passe ou dans les variables d&apos;environnement de votre outil (Zapier, Make, etc.). Ne jamais commiter dans un repo public.</li>
              <li>En cas de fuite : révoquez immédiatement et créez une nouvelle clé.</li>
            </ul>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Prêt à intégrer ?</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              Créez votre première clé API depuis votre compte Volia.
            </p>
            <Link
              href="/settings#api"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              <Key size={16} />
              Créer une clé API
            </Link>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
