import { createClient } from '@supabase/supabase-js';

// Cost per API call in euro cents (approximate)
export const API_COSTS = {
  google_places:     { cost: 1.7,   label: 'Google Places',     color: '#4285F4' },
  anthropic:         { cost: 1.5,   label: 'Anthropic Claude',  color: '#D4A574' },
  serper:            { cost: 0.1,   label: 'Serper.dev',        color: '#22C55E' },
  apollo:            { cost: 3.0,   label: 'Apollo.io',         color: '#6366F1' },
  resend:            { cost: 0.1,   label: 'Resend',            color: '#8B5CF6' },
  millionverifier:   { cost: 0.3,   label: 'MillionVerifier',   color: '#F97316' },
};

let _admin = null;
function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _admin;
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Track an API call with its cost.
 * Fire-and-forget — never blocks the main request.
 *
 * @param {string} service - Key from API_COSTS (e.g. 'google_places', 'apollo')
 * @param {string} [userId] - Optional user ID
 * @param {string} [endpoint] - Optional endpoint/action detail
 * @param {number} [customCost] - Override default cost in cents
 */
export function trackApiCall(service, userId = null, endpoint = null, customCost = null) {
  const month = getCurrentMonth();
  const costCents = customCost ?? API_COSTS[service]?.cost ?? 0;
  const admin = getAdmin();

  // Insert individual log (fire-and-forget)
  admin
    .from('api_usage_log')
    .insert({ service, endpoint, cost_cents: costCents, user_id: userId, month })
    .then(() => {})
    .catch((err) => console.error('API cost log error:', err.message));

  // Upsert monthly aggregate via RPC (atomic increment)
  admin
    .rpc('increment_api_usage', { p_service: service, p_month: month, p_cost: costCents })
    .then(() => {})
    .catch((err) => console.error('API cost aggregate error:', err.message));
}
