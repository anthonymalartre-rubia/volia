// ─────────────────────────────────────────────────────────────────────
// src/lib/newsletter-generator.js — Claude rédige la newsletter mensuelle
// ─────────────────────────────────────────────────────────────────────
// Sprint Marketing Compound Phase 3.
//
// Pipeline (25 du mois 9h CET — donne 5j au founder pour valider) :
//   1. Collecte contexte du mois :
//      - 3 derniers articles blog (static + DB auto)
//      - 3 dernières entrées changelog (static + DB auto)
//      - Compteur signups + posts publiés + actions autonomy executed
//   2. Claude rédige newsletter HTML :
//      - Subject percutant
//      - Intro 2-3 phrases
//      - Section "Ce qu'on a livré ce mois"
//      - Section "Article du mois" + 1-2 lectures recommandées
//      - 1 stat marché B2B FR (chiffre tournant)
//      - CTA discret final
//   3. Action 'newsletter_send' (high risk car broadcast → tous subscribers)
//   4. Founder review + approve
//   5. publish-actions envoie en batch via Resend
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import {
  isAutonomyEnabled,
  logAutonomousAction,
  enforceQuotaOrThrow,
  countRecentActions,
} from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const SYSTEM_PROMPT = `Tu rédiges la newsletter mensuelle de Volia.fr (suite SaaS B2B prospection + campagnes + CRM + forms, plan Business 179€/mois).

DESTINATAIRES :
- Inscrits newsletter (mix prospects froids + clients existants + curieux du marché B2B)
- Plutôt founders / SDR / CMO PME FR
- Lisent souvent en diagonale, attendent du concret

TON :
- Founder qui parle perso (pas "L'équipe Volia")
- Direct, factuel, anti-corporate
- Pas de "Dans ce numéro :" ni "Au sommaire". Va direct au truc.
- 1-2 emojis max dans tout l'email, jamais en début de paragraphe.
- Pas de buzzwords (innovation, disruptif, révolutionnaire).

STRUCTURE OBLIGATOIRE :
1. **Subject** : ≤55 chars, accroche concrète (pas "Newsletter mensuelle Volia n°X")
2. **Preheader** : ≤90 chars, complète le subject (preview gmail/outlook)
3. **Greeting** : "Salut [tutoiement par défaut],"
4. **Intro 2-3 phrases** : hook du mois, pourquoi cette newsletter
5. **"🚀 Ce qu'on a livré ce mois"** : 3-5 bullets sur les releases (depuis changelog)
6. **"📖 Lecture du mois"** : 1 article featured (titre + 2 lignes pitch + lien)
7. **"📊 Le chiffre du mois"** : 1 stat marché B2B FR (tournant) :
   - Janvier : 80% des cold emails B2B FR finissent en spam (étude Volia 2026)
   - Février : Un commercial PME passe 4h/sem à scraper LinkedIn manuellement
   - Mars : 65% des fondateurs FR utilisent encore Excel comme "CRM"
   - Avril : Apollo a indexé 287M de contacts mais 30% sont obsolètes
   - Mai : Le RGPD B2B autorise le cold email sous 3 conditions seulement
   - Juin : 47% des SDR FR pensent que leur stack outil leur fait perdre du temps
   - Juillet : Le warmup email coûte en moyenne 19€/mois pour 12% d'efficacité réelle
   - Août : 1 prospect B2B sur 4 ouvre vraiment un cold email "froid" en 2025
   - Septembre : Les emails envoyés mardi 10h-11h ont +23% de open rate vs lundi 9h
   - Octobre : 73% des PME FR sous-utilisent leur CRM (moins de 30% des features)
   - Novembre : Le coût moyen d'acquisition d'un client B2B PME = 387€
   - Décembre : Volia génère X% de plus de leads que la moyenne du marché (data libre)
   Pioche dans cette liste celle qui matche le mois ou propose une nouvelle.
8. **CTA final** : 1 lien soft vers volia.fr ou /etude ou /pricing
9. **Signature** : "Anthony — Fondateur Volia"

FORMAT SORTIE — HTML inline (compatible client mail strict) :
- Inline styles (style="...") obligatoires
- Pas de class CSS
- max-width 600px container
- Couleur primaire #6366f1 (violet Volia)
- Bg #f9fafb pour body, #ffffff pour card
- Font system : -apple-system, BlinkMacSystemFont, sans-serif
- Tracking-friendly : pas de tracking pixels custom, on laisse Resend gérer

GARDE-FOUS :
- INTERDIT : "0 humain", "100% autonome", "Bordeaux", "12 mois pour bâtir"
- INTERDIT : claims chiffrés non vérifiés ("287 000 entreprises", "+30% conversion")
- INTERDIT : promesses commerciales non tenables ("triple ton MRR")

Réponds UNIQUEMENT en JSON valide :
{
  "should_publish": true | false,
  "skip_reason": "...",
  "subject": "≤55 chars",
  "preheader": "≤90 chars",
  "html_body": "<div style=\\"...\\">...</div>",
  "text_body": "version texte brute du mail (fallback clients sans HTML)",
  "rationale": "1 phrase : pourquoi ce contenu ce mois"
}`;

