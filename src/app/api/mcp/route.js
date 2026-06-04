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

export const dynamic = 'force-dynamic';

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
];

// ─── Helpers ──────────────────────────────────────────────────────────
function rpcResult(id, result) {
  return NextResponse.json({ jsonrpc: '2.0', id, result });
}
function rpcError(id, code, message) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } });
}

// Appelle l'API v1 en interne en transmettant la clé de l'utilisateur.
async function callV1(origin, path, authHeader) {
  const res = await fetch(`${origin}${path}`, {
    headers: { Authorization: authHeader, Accept: 'application/json' },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
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
