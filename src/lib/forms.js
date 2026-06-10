// ─────────────────────────────────────────────────────────────────
// src/lib/forms.js — Helpers Volia Formulaires
// ─────────────────────────────────────────────────────────────────
// Utilitaires partagés par les routes /api/admin/forms/*, le builder
// /app/formulaires/[id] (Sprint F3) et le renderer public /f/[slug] (F2).
//
// Convention : tout helper qui touche la DB prend un client supabase
// en paramètre (jamais d'import direct). Permet d'utiliser soit le
// client RLS (utilisateur connecté), soit le client admin (renderer
// public via service_role).
//
// ─── Source of truth : form.schema JSONB ─────────────────────────
//
// Décision architecturale Sprint F3 :
//   La table form_fields existe (analytics futures) mais le RENDU et la
//   VALIDATION lisent uniquement depuis forms.schema JSONB. Cela évite
//   les double-writes côté builder et permet 1 query (le RPC
//   get_published_form retourne déjà schema).
//
// Structure attendue (version 1) :
//
//   form.schema = {
//     version: 1,
//     pages: [
//       { id: 'page-1', title: 'Informations', description?: '', position: 0 },
//       { id: 'page-2', title: 'Détails',      description?: '', position: 1 },
//     ],
//     fields: [
//       {
//         id: 'fld-xxx',          // uuid généré côté client (jamais persisté en DB)
//         key: 'email',           // field_key — utilisé dans answers
//         type: 'email',          // text|email|tel|textarea|select|radio|checkbox|number|date|file|rating|hidden
//         label: 'Votre email',
//         placeholder: 'jean@exemple.fr',
//         help_text: '',
//         required: true,
//         page_id: 'page-1',
//         position: 0,
//         options: [],            // select|radio|checkbox : [{ label, value }]
//         validation: {
//           min_length: 0,
//           max_length: 200,
//           pattern: null,        // regex string
//           min: null,            // number
//           max: null,            // number
//           accept: [],           // file : MIME types
//         },
//         conditional_logic: null // ou { show_if: { field_key, operator, value } }
//       },
//     ],
//     theme: { accent_color: '#7c3aed', font: 'inter' }, // V2
//     settings: { submit_label: 'Envoyer', show_progress: true },
//   }
//
// ─────────────────────────────────────────────────────────────────

const SCHEMA_VERSION = 1;

const ALLOWED_FIELD_TYPES = new Set([
  'text', 'email', 'tel', 'textarea', 'select', 'radio',
  'checkbox', 'number', 'date', 'file', 'rating', 'hidden',
]);

const ALLOWED_CONDITION_OPERATORS = new Set([
  // Legacy F3
  'equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty',
  // F4 — étendus
  'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal',
  'in', 'not_in', 'starts_with', 'ends_with',
]);

const ALLOWED_COMBINATORS = new Set(['AND', 'OR']);
const ALLOWED_JUMP_ACTIONS = new Set(['skip_to_page']);

const FIELD_KEY_REGEX = /^[a-z][a-z0-9_]{0,63}$/;
const PAGE_ID_REGEX = /^[a-z0-9-]{1,64}$/i;
const FIELD_ID_REGEX = /^[a-z0-9-]{1,64}$/i;

// Matrice : opérateurs disponibles par type de field.
// Permet de filtrer le dropdown dans le builder pour ne montrer que
// les opérateurs qui ont du sens (ex: greater_than n'est pas applicable
// sur un radio mais OK sur un number/rating).
export const OPERATORS_BY_FIELD_TYPE = {
  text:     ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'starts_with', 'ends_with', 'in', 'not_in'],
  email:    ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'starts_with', 'ends_with'],
  tel:      ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'starts_with', 'ends_with'],
  textarea: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'starts_with', 'ends_with'],
  number:   ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'in', 'not_in'],
  rating:   ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'],
  select:   ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'in', 'not_in'],
  radio:    ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'in', 'not_in'],
  checkbox: ['contains', 'is_empty', 'is_not_empty', 'in', 'not_in'],
  date:     ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'],
  file:     ['is_empty', 'is_not_empty'],
  hidden:   ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty'],
};

/**
 * Retourne la liste des opérateurs valides pour un type de field donné.
 * Fallback sur tous les opérateurs si type inconnu.
 */
