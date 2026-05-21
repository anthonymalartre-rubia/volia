// Composants serveur réutilisables pour enrichir les pages /prospection.
// Chaque block est null-safe : il ne s'affiche que si les données arrivent.
//
// Ces blocs sont conçus pour produire du contenu unique en combinant :
//   - data catégorie (category-data.js) → persona, KPIs, saisonnalité, pitch...
//   - data dept/région (dept-data.js, region-data.js) → tissu local
//
// Ainsi /prospection/restaurant/75-paris et /prospection/restaurant/13-bouches-du-rhone
// ont des paragraphes uniques (combinaison ICP resto × spécificités locales).

import Link from 'next/link';
import {
  Target, BarChart3, Calendar, MapPin, MessageCircle, BookOpen, Lightbulb,
  Mail, Phone, Linkedin, ArrowRight, AlertTriangle, Quote, Building2,
} from 'lucide-react';

// Helper pour interpoler {placeholders} dans un texte
function tpl(text, vars = {}) {
  if (!text) return '';
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] || `{${k}}`);
}

// ─── 1. MarketSize — chiffre clé du marché ──────────────
export function MarketSizeBlock({ data, category }) {
  if (!data?.marketSize) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-indigo-500/[0.06] p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-violet-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Taille du marché — {category?.labelPlural || 'secteur'}
            </h2>
            <p className="text-base text-zinc-200 leading-relaxed">{data.marketSize}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. KPIs sectoriels (4 cards) ──────────────────────
export function KpiBlock({ data, category }) {
  if (!data?.kpis?.length) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">
        Les chiffres clés des {category?.labelPlural || 'entreprises'}
      </h2>
      <p className="text-zinc-400 mb-6 max-w-2xl text-sm">
        Données sectorielles pour calibrer votre approche commerciale et vos messages.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.kpis.map((k, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-2xl font-bold text-violet-300 tabular-nums">{k.value}</div>
            <div className="text-sm text-zinc-200 font-semibold mt-1">{k.label}</div>
            {k.hint && <div className="text-xs text-zinc-500 mt-1 leading-snug">{k.hint}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 3. Persona — qui contacter ────────────────────────
export function PersonaBlock({ data, category }) {
  if (!data?.persona) return null;
  const { titles = [], decisionMaker, painPoint } = data.persona;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <Target size={22} className="text-violet-400" />
            Qui contacter dans un {category?.label || 'établissement'} ?
          </h2>
          <p className="text-zinc-400 leading-relaxed text-sm mb-4">
            <strong className="text-white">Décideur clé :</strong> {decisionMaker}
          </p>
          <p className="text-zinc-400 leading-relaxed text-sm">
            <strong className="text-white">Douleur principale :</strong> {painPoint}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Titres ICP à cibler
          </div>
          <ul className="space-y-2">
            {titles.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <ArrowRight size={12} className="text-violet-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── 4. Saisonnalité ───────────────────────────────────
export function SeasonalityBlock({ data, category }) {
  if (!data?.seasonality) return null;
  const { peak, low, comment } = data.seasonality;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <Calendar size={22} className="text-violet-400" />
        Quand prospecter les {category?.labelPlural || 'entreprises'} ?
      </h2>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">À éviter (haute saison)</div>
          <div className="text-sm text-zinc-200 leading-relaxed">{peak}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Idéal (basse saison)</div>
          <div className="text-sm text-zinc-200 leading-relaxed">{low}</div>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2">Conseil</div>
          <div className="text-sm text-zinc-200 leading-relaxed">{comment}</div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. Best approach ──────────────────────────────────
export function BestApproachBlock({ data, category }) {
  if (!data?.bestApproach) return null;
  const { channel, timing, why } = data.bestApproach;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle size={22} className="text-violet-400" />
        Le meilleur canal pour joindre les {category?.labelPlural || 'professionnels'}
      </h2>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail size={11} /> Canal
            </div>
            <div className="text-sm text-zinc-200 font-medium leading-relaxed">{channel}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> Période
            </div>
            <div className="text-sm text-zinc-200 font-medium leading-relaxed">{timing}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb size={11} /> Pourquoi
            </div>
            <div className="text-sm text-zinc-400 leading-relaxed">{why}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. Pitch hook ─────────────────────────────────────
export function PitchBlock({ data, category }) {
  if (!data?.pitchHook) return null;
  // Démo : remplacer les placeholders par des valeurs exemple
  const previewed = data.pitchHook
    .replace(/\{first_name\}/g, 'Marc')
    .replace(/\{last_name\}/g, 'Durand')
    .replace(/\{company\}/g, 'Exemple SAS')
    .replace(/\{position_title\}/g, category?.label || 'gérant')
    .replace(/\{custom\.\w+\}/g, '…');
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.04] to-indigo-500/[0.04] p-6">
        <div className="flex items-start gap-3 mb-3">
          <Quote size={22} className="text-violet-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold mb-1">Exemple d&apos;accroche cold email</h2>
            <p className="text-xs text-zinc-400">Adapté au profil {category?.label || 'cible'} — testé sur 1 000+ envois.</p>
          </div>
        </div>
        <blockquote className="rounded-xl border border-white/[0.06] bg-black/30 p-4 text-sm text-zinc-200 leading-relaxed italic">
          « {previewed} »
        </blockquote>
        <p className="text-xs text-zinc-500 mt-3">
          Personnalisez avec les variables <code className="text-violet-300">{`{first_name}`}</code>, <code className="text-violet-300">{`{company}`}</code> et <code className="text-violet-300">{`{custom.X}`}</code> dans Prospectia.
        </p>
      </div>
    </section>
  );
}

// ─── 7. Objections fréquentes ──────────────────────────
export function ObjectionBlock({ data, category }) {
  if (!data?.objections?.length) return null;
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <AlertTriangle size={22} className="text-amber-400" />
        Objections fréquentes des {category?.labelPlural || 'cibles'} et comment répondre
      </h2>
      <div className="space-y-3">
        {data.objections.map((o, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-sm text-amber-300 font-semibold mb-2">« {o.objection} »</div>
            <div className="text-sm text-zinc-300 leading-relaxed">
              <strong className="text-emerald-300">→ </strong>
              {o.reponse}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 8. Glossaire métier ───────────────────────────────
export function GlossaryBlock({ data, category }) {
  if (!data?.glossary?.length) return null;
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <BookOpen size={22} className="text-violet-400" />
        Lexique métier — {category?.labelPlural || 'secteur'}
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {data.glossary.map((g, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-sm font-semibold text-violet-300 mb-1">{g.term}</div>
            <div className="text-xs text-zinc-400 leading-relaxed">{g.def}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 9. Pain points sectoriels ─────────────────────────
export function PainPointsBlock({ data, category }) {
  if (!data?.painPoints?.length) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">
        Les 3 défis principaux des {category?.labelPlural || 'professionnels'}
      </h2>
      <p className="text-zinc-400 mb-6 max-w-2xl text-sm">
        Pour pitcher juste : connaître les vraies douleurs business de la cible.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {data.painPoints.map((p, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-3xl font-bold text-violet-400 mb-2">{i + 1}.</div>
            <div className="text-sm text-zinc-200 leading-relaxed">{p}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 10. Block dept-specific (pour pages /[cat]/[dept]) ─
export function DeptContextBlock({ deptData, dept, category }) {
  if (!deptData || !dept) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <MapPin size={22} className="text-violet-400" />
        Le marché {category ? `${category.labelPlural} ` : ''}en {dept.name}
      </h2>
      <p className="text-zinc-400 mb-6 max-w-3xl text-sm leading-relaxed">
        <strong className="text-white">{deptData.economy?.tag || dept.name}</strong> — {deptData.economy?.comment}
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Profil du territoire
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Population</dt>
              <dd className="text-zinc-200 font-medium tabular-nums">{deptData.population}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Densité</dt>
              <dd className="text-zinc-200 font-medium text-right max-w-[60%]">{deptData.density}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Top villes</dt>
              <dd className="text-zinc-200 font-medium text-right max-w-[60%]">{deptData.topCities?.join(', ')}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
            Secteurs phares
          </div>
          <ul className="space-y-1.5">
            {deptData.keySectors?.map((s, i) => (
              <li key={i} className="text-sm text-zinc-200 flex items-center gap-2">
                <ArrowRight size={11} className="text-violet-400 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {deptData.notableCompanies?.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 size={11} />
            Entreprises emblématiques du territoire
          </div>
          <div className="flex flex-wrap gap-2">
            {deptData.notableCompanies.map((c, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-200">
                {c}
              </span>
            ))}
          </div>
          {deptData.economicNote && (
            <p className="text-xs text-zinc-400 leading-relaxed mt-3">{deptData.economicNote}</p>
          )}
        </div>
      )}

      {deptData.prospectingTip && (
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={11} />
            Conseil de prospection local
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{deptData.prospectingTip}</p>
        </div>
      )}
    </section>
  );
}

// ─── 11. Block region-specific (pour pages /region/[X]) ─
export function RegionContextBlock({ regionData, region, category }) {
  if (!regionData || !region) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <MapPin size={22} className="text-violet-400" />
        Le marché {category ? `${category.labelPlural} ` : ''}en {region.name}
      </h2>
      <p className="text-zinc-400 mb-6 max-w-3xl text-sm leading-relaxed">
        <strong className="text-white">{regionData.businessClimate?.tag}</strong> — {regionData.businessClimate?.comment}
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Région en chiffres</div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Population</dt>
              <dd className="text-zinc-200 font-medium tabular-nums">{regionData.population}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">PIB</dt>
              <dd className="text-zinc-200 font-medium tabular-nums">{regionData.gdp}{regionData.gdpRank && <span className="text-zinc-500 text-xs ml-1">(#{regionData.gdpRank})</span>}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Métropoles</dt>
              <dd className="text-zinc-200 font-medium text-right max-w-[55%]">{regionData.topMetros?.join(', ')}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Filières d&apos;excellence</div>
          <ul className="space-y-2">
            {regionData.flagshipSectors?.slice(0, 4).map((s, i) => (
              <li key={i} className="text-sm text-zinc-200">
                <strong className="text-violet-300">{s.name}</strong>
                {s.note && <div className="text-xs text-zinc-500 leading-snug mt-0.5">{s.note}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {regionData.flagshipCompanies?.length > 0 && (
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 size={11} />
            Champions régionaux
          </div>
          <div className="flex flex-wrap gap-2">
            {regionData.flagshipCompanies.map((c, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-200">
                {c}
              </span>
            ))}
          </div>
          {regionData.economicHighlight && (
            <p className="text-xs text-zinc-400 leading-relaxed mt-3">{regionData.economicHighlight}</p>
          )}
        </div>
      )}

      {regionData.bestForProspecting && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={11} />
            Conseil de prospection régional
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{regionData.bestForProspecting}</p>
        </div>
      )}
    </section>
  );
}

// ─── 12. Block top regions (pour pages /[cat]) ─────────
export function TopRegionsBlock({ data, category }) {
  if (!data?.topRegions?.length) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <MapPin size={22} className="text-violet-400" />
        Où sont concentrés les {category?.labelPlural || 'professionnels'} en France
      </h2>
      <p className="text-zinc-400 mb-6 max-w-2xl text-sm">
        Les 3 régions où le secteur est le plus dense — bonnes priorités pour démarrer.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {data.topRegions.map((r, i) => (
          <Link
            key={i}
            href={`/prospection/${category?.slug || ''}/region/${r.slug}`}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-violet-500/30 transition"
          >
            <div className="text-3xl font-bold text-violet-400 mb-2 group-hover:text-violet-300 transition">#{i + 1}</div>
            <div className="text-sm text-zinc-200 font-semibold mb-1.5 capitalize group-hover:text-white transition">
              {r.slug.replace(/-/g, ' ')}
            </div>
            <div className="text-xs text-zinc-500 leading-relaxed">{r.reason}</div>
            <div className="mt-3 text-xs text-violet-400 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              Voir le détail
              <ArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
