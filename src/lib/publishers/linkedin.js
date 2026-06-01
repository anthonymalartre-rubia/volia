// ─────────────────────────────────────────────────────────────────────
// src/lib/publishers/linkedin.js — Publication directe LinkedIn API
// ─────────────────────────────────────────────────────────────────────
//
// Utilise l'API LinkedIn /v2/ugcPosts (Share on LinkedIn).
//
// Credentials requises (stockées dans publisher_credentials.credentials) :
//   {
//     access_token: "AQVxxxxxxxxxxxxxxxxx",   // OAuth2 token, scope w_member_social
//     person_urn: "urn:li:person:abc123",     // récupéré via /v2/me lors du setup
//     expires_at: "2026-08-01T00:00:00Z",     // tokens LinkedIn vivent ~60 jours
//     scope: "w_member_social r_liteprofile"  // pour debug
//   }
//
// Comment générer un access_token (à faire 1 fois, refresh tous les 60j) :
//   1. https://www.linkedin.com/developers/apps → créer app "Volia Auto-Publisher"
//   2. Products → demander accès à "Share on LinkedIn" (validation < 24h)
//   3. Auth tab → Generate Access Token → scopes : w_member_social, r_liteprofile
//   4. Copier le token + le person_urn (visible dans /v2/me) → coller dans
//      /admin/publishers de Volia
//
// Coût : 0€ (free tier LinkedIn API). Rate limit : 100 requêtes / jour / user.
// ─────────────────────────────────────────────────────────────────────

const LINKEDIN_API_BASE = 'https://api.linkedin.com';

/**
 * Test la validité d'un access_token via /v2/userinfo (endpoint OIDC).
 * Retourne { ok: true, person_urn, raw: { name, email, ... } } ou { ok: false, error }.
 *
 * NOTE — Pourquoi /v2/userinfo et pas /v2/me ?
 * Les tokens générés via "Sign In with LinkedIn using OpenID Connect"
 * (les seuls disponibles facilement aujourd'hui) ont les scopes
 * { openid, profile, email, w_member_social }. L'endpoint legacy /v2/me
 * exige le scope r_liteprofile qui n'est plus accessible facilement →
 * il renvoie 403 "Not enough permissions". L'endpoint OIDC standard
 * /v2/userinfo expose le même genre de data (sub, name, email, picture)
 * avec les scopes OIDC modernes.
 *
 * Utilisé par /admin/publishers "Tester la connexion".
 */
export async function testLinkedInToken(accessToken) {
  if (!accessToken) {
    return { ok: false, error: 'access_token manquant' };
  }
  try {
    const res = await fetch(`${LINKEDIN_API_BASE}/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `LinkedIn /v2/userinfo ${res.status} : ${body.slice(0, 200)}`,
      };
    }
    const data = await res.json();
    if (!data.sub) {
      return {
        ok: false,
        error: 'Réponse /v2/userinfo sans champ "sub" (Person ID). Token invalide ?',
      };
    }
    return {
      ok: true,
      person_urn: `urn:li:person:${data.sub}`,
      raw: {
        // On garde les anciens noms de champs pour rester compatible avec
        // l'UI /admin/publishers qui les affiche (cf. localizedFirstName).
        localizedFirstName: data.given_name || '',
        localizedLastName: data.family_name || '',
        email: data.email,
        picture: data.picture,
        locale: data.locale,
      },
    };
  } catch (err) {
    return { ok: false, error: `Fetch error : ${err.message}` };
  }
}

/**
 * Publie un texte sur LinkedIn via /v2/ugcPosts.
 *
 * @param {string} text - contenu du post (max 3000 caractères)
 * @param {object} credentials - { access_token, person_urn }
 * @param {object} [opts]
 * @param {'PUBLIC'|'CONNECTIONS'} [opts.visibility='PUBLIC']
 * @returns {Promise<{ok: boolean, post_id?: string, post_url?: string, error?: string}>}
 */
export async function publishToLinkedIn(text, credentials, opts = {}) {
  const { access_token: accessToken, person_urn: personUrn } = credentials || {};
  const visibility = opts.visibility || 'PUBLIC';

  if (!accessToken) return { ok: false, error: 'credentials.access_token manquant' };
  if (!personUrn) return { ok: false, error: 'credentials.person_urn manquant' };
  if (!text || typeof text !== 'string') return { ok: false, error: 'text invalide' };
  if (text.length > 3000) return { ok: false, error: 'text > 3000 caractères (limite LinkedIn)' };

  const body = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': visibility,
    },
  };

  try {
    const res = await fetch(`${LINKEDIN_API_BASE}/v2/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      // Common errors :
      //  - 401 : token expired → action_required: rotate token in /admin/publishers
      //  - 403 : scope manquant (w_member_social)
      //  - 422 : duplicate post (LinkedIn refuse 2 posts identiques < 24h)
      return {
        ok: false,
        error: `LinkedIn /v2/ugcPosts ${res.status} : ${errBody.slice(0, 300)}`,
        status: res.status,
      };
    }

    // Le post ID arrive dans le header x-restli-id (ex: urn:li:share:7000...)
    const restliId = res.headers.get('x-restli-id') || '';
    const data = await res.json().catch(() => ({}));
    const postId = restliId || data.id || '';
    // URL publique du post : https://www.linkedin.com/feed/update/{urn}/
    const postUrl = postId
      ? `https://www.linkedin.com/feed/update/${postId}/`
      : null;

    // Auto-like immédiat : signal d'autorité fort à l'algo LinkedIn dans
    // la fenêtre critique des 60 premières minutes. Fire-and-forget — si
    // ça plante on log mais on ne fail pas la publication elle-même.
    let autoLikedAt = null;
    let autoLikeError = null;
    if (postId && opts.autoLike !== false) {
      try {
        const likeRes = await likeLinkedInPost(postId, personUrn, accessToken);
        if (likeRes.ok) {
          autoLikedAt = new Date().toISOString();
        } else {
          autoLikeError = likeRes.error;
          console.warn('[linkedin auto-like] failed', likeRes.error);
        }
      } catch (e) {
        autoLikeError = e.message;
        console.warn('[linkedin auto-like] threw', e.message);
      }
    }

    return {
      ok: true,
      post_id: postId,
      post_url: postUrl,
      auto_liked_at: autoLikedAt,
      auto_like_error: autoLikeError,
      raw: data,
    };
  } catch (err) {
    return { ok: false, error: `Fetch error : ${err.message}` };
  }
}

/**
 * Like un post LinkedIn par son own URN (auto-like d'autorité).
 *
 * Endpoint : POST /v2/socialActions/{encodedShareUrn}/likes
 * Body : { actor: "urn:li:person:XXX" }
 * Scope nécessaire : w_member_social
 *
 * @param {string} shareUrn - "urn:li:share:XXXX" (le post)
 * @param {string} personUrn - "urn:li:person:XXX" (qui like, généralement soi-même)
 * @param {string} accessToken
 */
export async function likeLinkedInPost(shareUrn, personUrn, accessToken) {
  if (!shareUrn || !personUrn || !accessToken) {
    return { ok: false, error: 'shareUrn, personUrn, accessToken requis' };
  }
  const encoded = encodeURIComponent(shareUrn);
  try {
    const res = await fetch(`${LINKEDIN_API_BASE}/v2/socialActions/${encoded}/likes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actor: personUrn }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Like API ${res.status} : ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Fetch error : ${err.message}` };
  }
}