export function getOperatorsForFieldType(fieldType) {
  return OPERATORS_BY_FIELD_TYPE[fieldType] || Array.from(ALLOWED_CONDITION_OPERATORS);
}

/**
 * Normalise une "condition" (legacy single ou nouvelle forme groupée) vers
 * toujours la forme { combinator, conditions[] }.
 *
 * Backward compat F3 :
 *   { field_key, operator, value } → { combinator: 'AND', conditions: [...] }
 *
 * Si déjà au bon format, retourne tel quel (avec defaults).
 *
 * @param {object|null} input — show_if legacy ou nouvelle forme
 * @returns {{ combinator: 'AND'|'OR', conditions: Array }|null}
 */
export function normalizeConditionalLogic(input) {
  if (!input || typeof input !== 'object') return null;
  // Nouvelle forme : combinator + conditions[]
  if (Array.isArray(input.conditions)) {
    const combinator = ALLOWED_COMBINATORS.has(input.combinator) ? input.combinator : 'AND';
    const conditions = input.conditions
      .filter((c) => c && typeof c === 'object' && typeof c.field_key === 'string')
      .map((c) => ({
        field_key: c.field_key,
        operator: ALLOWED_CONDITION_OPERATORS.has(c.operator) ? c.operator : 'equals',
        value: c.value !== undefined ? c.value : '',
      }));
    return { combinator, conditions };
  }
  // Legacy : single condition
  if (typeof input.field_key === 'string') {
    return {
      combinator: 'AND',
      conditions: [{
        field_key: input.field_key,
        operator: ALLOWED_CONDITION_OPERATORS.has(input.operator) ? input.operator : 'equals',
        value: input.value !== undefined ? input.value : '',
      }],
    };
  }
  return null;
}

/**
 * Évalue un operator sur 1 condition (utilisé par AND/OR engine).
 * Tolérant — retourne true par défaut sur operator inconnu.
 *
 * @param {string} operator
 * @param {*} expected — valeur attendue (côté condition)
 * @param {*} actual   — valeur courante de la réponse utilisateur
 * @returns {boolean}
 */
