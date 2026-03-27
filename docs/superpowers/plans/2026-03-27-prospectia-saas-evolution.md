# Prospectia.ai SaaS Evolution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Prospectia.ai from a free tool into a monetized SaaS with usage limits, lead scoring, tagging, bulk enrichment, search history, and analytics dashboard.

**Architecture:** 4 independent phases — (1) Credits & Stripe billing, (2) Lead scoring & tagging, (3) Bulk enrichment & search history, (4) Dashboard analytics. Each phase is independently deployable. All state lives in Supabase with RLS. No TypeScript — pure JS. Tailwind dark theme throughout.

**Tech Stack:** Next.js 14 (App Router), React 18, Supabase (Postgres + Auth + RLS), Stripe (Checkout + Webhooks + Customer Portal), Tailwind CSS 3, Lucide React icons.

---

## Phase 1: Credits System & Stripe Billing

### Task 1.1: Database schema for plans & credits

**Files:**
- Create: `src/lib/plans.js`

**Why:** Define plan limits and credit costs as constants. The DB tracks usage; this file defines the rules.

- [ ] **Step 1: Create plan definitions**

```javascript
// src/lib/plans.js
export const PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    limits: {
      searches_per_month: 100,
      enrichments_per_month: 20,
      folders: 3,
      exports_per_month: 5,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4900, // cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    limits: {
      searches_per_month: -1, // unlimited
      enrichments_per_month: 500,
      folders: -1,
      exports_per_month: -1,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 14900, // cents
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    limits: {
      searches_per_month: -1,
      enrichments_per_month: -1,
      folders: -1,
      exports_per_month: -1,
    },
  },
};

// Returns the plan object for a given plan id, defaults to free
export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

// Check if a limit is reached. -1 means unlimited.
export function isLimitReached(limit, currentUsage) {
  if (limit === -1) return false;
  return currentUsage >= limit;
}
```

- [ ] **Step 2: Apply Supabase migration for user_profiles and usage_tracking**

Run this SQL via the Supabase MCP `apply_migration` tool (or Supabase dashboard SQL editor):

```sql
-- User profiles with plan info
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, plan) VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Monthly usage tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- format: '2026-03'
  searches INT DEFAULT 0,
  enrichments INT DEFAULT 0,
  exports INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX idx_usage_tracking_user_month ON usage_tracking(user_id, month);
```

- [ ] **Step 3: Backfill existing users**

Run this SQL once to create profiles for existing users:

```sql
INSERT INTO user_profiles (id, plan)
SELECT id, 'free' FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/plans.js
git commit -m "feat: add plan definitions and usage tracking schema"
```

---

### Task 1.2: Usage tracking helper

**Files:**
- Create: `src/lib/usage.js`

**Why:** Centralized functions to check and increment usage, called by API routes and dashboard before performing actions.

- [ ] **Step 1: Create usage helper**

```javascript
// src/lib/usage.js
import { getPlan, isLimitReached } from './plans';

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
export async function checkLimit(supabase, userId, action) {
  const plan = await getUserPlan(supabase, userId);
  const usage = await getUsage(supabase, userId);
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

// Increment usage counter
export async function incrementUsage(supabase, userId, action, amount = 1) {
  const month = getCurrentMonth();

  // Upsert: increment if exists, create if not
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, ' + action)
    .eq('user_id', userId)
    .eq('month', month)
    .single();

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({ [action]: (existing[action] || 0) + amount, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('usage_tracking')
      .insert({ user_id: userId, month, [action]: amount });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/usage.js
git commit -m "feat: add usage tracking helper with plan limit checks"
```

---

### Task 1.3: Add usage checks to API routes

**Files:**
- Modify: `src/app/api/places/route.js`
- Modify: `src/app/api/enrich-waterfall/route.js`

**Why:** Enforce plan limits at the API level so users can't bypass limits via direct API calls.

- [ ] **Step 1: Add limit check to places API**

