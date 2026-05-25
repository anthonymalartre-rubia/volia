'use client';

// ─────────────────────────────────────────────────────────────────────
// Admin · Design System Volia
// ─────────────────────────────────────────────────────────────────────
//
// Page de référence interne du design system. Documente :
// - Tokens (couleurs sémantiques, typographie, radius, shadows, spacing)
// - Components (Button, Input, Card, MarketingCard, Logo)
// - Patterns (Hero CTA, Pricing card, Empty state, Toast)
// - Guidelines (Do / Don't)
//
// Réservée aux admins (is_admin = true sur user_profiles).
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Lock, Eye, EyeOff, ShieldOff, Loader2, Check, X,
  AlertCircle, ArrowLeft, Copy, Search, Inbox, Sparkles, LogIn,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import {
  Button, Input, Card, MarketingCard, BrandWordmark, Logo, LogoIcon,
} from '@/components/ui';
import ThemeToggle from '@/components/ThemeToggle';

// ─────────────────────────────────────────────────────────────────────
// Page principale (auth gate + layout)
// ─────────────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [authState, setAuthState] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('guest'); setLoading(false); return; }
      setCurrentEmail(user.email);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.is_admin) { setAuthState('no-admin'); setLoading(false); return; }
      setAuthState('ok');
      setLoading(false);
    })();
  }, [router, supabase]);

  function copyToClipboard(text, key) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  if (loading) return <CenteredSpinner />;
  if (authState === 'guest') return <GuestScreen />;
  if (authState === 'no-admin') {
    return (
      <NoAdminScreen
        email={currentEmail}
        signOut={async () => {
          await supabase.auth.signOut();
          router.push('/login?return=/admin/design-system');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <StickyHeader />
      <TokensSection copyToClipboard={copyToClipboard} copiedKey={copiedKey} />
      <ComponentsSection />
      <PatternsSection />
      <GuidelinesSection />
      <footer className="border-t border-line py-8 text-center text-xs text-content-muted">
        Design System Volia · v1 · Page admin interne
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sticky header avec nav vers sections
// ─────────────────────────────────────────────────────────────────────
function StickyHeader() {
  const links = [
    { href: '#tokens', label: 'Tokens' },
    { href: '#components', label: 'Components' },
    { href: '#patterns', label: 'Patterns' },
    { href: '#guidelines', label: 'Guidelines' },
  ];
  return (
    <header className="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-xl border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin" className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg border border-line text-content-tertiary hover:text-content-primary hover:border-line-hover transition">
            <ArrowLeft size={14} />
          </Link>
          <h1 className="text-sm sm:text-base font-semibold truncate text-content-primary">
            Design System Volia
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section 1 — TOKENS
// ─────────────────────────────────────────────────────────────────────
function TokensSection({ copyToClipboard, copiedKey }) {
  const surfaceTokens = [
    { name: 'surface-base', className: 'bg-surface-base', sample: 'bg-surface-base' },
    { name: 'surface-card', className: 'bg-surface-card', sample: 'bg-surface-card' },
    { name: 'surface-elevated', className: 'bg-surface-elevated', sample: 'bg-surface-elevated' },
    { name: 'surface-deep', className: 'bg-surface-deep', sample: 'bg-surface-deep' },
  ];
  const contentTokens = [
    { name: 'content-primary', className: 'text-content-primary' },
    { name: 'content-secondary', className: 'text-content-secondary' },
    { name: 'content-tertiary', className: 'text-content-tertiary' },
    { name: 'content-muted', className: 'text-content-muted' },
    { name: 'content-faint', className: 'text-content-faint' },
  ];
  const lineTokens = [
    { name: 'line', className: 'border-line' },
    { name: 'line-hover', className: 'border-line-hover' },
  ];
  const brandAccents = [
    { name: 'violet-500', hex: '#8B5CF6', className: 'bg-violet-500' },
    { name: 'indigo-500', hex: '#6366F1', className: 'bg-indigo-500' },
    { name: 'violet-600', hex: '#7C3AED', className: 'bg-violet-600' },
    { name: 'indigo-600', hex: '#4F46E5', className: 'bg-indigo-600' },
  ];
  const signalAccents = [
    { name: 'emerald-400', hex: '#34D399', className: 'bg-emerald-400' },
    { name: 'amber-400', hex: '#FBBF24', className: 'bg-amber-400' },
    { name: 'rose-400', hex: '#FB7185', className: 'bg-rose-400' },
    { name: 'sky-400', hex: '#38BDF8', className: 'bg-sky-400' },
  ];
  const fontSizes = [
    { className: 'text-[10px]', px: '10px' },
    { className: 'text-xs', px: '12px' },
    { className: 'text-sm', px: '14px' },
    { className: 'text-base', px: '16px' },
    { className: 'text-lg', px: '18px' },
    { className: 'text-xl', px: '20px' },
    { className: 'text-2xl', px: '24px' },
    { className: 'text-3xl', px: '30px' },
    { className: 'text-4xl', px: '36px' },
    { className: 'text-5xl', px: '48px' },
    { className: 'text-6xl', px: '60px' },
  ];
  const fontWeights = [
    { weight: 400, label: 'Regular' },
    { weight: 500, label: 'Medium' },
    { weight: 600, label: 'Semibold' },
    { weight: 700, label: 'Bold' },
    { weight: 800, label: 'Extrabold' },
  ];
  const radii = [
    { className: 'rounded-md', label: 'rounded-md (6px)' },
    { className: 'rounded-lg', label: 'rounded-lg (8px)' },
    { className: 'rounded-xl', label: 'rounded-xl (12px)' },
    { className: 'rounded-2xl', label: 'rounded-2xl (16px)' },
    { className: 'rounded-3xl', label: 'rounded-3xl (24px)' },
    { className: 'rounded-full', label: 'rounded-full' },
  ];
  const shadows = [
    { className: 'shadow-sm', label: 'shadow-sm' },
    { className: 'shadow-md', label: 'shadow-md' },
    { className: 'shadow-lg', label: 'shadow-lg' },
    { className: 'shadow-xl', label: 'shadow-xl' },
    { className: 'shadow-2xl', label: 'shadow-2xl' },
  ];
  const spacings = [
    { px: 4, scale: '1' },
    { px: 8, scale: '2' },
    { px: 12, scale: '3' },
    { px: 16, scale: '4' },
    { px: 24, scale: '6' },
    { px: 32, scale: '8' },
    { px: 48, scale: '12' },
    { px: 64, scale: '16' },
  ];

  return (
    <section id="tokens" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-2 text-content-primary">Tokens</h2>
      <p className="text-sm text-content-tertiary mb-8">
        Variables sémantiques (surfaces, contenu, bordures) + palette brand + échelles
        typographiques, radius, ombres et espacements.
      </p>

      {/* Couleurs sémantiques */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Couleurs sémantiques</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <TokenGroup title="Surface">
          {surfaceTokens.map((t) => (
            <Swatch
              key={t.name}
              name={t.name}
              cssVar={`--${t.name}`}
              swatchClass={`${t.className} border border-line`}
              onCopy={() => copyToClipboard(t.name, `surface-${t.name}`)}
              copied={copiedKey === `surface-${t.name}`}
            />
          ))}
        </TokenGroup>

        <TokenGroup title="Content">
          {contentTokens.map((t) => (
            <div key={t.name} className="rounded-xl border border-line bg-surface-card p-3">
              <div className={`text-lg font-semibold mb-2 ${t.className}`}>Aa</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-content-tertiary truncate">{t.name}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(t.name, `content-${t.name}`)}
                  className="text-content-muted hover:text-content-primary transition shrink-0"
                  aria-label={`Copier ${t.name}`}
                >
                  {copiedKey === `content-${t.name}` ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </TokenGroup>

        <TokenGroup title="Line">
          {lineTokens.map((t) => (
            <div key={t.name} className="rounded-xl border border-line bg-surface-card p-3">
              <div className={`h-12 rounded-lg border-2 ${t.className} mb-2 bg-surface-elevated`} />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-content-tertiary truncate">{t.name}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(t.name, `line-${t.name}`)}
                  className="text-content-muted hover:text-content-primary transition shrink-0"
                  aria-label={`Copier ${t.name}`}
                >
                  {copiedKey === `line-${t.name}` ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </TokenGroup>

        <TokenGroup title="Accent — Brand">
          {brandAccents.map((t) => (
            <Swatch
              key={t.name}
              name={t.name}
              cssVar={t.hex}
              swatchClass={t.className}
              onCopy={() => copyToClipboard(t.hex, `brand-${t.name}`)}
              copied={copiedKey === `brand-${t.name}`}
            />
          ))}
        </TokenGroup>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-content-primary">Accent — Signals</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {signalAccents.map((t) => (
          <Swatch
            key={t.name}
            name={t.name}
            cssVar={t.hex}
            swatchClass={t.className}
            onCopy={() => copyToClipboard(t.hex, `signal-${t.name}`)}
            copied={copiedKey === `signal-${t.name}`}
          />
        ))}
      </div>

      {/* Typographie */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Typographie</h3>
      <Card className="mb-6">
        <div className="space-y-3">
          {fontSizes.map((f) => (
            <div key={f.className} className="flex items-baseline gap-4 border-b border-line/50 last:border-0 pb-3 last:pb-0">
              <span className="text-[10px] font-mono text-content-muted shrink-0 w-28">{f.className}</span>
              <span className={`${f.className} text-content-primary truncate`}>
                Lorem ipsum dolor sit amet
              </span>
              <span className="ml-auto text-[10px] text-content-faint shrink-0">{f.px}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <Card>
          <h4 className="text-xs uppercase tracking-wider text-content-tertiary mb-3 font-semibold">Polices</h4>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-content-muted mb-1">Sans (Inter)</div>
              <div className="text-2xl text-content-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                Volia. Le moins cher.
              </div>
            </div>
            <div>
              <div className="text-xs text-content-muted mb-1">Mono (JetBrains Mono)</div>
              <div className="text-base text-content-primary font-mono">
                const dept = &quot;75&quot;;
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-xs uppercase tracking-wider text-content-tertiary mb-3 font-semibold">Font weights</h4>
          <div className="space-y-2">
            {fontWeights.map((w) => (
              <div key={w.weight} className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-content-muted w-10">{w.weight}</span>
                <span className="text-base text-content-primary" style={{ fontWeight: w.weight }}>
                  Aa — {w.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Radius */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Radius</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {radii.map((r) => (
          <div key={r.className} className="flex flex-col items-center gap-2">
            <div
              className={`w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 ${r.className}`}
            />
            <span className="text-xs font-mono text-content-tertiary text-center">{r.label}</span>
          </div>
        ))}
      </div>

      {/* Shadows */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Shadows</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-12 p-6 bg-surface-elevated rounded-2xl">
        {shadows.map((s) => (
          <div key={s.className} className="flex flex-col items-center gap-3">
            <div className={`w-[120px] h-20 bg-white rounded-xl ${s.className}`} />
            <span className="text-xs font-mono text-content-tertiary">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Spacing */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Spacing</h3>
      <Card>
        <div className="space-y-3">
          {spacings.map((s) => (
            <div key={s.px} className="flex items-center gap-4">
              <span className="text-xs font-mono text-content-muted shrink-0 w-24">{s.scale} ({s.px}px)</span>
              <div
                className="h-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded"
                style={{ width: `${s.px}px` }}
              />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function TokenGroup({ title, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider text-content-tertiary font-semibold">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Swatch({ name, cssVar, swatchClass, onCopy, copied }) {
  return (
    <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
      <div className={`h-16 ${swatchClass}`} />
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-content-primary truncate">{name}</span>
          <button
            type="button"
            onClick={onCopy}
            className="text-content-muted hover:text-content-primary transition shrink-0"
            aria-label={`Copier ${name}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
        <div className="text-[10px] font-mono text-content-faint mt-1">{cssVar}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section 2 — COMPONENTS
// ─────────────────────────────────────────────────────────────────────
function ComponentsSection() {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <section id="components" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-2 text-content-primary">Components</h2>
      <p className="text-sm text-content-tertiary mb-8">
        Primitives UI partagées (import depuis <code className="font-mono text-content-secondary">@/components/ui</code>).
      </p>

      {/* Button */}
      <h3 className="text-xl font-semibold mb-2 mt-12 text-content-primary">Button</h3>
      <p className="text-sm text-content-tertiary mb-4">4 variants × 3 sizes + états loading, disabled, fullWidth.</p>
      <Showcase>
        <div className="space-y-6">
          <div>
            <Label>Variants</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div>
            <Label>Sizes</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div>
            <Label>États</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button icon={Sparkles}>Avec icône</Button>
            </div>
          </div>
          <div>
            <Label>Full width</Label>
            <Button fullWidth>Continuer</Button>
          </div>
        </div>
      </Showcase>
      <CodeSnippet code={`<Button variant="primary" size="md">Lancer</Button>
<Button variant="secondary" size="sm">Annuler</Button>
<Button variant="ghost" icon={Sparkles}>Options</Button>
<Button variant="danger" loading>Supprimer</Button>`} />

      {/* Input */}
      <h3 className="text-xl font-semibold mb-2 mt-12 text-content-primary">Input</h3>
      <p className="text-sm text-content-tertiary mb-4">Style canonique + slot leading icon + slot trailing button.</p>
      <Showcase>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <Label>Default</Label>
            <Input placeholder="Nom" />
          </div>
          <div>
            <Label>Leading icon</Label>
            <Input leadingIcon={Mail} type="email" placeholder="vous@exemple.com" />
          </div>
          <div>
            <Label>Trailing slot (toggle password)</Label>
            <Input
              leadingIcon={Lock}
              type={showPwd ? 'text' : 'password'}
              placeholder="Mot de passe"
              trailingSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="p-2 text-content-muted hover:text-content-primary transition"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>
          <div>
            <Label>Disabled</Label>
            <Input placeholder="Désactivé" disabled />
          </div>
        </div>
      </Showcase>
      <CodeSnippet code={`<Input placeholder="Nom" />
<Input leadingIcon={Mail} type="email" placeholder="vous@exemple.com" />
<Input
  leadingIcon={Lock}
  type={showPwd ? 'text' : 'password'}
  trailingSlot={<button onClick={() => setShowPwd(v => !v)}>...</button>}
/>`} />

      {/* Card */}
      <h3 className="text-xl font-semibold mb-2 mt-12 text-content-primary">Card</h3>
      <p className="text-sm text-content-tertiary mb-4">Container générique (dashboard, settings).</p>
      <Showcase>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-content-primary">Card default (border-line + bg-surface-card + p-6).</p>
          </Card>
          <Card variant="interactive">
            <p className="text-sm text-content-primary">Card interactive (hover violet, cursor pointer).</p>
          </Card>
        </div>
      </Showcase>
      <CodeSnippet code={`<Card><p>Contenu</p></Card>
<Card variant="interactive" size="lg">...</Card>`} />

      {/* MarketingCard */}
      <h3 className="text-xl font-semibold mb-2 mt-12 text-content-primary">MarketingCard</h3>
      <p className="text-sm text-content-tertiary mb-4">Cards des pages publiques (landing, /vs, /personas...).</p>
      <Showcase darkBg>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MarketingCard size="sm">
            <div className="text-content-primary font-semibold mb-1">Default · sm</div>
            <div className="text-content-primary/60 text-xs">Card neutre marketing.</div>
          </MarketingCard>
          <MarketingCard variant="highlighted" size="md">
            <div className="text-content-primary font-semibold mb-1">Highlighted · md</div>
            <div className="text-content-primary/70 text-xs">Pricing card recommandée.</div>
          </MarketingCard>
          <MarketingCard
            variant="persona"
            size="md"
            gradientClass="bg-gradient-to-br from-violet-500/15 to-indigo-500/15"
          >
            <div className="text-white font-semibold mb-1">Persona · md</div>
            <div className="text-white/70 text-xs">Avec gradient accent.</div>
          </MarketingCard>
        </div>
      </Showcase>
      <CodeSnippet code={`<MarketingCard size="sm">...</MarketingCard>
<MarketingCard variant="highlighted" size="md">...</MarketingCard>
<MarketingCard
  variant="persona"
  gradientClass="bg-gradient-to-br from-violet-500/15 to-indigo-500/15"
>...</MarketingCard>`} />

      {/* Logo / BrandWordmark */}
      <h3 className="text-xl font-semibold mb-2 mt-12 text-content-primary">Logo · LogoIcon · BrandWordmark</h3>
      <p className="text-sm text-content-tertiary mb-4">Identité de marque. Theme-aware (swap dark/light auto).</p>
      <Showcase>
        <div className="space-y-6">
          <div>
            <Label>LogoIcon — 5 sizes</Label>
            <div className="flex items-end gap-4">
              <LogoIcon size="xs" />
              <LogoIcon size="sm" />
              <LogoIcon size="md" />
              <LogoIcon size="lg" />
              <LogoIcon size="xl" />
            </div>
          </div>
          <div>
            <Label>Logo wordmark (md)</Label>
            <Logo size="md" />
          </div>
          <div>
            <Label>BrandWordmark — variants</Label>
            <div className="flex flex-col gap-3">
              <BrandWordmark variant="logo" />
              <BrandWordmark variant="default" />
              <BrandWordmark variant="compact" />
            </div>
          </div>
        </div>
      </Showcase>
      <CodeSnippet code={`<LogoIcon size="md" />
<Logo size="md" />
<BrandWordmark variant="logo" />
<BrandWordmark variant="default" />
<BrandWordmark variant="compact" />`} />
    </section>
  );
}

function Label({ children }) {
  return (
    <div className="text-[10px] uppercase tracking-wider font-semibold text-content-tertiary mb-2">
      {children}
    </div>
  );
}

function Showcase({ children, darkBg = false }) {
  return (
    <div
      className={`rounded-2xl border border-line p-6 mb-4 ${
        darkBg ? 'bg-surface-base' : 'bg-surface-card'
      }`}
    >
      {children}
    </div>
  );
}

function CodeSnippet({ code }) {
  return (
    <pre className="rounded-lg bg-surface-elevated border border-line p-4 text-xs font-mono text-content-secondary overflow-x-auto mb-2">
      {code}
    </pre>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section 3 — PATTERNS
// ─────────────────────────────────────────────────────────────────────
function PatternsSection() {
  return (
    <section id="patterns" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-2 text-content-primary">Patterns</h2>
      <p className="text-sm text-content-tertiary mb-8">
        Layouts récurrents composés à partir des primitives.
      </p>

      {/* Hero CTA marketing */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Marketing · Hero CTA</h3>
      <div className="rounded-2xl border border-line bg-surface-card p-6 mb-12">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-transparent border border-violet-500/30 p-8 sm:p-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-xs font-medium text-violet-300 mb-4">
            <Sparkles size={12} /> Lancement public
          </div>
          <h4 className="text-3xl sm:text-4xl font-bold text-content-primary mb-3">
            Le moins cher du marché
          </h4>
          <p className="text-base text-content-secondary mb-6 max-w-md mx-auto">
            100 prospects offerts. 19€/mois ensuite. Cascade waterfall 7 sources.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" icon={Sparkles}>Commencer</Button>
            <Button variant="secondary" size="lg">Voir pricing</Button>
          </div>
        </div>
      </div>

      {/* Pricing card */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Pricing card</h3>
      <div className="rounded-2xl border border-line bg-surface-card p-6 mb-12">
        <div className="max-w-sm mx-auto">
          <MarketingCard variant="highlighted" size="lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold shadow-lg shadow-violet-500/30">
              Recommandé
            </div>
            <div className="text-center mb-6">
              <div className="text-sm text-content-primary/70 mb-1">Pro</div>
              <div className="text-4xl font-bold text-content-primary">
                49<span className="text-xl text-content-primary/60">€/mois</span>
              </div>
              <div className="text-xs text-content-primary/60 mt-1">5 000 prospects · cascade waterfall</div>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                '5 000 prospects / mois',
                'Cascade 7 sources email',
                'Export CSV + Zoho CRM',
                'Filtrage RGPD inclus',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-content-primary/90">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="primary" fullWidth>Choisir Pro</Button>
          </MarketingCard>
        </div>
      </div>

      {/* Empty state */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Empty state</h3>
      <div className="rounded-2xl border border-line bg-surface-card p-6 mb-12">
        <div className="text-center py-12 px-6 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-elevated border border-line mb-4">
            <Inbox size={24} className="text-content-muted" />
          </div>
          <h4 className="text-lg font-semibold text-content-primary mb-2">Aucun résultat</h4>
          <p className="text-sm text-content-tertiary mb-6">
            Lance ta première recherche pour générer une liste de prospects qualifiés.
          </p>
          <Button variant="primary" icon={Search}>Nouvelle recherche</Button>
        </div>
      </div>

      {/* Toasts */}
      <h3 className="text-xl font-semibold mb-4 mt-12 text-content-primary">Toasts</h3>
      <div className="rounded-2xl border border-line bg-surface-card p-6 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToastSample
            icon={<Check size={14} className="text-emerald-400" />}
            color="border-emerald-500/30 bg-emerald-500/10"
            title="Recherche terminée"
            desc="247 prospects ajoutés à la liste."
          />
          <ToastSample
            icon={<X size={14} className="text-rose-400" />}
            color="border-rose-500/30 bg-rose-500/10"
            title="Erreur d'enrichissement"
            desc="Le scraping a échoué pour 3 prospects."
          />
          <ToastSample
            icon={<Loader2 size={14} className="text-violet-400 animate-spin" />}
            color="border-violet-500/30 bg-violet-500/10"
            title="Enrichissement en cours…"
            desc="Cascade waterfall — source 3/7."
          />
          <ToastSample
            icon={<AlertCircle size={14} className="text-content-tertiary" />}
            color="border-line bg-surface-elevated"
            title="Mise à jour disponible"
            desc="Une nouvelle version est prête."
          />
        </div>
      </div>
    </section>
  );
}

function ToastSample({ icon, color, title, desc }) {
  return (
    <div className={`rounded-xl border ${color} px-4 py-3 flex items-start gap-3`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-content-primary truncate">{title}</div>
        <div className="text-xs text-content-tertiary truncate">{desc}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section 4 — GUIDELINES
// ─────────────────────────────────────────────────────────────────────
function GuidelinesSection() {
  const groups = [
    {
      title: 'Buttons',
      dos: [
        <><code className="font-mono text-violet-300">variant=&quot;primary&quot;</code> pour le CTA principal (1 par écran).</>,
        <><code className="font-mono text-violet-300">variant=&quot;secondary&quot;</code> pour action secondaire (annuler, voir plus).</>,
        <><code className="font-mono text-violet-300">variant=&quot;ghost&quot;</code> pour action tertiaire (settings, options).</>,
        <><code className="font-mono text-violet-300">variant=&quot;danger&quot;</code> UNIQUEMENT pour actions destructrices.</>,
      ],
      donts: [
        <>Ne PAS recoder un <code className="font-mono text-rose-300">&lt;button&gt;</code> à la main, utilise <code className="font-mono text-rose-300">Button</code>.</>,
        <>Ne PAS empiler plusieurs primary CTAs côte à côte.</>,
        <>Ne PAS utiliser danger pour de l&apos;UX neutre (logout n&apos;est PAS danger).</>,
      ],
    },
    {
      title: 'Radius',
      dos: [
        <><code className="font-mono text-violet-300">rounded-md</code> (6px) : inputs, badges, boutons mini.</>,
        <><code className="font-mono text-violet-300">rounded-lg</code> (8px) : boutons, cards compactes.</>,
        <><code className="font-mono text-violet-300">rounded-xl</code> (12px) : cards moyennes, dropdowns.</>,
        <><code className="font-mono text-violet-300">rounded-2xl</code> (16px) : sections marketing, modales, cards larges.</>,
      ],
      donts: [
        <>Ne PAS utiliser <code className="font-mono text-rose-300">rounded-3xl</code> (un seul cas existant, à éliminer).</>,
        <>Ne PAS mélanger 4 radius différents dans la même vue.</>,
      ],
    },
    {
      title: 'Palette violet/indigo',
      dos: [
        <><code className="font-mono text-violet-300">from-violet-600 to-indigo-600</code> pour TOUS les gradients brand.</>,
        <><code className="font-mono text-violet-300">text-violet-400</code> pour les accents text (liens, highlights).</>,
        <><code className="font-mono text-violet-300">bg-violet-500/10</code> pour les backgrounds tintés.</>,
      ],
      donts: [
        <>Ne PAS mélanger <code className="font-mono text-rose-300">bg-purple-500</code> (préférer violet).</>,
        <>Ne PAS introduire de nouvelles couleurs primaires (rose/sky en accent secondaire OK, mais jamais brand).</>,
      ],
    },
    {
      title: 'Borders',
      dos: [
        <><code className="font-mono text-violet-300">border-line</code> (subtle) pour la plupart des cards/sections.</>,
        <><code className="font-mono text-violet-300">border-line-hover</code> (medium) pour states hover.</>,
      ],
      donts: [
        <>Ne PAS utiliser <code className="font-mono text-rose-300">border-white/[0.06]</code> ou <code className="font-mono text-rose-300">border-zinc-700</code> (legacy, à remplacer).</>,
        <>Ne PAS multiplier les borders (1 par card suffit).</>,
      ],
    },
  ];

  return (
    <section id="guidelines" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      <h2 className="text-3xl font-bold mb-2 text-content-primary">Guidelines</h2>
      <p className="text-sm text-content-tertiary mb-8">
        Règles d&apos;usage canoniques. Référence en cas de doute.
      </p>

      <div className="space-y-8">
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-xl font-semibold mb-4 text-content-primary">{g.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-300">Do</span>
                </div>
                <ul className="space-y-2">
                  {g.dos.map((item, i) => (
                    <li key={i} className="text-sm text-content-secondary leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <X size={14} className="text-rose-400" />
                  </div>
                  <span className="text-sm font-semibold text-rose-300">Don&apos;t</span>
                </div>
                <ul className="space-y-2">
                  {g.donts.map((item, i) => (
                    <li key={i} className="text-sm text-content-secondary leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Auth states (guest / no-admin / spinner)
// ─────────────────────────────────────────────────────────────────────
function CenteredSpinner() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center text-content-secondary">
      <Loader2 className="animate-spin" size={20} />
    </div>
  );
}

function GuestScreen() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-line bg-surface-card p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4">
          <ShieldOff size={20} className="text-violet-300" />
        </div>
        <h1 className="text-xl font-bold mb-2 text-content-primary">Connexion requise</h1>
        <p className="text-sm text-content-secondary mb-6">
          Cette page est réservée aux administrateurs.
        </p>
        <Link
          href="/login?return=/admin/design-system"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
        >
          <LogIn size={14} />
          Se connecter
        </Link>
      </div>
    </div>
  );
}

function NoAdminScreen({ email, signOut }) {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
          <ShieldOff size={20} className="text-amber-300" />
        </div>
        <h1 className="text-xl font-bold mb-2 text-content-primary">Accès refusé</h1>
        <p className="text-sm text-content-secondary mb-2">
          Connecté en tant que <strong className="text-content-primary">{email}</strong>, mais
          ce compte n&apos;a pas les droits administrateur.
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-line text-content-secondary hover:text-content-primary text-sm font-medium transition"
          >
            Retour au dashboard
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
          >
            <LogIn size={14} />
            Changer de compte
          </button>
        </div>
      </div>
    </div>
  );
}
