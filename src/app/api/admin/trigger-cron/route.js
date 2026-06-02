// ─────────────────────────────────────────────────────────────────────
// /api/admin/trigger-cron — Trigger manuel des crons autonomy
// ─────────────────────────────────────────────────────────────────────
//
// POST body : { cron: 'auto-content-proposer' | 'publish-approved-actions' }
//
// Permet à l'admin de déclencher manuellement les boucles auto-pilote
// depuis l'UI /admin/auto-queue sans avoir à connaître CRON_SECRET ni
// attendre le prochain tick scheduled.
//
// Sécurité : admin uniquement (is_admin = true). Ne bypasse PAS le
// kill switch global (AUTONOMOUS_MODE_ENABLED) — les fonctions lib
// font la vérif elles-mêmes.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { runContentProposer } from '@/lib/content-proposer';
import { runPublishApprovedActions } from '@/lib/publish-actions';
import { runSentryDigest } from '@/lib/sentry-digest';
import { runChangelogProposer } from '@/lib/changelog-proposer';
import { runBlogWriter } from '@/lib/blog-writer';
import { runNewsletterProposer } from '@/lib/newsletter-generator';
import { runReactivationChurners } from '@/lib/reactivation';
import { runAutoFixBugs } from '@/lib/auto-fix-bugs';
import { rebuildAllLeadScores } from '@/lib/lead-scoring';
import { runTrialRelance } from '@/lib/trial-relance';
import { runDogfoodOutreach } from '@/lib/dogfood-outreach';
import { rollupAutonomyMetrics, runWeeklyAutonomyReview, generateRecommendations } from '@/lib/meta-autonomy';
import { runAutoFaqReply } from '@/lib/auto-faq-reply';
import { runStuckUserDetector } from '@/lib/stuck-user-detector';
import { runCheckoutRecovery } from '@/lib/checkout-recovery';
import { runUsageDeclineDetector } from '@/lib/usage-decline-detector';
import { runHotLeadPromo } from '@/lib/hot-lead-promo';
import { runLinkedInEngagersDetector } from '@/lib/linkedin-engagers-detector';
import { runWeeklyValueReport } from '@/lib/weekly-value-report';
import { runNpsAuto } from '@/lib/nps-auto';
import { runEngine as runAutopilotEngine } from '@/lib/autopilot/engine';
import { runStepper as runAutopilotStepper } from '@/lib/autopilot/stepper';

const CRONS = {
  'auto-faq-reply': runAutoFaqReply,
  // ─── Wave 1 Growth Loops ──────────────────────────────────
  'stuck-user-detection': runStuckUserDetector,
  'checkout-recovery': runCheckoutRecovery,
  'usage-decline-detector': runUsageDeclineDetector,
  'hot-lead-promo': runHotLeadPromo,
  // ─── Wave 2 Growth Loops ──────────────────────────────────
  'linkedin-engagers': runLinkedInEngagersDetector,
  'weekly-value-report': runWeeklyValueReport,
  'nps-auto': runNpsAuto,
  // ─── Volia Autopilot Phase 1 ──────────────────────────────
  'autopilot-engine': runAutopilotEngine,
  'autopilot-stepper': runAutopilotStepper,
  'auto-content-proposer': runContentProposer,
  'publish-approved-actions': runPublishApprovedActions,
  'sentry-digest': runSentryDigest,
  'auto-changelog-proposer': runChangelogProposer,
  'auto-blog-writer': runBlogWriter,
  'newsletter-proposer': runNewsletterProposer,
  'reactivation-churners': runReactivationChurners,
  'auto-fix-bugs': runAutoFixBugs,
  'lead-scoring': rebuildAllLeadScores,
  'trial-relance': runTrialRelance,
  'dogfood-outreach': runDogfoodOutreach,
  'meta-autonomy-rollup': rollupAutonomyMetrics,
  'meta-autonomy-weekly-review': runWeeklyAutonomyReview,
  'meta-autonomy-recommendations': generateRecommendations,
};

async function requireAdmin() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { error: 'Forbidden — admin only', status: 403 };
  return { user };
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { cron } = body;
  const handler = CRONS[cron];
  if (!handler) {
    return NextResponse.json(
      { error: `cron inconnu : "${cron}". Valeurs : ${Object.keys(CRONS).join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const result = await handler();
    return NextResponse.json({ success: true, cron, result });
  } catch (err) {
    console.error(`[admin/trigger-cron] ${cron} unhandled`, err);
    return NextResponse.json(
      { success: false, cron, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
