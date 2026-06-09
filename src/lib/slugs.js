// Slug helpers for programmatic SEO pages

import { DEPTS, B2B_GROUPS, B2B_CATS, REGIONS } from './constants';

/**
 * Convert a string to URL-safe slug (lowercase, no accents, dashes)
 * Ex: "Boulangerie pâtisserie" → "boulangerie-patisserie"
 */
export function toSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/['']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build a flat list of categories with their slug + group + label
 * Used for static generation and lookups.
 */
export function getAllCategories() {
  const result = [];
  for (const [group, cats] of Object.entries(B2B_GROUPS)) {
    for (const cat of cats) {
      result.push({
        slug: toSlug(cat),
        label: cat,
        labelCapitalized: cat.charAt(0).toUpperCase() + cat.slice(1),
        labelPlural: pluralize(cat),
        group,
      });
    }
  }
  // Deduplicate by slug (some categories appear in multiple groups, like "imprimerie")
  const seen = new Set();
  return result.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });
}

/**
 * Simple French pluralizer for category names.
 */
function pluralize(str) {
  if (!str) return '';
  const lower = str.toLowerCase().trim();
  // Already plural or ends in s/x/z
  if (/[sxz]$/.test(lower)) return str;
  // Words ending in -al → -aux (cheval → chevaux)
  if (lower.endsWith('al')) return str.slice(0, -2) + 'aux';
  // Words ending in -au or -eu → +x
  if (/(au|eu)$/.test(lower)) return str + 'x';
  // Default: +s
  return str + 's';
}

/**
 * Get all department slugs (FR only for v1)
 * Format: "75-paris", "13-bouches-du-rhone"
 */
export function getAllDepartments() {
  return Object.entries(DEPTS).map(([code, info]) => ({
    code,
    slug: `${code}-${toSlug(info.name)}`,
    name: info.name,
    region: getRegionForDept(code),
  }));
}

/**
 * Get region (name + slug + key) for a department code, derived from
 * the REGIONS constant. Returns null if not found.
 */
function getRegionForDept(code) {
  for (const [key, info] of Object.entries(REGIONS)) {
    if (info.depts.includes(code)) {
      return {
        key,
        name: info.name,
        slug: toSlug(info.name),
      };
    }
  }
  return null;
}

/**
 * List all 14 French regions with slug + dept list.
 * Used for /prospection/[category]/region/[region] pages.
 */
export function getAllRegions() {
  return Object.entries(REGIONS).map(([key, info]) => ({
    key,
    name: info.name,
    slug: toSlug(info.name),
    depts: info.depts,
  }));
}

/**
 * Find a region by slug (e.g. "ile-de-france" → { name: 'Île-de-France', depts: [...] })
 */
export function getRegionBySlug(slug) {
  if (!slug) return null;
  return getAllRegions().find((r) => r.slug === slug) || null;
}

/**
 * Find a department by slug (e.g. "75-paris" → DEPTS["75"])
 */
export function getDepartmentBySlug(slug) {
  if (!slug) return null;
  const code = slug.split('-')[0];
  const info = DEPTS[code];
  if (!info) return null;
  return {
    code,
    slug,
    name: info.name,
    region: getRegionForDept(code),
    lat: info.lat,
    lng: info.lng,
  };
}

/**
 * Find a category by slug (e.g. "restaurant" → "restaurant")
 */
export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const all = getAllCategories();
  return all.find((c) => c.slug === slug) || null;
}

/**
 * Build sitemap entries for all programmatic pages
 * Returns array of { loc, priority, changefreq }
 */
export function getAllSeoUrls(baseUrl = 'https://volia.fr') {
  const urls = [];
  const cats = getAllCategories();
  const depts = getAllDepartments();

  // Index page
  urls.push({ loc: `${baseUrl}/prospection`, priority: 0.8, changefreq: 'weekly' });

  // Category pages (1 per cat)
  for (const cat of cats) {
    urls.push({
      loc: `${baseUrl}/prospection/${cat.slug}`,
      priority: 0.6,
      changefreq: 'monthly',
    });
  }

  // Department pages (1 per dept) — EXCLUES du sitemap : ces pages /dept/[slug]
  // sont en noindex (Option C SEO, page.js robots:{index:false}). Lister une
  // URL noindex dans le sitemap est contradictoire (warning Search Console).

  // Combined category × department pages (the bulk)
  for (const cat of cats) {
    for (const dept of depts) {
      urls.push({
        loc: `${baseUrl}/prospection/${cat.slug}/${dept.slug}`,
        priority: 0.4,
        changefreq: 'monthly',
      });
    }
  }

  // Combined category × region pages — EXCLUES du sitemap : pages
  // /[cat]/region/[r] en noindex (Option C SEO). On ne les liste plus.

  // ─── Pages utilitaires publiques ───────────────────────────────
  urls.push({ loc: `${baseUrl}/changelog`, priority: 0.5, changefreq: 'weekly' });
  urls.push({ loc: `${baseUrl}/status`, priority: 0.4, changefreq: 'daily' });
  urls.push({ loc: `${baseUrl}/parrainage`, priority: 0.5, changefreq: 'monthly' });
  urls.push({ loc: `${baseUrl}/newsletter`, priority: 0.6, changefreq: 'monthly' });

  // ─── Pages personas /pour/[persona] ────────────────────────────
  try {
    const { getAllPersonas } = require('./personas');
    for (const p of getAllPersonas()) {
      urls.push({ loc: `${baseUrl}/pour/${p.slug}`, priority: 0.7, changefreq: 'monthly' });
    }
  } catch (e) {
    // personas optionnel — si non présent, on skip
  }

  // ─── Suisse romande ─────────────────────────────────────────────
  // Seuls le hub + les pages catégorie sont indexables ; canton/[slug] et
  // [cat]/[canton] sont en noindex (Option C SEO) → exclus du sitemap.
  urls.push({ loc: `${baseUrl}/prospection-ch`, priority: 0.7, changefreq: 'weekly' });
  for (const cat of cats) {
    urls.push({ loc: `${baseUrl}/prospection-ch/${cat.slug}`, priority: 0.55, changefreq: 'monthly' });
  }

  // ─── Belgique francophone (Wallonie + Bruxelles) ────────────────
  // Hub + pages catégorie indexables ; province/[slug] et [cat]/[province]
  // sont en noindex (Option C SEO) → exclus du sitemap.
  urls.push({ loc: `${baseUrl}/prospection-be`, priority: 0.7, changefreq: 'weekly' });
  for (const cat of cats) {
    urls.push({ loc: `${baseUrl}/prospection-be/${cat.slug}`, priority: 0.55, changefreq: 'monthly' });
  }

  // Combined category × city pages — EXCLUES du sitemap : pages
  // /[cat]/ville/[city] en noindex (Option C SEO). Ne plus les lister.

  return urls;
}
