'use client';

// ─────────────────────────────────────────────────────────────────────
// MobileNavMenu — menu hamburger pour la nav marketing sur mobile
// ─────────────────────────────────────────────────────────────────────
// Avant : les liens de nav (Produits / Tarifs / Blog / FAQ) étaient en
// `hidden sm:flex` SANS remplacement mobile → sur téléphone, impossible
// d'accéder à autre chose que le logo + « On essaie ». Ce composant ajoute
// un bouton burger (visible `sm:hidden`) qui ouvre un panneau plein écran
// avec tous les liens + le sélecteur de langue.
//
// Réutilisé par LandingContent et MarketingHeader (même nav).
// EN : passer locale="en" → libellés + routes /en/*.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Mail, Users, FormInput, Zap, FolderKanban } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Volia One = le produit héros (domaine → leads + emails + pipeline).
// Son point d'entrée est /one (route top-level, pas /produits/*), d'où le
// `href` explicite. Les 5 modules qui font tourner One vivent sous /produits/*.
const PRODUCTS_FR = [
  { slug: 'one', href: '/one', name: 'Volia One', icon: Zap, accent: 'text-amber-600 bg-amber-100' },
  { slug: 'prospection', name: 'Volia Prospection', icon: Search, accent: 'text-violet-600 bg-violet-100' },
  { slug: 'campagnes', name: 'Volia Campagnes', icon: Mail, accent: 'text-blue-600 bg-blue-100' },
  { slug: 'crm', name: 'Volia CRM', icon: Users, accent: 'text-emerald-600 bg-emerald-100' },
  { slug: 'formulaires', name: 'Volia Formulaires', icon: FormInput, accent: 'text-pink-600 bg-pink-100' },
  { slug: 'project', name: 'Volia Project', icon: FolderKanban, accent: 'text-orange-600 bg-orange-100' },
];

const PRODUCTS_EN = [
  { slug: 'one', href: '/one', name: 'Volia One', icon: Zap, accent: 'text-amber-600 bg-amber-100' },
  { slug: 'prospection', name: 'Volia Prospection', icon: Search, accent: 'text-violet-600 bg-violet-100' },
  { slug: 'campaigns', name: 'Volia Campaigns', icon: Mail, accent: 'text-blue-600 bg-blue-100' },
  { slug: 'crm', name: 'Volia CRM', icon: Users, accent: 'text-emerald-600 bg-emerald-100' },
  { slug: 'forms', name: 'Volia Forms', icon: FormInput, accent: 'text-pink-600 bg-pink-100' },
];

const STR = {
  fr: { open: 'Ouvrir le menu', close: 'Fermer le menu', products: 'Produits', pricing: 'Tarifs', blog: 'Blog', faq: 'FAQ', login: 'Connexion', cta: 'Démarrer gratuitement' },
  en: { open: 'Open menu', close: 'Close menu', products: 'Products', pricing: 'Pricing', blog: 'Blog', faq: 'FAQ', login: 'Log in', cta: 'Start free' },
};

export default function MobileNavMenu({ locale = 'fr' }) {
  const [open, setOpen] = useState(false);
  const isEn = locale === 'en';
  const t = STR[isEn ? 'en' : 'fr'];
  const products = isEn ? PRODUCTS_EN : PRODUCTS_FR;
  const basePath = isEn ? '/en/products' : '/produits';
  const pricingHref = isEn ? '/en/pricing' : '/pricing';
  const loginHref = '/login';
  const signupHref = '/signup';

  // Scroll-lock + fermeture à l'Échap quand le panneau est ouvert
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.open}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center justify-center w-10 h-10 -mr-1 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <Menu size={22} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={close}
            aria-hidden="true"
          />
          {/* Panneau déroulant sous la nav (h-16) */}
          <div
            id="mobile-nav-panel"
            className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-surface-base border-b border-line shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Produits */}
              <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-content-tertiary">
                {t.products}
              </p>
              {products.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.slug}
                    href={p.href || `${basePath}/${p.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-elevated transition"
                  >
                    <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${p.accent}`}>
                      <Icon size={17} />
                    </span>
                    <span className="text-[15px] font-medium text-content-primary">{p.name}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-line my-2" />

              {/* Liens principaux */}
              <Link href={pricingHref} onClick={close} className="block px-2 py-3 rounded-xl text-[15px] font-medium text-content-primary hover:bg-surface-elevated transition">
                {t.pricing}
              </Link>
              <Link href="/blog" onClick={close} className="block px-2 py-3 rounded-xl text-[15px] font-medium text-content-primary hover:bg-surface-elevated transition">
                {t.blog}
              </Link>
              <Link href="/faq" onClick={close} className="block px-2 py-3 rounded-xl text-[15px] font-medium text-content-primary hover:bg-surface-elevated transition">
                {t.faq}
              </Link>
              <Link href={loginHref} onClick={close} className="block px-2 py-3 rounded-xl text-[15px] font-medium text-content-primary hover:bg-surface-elevated transition">
                {t.login}
              </Link>

              {/* CTA principal */}
              <Link
                href={signupHref}
                onClick={close}
                className="mt-2 flex items-center justify-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[15px] font-semibold shadow-lg shadow-violet-500/20 active:from-violet-500 active:to-indigo-500 transition"
              >
                {t.cta}
              </Link>

              {/* Sélecteur de langue */}
              <div className="flex items-center justify-center pt-3">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