/**
 * Collecte le contexte business du mois en cours pour Claude.
 */
async function gatherMonthlyContext() {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const last30daysAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

  // 1. Derniers articles blog (static + DB auto)
  let recentArticles = [];
  try {
    const { getAllPostsWithAuto } = await import('./blog');
    const all = await getAllPostsWithAuto();
    recentArticles = (all || [])
      .slice(0, 5)
      .map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: (p.excerpt || p.description || '').slice(0, 180),
        publishedAt: p.publishedAt,
        url: `https://volia.fr/blog/${p.slug}`,
      }));
  } catch {
    /* non bloquant */
  }

  // 2. Dernières entrées changelog (static + DB auto)
  let recentChangelog = [];
  try {
    const { getAllChangelogEntriesWithAuto } = await import('./changelog');
    const all = await getAllChangelogEntriesWithAuto();
    recentChangelog = (all || [])
      .filter((e) => e.date >= last30daysAgo.split('T')[0])
      .slice(0, 5);
  } catch {
    /* non bloquant */
  }

  // 3. Stats business du mois
  let newSignupsThisMonth = 0;
  let newBusinessClientsThisMonth = 0;
  try {
    const { count: signups } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart);
    newSignupsThisMonth = signups || 0;

    const { count: businessClients } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('plan', 'business')
      .gte('created_at', monthStart);
    newBusinessClientsThisMonth = businessClients || 0;
  } catch {
    /* non bloquant */
  }

  // 4. Posts LinkedIn auto publiés
  const autonomousPostsThisMonth = await countRecentActions('linkedin_post', 30 * 24, ['executed']);

  // 5. Compteur subscribers actuels (anonyme, pour stats interne)
  let subscriberCount = 0;
  try {
    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .is('unsubscribed_at', null);
    subscriberCount = count || 0;
  } catch {
    /* non bloquant */
  }

  return {
    monthName: MONTHS_FR[now.getMonth()],
    year: now.getFullYear(),
    recentArticles,
    recentChangelog,
    newSignupsThisMonth,
    newBusinessClientsThisMonth,
    autonomousPostsThisMonth,
    subscriberCount,
  };
}

/**
 * Génère le draft newsletter via Claude.
 */
async function generateNewsletterDraft(ctx) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurée');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const articlesBrief = ctx.recentArticles.length
    ? ctx.recentArticles
        .map((a) => `- "${a.title}" — ${a.excerpt} (${a.url})`)
        .join('\n')
    : '(Aucun article récent)';

  const changelogBrief = ctx.recentChangelog.length
    ? ctx.recentChangelog
        .map((e) => `- v${e.version || '?'} (${e.date}) — ${e.title}\n  ${(e.items || []).slice(0, 3).map((i) => '  • ' + i.text).join('\n')}`)
        .join('\n')
    : '(Aucune release récente)';

  const userMessage = `# Newsletter ${ctx.monthName} ${ctx.year}

## Articles récents (5 derniers)
${articlesBrief}

## Releases récentes (changelog du mois)
${changelogBrief}

## Stats interne (NE PAS partager dans la newsletter — juste pour contexte)
- ${ctx.newSignupsThisMonth} nouveaux signups ce mois
- ${ctx.newBusinessClientsThisMonth} nouveaux clients Business ce mois
- ${ctx.autonomousPostsThisMonth} posts LinkedIn publiés en autonomie
- ${ctx.subscriberCount} abonnés actifs newsletter

# Rédige la newsletter de ${ctx.monthName} ${ctx.year}.

Format JSON strict du system prompt. HTML inline pour body. Subject ≤55 chars, percutant.`;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = message.content[0]?.text || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Pas de JSON dans la réponse Claude');

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error('JSON invalide : ' + err.message);
  }

  if (parsed.should_publish) {
    if (!parsed.subject || !parsed.html_body) {
      throw new Error('Réponse Claude incomplète (subject ou html_body manquant)');
    }
    // Linter défense en profondeur
    const BANNED = [
      /\b0\s+humain\b/i,
      /\b100\s*%\s+autonome\b/i,
      /\bBordeaux\b/i,
      /\b12\s+mois\s+pour\s+(?:bâtir|coder)/i,
      /\b287[\s ]?000\b/,
      /\btriple\s+ton\s+MRR\b/i,
    ];
    const combined = `${parsed.subject}\n${parsed.html_body}\n${parsed.text_body || ''}`;
    const flagged = BANNED.find((p) => p.test(combined));
    if (flagged) {
      throw new Error(`Linter blocked draft (pattern ${flagged}). Brouillon rejeté avant queue.`);
    }
  }

  return parsed;
}

