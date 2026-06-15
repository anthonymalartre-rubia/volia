// ─────────────────────────────────────────────────────────────────────
// POST /api/crm/summarize-call
// ─────────────────────────────────────────────────────────────────────
// Reçoit { deal_id, transcript } (compte-rendu / transcript d'un appel collé
// par l'utilisateur). Claude PROPOSE (sans rien appliquer) :
//   - un résumé FR de l'appel
//   - une suggestion d'étape (parmi les étapes du pipeline du deal)
//   - 0 à 4 tâches de relance (avec échéance en jours)
//   - les objections / points clés
//
// L'application (changement d'étape + création des activités) est faite côté
// client via les endpoints EXISTANTS (/deals/[id]/move + /activities) APRÈS
// validation de l'utilisateur. Aucune écriture ici → endpoint read-only/IA.
//
// Réservé au plan qui débloque le CRM (checkCrmAccess). Pas de table ni de
// migration : on reste simple.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';
import { cleanEnv } from '@/lib/envClean';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const CLAUDE_MODEL = 'claude-sonnet-4-6';

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const dealId = typeof body.deal_id === 'string' ? body.deal_id : null;
  const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';

  if (!dealId) {
    return NextResponse.json({ success: false, error: 'deal_id requis' }, { status: 400 });
  }
  if (transcript.length < 20) {
    return NextResponse.json(
      { success: false, error: 'Compte-rendu trop court (colle le transcript ou tes notes).' },
      { status: 400 }
    );
  }

  // Charge le deal (RLS = ownership) + ses étapes de pipeline
  const { data: deal } = await supabase
    .from('crm_deals')
    .select('id, title, stage_id, pipeline_id, notes, contact:crm_contacts(name, company)')
    .eq('id', dealId)
    .maybeSingle();
  if (!deal) {
    return NextResponse.json({ success: false, error: 'Deal introuvable' }, { status: 404 });
  }

  const { data: stages } = await supabase
    .from('crm_stages')
    .select('id, name, probability, position')
    .eq('pipeline_id', deal.pipeline_id)
    .order('position', { ascending: true });

  const stageList = Array.isArray(stages) ? stages : [];
  const currentStage = stageList.find((s) => s.id === deal.stage_id);

  const apiKey = cleanEnv(process.env.ANTHROPIC_API_KEY);
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Service IA indisponible (clé absente).' },
      { status: 503 }
    );
  }

  const stagesForPrompt = stageList
    .map((s, i) => `${i + 1}. id="${s.id}" · "${s.name}" (proba ${s.probability}%)`)
    .join('\n');

  const system = `Tu es l'assistant CRM d'un commercial B2B français. À partir du compte-rendu d'un appel, tu produis une mise à jour de CRM factuelle et actionnable. Tu ne promets rien, tu n'inventes aucun chiffre : tu te bases UNIQUEMENT sur le contenu de l'appel.

SORTIE : un objet JSON STRICT, rien d'autre :
{
  "summary": "<résumé FR de l'appel, 3 à 5 phrases, factuel>",
  "suggested_stage_id": "<l'id EXACT d'une étape de la liste fournie, ou null si l'appel ne justifie pas de changement>",
  "stage_reason": "<1 phrase: pourquoi cette étape>",
  "objections": "<objections / points de vigilance, ou null>",
  "tasks": [ { "content": "<tâche de relance concrète>", "due_in_days": <entier 1..30> } ]
}

RÈGLES :
- suggested_stage_id DOIT être l'un des id listés, ou null. Jamais inventer.
- 0 à 4 tâches max, concrètes ("Envoyer le devis", "Relancer après le board"), avec une échéance réaliste en jours.
- Français, ton sobre. Pas de markdown, pas de texte hors JSON.`;

  const userContent = [
    `Deal : "${deal.title || 'Sans titre'}"`,
    deal.contact?.name ? `Contact : ${deal.contact.name}${deal.contact.company ? ` (${deal.contact.company})` : ''}` : null,
    `Étape actuelle : ${currentStage ? `"${currentStage.name}" (id=${currentStage.id})` : 'inconnue'}`,
    '',
    'Étapes possibles du pipeline (utilise un de ces id pour suggested_stage_id) :',
    stagesForPrompt || '(aucune étape)',
    '',
    'Compte-rendu / transcript de l\'appel :',
    '"""',
    transcript.slice(0, 12000),
    '"""',
  ]
    .filter((l) => l !== null)
    .join('\n');

  let raw = '';
  try {
    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      temperature: 0.3,
      system,
      messages: [{ role: 'user', content: userContent }],
    });
    raw = resp?.content?.[0]?.text || '';
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Erreur IA : ${err.message || 'inconnue'}` },
      { status: 502 }
    );
  }

  let parsed;
  try {
    const jsonStr = raw.replace(/^```\w*\n?/gm, '').replace(/\n?```$/gm, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    parsed = JSON.parse(start >= 0 ? jsonStr.slice(start, end + 1) : jsonStr);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Réponse IA illisible, réessaie.' },
      { status: 502 }
    );
  }

  // Validation / nettoyage
  const validStageIds = new Set(stageList.map((s) => s.id));
  const suggestedStageId =
    typeof parsed.suggested_stage_id === 'string' && validStageIds.has(parsed.suggested_stage_id)
      ? parsed.suggested_stage_id
      : null;

  const tasks = Array.isArray(parsed.tasks)
    ? parsed.tasks
        .filter((t) => t && typeof t.content === 'string' && t.content.trim())
        .slice(0, 4)
        .map((t) => ({
          content: t.content.trim().slice(0, 300),
          due_in_days: Math.min(30, Math.max(1, parseInt(t.due_in_days, 10) || 3)),
        }))
    : [];

  const suggestedStage = stageList.find((s) => s.id === suggestedStageId) || null;

  return NextResponse.json({
    success: true,
    proposal: {
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim().slice(0, 2000) : '',
      suggested_stage_id: suggestedStageId,
      suggested_stage_name: suggestedStage?.name || null,
      stage_reason: typeof parsed.stage_reason === 'string' ? parsed.stage_reason.trim().slice(0, 240) : null,
      objections: typeof parsed.objections === 'string' && parsed.objections.trim() ? parsed.objections.trim().slice(0, 1000) : null,
      tasks,
    },
  });
}
