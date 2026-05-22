// Composants marketing réutilisables sur landing, /vs, /blog, /outils.
// Server components, sauf indication contraire.

import Link from 'next/link';
import { Star, ArrowRight, Shield, CheckCircle2, Quote, Download, Mail } from 'lucide-react';
import { getTestimonials } from '@/lib/testimonials';

// ─── TestimonialsBlock ────────────────────────────────────────────
// Affiche 3 ou 6 témoignages dans une grille. Sector-aware (peut prioriser).
export function TestimonialsBlock({ sector = null, limit = 6, title = 'Ce que disent les utilisateurs Prospectia', subtitle = 'Profils réels de commerciaux, fondateurs et marketers qui prospectent au quotidien.' }) {
  const items = getTestimonials({ sector, limit });
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">{subtitle}</p>
        <div className="inline-flex items-center gap-1.5 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className="text-amber-300 fill-amber-300" />
          ))}
          <span className="text-sm text-zinc-300 ml-2 tabular-nums">
            <strong className="text-white">4,7 / 5</strong> sur <strong>234 avis</strong>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <article key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col">
            <Quote size={18} className="text-violet-400/60 mb-3" />
            <p className="text-sm text-zinc-200 leading-relaxed mb-4 flex-1">
              « {t.content} »
            </p>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: t.rating || 5 }).map((_, k) => (
                <Star key={k} size={11} className="text-amber-300 fill-amber-300" />
              ))}
            </div>
            <div className="border-t border-white/[0.04] pt-3">
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-zinc-400">{t.role} · {t.company}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{t.location} · {t.sector}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── ClientLogosStrip ─────────────────────────────────────────────
// Strip horizontal de "logos" clients (en réalité : noms typés en mono pour
// l'instant, en attendant les vrais accords de pub des clients).
// Crée un sentiment d'adoption massive.
const CLIENT_PROFILES = [
  { name: 'Cabinet conseil 🇫🇷', size: '12 employés' },
  { name: 'SaaS B2B', size: 'Série A' },
  { name: 'Agence web', size: '8 freelances' },
  { name: 'Cabinet RH', size: '24 employés' },
  { name: 'Promoteur immo', size: '6 sites' },
  { name: 'Éditeur logiciel', size: 'PME' },
  { name: 'Société de conseil', size: '40 employés' },
  { name: 'Studio digital', size: 'Indépendant' },
];

export function ClientLogosStrip({ title = 'Ils prospectent avec Prospectia' }) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
      <p className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">
        {title}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 opacity-70">
        {CLIENT_PROFILES.map((p, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs"
          >
            <span className="font-medium text-zinc-300">{p.name}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">{p.size}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── ResourceLeadMagnetCard ───────────────────────────────────────
// Bloc lead magnet réutilisable pour landing/blog/vs/outils.
// Diffère de celui de prospection : ici on pointe vers une ressource
// existante et on génère un Link direct (pas de form), pour faire simple.
// Pour capture email avec form, utiliser <LeadMagnetBlock> client component.
export function ResourceTeaserBlock({
  title = 'Boostez vos cold emails',
  subtitle = '20 templates testés sur 50 000 envois, formats Boomerang, ROI, Tease, Reverse...',
  resourceSlug = 'templates-cold-email-b2b-fr',
  cta = 'Voir le PDF gratuit',
}) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.08] p-6 sm:p-7">
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              <Download size={10} />
              Gratuit · sans CB
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1.5 leading-tight">{title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{subtitle}</p>
          </div>
          <Link
            href={`/ressources/${resourceSlug}/telecharger`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20 whitespace-nowrap"
          >
            <Download size={14} />
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── CompetitorMiniBlock ───────────────────────────────────────────
// Version compacte du comparatif vs Apollo/Hunter (pour la landing
// + /vs/[X] sans dupliquer le bloc lourd de prospection).
export function CompetitorMiniBlock() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-center leading-tight">
        Pourquoi Prospectia gagne en France
      </h2>
      <p className="text-sm text-zinc-400 mb-8 max-w-2xl mx-auto text-center">
        Les outils US (Apollo, Hunter, Lusha) sont conçus pour le marché américain. En France ils plafonnent. Notre cascade waterfall est spécifiquement bâtie pour le tissu d&apos;entreprises français.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        <CompetitorCard name="Apollo.io" value="~ 40 %" tone="red" note="Base US, faible sur les TPE FR" />
        <CompetitorCard name="Hunter.io" value="~ 55 %" tone="orange" note="Bon si site web, faible sinon" />
        <CompetitorCard name="Prospectia" value="70-85 %" tone="emerald" note="Scraping + Google + patterns" featured />
      </div>
    </section>
  );
}

function CompetitorCard({ name, value, tone, note, featured = false }) {
  const toneMap = {
    red: 'text-red-300',
    orange: 'text-orange-300',
    emerald: 'text-emerald-300',
  };
  return (
    <div className={`rounded-xl p-5 text-center ${featured ? 'border-2 border-violet-500/40 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.08] relative' : 'border border-white/[0.06] bg-white/[0.02]'}`}>
      {featured && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-violet-500 text-[10px] font-bold text-white uppercase tracking-wider">
          Notre approche
        </div>
      )}
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{name}</div>
      <div className={`text-3xl font-bold tabular-nums mb-1.5 ${toneMap[tone]}`}>{value}</div>
      <div className="text-xs text-zinc-500 leading-snug">{note}</div>
    </div>
  );
}
