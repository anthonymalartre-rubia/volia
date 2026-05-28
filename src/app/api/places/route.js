import { DEPTS, PLACES_API_URL, FIELD_MASK, getDeptData } from '@/lib/constants';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { trackApiCall } from '@/lib/apiCosts';
import { trackOnboardingStep } from '@/lib/onboarding';
import { unlockAchievement } from '@/lib/achievements';

export async function GET() {
  // Health check — just checks if API key is set
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json({ configured: false }, { status: 503 });
  }
  return Response.json({ configured: true });
}

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthenticatedUser();

    if (!user) {
      return Response.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const limitCheck = await checkLimit(supabase, user.id, 'searches');
    if (!limitCheck.allowed) {
      return Response.json(
        { error: 'Limite de prospects atteinte pour ce mois. Passez au plan Pro pour continuer.', limitReached: true, ...limitCheck },
        { status: 429 }
      );
    }

    const { query, dept } = await request.json();

    if (!query || typeof query !== 'string' || query.length > 200) {
      return Response.json(
        { error: 'Invalid query: must be a string under 200 characters' },
        { status: 400 }
      );
    }

    if (!dept || typeof dept !== 'string') {
      return Response.json(
        { error: 'Missing required field: dept' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'GOOGLE_PLACES_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Support multi-country zone codes (FR: "75", BE: "BE-BRU", CH: "CH-GE", etc.)
    const deptData = getDeptData(dept);
    if (!deptData) {
      return Response.json(
        { error: `Zone not found: ${dept}` },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(PLACES_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: {
              latitude: deptData.lat,
              longitude: deptData.lng,
            },
            radius: deptData.r,
          },
        },
      }),
    });

    clearTimeout(timeout);
    trackApiCall('google_places', user.id, 'searchText');

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Places API error:', errorData);
      return Response.json(
        { error: `Google Places API error: ${response.status} — ${errorData.substring(0, 200)}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // ─── Quota téléphones — check avant d'attribuer ─────────────
    // Les téléphones sont une 2ème ligne de quota (cf. plans.js
    // phones_per_month). On les attribue dans la limite restante :
    // au-delà, on retourne la place SANS téléphone (l'user voit le nom,
    // l'adresse, etc. mais devra upgrader pour voir le numéro).
    const phonesLimitCheck = await checkLimit(supabase, user.id, 'phones');
    const phonesUnlimited = phonesLimitCheck.limit === -1;
    let phonesBudget = phonesUnlimited
      ? Number.POSITIVE_INFINITY
      : Math.max(0, phonesLimitCheck.remaining);

    let phonesAttributed = 0;
    const places = (data.places || []).map((place) => {
      const rawPhone = place.nationalPhoneNumber || place.internationalPhoneNumber || '';
      let telephone = '';
      if (rawPhone && phonesBudget > 0) {
        telephone = rawPhone;
        phonesBudget -= 1;
        phonesAttributed += 1;
      }
      return {
        place_id: place.id || '',
        nom: place.displayName?.text || '',
        adresse: place.formattedAddress || '',
        telephone,
        site_web: place.websiteUri || '',
        note: place.rating || null,
        nb_avis: place.userRatingCount || 0,
      };
    });

    // Comptage par prospect ramené (et non plus par appel API).
    // Un appel Google Places peut retourner jusqu'à 20 résultats : on
    // facture la valeur (les prospects obtenus), pas l'API call.
    let achievement = null;
    if (places.length > 0) {
      await incrementUsage(supabase, user.id, 'searches', places.length);
      // Incrémente le compteur phones uniquement avec ce qui a réellement
      // été attribué (best-effort, ne JAMAIS bloquer la réponse search).
      if (phonesAttributed > 0) {
        incrementUsage(supabase, user.id, 'phones', phonesAttributed).catch((err) =>
          console.warn('[places] phones increment failed:', err.message)
        );
      }
      // Onboarding : marque first_search (fire-and-forget)
      trackOnboardingStep(user.id, 'first_search');

      // Achievement : first_search (best-effort, ne JAMAIS bloquer la réponse)
      try {
        const ach = await unlockAchievement(
          user.id,
          'first_search',
          { first_query: query, first_dept: dept },
          { markToastShown: true } // toast affiché live côté dashboard
        );
        if (ach?.newly_unlocked) achievement = ach.achievement;
      } catch (err) {
        console.warn('[achievement] unlock failed:', err.message);
      }
    }
    return Response.json({ places, achievement });
  } catch (error) {
    console.error('Places API route error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
