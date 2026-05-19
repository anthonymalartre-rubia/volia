// src/lib/usage.js
import { getPlan, isLimitReached } from './plans';
import { sendEmail } from './email';
import { usageWarningEmail, usageLimitReachedEmail } from './emailTemplates';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Get or create usage record for current month
export async function getUsage(supabase, userId) {
  const month = getCurrentMonth();

  const { data } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .single();

  if (data) return data;

  // Create if not exists
  const { data: newData } = await supabase
    .from('usage_tracking')
    .insert({ user_id: userId, month })
    .select()
    .single();

  return newData || { searches: 0, enrichments: 0, exports: 0 };
}

// Get user plan
export async function getUserPlan(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  return getPlan(data?.plan || 'free');
}

// Check if user can perform an action
// Avant : 2 roundtrips séquentiels (getUserPlan puis getUsage) = ~300-600ms.
// Cumulé sur un waterfall de 80 prospects = 24-48s perdus. Maintenant en parallèle.
export async function checkLimit(supabase, userId, action) {
  const [plan, usage] = await Promise.all([
    getUserPlan(supabase, userId),
    getUsage(supabase, userId),
  ]);
  const limit = plan.limits[`${action}_per_month`];
  const current = usage[action] || 0;

  return {
    allowed: !isLimitReached(limit, current),
    current,
    limit,
    plan: plan.id,
    remaining: limit === -1 ? -1 : Math.max(0, limit - current),
  };
}

// Increment usage counter and send warning emails if thresholds are crossed
export async function incrementUsage(supabase, userId, action, amount = 1) {
  const month = getCurrentMonth();

  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, ' + action)
    .eq('user_id', userId)
    .eq('month', month)
    .single();

  const previousCount = existing ? (existing[action] || 0) : 0;
  const newCount = previousCount + amount;

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({ [action]: newCount, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('usage_tracking')
      .insert({ user_id: userId, month, [action]: amount });
  }

  // ─── Usage warning emails ──────────────────────────────────────────────────
  // Send emails when crossing the 80% or 100% threshold.
  // We check that the previous count was below the threshold to avoid duplicates.
  try {
    const plan = await getUserPlan(supabase, userId);
    const limitKey = `${action}_per_month`;
    const limit = plan.limits[limitKey];

    // Skip for unlimited plans
    if (limit === -1) return;

    const prevPercent = Math.floor((previousCount / limit) * 100);
    const newPercent = Math.floor((newCount / limit) * 100);

    // Determine which threshold was just crossed
    let thresholdCrossed = null;
    if (newPercent >= 100 && prevPercent < 100) {
      thresholdCrossed = 100;
    } else if (newPercent >= 80 && prevPercent < 80) {
      thresholdCrossed = 80;
    }

    if (thresholdCrossed) {
      // Fetch user email
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (profile?.email) {
        const limitType = action; // 'searches', 'enrichments', 'exports'
        let template;
        if (thresholdCrossed === 100) {
          template = usageLimitReachedEmail(profile.full_name, plan.name, limitType);
        } else {
          template = usageWarningEmail(profile.full_name, thresholdCrossed, plan.name, limitType);
        }
        sendEmail({ to: profile.email, subject: template.subject, html: template.html })
          .catch((err) => console.error(`[usage] ${thresholdCrossed}% email failed:`, err));
      }
    }
  } catch (emailErr) {
    // Never let email errors affect usage tracking
    console.error('[usage] Warning email error:', emailErr);
  }
}
