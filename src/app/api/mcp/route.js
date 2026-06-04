// /api/mcp — Serveur MCP (Model Context Protocol) de Volia.
// ─────────────────────────────────────────────────────────────────────
// Transport : Streamable HTTP (JSON-RPC 2.0 sur POST), compatible Claude
// Desktop (connecteurs personnalisés), Cursor, et tout client MCP.
//
// Auth : header `Authorization: Bearer pk_...` (la même clé API que l'API v1).
// Les tools réutilisent l'API publique v1 en interne (même logique, mêmes
// quotas, même rate-limit) — pas de duplication.
//
// Tools exposés (lecture) :
//   - get_account    → profil + plan + usage (GET /api/v1/me)
//   - list_prospects → prospects de l'utilisateur (GET /api/v1/prospects)
//   - get_usage      → usage du mois vs limites (GET /api/v1/usage)
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PLANS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

// ─── Gate plan : le serveur MCP est réservé au plan Business (et au-dessus) ──
// On s'appuie sur `unlocksModules` (true uniquement sur business / enterprise),
// la même marque que pour CRM/Campagnes/Forms.
async function planGate(request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return { ok: false, text: `Clé API invalide : ${auth.error}` };
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('id', auth.userId)
    .maybeSingle();
  const planId = profile?.plan || 'free';
  const plan = PLANS[planId] || PLANS.free;
  if (!plan.unlocksModules) {
    return {
      ok: false,
      text: `🔒 Le serveur MCP de Volia est réservé au plan Business. Ton plan actuel (${plan.name}) n'y donne pas accès. Passe au plan Business pour piloter Volia depuis un agent IA : https://volia.fr/pricing`,
    };
  }
  return { ok: true };
}

const SERVER_INFO = { name: 'Volia', title: 'Volia — Prospection B2B', version: '1.0.0' };
const DEFAULT_PROTOCOL = '2025-06-18';
const INSTRUCTIONS =
  "Serveur MCP de Volia (prospection B2B France). Utilise get_account pour vérifier la clé et le plan, list_prospects pour lire les prospects de l'utilisateur (filtres : département, présence d'email…), get_usage pour l'usage du mois. Lecture seule. Clé API requise (Bearer pk_…), créée sur https://volia.fr/settings.";

const TOOLS = [
  {
    name: 'get_account',
    title: 'Compte & plan',
    description: "Retourne le profil de l'utilisateur, son plan Volia et l'usage du mois courant. À appeler en premier pour vérifier que la clé API est valide.",
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_prospects',
    title: 'Lister les prospects',
    description: "Liste paginée des prospects (entreprises) de l'utilisateur dans Volia. Filtres optionnels : département français, présence d'email, tri.",
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Nombre de résultats (1-100, défaut 50)' },
        offset: { type: 'integer', minimum: 0, description: 'Décalage de pagination (défaut 0)' },
        has_email: { type: 'boolean', description: 'true = uniquement avec email, false = uniquement sans email' },
        department: { type: 'string', description: 'Code département français, ex "75", "13", "2A"' },
        sort: { type: 'string', enum: ['newest', 'oldest'], description: 'Tri par date (défaut newest)' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_usage',
    title: 'Usage du mois',
    description: "Retourne l'usage du mois (recherches, enrichissements, exports) avec les pourcentages vs les limites du plan.",
    inputSchema: {
      type: 'object',
      properties: {
        month: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Mois au format YYYY-MM (défaut : mois courant)' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'start_search',
    title: 'Lancer une recherche (écriture)',
    description: "Lance une vraie recherche d'entreprises (Google Places) dans un département français et enregistre les résultats comme prospects de l'utilisateur. ⚠️ Action d'écriture : décomptée sur le quota mensuel du forfait de l'utilisateur. Nécessite une clé API avec le scope 'write'. 1 appel = jusqu'à 20 entreprises.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Terme de recherche, ex "restaurant", "agence immobilière", "garage automobile".' },
        dept: { type: 'string', description: 'Code département français, ex "75", "13", "2A". Obligatoire.' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Nb max de résultats (1-20, défaut 20). Borné par le quota restant.' },
      },
      required: ['query', 'dept'],
      additionalProperties: false,
    },
  },
  {
    name: 'export_csv',
    title: 'Exporter les prospects en CSV',
    description: "Exporte les prospects de l'utilisateur au format CSV (nom, email, téléphone, site, adresse, département). Filtres optionnels : présence d'email, département.",
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Nb max de lignes (1-100, défaut 100)' },
        has_email: { type: 'boolean', description: 'true = uniquement les prospects avec email' },
        department: { type: 'string', description: 'Filtrer sur un code département FR' },
      },
      additionalProperties: false,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function rpcResult(id, result) {
  return NextResponse.json({ jsonrpc: '2.0', id, result });
}
function rpcError(id, code, message) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } });
}