Add at the top of the POST handler in `src/app/api/places/route.js`, after the existing auth/validation code:

```javascript
import { checkLimit, incrementUsage } from '@/lib/usage';

// Inside POST handler, after getting user from auth:
const limitCheck = await checkLimit(supabase, user.id, 'searches');
if (!limitCheck.allowed) {
  return NextResponse.json(
    { error: 'Limite de recherches atteinte pour ce mois. Passez au plan Pro pour continuer.', limitReached: true, ...limitCheck },
    { status: 429 }
  );
}

// After successful search, before returning:
await incrementUsage(supabase, user.id, 'searches');
```

- [ ] **Step 2: Add limit check to waterfall enrichment API**

Add at the top of the POST handler in `src/app/api/enrich-waterfall/route.js`:

```javascript
import { checkLimit, incrementUsage } from '@/lib/usage';

// Inside POST handler, after getting user from auth:
const limitCheck = await checkLimit(supabase, user.id, 'enrichments');
if (!limitCheck.allowed) {
  return NextResponse.json(
    { error: 'Limite d\'enrichissements atteinte. Passez au plan Pro.', limitReached: true, ...limitCheck },
    { status: 429 }
  );
}

// After successful enrichment, before returning:
await incrementUsage(supabase, user.id, 'enrichments');
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/places/route.js src/app/api/enrich-waterfall/route.js
git commit -m "feat: enforce plan limits on search and enrichment APIs"
```

---

### Task 1.4: Stripe integration — Checkout & Webhooks

**Files:**
- Create: `src/app/api/stripe/checkout/route.js`
- Create: `src/app/api/stripe/webhook/route.js`
- Create: `src/app/api/stripe/portal/route.js`

**Why:** Handle plan upgrades via Stripe Checkout, subscription lifecycle via webhooks, and self-service billing via Customer Portal.

- [ ] **Step 1: Install Stripe**

```bash
npm install stripe
```

- [ ] **Step 2: Create checkout endpoint**

