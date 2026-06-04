// /mcp — Page publique : Volia est utilisable par les agents IA (serveur MCP).
// Doc + setup Claude Desktop / Cursor. Angle PR : 1er SaaS de prospection FR
// avec un serveur MCP réel.

import Link from 'next/link';
import { Bot, KeyRound, Plug, ShieldCheck, Terminal, ArrowRight } from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'Volia MCP — la prospection B2B utilisable par les agents IA (Claude, Cursor…)',
  description:
    'Volia expose un serveur MCP (Model Context Protocol) : connecte Volia à Claude Desktop, Cursor ou tout agent IA et laisse-le lire tes prospects, ton plan et ton usage. Lecture seule, clé API, RGPD.',
  alternates: { canonical: 'https://volia.fr/mcp' },
  keywords: ['Volia MCP', 'serveur MCP prospection', 'Model Context Protocol', 'Volia Claude Desktop', 'agent IA prospection B2B', 'MCP France'],
  openGraph: {
    title: 'Volia MCP — prospection B2B utilisable par les agents IA',
    description: 'Connecte Volia à Claude, Cursor ou ton agent IA via le Model Context Protocol. Serveur MCP réel, lecture seule, clé API.',
    type: 'website',
    url: 'https://volia.fr/mcp',
  },
};

const TOOLS = [
  { name: 'get_account', desc: 'Profil, plan Volia et usage du mois. À appeler pour vérifier la clé.' },
  { name: 'list_prospects', desc: "Liste les prospects (entreprises) de l'utilisateur. Filtres : département, présence d'email, tri." },
  { name: 'get_usage', desc: "Usage du mois (recherches, enrichissements, exports) vs limites du plan." },
];

const CONFIG_JSON = `{
  "mcpServers": {
    "volia": {
      "url": "https://volia.fr/api/mcp",
      "headers": {
        "Authorization": "Bearer pk_ta_cle_api"
      }
    }
  }
}`;

export default function McpPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Accueil', url: 'https://volia.fr' },
    { name: 'Volia MCP', url: 'https://volia.fr/mcp' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <ReaderHeader />
      <main id="main-content" className="bg-surface-base text-content-primary">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-1.5 text-xs font-semibold text-violet-500">
            <Bot className="h-3.5 w-3.5" /> Model Context Protocol
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Volia est <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">utilisable par les agents IA</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-content-secondary">
            Volia expose un <strong>serveur MCP</strong> (Model Context Protocol, le standard d'Anthropic).
            Branche Volia à <strong>Claude Desktop</strong>, <strong>Cursor</strong> ou n'importe quel agent IA
            compatible, et laisse-le interroger tes prospects en langage naturel.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-content-tertiary">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Lecture seule (V1)</span>
            <span className="inline-flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-emerald-500" /> Clé API requise</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> 🇫🇷 RGPD</span>
          </div>
        </section>

        {/* Tools */}
        <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <h2 className="text-2xl font-bold">Ce que l'agent peut faire</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {TOOLS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-line bg-surface-raised p-5">
                <code className="rounded bg-surface-base px-2 py-1 text-sm font-semibold text-violet-500">{t.name}</code>
                <p className="mt-3 text-sm text-content-secondary">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-content-tertiary">
            V1 en <strong>lecture seule</strong> (l'agent consulte, il ne modifie rien). Les actions d'écriture
            (lancer une recherche, créer une campagne) arriveront ensuite.
          </p>
        </section>

        {/* Setup */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold"><Plug className="h-6 w-6 text-violet-500" /> Connexion en 2 minutes</h2>
          <ol className="mt-5 space-y-4 text-sm text-content-secondary">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">1</span>
              <span>Crée ta clé API Volia dans <Link href="/settings" className="text-violet-500 hover:underline">tes paramètres</Link> (commence par <code className="rounded bg-surface-raised px-1.5 py-0.5 text-xs">pk_</code>).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">2</span>
              <span>Ajoute le serveur à ton client MCP (Cursor, Claude Desktop, etc.) avec cette config :</span>
            </li>
          </ol>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface-raised p-4 text-xs leading-relaxed text-content-primary">
            <Terminal className="mb-2 inline h-4 w-4 text-content-tertiary" />{'\n'}{CONFIG_JSON}
          </pre>
          <p className="mt-3 text-sm text-content-tertiary">
            URL du serveur : <code className="rounded bg-surface-raised px-1.5 py-0.5 text-xs">https://volia.fr/api/mcp</code>{' '}
            (transport Streamable HTTP). Sur Claude Desktop, ajoute-le via « Connecteurs personnalisés » et renseigne ta clé.
          </p>
          <ol start="3" className="mt-4 space-y-4 text-sm text-content-secondary">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">3</span>
              <span>Demande à ton agent : « <em>Combien de prospects avec email j'ai dans le 13 ?</em> » — il appelle Volia tout seul.</span>
            </li>
          </ol>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
            <h2 className="text-2xl font-bold">Pas encore de compte Volia ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-content-secondary">
              Crée ton compte, lance ta première recherche, puis branche ton agent IA. Dès 19 €/mois, essai 14 jours sans carte bancaire.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95">
                Créer mon compte <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/api" className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 font-medium text-content-secondary transition hover:bg-surface-base">
                Voir l'API REST
              </Link>
            </div>
          </div>
        </section>
      </main>
      <ReaderFooter />
    </>
  );
}