// Appelle l'API v1 en interne en transmettant la clé de l'utilisateur.
async function callV1(origin, path, authHeader, opts = {}) {
  const init = {
    method: opts.method || 'GET',
    headers: { Authorization: authHeader, Accept: 'application/json' },
  };
  if (opts.body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
  const res = await fetch(`${origin}${path}`, init);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

// Convertit une liste de prospects en CSV.
function prospectsToCsv(list) {
  const cols = ['nom', 'email', 'telephone', 'site_web', 'adresse', 'departement', 'note', 'nb_avis'];
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(',');
  const lines = (list || []).map((p) => cols.map((c) => esc(p[c])).join(','));
  return [header, ...lines].join('\n');
}

async function runTool(name, args, origin, authHeader) {
  if (!authHeader || !/^Bearer\s+pk_/i.test(authHeader)) {
    return { isError: true, text: "Clé API manquante. Configure le header Authorization: Bearer pk_… (clé créée sur https://volia.fr/settings)." };
  }
  args = args || {};

  if (name === 'get_account') {
    const r = await callV1(origin, '/api/v1/me', authHeader);
    return r.ok ? { text: JSON.stringify(r.json, null, 2) } : { isError: true, text: `Erreur ${r.status}: ${r.json?.error || 'inconnue'}` };
  }

  if (name === 'list_prospects') {
    const qs = new URLSearchParams();
    if (Number.isInteger(args.limit)) qs.set('limit', String(args.limit));
    if (Number.isInteger(args.offset)) qs.set('offset', String(args.offset));
    if (typeof args.has_email === 'boolean') qs.set('has_email', String(args.has_email));
    if (args.department) qs.set('department', String(args.department));
    if (args.sort) qs.set('sort', String(args.sort));
    const r = await callV1(origin, `/api/v1/prospects?${qs.toString()}`, authHeader);
    return r.ok ? { text: JSON.stringify(r.json, null, 2) } : { isError: true, text: `Erreur ${r.status}: ${r.json?.error || 'inconnue'}` };
  }

  if (name === 'get_usage') {
    const qs = new URLSearchParams();
    if (args.month) qs.set('month', String(args.month));
    const r = await callV1(origin, `/api/v1/usage?${qs.toString()}`, authHeader);
    return r.ok ? { text: JSON.stringify(r.json, null, 2) } : { isError: true, text: `Erreur ${r.status}: ${r.json?.error || 'inconnue'}` };
  }

  // ─── Tools d'ÉCRITURE (scope write requis, vérifié côté API v1) ──────
  if (name === 'start_search') {
    if (!args.query && !args.category) return { isError: true, text: 'Paramètre "query" (ou "category") requis.' };
    if (!args.dept) return { isError: true, text: 'Paramètre "dept" requis (code département FR, ex "75").' };
    const r = await callV1(origin, '/api/v1/search', authHeader, {
      method: 'POST',
      body: { query: args.query || args.category, dept: String(args.dept), limit: args.limit },
    });
    if (r.ok) return { text: JSON.stringify(r.json, null, 2) };
    if (r.status === 429) return { isError: true, text: `Quota de recherche du forfait atteint ce mois-ci. ${r.json?.error || ''}` };
    if (r.status === 403) return { isError: true, text: `Clé API en lecture seule : il faut une clé avec le scope "write" pour lancer une recherche.` };
    return { isError: true, text: `Erreur ${r.status}: ${r.json?.error || 'inconnue'}` };
  }

  if (name === 'export_csv') {
    const qs = new URLSearchParams();
    qs.set('limit', String(Math.min(100, Math.max(1, parseInt(args.limit, 10) || 100))));
    if (typeof args.has_email === 'boolean') qs.set('has_email', String(args.has_email));
    if (args.department) qs.set('department', String(args.department));
    const r = await callV1(origin, `/api/v1/prospects?${qs.toString()}`, authHeader);
    if (!r.ok) return { isError: true, text: `Erreur ${r.status}: ${r.json?.error || 'inconnue'}` };
    const list = r.json?.prospects || r.json?.data || [];
    const csv = prospectsToCsv(list);
    return { text: `${list.length} prospect(s) exporté(s) en CSV :\n\n${csv}` };
  }

  return { isError: true, text: `Tool inconnu : ${name}` };
}

// ─── Transport ────────────────────────────────────────────────────────
export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  const origin = new URL(request.url).origin;

  let msg;
  try {
    msg = await request.json();
  } catch {
    return rpcError(null, -32700, 'Parse error');
  }

  // Notifications (pas d'id) → 202 sans corps
  if (msg && msg.id === undefined) {
    return new NextResponse(null, { status: 202 });
  }

  const { id, method, params } = msg || {};

  switch (method) {
    case 'initialize':
      return rpcResult(id, {
        protocolVersion: params?.protocolVersion || DEFAULT_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });

    case 'ping':
      return rpcResult(id, {});

    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });

    case 'tools/call': {
      const toolName = params?.name;
      if (!TOOLS.some((t) => t.name === toolName)) {
        return rpcError(id, -32602, `Tool inconnu : ${toolName}`);
      }
      // Gate Business : tous les tools nécessitent un plan Business+
      const gate = await planGate(request);
      if (!gate.ok) {
        return rpcResult(id, { content: [{ type: 'text', text: gate.text }], isError: true });
      }
      try {
        const out = await runTool(toolName, params?.arguments, origin, authHeader);
        return rpcResult(id, {
          content: [{ type: 'text', text: out.text }],
          ...(out.isError ? { isError: true } : {}),
        });
      } catch (err) {
        return rpcResult(id, { content: [{ type: 'text', text: `Erreur serveur : ${err?.message || 'inconnue'}` }], isError: true });
      }
    }

    default:
      return rpcError(id, -32601, `Méthode non supportée : ${method}`);
  }
}

// GET : pas de stream SSE serveur→client (serveur stateless) → 405 propre.
export async function GET() {
  return NextResponse.json(
    { error: 'Volia MCP server. Use POST (JSON-RPC, Streamable HTTP). Docs: https://volia.fr/mcp' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