```javascript
// src/app/api/stripe/checkout/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase-server';
import { PLANS } from '@/lib/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { planId } = await request.json();
    const plan = PLANS[planId];
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://scraping-dom-ezdrive.vercel.app'}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://scraping-dom-ezdrive.vercel.app'}/dashboard?upgrade=cancelled`,
      metadata: { supabase_user_id: user.id, plan_id: planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create webhook endpoint**

```javascript
// src/app/api/stripe/webhook/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use service role for webhook (no user session)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.supabase_user_id;
      const planId = session.metadata.plan_id;
      if (userId && planId) {
        await supabaseAdmin
          .from('user_profiles')
          .update({
            plan: planId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      if (subscription.cancel_at_period_end) {
        // User cancelled — will downgrade at period end
        // Could store cancel_at date for display, but plan stays active until then
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      // Downgrade to free
      const { data } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (data) {
        await supabaseAdmin
          .from('user_profiles')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 4: Create customer portal endpoint**

```javascript
// src/app/api/stripe/portal/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Pas d\'abonnement actif' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://scraping-dom-ezdrive.vercel.app'}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 });
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/stripe/
git commit -m "feat: add Stripe checkout, webhook, and customer portal endpoints"
```

---

### Task 1.5: Usage & plan display in dashboard

**Files:**
- Create: `src/components/UsageBanner.jsx`
- Modify: `src/app/dashboard/page.js` — load plan/usage, pass to components, add upgrade flow

- [ ] **Step 1: Create UsageBanner component**

```jsx
// src/components/UsageBanner.jsx
'use client';

import { Zap, ArrowUpRight } from 'lucide-react';

export default function UsageBanner({ plan, usage, onUpgrade }) {
  if (!plan || !usage) return null;

  const items = [
    { label: 'Recherches', current: usage.searches || 0, limit: plan.limits.searches_per_month },
    { label: 'Enrichissements', current: usage.enrichments || 0, limit: plan.limits.enrichments_per_month },
    { label: 'Exports', current: usage.exports || 0, limit: plan.limits.exports_per_month },
  ];

  return (
    <div className="mx-4 mt-4 rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-[#fafafa]">
            Plan {plan.name}
          </span>
        </div>
        {plan.id === 'free' && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Passer Pro <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map(({ label, current, limit }) => {
          const isUnlimited = limit === -1;
          const pct = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
          const isWarning = !isUnlimited && pct >= 80;
          const isMaxed = !isUnlimited && pct >= 100;

          return (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#a1a1aa]">{label}</span>
                <span className={isMaxed ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-[#71717a]'}>
                  {current} / {isUnlimited ? '\u221e' : limit}
                </span>
              </div>
              {!isUnlimited && (
                <div className="h-1.5 rounded-full bg-[#1e1e24] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMaxed ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-violet-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Load plan/usage in dashboard and wire upgrade flow**

In `src/app/dashboard/page.js`, add these state variables alongside existing ones:

```javascript
const [userPlan, setUserPlan] = useState(null);
const [userUsage, setUserUsage] = useState(null);
```

In the `initializeApp()` function, after loading user, add:

```javascript
// Load plan
const { data: profile } = await supabase
  .from('user_profiles')
  .select('plan, stripe_customer_id')
  .eq('id', user.id)
  .single();

if (profile) {
  const { getPlan } = await import('@/lib/plans');
  setUserPlan(getPlan(profile.plan));
}

// Load usage
const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const { data: usage } = await supabase
  .from('usage_tracking')
  .select('searches, enrichments, exports')
  .eq('user_id', user.id)
  .eq('month', month)
  .single();

setUserUsage(usage || { searches: 0, enrichments: 0, exports: 0 });
```

Add upgrade handler:

```javascript
const handleUpgrade = async (planId = 'pro') => {
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    if (error) alert(error);
  } catch (err) {
    alert('Erreur lors de la redirection vers le paiement.');
  }
};
```

Add `<UsageBanner>` in the Sidebar area of the JSX:

```jsx
import UsageBanner from '@/components/UsageBanner';

// In the sidebar section:
<UsageBanner plan={userPlan} usage={userUsage} onUpgrade={() => handleUpgrade('pro')} />
```

- [ ] **Step 3: Handle limit errors in search/enrichment loops**

In the `startScraping` function, handle 429 responses:

```javascript
// In the fetch loop, after calling /api/places:
if (res.status === 429) {
  const { error } = await res.json();
  addLog('error', error || 'Limite atteinte');
  stopSearchRef.current = true;
  break;
}
```

Same pattern in `startWaterfallEnrichment`:

```javascript
if (res.status === 429) {
  const { error } = await res.json();
  addLog('error', error || 'Limite atteinte');
  stopWaterfallRef.current = true;
  break;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/UsageBanner.jsx src/app/dashboard/page.js
git commit -m "feat: add usage banner with plan limits and Stripe upgrade flow"
```

---

### Task 1.6: Environment variables setup

**Files:** None (Vercel dashboard + Stripe dashboard)

- [ ] **Step 1: Create Stripe products and prices**

In Stripe Dashboard:
1. Create product "Prospectia Pro" — 49 EUR/month recurring
2. Create product "Prospectia Enterprise" — 149 EUR/month recurring
3. Copy the price IDs (e.g., `price_xxx`)

- [ ] **Step 2: Set Vercel environment variables**

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  (for webhook endpoint)
NEXT_PUBLIC_APP_URL=https://scraping-dom-ezdrive.vercel.app
```

- [ ] **Step 3: Configure Stripe webhook**

In Stripe Dashboard > Webhooks, add endpoint:
- URL: `https://scraping-dom-ezdrive.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

- [ ] **Step 4: Commit** (nothing to commit, config only)

---

## Phase 2: Lead Scoring & Tags

### Task 2.1: Database schema for tags

- [ ] **Step 1: Apply Supabase migration**

```sql
-- Tags table
CREATE TABLE lead_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'gray',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tags" ON lead_tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Junction table: prospects <-> tags (many-to-many)
CREATE TABLE prospect_tags (
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES lead_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prospect_id, tag_id)
);

ALTER TABLE prospect_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prospect tags" ON prospect_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM prospects p WHERE p.id = prospect_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM prospects p WHERE p.id = prospect_id AND p.user_id = auth.uid()));

-- Add score column to prospects
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS lead_score INT DEFAULT 0;
```

- [ ] **Step 2: Commit** (no file changes, DB migration only)

---

### Task 2.2: Lead scoring logic

**Files:**
- Create: `src/lib/scoring.js`

- [ ] **Step 1: Create scoring function**

```javascript
// src/lib/scoring.js

// Compute a 0-100 lead score based on data completeness and quality
export function computeLeadScore(prospect) {
  let score = 0;

  // Has verified email (not guessed) — 30 pts
  if (prospect.email && prospect.email_method !== 'guess') {
    score += 30;
  } else if (prospect.email) {
    score += 10; // guessed email
  }

  // Has phone — 20 pts
  if (prospect.telephone) score += 20;

  // Has website — 15 pts
  if (prospect.site_web) score += 15;

  // Google rating >= 4.0 — 15 pts, >= 3.0 — 8 pts
  if (prospect.note >= 4.0) score += 15;
  else if (prospect.note >= 3.0) score += 8;

  // Has reviews (signals active business) — 10 pts if > 10 reviews, 5 pts if > 0
  if (prospect.nb_avis > 10) score += 10;
  else if (prospect.nb_avis > 0) score += 5;

  // Has address — 10 pts
  if (prospect.adresse) score += 10;

  return Math.min(100, score);
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (score >= 60) return { label: 'Bon', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (score >= 40) return { label: 'Moyen', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  return { label: 'Faible', color: 'text-red-400', bg: 'bg-red-500/20' };
}
```

- [ ] **Step 2: Compute score on prospect save in dashboard**

In `src/app/dashboard/page.js`, import scoring and compute on save:

```javascript
import { computeLeadScore } from '@/lib/scoring';

// In startScraping, when building prospect objects to insert:
const prospect = {
  // ...existing fields...
  lead_score: computeLeadScore({ nom, adresse, telephone, site_web, note, nb_avis, email: null, email_method: null }),
};

// In enrichment success handlers, recompute:
const updatedScore = computeLeadScore(updatedProspect);
await supabase.from('prospects').update({ lead_score: updatedScore }).eq('id', prospect.id);
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/scoring.js src/app/dashboard/page.js
git commit -m "feat: add lead scoring based on data completeness"
```

---

### Task 2.3: Tag management UI in ResultsPanel

**Files:**
- Modify: `src/app/dashboard/page.js` — load tags, pass to ResultsPanel
- Modify: `src/components/ResultsPanel.jsx` — tag display, add/remove tags, create tags

- [ ] **Step 1: Load tags in dashboard and add CRUD functions**

In `src/app/dashboard/page.js`:

```javascript
const [tags, setTags] = useState([]);

// In initializeApp(), after loading folders:
const { data: tagsData } = await supabase
  .from('lead_tags')
  .select('*')
  .order('name');
setTags(tagsData || []);

// Also load prospect_tags associations:
const { data: ptData } = await supabase
  .from('prospect_tags')
  .select('prospect_id, tag_id');
// Store as a Map: prospect_id -> [tag_id, ...]
const tagMap = {};
(ptData || []).forEach(pt => {
  if (!tagMap[pt.prospect_id]) tagMap[pt.prospect_id] = [];
  tagMap[pt.prospect_id].push(pt.tag_id);
});
setProspectTagMap(tagMap);

// Add state:
const [prospectTagMap, setProspectTagMap] = useState({});

// Tag CRUD:
const createTag = async (name, color) => {
  const { data } = await supabase
    .from('lead_tags')
    .insert({ user_id: user.id, name, color })
    .select()
    .single();
  if (data) setTags(prev => [...prev, data]);
  return data;
};

const deleteTag = async (tagId) => {
  await supabase.from('lead_tags').delete().eq('id', tagId);
  setTags(prev => prev.filter(t => t.id !== tagId));
  // Clean up map
  setProspectTagMap(prev => {
    const next = { ...prev };
    Object.keys(next).forEach(pid => {
      next[pid] = next[pid].filter(tid => tid !== tagId);
    });
    return next;
  });
};

const toggleProspectTag = async (prospectId, tagId) => {
  const current = prospectTagMap[prospectId] || [];
  if (current.includes(tagId)) {
    await supabase.from('prospect_tags').delete().eq('prospect_id', prospectId).eq('tag_id', tagId);
    setProspectTagMap(prev => ({
      ...prev,
      [prospectId]: (prev[prospectId] || []).filter(t => t !== tagId),
    }));
  } else {
    await supabase.from('prospect_tags').insert({ prospect_id: prospectId, tag_id: tagId });
    setProspectTagMap(prev => ({
      ...prev,
      [prospectId]: [...(prev[prospectId] || []), tagId],
    }));
  }
};
```

Pass to ResultsPanel:

```jsx
<ResultsPanel
  // ...existing props...
  tags={tags}
  prospectTagMap={prospectTagMap}
  onCreateTag={createTag}
  onDeleteTag={deleteTag}
  onToggleProspectTag={toggleProspectTag}
/>
```

- [ ] **Step 2: Add tag chips and score badge to each row in ResultsPanel**

In `src/components/ResultsPanel.jsx`, in the table row for each prospect:

```jsx
import { computeLeadScore, getScoreLabel } from '@/lib/scoring';

// In the table row, add a score badge column:
const score = prospect.lead_score || computeLeadScore(prospect);
const scoreInfo = getScoreLabel(score);

<td className="px-3 py-2">
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${scoreInfo.bg} ${scoreInfo.color}`}>
    {score}
  </span>
</td>

// Add tag chips after the score:
<td className="px-3 py-2">
  <div className="flex flex-wrap gap-1">
    {(prospectTagMap[prospect.id] || []).map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      if (!tag) return null;
      return (
        <span
          key={tagId}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-${tag.color}-500/20 text-${tag.color}-400 cursor-pointer hover:opacity-70`}
          onClick={() => onToggleProspectTag(prospect.id, tagId)}
          title="Cliquer pour retirer"
        >
          {tag.name}
        </span>
      );
    })}
    <TagDropdown
      tags={tags}
      activeTags={prospectTagMap[prospect.id] || []}
      onToggle={(tagId) => onToggleProspectTag(prospect.id, tagId)}
      onCreate={onCreateTag}
    />
  </div>
</td>
```

- [ ] **Step 3: Create TagDropdown inline component**

Add inside `ResultsPanel.jsx`:

```jsx
function TagDropdown({ tags, activeTags, onToggle, onCreate }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full bg-[#1e1e24] hover:bg-[#2a2a32] text-[#71717a] hover:text-[#fafafa] flex items-center justify-center text-xs transition-colors"
      >
        +
      </button>
      {open && (
        <div className="absolute z-50 top-7 left-0 w-48 rounded-lg border border-[#1e1e24] bg-[#111114] shadow-xl p-2 space-y-1">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => { onToggle(tag.id); setOpen(false); }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-[#1e1e24] transition-colors ${
                activeTags.includes(tag.id) ? 'text-[#fafafa]' : 'text-[#a1a1aa]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-${tag.color}-500`} />
              {tag.name}
              {activeTags.includes(tag.id) && <span className="ml-auto text-violet-400">&#10003;</span>}
            </button>
          ))}
          <div className="border-t border-[#1e1e24] pt-1 mt-1">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) {
                onCreate(newName.trim(), 'violet');
                setNewName('');
                setOpen(false);
              }
            }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nouveau tag..."
                className="w-full px-2 py-1.5 rounded text-xs bg-[#09090b] border border-[#1e1e24] text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-violet-500"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.js src/components/ResultsPanel.jsx
git commit -m "feat: add tag management and lead score display in results table"
```

---

## Phase 3: Bulk Enrichment & Search History

### Task 3.1: Bulk enrichment — "Enrichir tout le dossier"

**Files:**
- Modify: `src/components/ResultsPanel.jsx` — add bulk enrich button
- Modify: `src/app/dashboard/page.js` — add bulk enrichment handler

- [ ] **Step 1: Add bulk enrich button in ResultsPanel header**

In `src/components/ResultsPanel.jsx`, in the stats/action bar area:

```jsx
// Add next to existing action buttons:
<button
  onClick={() => onBulkEnrich(activeFolder === 'all' ? null : activeFolder)}
  disabled={isWaterfallEnriching || prospectsWithoutEmail === 0}
  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
>
  <Zap className="h-3.5 w-3.5" />
  Enrichir tout ({prospectsWithoutEmail})
</button>

// Compute count:
const prospectsWithoutEmail = folderProspects.filter(p => !p.email && p.site_web).length;
```

Add `onBulkEnrich` prop.

- [ ] **Step 2: Implement bulk enrichment in dashboard**

In `src/app/dashboard/page.js`:

```javascript
const handleBulkEnrich = async (folderId) => {
  // Get prospects to enrich
  let toEnrich = prospects.filter(p => !p.email && p.site_web);
  if (folderId) toEnrich = toEnrich.filter(p => p.folder_id === folderId);

  if (toEnrich.length === 0) return;

  // Check limit
  const res = await fetch('/api/stripe/checkout', { method: 'OPTIONS' }); // dummy
  // Actually, start the waterfall enrichment loop with the filtered list
  startWaterfallEnrichment(toEnrich);
};
```

Modify `startWaterfallEnrichment` to optionally accept a custom prospect list:

```javascript
const startWaterfallEnrichment = async (customList = null) => {
  const toEnrich = customList || prospects.filter(p => !p.email && p.site_web);
  // ...rest of existing logic using toEnrich...
};
```

Pass to ResultsPanel:

```jsx
<ResultsPanel
  // ...existing props...
  onBulkEnrich={handleBulkEnrich}
  isWaterfallEnriching={isWaterfallEnriching}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultsPanel.jsx src/app/dashboard/page.js
git commit -m "feat: add bulk enrichment for all prospects in folder"
```

---

### Task 3.2: Search history

**Files:**
- Modify: `src/app/dashboard/page.js` — save search sessions with details, load history
- Modify: `src/components/Sidebar.jsx` — display search history in sidebar
- Create: `src/components/SearchHistoryPanel.jsx`

- [ ] **Step 1: Enhance search_sessions table**

Apply migration:

```sql
ALTER TABLE search_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE search_sessions ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE search_sessions ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES lead_folders(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sessions" ON search_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Save sessions with details in dashboard**

In `src/app/dashboard/page.js`, in `startScraping`:

```javascript
// After building the task list, before the search loop:
const { data: session } = await supabase.from('search_sessions').insert({
  user_id: user.id,
  departments: selectedDepts,
  categories: { b2b: b2bCats, copro: coproCats, custom: customQueries },
  query_count: tasks.length,
  results_count: 0,
  status: 'running',
  label: `Recherche ${new Date().toLocaleDateString('fr-FR')}`,
  folder_id: folderId || null,
}).select().single();

const sessionId = session?.id;

// After the loop completes:
if (sessionId) {
  await supabase.from('search_sessions')
    .update({ status: 'completed', results_count: newProspects.length })
    .eq('id', sessionId);
}
```

- [ ] **Step 3: Load search history and add to sidebar**

In `src/app/dashboard/page.js`, in `initializeApp`:

```javascript
const [searchHistory, setSearchHistory] = useState([]);

// In initializeApp:
const { data: sessions } = await supabase
  .from('search_sessions')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(20);
setSearchHistory(sessions || []);
```

Pass to Sidebar:

```jsx
<Sidebar
  // ...existing props...
  searchHistory={searchHistory}
  onReplaySearch={(session) => {
    // Pre-fill search panel with session params and start
    setActiveView('search');
    // The SearchPanel could accept initialConfig prop
  }}
/>
```

- [ ] **Step 4: Display history in Sidebar**

In `src/components/Sidebar.jsx`, add a "Historique" section:

```jsx
{/* Search history */}
<div className="mt-6">
  <h3 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#52525b] mb-2">
    Historique
  </h3>
  <div className="space-y-0.5">
    {(searchHistory || []).slice(0, 10).map(session => (
      <button
        key={session.id}
        onClick={() => onReplaySearch?.(session)}
        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#a1a1aa] hover:bg-[#1e1e24] hover:text-[#fafafa] transition-colors"
      >
        <div className="font-medium truncate">{session.label || 'Recherche'}</div>
        <div className="text-[10px] text-[#52525b] mt-0.5">
          {session.results_count} resultats &middot; {new Date(session.created_at).toLocaleDateString('fr-FR')}
        </div>
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.js src/components/Sidebar.jsx
git commit -m "feat: add search history with replay in sidebar"
```

---

## Phase 4: Dashboard Analytics

### Task 4.1: Analytics data aggregation

**Files:**
- Create: `src/lib/analytics.js`

- [ ] **Step 1: Create analytics helper**

```javascript
// src/lib/analytics.js

export function computeAnalytics(prospects, searchHistory) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const recent30 = prospects.filter(p => new Date(p.created_at) >= thirtyDaysAgo);
  const recent7 = prospects.filter(p => new Date(p.created_at) >= sevenDaysAgo);

  // Enrichment rate
  const withEmail = prospects.filter(p => p.email);
  const enrichmentRate = prospects.length > 0
    ? Math.round((withEmail.length / prospects.length) * 100)
    : 0;

  // By department
  const byDept = {};
  prospects.forEach(p => {
    byDept[p.departement] = (byDept[p.departement] || 0) + 1;
  });

  // By email method
  const byMethod = {};
  withEmail.forEach(p => {
    byMethod[p.email_method] = (byMethod[p.email_method] || 0) + 1;
  });

  // By type
  const byType = { b2b: 0, copro: 0, custom: 0 };
  prospects.forEach(p => {
    if (p.type) byType[p.type] = (byType[p.type] || 0) + 1;
  });

  // Weekly trend (last 4 weeks)
  const weeklyTrend = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date(now - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
    const count = prospects.filter(p => {
      const d = new Date(p.created_at);
      return d >= start && d < end;
    }).length;
    weeklyTrend.push({
      label: `S-${i}`,
      count,
    });
  }

  // Score distribution
  const scoreDistribution = { excellent: 0, bon: 0, moyen: 0, faible: 0 };
  prospects.forEach(p => {
    const score = p.lead_score || 0;
    if (score >= 80) scoreDistribution.excellent++;
    else if (score >= 60) scoreDistribution.bon++;
    else if (score >= 40) scoreDistribution.moyen++;
    else scoreDistribution.faible++;
  });

  return {
    total: prospects.length,
    recent30: recent30.length,
    recent7: recent7.length,
    withEmail: withEmail.length,
    enrichmentRate,
    byDept,
    byMethod,
    byType,
    weeklyTrend,
    scoreDistribution,
    searchCount: searchHistory?.length || 0,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/analytics.js
git commit -m "feat: add analytics computation helper"
```

---

### Task 4.2: Enhanced OverviewPanel with charts

**Files:**
- Modify: `src/components/OverviewPanel.jsx`

- [ ] **Step 1: Rewrite OverviewPanel with analytics cards and visual bars**

```jsx
// src/components/OverviewPanel.jsx
'use client';

import { useMemo } from 'react';
import { Users, Mail, TrendingUp, BarChart3, MapPin, Target } from 'lucide-react';
import { computeAnalytics } from '@/lib/analytics';
import { DEPTS } from '@/lib/constants';

export default function OverviewPanel({ prospects, searchHistory }) {
  const analytics = useMemo(
    () => computeAnalytics(prospects || [], searchHistory || []),
    [prospects, searchHistory]
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-[#fafafa]">Vue d'ensemble</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total leads" value={analytics.total} sub={`+${analytics.recent7} cette semaine`} />
        <KpiCard icon={Mail} label="Emails trouves" value={analytics.withEmail} sub={`${analytics.enrichmentRate}% enrichis`} />
        <KpiCard icon={Target} label="Recherches" value={analytics.searchCount} sub="sessions lancees" />
        <KpiCard icon={TrendingUp} label="7 derniers jours" value={analytics.recent7} sub="nouveaux leads" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly trend */}
        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
          <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Tendance hebdomadaire
          </h3>
          <div className="flex items-end gap-3 h-32">
            {analytics.weeklyTrend.map((w, i) => {
              const maxCount = Math.max(...analytics.weeklyTrend.map(w => w.count), 1);
              const height = (w.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-[#71717a]">{w.count}</span>
                  <div className="w-full rounded-t-md bg-violet-600/80" style={{ height: `${Math.max(4, height)}%` }} />
                  <span className="text-[10px] text-[#52525b]">{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By department */}
        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
          <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Par departement
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byDept).sort((a, b) => b[1] - a[1]).map(([dept, count]) => {
              const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={dept}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#a1a1aa]">{DEPTS[dept]?.name || dept}</span>
                    <span className="text-[#71717a]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1e1e24] overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score distribution & email methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
          <h3 className="text-sm font-medium text-[#a1a1aa] mb-4">Qualite des leads</h3>
          <div className="space-y-2">
            {[
              { key: 'excellent', label: 'Excellent (80+)', color: 'bg-green-500' },
              { key: 'bon', label: 'Bon (60-79)', color: 'bg-blue-500' },
              { key: 'moyen', label: 'Moyen (40-59)', color: 'bg-amber-500' },
              { key: 'faible', label: 'Faible (<40)', color: 'bg-red-500' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-[#a1a1aa] flex-1">{label}</span>
                <span className="text-xs font-medium text-[#fafafa]">{analytics.scoreDistribution[key]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
          <h3 className="text-sm font-medium text-[#a1a1aa] mb-4">Sources d'enrichissement</h3>
          <div className="space-y-2">
            {Object.entries(analytics.byMethod).sort((a, b) => b[1] - a[1]).map(([method, count]) => (
              <div key={method} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="text-xs text-[#a1a1aa] flex-1 capitalize">{method}</span>
                <span className="text-xs font-medium text-[#fafafa]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-[#1e1e24] bg-[#111114] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-violet-400" />
        <span className="text-xs text-[#71717a]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#fafafa]">{value}</div>
      {sub && <div className="text-[10px] text-[#52525b] mt-1">{sub}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Pass searchHistory to OverviewPanel in dashboard**

In `src/app/dashboard/page.js`:

```jsx
<OverviewPanel
  prospects={prospects}
  searchHistory={searchHistory}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/OverviewPanel.jsx src/app/dashboard/page.js
git commit -m "feat: add analytics dashboard with KPIs, trends, and distribution charts"
```

---

## Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|-----------------|
| 1. Credits & Stripe | 1.1–1.6 | Monetized SaaS with 3 plans, usage limits, Stripe billing |
| 2. Lead Scoring & Tags | 2.1–2.3 | 0-100 score per lead, tagging system with UI |
| 3. Bulk Enrich & History | 3.1–3.2 | One-click folder enrichment, replayable search history |
| 4. Dashboard Analytics | 4.1–4.2 | KPIs, weekly trends, dept/score/method breakdowns |

**Env vars needed for Phase 1:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
