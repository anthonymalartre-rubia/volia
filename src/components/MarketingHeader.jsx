'use client';

// ─────────────────────────────────────────────────────────────────────
// MarketingHeader — header complet du site marketing
// ─────────────────────────────────────────────────────────────────────
// Réutilisé par les pages standalone (/pricing, futures pages commerciales)
// qui ont besoin du menu nav complet (Produits / Fonctionnalités / Pricing /
// Blog / FAQ) plutôt que du ReaderHeader minimaliste (qui lui sert au blog,
// guide, glossaire — lecture longue).
//
// Structure identique au header de LandingContent + ProductPageLayout pour
// cohérence visuelle cross-pages marketing.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { NavAuth } from '@/components/AuthCTA';
import { LogoIcon } from '@/components/ui';
import ProductsMenu from '@/components/ProductsMenu';

const DEFAULT_LABELS_FR = {
  products: 'Produits',
  features: 'Fonctionnalités',
  pricing: 'Pricing',
  blog: 'Blog',
  faq: 'FAQ',
};

const DEFAULT_LABELS_EN = {
  products: 'Products',
  features: 'Features',
  pricing: 'Pricing',
  blog: 'Blog',
  faq: 'FAQ',
};

export default function MarketingHeader({ locale = 'fr', labels }) {
  const isEn = locale === 'en';
  const home = isEn ? '/en' : '/';
  const pricingHref = isEn ? '/en/pricing' : '/pricing';
  const l = labels || (isEn ? DEFAULT_LABELS_EN : DEFAULT_LABELS_FR);

  return (
    <header>
      <nav className="fixed top-0 w-full z-50 bg-surface-base/70 backdrop-blur-2xl border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={home} className="flex items-center gap-1.5">
            <LogoIcon size="sm" />
            <span className="text-lg font-bold tracking-tight ml-1">Volia</span>
            <span className="text-violet-400 text-xs font-semibold">.fr</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <ProductsMenu label={l.products} locale={locale} />
            <Link href={`${home}#features`} className="text-sm text-content-tertiary hover:text-content-primary transition">
              {l.features}
            </Link>
            <Link href={pricingHref} className="text-sm text-content-tertiary hover:text-content-primary transition">
              {l.pricing}
            </Link>
            <Link href="/blog" className="text-sm text-content-tertiary hover:text-content-primary transition">
              {l.blog}
            </Link>
            <Link href={`${home}#faq`} className="text-sm text-content-tertiary hover:text-content-primary transition">
              {l.faq}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NavAuth />
          </div>
        </div>
      </nav>
    </header>
  );
}
