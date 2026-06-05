// ─────────────────────────────────────────────────────────────────────
// src/lib/global-contacts.js — Base commune d'enrichissement (couche 0)
// ─────────────────────────────────────────────────────────────────────
// Avant tout scrape/Serper, on regarde dans `global_contacts` (base Volia
// mutualisée, clé = domaine). Si un contact frais existe → on le sert, 0 crédit
// Serper. Chaque enrichissement réussi alimente la base (write-back).
//
// PHASE 1 (actuelle) : seul Volia (comptes admin) alimente le pool — donnée
// dont Volia est responsable, juridiquement propre. Les enrichissements clients
// ne sont PAS versés tant que GLOBAL_POOL_WRITE !== 'all' (cadre RGPD requis).
//
// Interrupteur env GLOBAL_POOL_WRITE :
//   'volia_only' (défaut) → écrit seulement si l'enrichisseur est admin
//   'all'                 → écrit pour tout le monde (Phase 2, après juridique)
//   'off'                 → lecture seule (ne jamais écrire)
//
// Best-effort partout : une erreur ici ne doit JAMAIS casser l'enrichissement.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const TTL_MS = 3 * 365 * 24 * 60 * 60 * 1000; // 3 ans (décision produit)

function poolWriteMode() {
  return (process.env.GLOBAL_POOL_WRITE || 'volia_only').toLowerCase();
}

/** Normalise une URL/host en domaine nu (sans protocole, sans www, sans path). */
export function normalizeDomain(input) {
  if (!input) return null;
  try {
    let s = String(input).trim().toLowerCase();
    if (!s) return null;
    if (!/^https?:\/\//.test(s)) s = 'https://' + s;
    const host = new URL(s).hostname.replace(/^www\./, '');
    return host.includes('.') ? host : null;
  } catch {
    return null;
  }
}

async function isOptedOut(supabase, email) {
  if (!email) return false;
  try {
    const { data } = await supabase
      .from('opt_out_list')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Couche 0 — cherche un contact frais dans la base commune.
 * @returns {Promise<{email:string, method:'volia_db', phone:string}|null>}
 *          null si rien / périmé / opté-out / erreur.
 */
export async function lookupGlobalContact({ domain, placeId } = {}) {
  const d = normalizeDomain(domain);
  if (!d && !placeId) return null;
  try {
    const supabase = getSupabaseAdmin();
    const sel = supabase
      .from('global_contacts')
      .select('email, phone, last_verified_at');
    const { data } = d
      ? await sel.eq('domain', d).maybeSingle()
      : await sel.eq('place_id', placeId).limit(1).maybeSingle();
    if (!data || !data.email) return null;

    // Fraîcheur (TTL)
    const age = Date.now() - new Date(data.last_verified_at).getTime();
    if (Number.isFinite(age) && age > TTL_MS) return null;

    // Opt-out : on ne sert jamais un email qui s'est désinscrit
    if (await isOptedOut(supabase, data.email)) return null;

    return { email: data.email, method: 'volia_db', phone: data.phone || '' };
  } catch {
    return null;
  }
}

/**
 * Write-back — alimente la base commune après un enrichissement réussi
 * (scrape/Serper). Respecte l'interrupteur + l'opt-out. Insert-only (ne
 * dégrade jamais une ligne existante ; le TTL de 3 ans suffit).
 */
export async function upsertGlobalContact({
  domain, placeId, companyName, email, emailMethod, phone, sector, departement, isAdmin,
} = {}) {
  const d = normalizeDomain(domain);
  if (!d || !email) return; // on ne stocke que des lignes utiles (domaine + email)

  const mode = poolWriteMode();
  if (mode === 'off') return;
  if (mode === 'volia_only' && !isAdmin) return; // Phase 1 : seul Volia alimente

  try {
    const supabase = getSupabaseAdmin();
    if (await isOptedOut(supabase, email)) return;

    const confidence =
      emailMethod === 'serper' ? 'google'
      : emailMethod === 'guess' ? 'probable'
      : 'verified';

    await supabase
      .from('global_contacts')
      .upsert(
        {
          domain: d,
          place_id: placeId || null,
          company_name: companyName || null,
          email,
          email_method: emailMethod === 'volia_db' ? 'scrape' : (emailMethod || null),
          email_confidence: confidence,
          phone: phone || null,
          sector: sector || null,
          departement: departement || null,
          source: isAdmin ? 'volia' : 'client',
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'domain', ignoreDuplicates: true } // insert-only
      );
  } catch {
    /* best-effort — ne casse jamais l'enrichissement */
  }
}

// ─────────────────────────────────────────────────────────────────────
// Cache DÉCIDEUR (table dédiée decision_maker_contacts, clé (domain, role))
// ─────────────────────────────────────────────────────────────────────
// Même cadre RGPD que le générique : on ne SERT que des contacts frais (TTL)
// et non opté-out ; on n'ÉCRIT (phase 1) que si l'enrichisseur est admin
// (GLOBAL_POOL_WRITE='volia_only'). Best-effort partout.

/**
 * Couche 0 décideur — cherche un décideur frais en cache pour (domain, role).
 * @returns {Promise<{email,fullName,title,linkedinUrl,confidence,role}|null>}
 */
export async function lookupDecisionMaker({ domain, role } = {}) {
  const d = normalizeDomain(domain);
  if (!d || !role) return null;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('decision_maker_contacts')
      .select('email, full_name, title, linkedin_url, confidence, role, last_verified_at')
      .eq('domain', d)
      .eq('role', role)
      .maybeSingle();
    if (!data || !data.email) return null;

    // Fraîcheur (même TTL que le générique)
    const age = Date.now() - new Date(data.last_verified_at).getTime();
    if (Number.isFinite(age) && age > TTL_MS) return null;

    // Opt-out : on ne sert jamais un email désinscrit
    if (await isOptedOut(supabase, data.email)) return null;

    return {
      email: data.email,
      fullName: data.full_name || null,
      title: data.title || null,
      linkedinUrl: data.linkedin_url || null,
      confidence: data.confidence ?? null,
      role: data.role,
    };
  } catch {
    return null;
  }
}

/**
 * Write-back décideur — alimente le cache après une recherche live réussie.
 * Respecte l'interrupteur (volia_only → admin seul) + l'opt-out.
 * Upsert sur (domain, role) : on rafraîchit si on retrouve un contact.
 */
export async function upsertDecisionMaker({
  domain, role, email, fullName, title, linkedinUrl, confidence, companyName, isAdmin,
} = {}) {
  const d = normalizeDomain(domain);
  if (!d || !role || !email) return;

  const mode = poolWriteMode();
  if (mode === 'off') return;
  if (mode === 'volia_only' && !isAdmin) return; // Phase 1 : seul Volia alimente

  try {
    const supabase = getSupabaseAdmin();
    if (await isOptedOut(supabase, email)) return;

    await supabase
      .from('decision_maker_contacts')
      .upsert(
        {
          domain: d,
          role,
          email,
          full_name: fullName || null,
          title: title || null,
          linkedin_url: linkedinUrl || null,
          confidence: confidence ?? null,
          company_name: companyName || null,
          source: isAdmin ? 'volia' : 'client',
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'domain,role' }
      );
  } catch {
    /* best-effort — ne casse jamais l'enrichissement */
  }
}
