import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, Calendar, TrendingUp, Zap } from 'lucide-react';
import NewsletterCapture from '@/components/NewsletterCapture';

const SITE_URL = 'https://volia.fr';

export const metadata = {
  title: 'Newsletter Volia — 1 email/mois sur la prospection B2B France',
  description: 'Stats sectorielles, templates cold email qui convertissent, retours d\'expérience. Désinscription 1 clic. RGPD compliant.',
  alternates: { canonical: `${SITE_URL}/newsletter` },
  openGraph: {
    title: 'Newsletter Volia — La prospection B2B France en 5 minutes/mois',
    description: 'Stats sectorielles + templates + retours d\'expérience. 1 email/mois max, désabo 1 clic.',
    url: `${SITE_URL}/newsletter`,
  },
};

export default function NewsletterPage() {
  return (
    <div className="dark min-h-screen bg-surface-base text-content-primary">
      <nav className="fixed top-0 w-full z-50 bg-surface-base/70 backdrop-blur-2xl border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition">
            <ArrowLeft size={14} />
            Volia
          </Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition">
            Essayer gratuitement
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <Mail size={12} />
            Newsletter mensuelle Volia
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            La prospection B2B France en 5 minutes/mois
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-2xl mx-auto">
            1 email par mois, le 1er du mois. Stats sectorielles, templates qui convertissent, retours d&apos;expérience terrain. Pas de spam, pas de tracking pushy, désabonnement 1 clic.
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-16">
          <NewsletterCapture
            source="page-newsletter"
            title="Recevoir la prochaine édition"
            subtitle="Vous recevrez la prochaine édition au 1er du prochain mois. Aucun email de relance, aucun automatisme intermédiaire."
          />
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Ce que contient chaque édition</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <FeatureCard icon={Calendar} title="L'article du mois" desc="L'analyse la plus lue de notre blog, formatée pour 5 min de lecture." />
            <FeatureCard icon={TrendingUp} title="Le chiffre du mois" desc="Une stat marché B2B France actionnable (densité secteur, taux conversion, etc.)." />
            <FeatureCard icon={Zap} title="La ressource du mois" desc="Un PDF gratuit (templates, checklists, guides) qui prolonge l'article." />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-line bg-surface-elevated/40 p-6">
            <h3 className="text-base font-semibold mb-3">Engagements newsletter</h3>
            <ul className="space-y-2.5">
              <Engagement>1 email par mois maximum, jamais plus.</Engagement>
              <Engagement>Pas de tracking pixel pushy (juste les ouvertures Resend agrégées).</Engagement>
              <Engagement>Désinscription 1 clic dans chaque email — lien token-based.</Engagement>
              <Engagement>Vos données restent en France (Supabase EU + Vercel EU edges).</Engagement>
              <Engagement>Pas de revente à des tiers. Jamais.</Engagement>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-content-tertiary">
          <span>© 2026 Volia.fr</span>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-content-secondary">CGU</Link>
            <Link href="/confidentialite" className="hover:text-content-secondary">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-content-secondary">RGPD</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
      <Icon size={20} className="text-violet-400 mb-3" />
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-xs text-content-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function Engagement({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-content-secondary">
      <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