/**
 * Main : appelée par cron newsletter-proposer.
 */
export async function runNewsletterProposer() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  // Quota strict : 1 newsletter / mois max (anti-spam absolu)
  try {
    await enforceQuotaOrThrow('newsletter_send', { perMonth: 1 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message, startedAt };
  }

  // 1. Collecte contexte
  const ctx = await gatherMonthlyContext();

  // 2. Génère draft
  let draft;
  try {
    draft = await generateNewsletterDraft(ctx);
  } catch (err) {
    return { ok: false, error: 'claude_failed', detail: err.message, startedAt };
  }

  if (!draft.should_publish) {
    return {
      ok: true,
      skipped: true,
      reason: 'claude_decided_skip',
      detail: draft.skip_reason || 'Pas de raison fournie',
      startedAt,
    };
  }

  // 3. Log dans queue (HIGH RISK car broadcast à tous subscribers)
  const preview = `📬 Newsletter ${ctx.monthName} → ${ctx.subscriberCount} abonnés\nSubject : "${draft.subject}"`;
  const action = await logAutonomousAction({
    actionType: 'newsletter_send',
    source: 'cron/newsletter-proposer',
    riskLevel: 'high', // broadcast = high stakes
    payload: {
      subject: draft.subject,
      preheader: draft.preheader,
      html_body: draft.html_body,
      text_body: draft.text_body,
      month_label: `${ctx.monthName} ${ctx.year}`,
      subscriber_count_at_proposal: ctx.subscriberCount,
      articles_referenced: ctx.recentArticles.length,
      changelog_referenced: ctx.recentChangelog.length,
    },
    preview,
    rationale: draft.rationale || `Newsletter mensuelle ${ctx.monthName}. ${ctx.recentArticles.length} articles + ${ctx.recentChangelog.length} releases référencés. ${ctx.subscriberCount} abonnés visés.`,
    autoExecute: false,
    expiresInHours: 120, // 5 jours pour valider (envoi 1er du mois)
  });

  return {
    ok: true,
    actionId: action.id,
    subject: draft.subject,
    subscriber_count: ctx.subscriberCount,
    month: `${ctx.monthName} ${ctx.year}`,
    startedAt,
  };
}

/**
 * Envoie la newsletter à tous les subscribers actifs.
 * Appelée par publish-actions après approval founder.
 * Pattern de batching : 50 emails/batch + 5s pause entre batchs (rate limit Resend).
 */
export async function sendNewsletterToAllSubscribers({ subject, html, text, monthLabel }) {
  const { sendEmail } = await import('./email');
  const supabase = getSupabaseAdmin();
  const BATCH_SIZE = 50;
  const PAUSE_MS = 5000;

  // Fetch tous subscribers actifs
  const { data: subs, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email')
    .is('unsubscribed_at', null);

  if (error) {
    throw new Error(`Fetch subscribers failed: ${error.message}`);
  }
  if (!subs || subs.length === 0) {
    return { ok: true, sent: 0, failed: 0, message: 'Aucun subscriber actif' };
  }

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (sub) => {
        try {
          const r = await sendEmail({ to: sub.email, subject, html, text });
          if (r?.id || r?.ok !== false) {
            sent++;
          } else {
            failed++;
            errors.push({ email: sub.email, error: r?.error || 'unknown' });
          }
        } catch (e) {
          failed++;
          errors.push({ email: sub.email, error: e.message });
        }
      })
    );
    // Pause anti rate limit (sauf pour le dernier batch)
    if (i + BATCH_SIZE < subs.length) {
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
  }

  return {
    ok: true,
    sent,
    failed,
    total_subscribers: subs.length,
    month: monthLabel,
    errors_sample: errors.slice(0, 5),
  };
}