export function evaluateOperator(operator, expected, actual) {
  const isEmpty = actual == null || actual === '' || (Array.isArray(actual) && actual.length === 0);
  switch (operator) {
    case 'is_empty':       return isEmpty;
    case 'is_not_empty':   return !isEmpty;
    case 'equals':         return String(actual ?? '') === String(expected ?? '');
    case 'not_equals':     return String(actual ?? '') !== String(expected ?? '');
    case 'contains': {
      const arr = Array.isArray(actual) ? actual.map((x) => String(x).toLowerCase()) : null;
      if (arr) return arr.includes(String(expected ?? '').toLowerCase());
      return String(actual ?? '').toLowerCase().includes(String(expected ?? '').toLowerCase());
    }
    case 'starts_with':    return String(actual ?? '').toLowerCase().startsWith(String(expected ?? '').toLowerCase());
    case 'ends_with':      return String(actual ?? '').toLowerCase().endsWith(String(expected ?? '').toLowerCase());
    case 'greater_than': {
      const a = Number(actual); const b = Number(expected);
      return !Number.isNaN(a) && !Number.isNaN(b) && a > b;
    }
    case 'less_than': {
      const a = Number(actual); const b = Number(expected);
      return !Number.isNaN(a) && !Number.isNaN(b) && a < b;
    }
    case 'greater_or_equal': {
      const a = Number(actual); const b = Number(expected);
      return !Number.isNaN(a) && !Number.isNaN(b) && a >= b;
    }
    case 'less_or_equal': {
      const a = Number(actual); const b = Number(expected);
      return !Number.isNaN(a) && !Number.isNaN(b) && a <= b;
    }
    case 'in':
    case 'not_in': {
      // expected = "a,b,c" (string CSV) ou array
      const list = Array.isArray(expected)
        ? expected.map((x) => String(x).trim().toLowerCase())
        : String(expected ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
      const isIn = Array.isArray(actual)
        ? actual.some((x) => list.includes(String(x).toLowerCase()))
        : list.includes(String(actual ?? '').toLowerCase());
      return operator === 'in' ? isIn : !isIn;
    }
    default:
      return true;
  }
}

/**
 * Évalue toute une conditional_logic.show_if (legacy ou nouvelle forme).
 * Retourne true si le field doit être visible.
 *
 * @param {object|null} conditionalLogic — { show_if: ... }
 * @param {object} answers — { field_key: value }
 * @returns {boolean}
 */
export function evaluateConditionalLogic(conditionalLogic, answers) {
  if (!conditionalLogic || typeof conditionalLogic !== 'object') return true;
  const showIf = conditionalLogic.show_if;
  if (!showIf) return true;
  const normalized = normalizeConditionalLogic(showIf);
  if (!normalized || normalized.conditions.length === 0) return true;
  const results = normalized.conditions.map((c) =>
    evaluateOperator(c.operator, c.value, answers?.[c.field_key])
  );
  return normalized.combinator === 'OR' ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Évalue une condition arbitraire (utilisée par jump_logic au niveau
 * page). Même forme que show_if : legacy ou { combinator, conditions[] }.
 *
 * @param {object|null} condition
 * @param {object} answers
 * @returns {boolean}
 */
export function evaluateCondition(condition, answers) {
  if (!condition || typeof condition !== 'object') return false;
  const normalized = normalizeConditionalLogic(condition);
  if (!normalized || normalized.conditions.length === 0) return false;
  const results = normalized.conditions.map((c) =>
    evaluateOperator(c.operator, c.value, answers?.[c.field_key])
  );
  return normalized.combinator === 'OR' ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Slugifie une string FR-aware : remplace les diacritiques, normalise,
 * trim, lowercase, ne garde que [a-z0-9-], déduplique les tirets.
 *
 * @param {string} input
 * @returns {string}
 */
export function slugify(input) {
  const s = String(input || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritiques
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return s || 'form';
}

/**
 * Génère un slug unique en interrogeant la table forms.
 *
 * @param {object} supabase
 * @param {string} name
 * @param {string} [excludeId]
 * @returns {Promise<string>}
 */
export async function generateUniqueSlug(supabase, name, excludeId = null) {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;

  for (let attempt = 0; attempt < 50; attempt++) {
    let query = supabase.from('forms').select('id').eq('slug', candidate).limit(1);
    if (excludeId) query = query.neq('id', excludeId);
    const { data, error } = await query;
    if (error) {
      return `${base}-${Math.random().toString(36).slice(2, 8)}`;
    }
    if (!data || data.length === 0) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Helpers de construction ─────────────────────────────────────

/**
 * Génère un identifiant local (non persisté tel quel — page_id / field.id
 * dans schema JSONB côté builder). Format URL-safe.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function generateLocalId(prefix = 'id') {
  // crypto.randomUUID() si dispo (Node ≥ 19 + browsers modernes), sinon fallback
  const uid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${uid}`;
}

/**
 * Retourne le schema d'initialisation d'un nouveau form (1 page vide,
 * 0 fields). Utilisé à la création + comme fallback dans le builder.
 *
 * @returns {object}
 */
export function createEmptySchema() {
  return {
    version: SCHEMA_VERSION,
    pages: [
      { id: 'page-1', title: 'Page 1', description: '', position: 0 },
    ],
    fields: [],
    theme: { accent_color: '#db2777', font: 'inter' },
    settings: { submit_label: 'Envoyer', show_progress: true },
  };
}

/**
 * Normalise un schema : remplit les defaults manquants, garantit
 * version=1, pages non-vide. Tolérant : ne lève pas, retourne toujours
 * un schema utilisable. Utile pour load les anciens forms (F1/F2)
 * qui ont schema = {} en DB.
 *
 * @param {any} schema
 * @returns {object}
 */
export function normalizeSchema(schema) {
  const base = createEmptySchema();
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return base;
  }
  const out = {
    version: schema.version || SCHEMA_VERSION,
    pages: Array.isArray(schema.pages) && schema.pages.length > 0
      ? schema.pages.map((p, i) => ({
          id: typeof p?.id === 'string' && p.id ? p.id : `page-${i + 1}`,
          title: typeof p?.title === 'string' ? p.title : `Page ${i + 1}`,
          description: typeof p?.description === 'string' ? p.description : '',
          position: typeof p?.position === 'number' ? p.position : i,
          jump_logic: p?.jump_logic && typeof p.jump_logic === 'object' && Array.isArray(p.jump_logic.rules)
            ? { rules: p.jump_logic.rules.filter((r) => r && typeof r === 'object') }
            : null,
        }))
      : base.pages,
    fields: Array.isArray(schema.fields)
      ? schema.fields.map((f, i) => normalizeField(f, i))
      : [],
    theme: schema.theme && typeof schema.theme === 'object' ? schema.theme : base.theme,
    settings: schema.settings && typeof schema.settings === 'object' ? schema.settings : base.settings,
  };
  // Réassocie les fields orphelins à la 1ère page
  const firstPageId = out.pages[0].id;
  const pageIds = new Set(out.pages.map((p) => p.id));
  out.fields = out.fields.map((f) => ({
    ...f,
    page_id: f.page_id && pageIds.has(f.page_id) ? f.page_id : firstPageId,
  }));
  return out;
}

function normalizeField(f, idx) {
  const fld = f && typeof f === 'object' ? f : {};
  return {
    id: typeof fld.id === 'string' && fld.id ? fld.id : generateLocalId('fld'),
    key: typeof fld.key === 'string' ? fld.key : `field_${idx + 1}`,
    type: ALLOWED_FIELD_TYPES.has(fld.type) ? fld.type : 'text',
    label: typeof fld.label === 'string' ? fld.label : 'Sans titre',
    placeholder: typeof fld.placeholder === 'string' ? fld.placeholder : '',
    help_text: typeof fld.help_text === 'string' ? fld.help_text : '',
    required: !!fld.required,
    page_id: typeof fld.page_id === 'string' ? fld.page_id : 'page-1',
    position: typeof fld.position === 'number' ? fld.position : idx,
    options: Array.isArray(fld.options) ? fld.options : [],
    validation: fld.validation && typeof fld.validation === 'object' ? fld.validation : {},
    conditional_logic: fld.conditional_logic && typeof fld.conditional_logic === 'object'
      ? fld.conditional_logic
      : null,
  };
}

// ─── Validation rigoureuse (Sprint F3) ───────────────────────────

/**
 * Valide un schema JSONB de form.
 * Retourne { valid: boolean, errors: string[] }.
 *
 * Sprint F3 : validation rigoureuse de la structure version=1.
 * Tolérant pour les forms vides ({}, null) → reste valide (form draft
 * fraîchement créé, builder pas encore touché).
 *
 * @param {any} schema
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFormSchema(schema) {
  const errors = [];

  if (schema === null || schema === undefined) {
    return { valid: true, errors: [] };
  }

  if (typeof schema !== 'object' || Array.isArray(schema)) {
    return { valid: false, errors: ['schema doit être un objet JSON'] };
  }

  const keys = Object.keys(schema);
  if (keys.length === 0) {
    return { valid: true, errors: [] };
  }

  // version : si présent doit être un nombre supporté
  if (schema.version !== undefined && schema.version !== SCHEMA_VERSION) {
    errors.push(`schema.version "${schema.version}" non supportée (attendu ${SCHEMA_VERSION})`);
  }

  // pages : si présent → array non-vide d'objets bien-formés
  let pageIds = new Set();
  if (schema.pages !== undefined) {
    if (!Array.isArray(schema.pages)) {
      errors.push('schema.pages doit être un array');
    } else if (schema.pages.length === 0) {
      errors.push('schema.pages doit contenir au moins 1 page');
    } else {
      schema.pages.forEach((p, idx) => {
        if (!p || typeof p !== 'object') {
          errors.push(`schema.pages[${idx}] doit être un objet`);
          return;
        }
        if (typeof p.id !== 'string' || !PAGE_ID_REGEX.test(p.id)) {
          errors.push(`schema.pages[${idx}].id invalide (alphanumérique + tirets, max 64)`);
        } else if (pageIds.has(p.id)) {
          errors.push(`schema.pages[${idx}].id "${p.id}" est dupliqué`);
        } else {
          pageIds.add(p.id);
        }
        if (p.title !== undefined && typeof p.title !== 'string') {
          errors.push(`schema.pages[${idx}].title doit être une string`);
        }
        // F4 : jump_logic validation
        if (p.jump_logic !== undefined && p.jump_logic !== null) {
          if (typeof p.jump_logic !== 'object' || Array.isArray(p.jump_logic)) {
            errors.push(`schema.pages[${idx}].jump_logic doit être un objet`);
          } else if (p.jump_logic.rules !== undefined) {
            if (!Array.isArray(p.jump_logic.rules)) {
              errors.push(`schema.pages[${idx}].jump_logic.rules doit être un array`);
            } else {
              p.jump_logic.rules.forEach((rule, rIdx) => {
                if (!rule || typeof rule !== 'object') {
                  errors.push(`schema.pages[${idx}].jump_logic.rules[${rIdx}] doit être un objet`);
                  return;
                }
                if (!ALLOWED_JUMP_ACTIONS.has(rule.action)) {
                  errors.push(`schema.pages[${idx}].jump_logic.rules[${rIdx}].action "${rule.action}" invalide`);
                }
                if (rule.target_page_id !== 'submit' && typeof rule.target_page_id !== 'string') {
                  errors.push(`schema.pages[${idx}].jump_logic.rules[${rIdx}].target_page_id invalide`);
                }
                // condition : on accepte legacy ou nouvelle forme (validée + tolérante)
                if (rule.condition && typeof rule.condition === 'object') {
                  const condErrors = validateConditionShape(rule.condition);
                  condErrors.forEach((e) =>
                    errors.push(`schema.pages[${idx}].jump_logic.rules[${rIdx}].condition: ${e}`)
                  );
                }
              });
            }
          }
        }
      });
    }
  }

  // fields : si présent → array de fields valides
  if (schema.fields !== undefined) {
    if (!Array.isArray(schema.fields)) {
      errors.push('schema.fields doit être un array');
    } else {
      const seenKeys = new Set();
      const seenIds = new Set();
      schema.fields.forEach((f, idx) => {
        if (!f || typeof f !== 'object') {
          errors.push(`schema.fields[${idx}] doit être un objet`);
          return;
        }
        // id (local) — optionnel mais si présent doit être bien-formé
        if (f.id !== undefined) {
          if (typeof f.id !== 'string' || !FIELD_ID_REGEX.test(f.id)) {
            errors.push(`schema.fields[${idx}].id invalide`);
          } else if (seenIds.has(f.id)) {
            errors.push(`schema.fields[${idx}].id "${f.id}" est dupliqué`);
          } else {
            seenIds.add(f.id);
          }
        }
        // key — obligatoire, unique, snake_case
        if (typeof f.key !== 'string' || !FIELD_KEY_REGEX.test(f.key)) {
          errors.push(`schema.fields[${idx}].key invalide (snake_case, max 64, commence par une lettre)`);
        } else if (seenKeys.has(f.key)) {
          errors.push(`schema.fields[${idx}].key "${f.key}" est dupliquée`);
        } else {
          seenKeys.add(f.key);
        }
        // type — obligatoire, dans la whitelist
        if (!ALLOWED_FIELD_TYPES.has(f.type)) {
          errors.push(`schema.fields[${idx}].type "${f.type}" invalide`);
        }
        // label — obligatoire non-vide
        if (typeof f.label !== 'string' || f.label.trim().length === 0) {
          errors.push(`schema.fields[${idx}].label requis`);
        }
        // page_id — si renseigné doit pointer sur une page existante (sauf si pas de pages)
        if (f.page_id !== undefined && pageIds.size > 0 && !pageIds.has(f.page_id)) {
          errors.push(`schema.fields[${idx}].page_id "${f.page_id}" n'existe pas`);
        }
        // options — pour select/radio/checkbox, doit être array
        if (['select', 'radio'].includes(f.type)) {
          if (!Array.isArray(f.options) || f.options.length === 0) {
            errors.push(`schema.fields[${idx}] (type=${f.type}) doit avoir au moins une option`);
          }
        }
        if (f.options !== undefined && !Array.isArray(f.options)) {
          errors.push(`schema.fields[${idx}].options doit être un array`);
        }
        // validation — doit être un objet si présent
        if (f.validation !== undefined && (typeof f.validation !== 'object' || Array.isArray(f.validation))) {
          errors.push(`schema.fields[${idx}].validation doit être un objet`);
        }
        // conditional_logic — doit être un objet avec show_if bien-formé
        // (F4) accepte legacy { field_key, operator, value } OU nouvelle forme { combinator, conditions[] }
        if (f.conditional_logic && typeof f.conditional_logic === 'object') {
          const si = f.conditional_logic.show_if;
          if (si && typeof si === 'object') {
            const condErrors = validateConditionShape(si);
            condErrors.forEach((e) =>
              errors.push(`schema.fields[${idx}].conditional_logic.show_if: ${e}`)
            );
          }
        }
      });
    }
  }

  // theme — optionnel mais doit être un objet
  if (schema.theme !== undefined && (typeof schema.theme !== 'object' || Array.isArray(schema.theme))) {
    errors.push('schema.theme doit être un objet');
  }
  // settings — optionnel mais doit être un objet
  if (schema.settings !== undefined && (typeof schema.settings !== 'object' || Array.isArray(schema.settings))) {
    errors.push('schema.settings doit être un objet');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Helper interne : valide une "condition" arbitraire (legacy single ou
 * nouvelle forme { combinator, conditions[] }). Retourne un array
 * d'erreurs (vide = OK).
 *
 * @param {object} cond
 * @returns {string[]}
 */
function validateConditionShape(cond) {
  const errs = [];
  if (!cond || typeof cond !== 'object') {
    errs.push('doit être un objet');
    return errs;
  }
  // Nouvelle forme : combinator + conditions[]
  if (Array.isArray(cond.conditions)) {
    if (cond.combinator !== undefined && !ALLOWED_COMBINATORS.has(cond.combinator)) {
      errs.push(`combinator "${cond.combinator}" invalide (AND|OR)`);
    }
    cond.conditions.forEach((c, i) => {
      if (!c || typeof c !== 'object') {
        errs.push(`conditions[${i}] doit être un objet`);
        return;
      }
      if (typeof c.field_key !== 'string' || c.field_key.length === 0) {
        errs.push(`conditions[${i}].field_key invalide`);
      }
      if (!ALLOWED_CONDITION_OPERATORS.has(c.operator)) {
        errs.push(`conditions[${i}].operator "${c.operator}" invalide`);
      }
    });
    return errs;
  }
  // Legacy : single condition
  if (typeof cond.field_key !== 'string' || cond.field_key.length === 0) {
    errs.push('field_key invalide');
  }
  if (!ALLOWED_CONDITION_OPERATORS.has(cond.operator)) {
    errs.push(`operator "${cond.operator}" invalide`);
  }
  return errs;
}

// ─── Conversion schema ↔ "flat fields" (compat F2 renderer) ──────
//
// Le FormRenderer original (F2) attend la shape DB :
//   { field_key, field_type, label, page, options, validation, conditional_logic, ... }
// Le nouveau builder produit :
//   { key, type, label, page_id, options, validation, conditional_logic, ... }
//
// Cet helper convertit pour rétro-compat sans toucher au renderer.

/**
 * Transforme schema.fields[] (shape builder) en array compatible
 * FormRenderer (shape DB). Calcule un index numérique de page (1, 2…)
 * à partir des page_id.
 *
 * @param {object} schema
 * @returns {Array}
 */
export function schemaFieldsToRendererFields(schema) {
  if (!schema || !Array.isArray(schema.fields)) return [];
  const pages = Array.isArray(schema.pages) && schema.pages.length > 0
    ? schema.pages
    : [{ id: 'page-1', position: 0 }];
  // Tri par position pour garantir un mapping stable
  const ordered = [...pages].sort((a, b) => (a.position || 0) - (b.position || 0));
  const pageIndex = new Map();
  ordered.forEach((p, i) => pageIndex.set(p.id, i + 1));

  // Groupe les fields par page et trie par position
  const grouped = new Map();
  schema.fields.forEach((f) => {
    const pid = f.page_id || ordered[0]?.id || 'page-1';
    if (!grouped.has(pid)) grouped.set(pid, []);
    grouped.get(pid).push(f);
  });
  grouped.forEach((arr) => arr.sort((a, b) => (a.position || 0) - (b.position || 0)));

  const out = [];
  ordered.forEach((p) => {
    const arr = grouped.get(p.id) || [];
    arr.forEach((f, idx) => {
      out.push({
        id: f.id || `field_${out.length}`,
        field_key: f.key,
        field_type: f.type,
        label: f.label,
        placeholder: f.placeholder || '',
        help_text: f.help_text || '',
        required: !!f.required,
        position: idx,
        page: pageIndex.get(p.id) || 1,
        page_id: p.id,
        options: Array.isArray(f.options) ? f.options : [],
        validation: normalizeValidationForRenderer(f.validation),
        conditional_logic: f.conditional_logic || null,
      });
    });
  });
  return out;
}

/**
 * Le FormRenderer F2 et la route submit attendent les clés camelCase
 * (minLength, maxLength). Le builder F3 écrit en snake_case
 * (min_length, max_length). On normalise les deux formats vers camelCase
 * pour rétro-compat sans toucher au renderer.
 *
 * @param {object} validation
 * @returns {object}
 */
function normalizeValidationForRenderer(validation) {
  if (!validation || typeof validation !== 'object') return {};
  const v = { ...validation };
  if (v.min_length !== undefined && v.minLength === undefined) v.minLength = v.min_length;
  if (v.max_length !== undefined && v.maxLength === undefined) v.maxLength = v.max_length;
  if (v.pattern !== undefined && v.regex === undefined) v.regex = v.pattern;
  return v;
}

// ─── Incrémentation atomique via RPC ─────────────────────────────

/**
 * Incrémente atomiquement forms.view_count.
 * @param {object} supabase
 * @param {string} formId
 */
export async function incrementViewCount(supabase, formId) {
  if (!supabase || !formId) return { ok: false, error: 'invalid args' };
  const { error } = await supabase.rpc('increment_form_view_count', { p_form_id: formId });
  if (error) {
    console.error('[forms] incrementViewCount RPC error', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Incrémente atomiquement forms.submission_count.
 * @param {object} supabaseAdmin
 * @param {string} formId
 */
export async function incrementSubmissionCount(supabaseAdmin, formId) {
  if (!supabaseAdmin || !formId) return { ok: false, error: 'invalid args' };
  const { error } = await supabaseAdmin.rpc('increment_form_submission_count', { p_form_id: formId });
  if (error) {
    console.error('[forms] incrementSubmissionCount RPC error', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// Constantes exportées (utilisées par le builder)
export const FORM_FIELD_TYPES = [
  { type: 'text',     label: 'Texte court',  category: 'fields' },
  { type: 'textarea', label: 'Texte long',   category: 'fields' },
  { type: 'email',    label: 'Email',        category: 'fields' },
  { type: 'tel',      label: 'Téléphone',    category: 'fields' },
  { type: 'number',   label: 'Nombre',       category: 'fields' },
  { type: 'select',   label: 'Liste déroulante', category: 'fields' },
  { type: 'radio',    label: 'Choix unique', category: 'fields' },
  { type: 'checkbox', label: 'Cases à cocher', category: 'fields' },
  { type: 'date',     label: 'Date',         category: 'fields' },
  { type: 'file',     label: 'Fichier',      category: 'fields' },
  { type: 'rating',   label: 'Note (étoiles)', category: 'fields' },
  { type: 'hidden',   label: 'Champ caché',  category: 'fields' },
];

export const FORM_CONDITION_OPERATORS = [
  { value: 'equals',           label: 'est égal à' },
  { value: 'not_equals',       label: 'n\'est pas égal à' },
  { value: 'contains',         label: 'contient' },
  { value: 'is_empty',         label: 'est vide' },
  { value: 'is_not_empty',     label: 'n\'est pas vide' },
  { value: 'starts_with',      label: 'commence par' },
  { value: 'ends_with',        label: 'finit par' },
  { value: 'greater_than',     label: 'est supérieur à' },
  { value: 'less_than',        label: 'est inférieur à' },
  { value: 'greater_or_equal', label: 'est ≥ à' },
  { value: 'less_or_equal',    label: 'est ≤ à' },
  { value: 'in',               label: 'est dans la liste' },
  { value: 'not_in',           label: 'n\'est pas dans la liste' },
];

/** Opérateurs qui n'attendent PAS de valeur (UI cache l'input). */
export const OPERATORS_WITHOUT_VALUE = new Set(['is_empty', 'is_not_empty']);

/** Opérateurs qui attendent une LISTE en valeur (UI hint "valeur1, valeur2, …"). */
export const OPERATORS_WITH_LIST_VALUE = new Set(['in', 'not_in']);

export { ALLOWED_FIELD_TYPES, ALLOWED_CONDITION_OPERATORS, ALLOWED_COMBINATORS, ALLOWED_JUMP_ACTIONS, SCHEMA_VERSION };
