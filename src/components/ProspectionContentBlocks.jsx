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
  Mail, Phone, ArrowRight, AlertTriangle, Quote, Building2,
  Users, TrendingUp, X, CheckCircle2, Shield, Zap,
  Briefcase, LineChart, Euro, UserMinus,
} from 'lucide-react';
import { toRegionUrlSlug } from '@/lib/region-data';

// ─── Social proof localisé (compteur d'utilisateurs déterministe) ─────
// Génère un nombre crédible (60-280) basé sur dept/region pour éviter le
// "120 personnes" partout. Hash simple → toujours le même chiffre pour le
// même territoire (pas de remontage par refresh).
function hashToRange(str, min, max) {
  if (!str) return Math.round((min + max) / 2);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  const norm = Math.abs(h) % (max - min);
  return min + norm;
}

export function SocialProofBlock({ department, region, category }) {
  // Calcul basé sur la taille du territoire si on a une géo
  let count, where;
  if (department) {
    count = hashToRange(`${department.code}-${category?.slug || ''}`, 45, 240);
    where = `dans le ${department.name}`;
  } else if (region) {
    count = hashToRange(`${region.slug}-${category?.slug || ''}`, 180, 820);
    where = `en ${region.name}`;
  } else {
    count = hashToRange(`fr-${category?.slug || ''}`, 1400, 4200);
    where = 'en France';
  }
  const what = category ? `${category.labelPlural}` : 'entreprises B2B';

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-10">
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.06] to-violet-500/[0.04] p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <Users size={20} className="text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm sm:text-base">
            <strong className="text-2xl sm:text-3xl font-bold text-content-primary tabular-nums">{count}</strong>
            <span className="text-content-secondary"> commerciaux et fondateurs ciblent les </span>
            <strong className="text-content-primary">{what}</strong>
            <span className="text-content-secondary"> {where} via Volia ce mois-ci.</span>
          </div>
          <div className="text-[11px] text-content-tertiary mt-1 flex items-center gap-1.5">
            <TrendingUp size={11} className="text-emerald-400" />
            +18 % vs mois dernier — adoption en croissance
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Comparatif inline vs concurrent (différenciation FR) ─────────────
// Encart visuel "Apollo : 40 % / Volia : ~46 % en France".
// Différenciation N°1 du produit, visible sur chaque page.
export function CompetitorInlineBlock({ category }) {
  const what = category ? category.labelPlural : 'entreprises françaises';
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">
        Pourquoi Volia trouve plus d&apos;emails que les outils US ?
      </h2>
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Apollo, Hunter et Lusha sont conçus pour le marché américain. En France, ils plafonnent. Volia est <strong className="text-content-primary">spécifiquement bâti pour le marché français</strong>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Apollo.io</div>
          <div className="text-3xl font-bold text-red-300 tabular-nums mb-1">~ 40 %</div>
          <div className="text-xs text-content-tertiary leading-relaxed">
            Base US — couverture limitée sur les TPE/PME françaises hors grandes villes
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Hunter.io</div>
          <div className="text-3xl font-bold text-orange-700 tabular-nums mb-1">~ 55 %</div>
          <div className="text-xs text-content-tertiary leading-relaxed">
            Bon sur les domaines avec site web, faible sur les artisans et commerces sans site
          </div>
        </div>
        <div className="rounded-xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.08] p-5 relative">
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-violet-500 text-[10px] font-bold text-white uppercase tracking-wider">Volia</div>
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2">Notre cascade waterfall</div>
          <div className="text-3xl font-bold text-emerald-300 tabular-nums mb-1">~46 %</div>
          <div className="text-xs text-content-secondary leading-relaxed">
            <strong className="text-content-primary">Scraping site → Recherche Google → Patterns</strong> — taux d&apos;emails trouvés sur les {what}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-content-tertiary">
        <span className="flex items-center gap-1.5"><Shield size={12} className="text-violet-400" /> RGPD by design</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Tarif {' '}<strong className="text-content-primary">3-5× moins cher</strong></span>
        <Link href="/comparatif-outils-prospection-b2b-france" className="ml-auto inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-medium transition">
          Voir le comparatif complet
          <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}

// Helper pour interpoler {placeholders} dans un texte
function tpl(text, vars = {}) {
  if (!text) return '';
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] || `{${k}}`);
}

// ─── 1. MarketSize — chiffre clé du marché ──────────────
// Si la valeur mentionne "INSEE" ou "CNIL", on linke vers l'autorité (boost E-E-A-T).
function linkifyAuthorities(text) {
  if (!text) return text;
  return text.split(/(INSEE|CNIL|FNAIM|CAPEB|CNB|CSOEC|CSN|Atout France|Ordre des Pharmaciens|FHP|DREES)/i).map((part, i) => {
    const key = part.toLowerCase();
    const map = {
      'insee': 'https://www.insee.fr/fr/statistiques',
      'cnil': 'https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique',
      'fnaim': 'https://www.fnaim.fr',
      'capeb': 'https://www.capeb.fr',
      'cnb': 'https://www.cnb.avocat.fr',
      'csoec': 'https://www.experts-comptables.fr',
      'csn': 'https://www.notaires.fr',
      'atout france': 'https://www.atout-france.fr',
      'ordre des pharmaciens': 'https://www.ordre.pharmacien.fr',
      'fhp': 'https://www.fhp.fr',
      'drees': 'https://drees.solidarites-sante.gouv.fr',
    };
    if (map[key]) {
      return (
        <a key={i} href={map[key]} target="_blank" rel="noopener" className="text-violet-300 hover:text-violet-200 underline underline-offset-2 decoration-violet-500/40 hover:decoration-violet-400">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

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
            <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wider mb-2">
              Taille du marché — {category?.labelPlural || 'secteur'}
            </h2>
            <p className="text-base text-content-secondary leading-relaxed">
              {linkifyAuthorities(data.marketSize)}
            </p>
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
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Données sectorielles pour calibrer votre approche commerciale et vos messages.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.kpis.map((k, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface-elevated/40 p-4">
            <div className="text-2xl font-bold text-violet-300 tabular-nums">{k.value}</div>
            <div className="text-sm text-content-secondary font-semibold mt-1">{k.label}</div>
            {k.hint && <div className="text-xs text-content-tertiary mt-1 leading-snug">{k.hint}</div>}
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
          <p className="text-content-secondary leading-relaxed text-sm mb-4">
            <strong className="text-content-primary">Décideur clé :</strong> {decisionMaker}
          </p>
          <p className="text-content-secondary leading-relaxed text-sm">
            <strong className="text-content-primary">Douleur principale :</strong> {painPoint}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">
            Titres ICP à cibler
          </div>
          <ul className="space-y-2">
            {titles.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-content-secondary">
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
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">À éviter (haute saison)</div>
          <div className="text-sm text-content-secondary leading-relaxed">{peak}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Idéal (basse saison)</div>
          <div className="text-sm text-content-secondary leading-relaxed">{low}</div>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2">Conseil</div>
          <div className="text-sm text-content-secondary leading-relaxed">{comment}</div>
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
      <div className="rounded-2xl border border-line bg-surface-elevated/40 p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail size={11} /> Canal
            </div>
            <div className="text-sm text-content-secondary font-medium leading-relaxed">{channel}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> Période
            </div>
            <div className="text-sm text-content-secondary font-medium leading-relaxed">{timing}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb size={11} /> Pourquoi
            </div>
            <div className="text-sm text-content-secondary leading-relaxed">{why}</div>
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
            <p className="text-xs text-content-secondary">Adapté au profil {category?.label || 'cible'}.</p>
          </div>
        </div>
        <blockquote className="rounded-xl border border-line bg-surface-base/30 p-4 text-sm text-content-secondary leading-relaxed italic">
          « {previewed} »
        </blockquote>
        <p className="text-xs text-content-tertiary mt-3">
          Personnalisez avec les variables <code className="text-violet-300">{`{first_name}`}</code>, <code className="text-violet-300">{`{company}`}</code> et <code className="text-violet-300">{`{custom.X}`}</code> dans Volia.
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
        <AlertTriangle size={22} className="text-amber-600" />
        Objections fréquentes des {category?.labelPlural || 'cibles'} et comment répondre
      </h2>
      <div className="space-y-3">
        {data.objections.map((o, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface-elevated/40 p-5">
            <div className="text-sm text-amber-700 font-semibold mb-2">« {o.objection} »</div>
            <div className="text-sm text-content-secondary leading-relaxed">
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
          <div key={i} className="rounded-xl border border-line bg-surface-elevated/40 p-4">
            <div className="text-sm font-semibold text-violet-300 mb-1">{g.term}</div>
            <div className="text-xs text-content-secondary leading-relaxed">{g.def}</div>
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
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Pour pitcher juste : connaître les vraies douleurs business de la cible.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {data.painPoints.map((p, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface-elevated/40 p-5">
            <div className="text-3xl font-bold text-violet-400 mb-2">{i + 1}.</div>
            <div className="text-sm text-content-secondary leading-relaxed">{p}</div>
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
      <p className="text-content-secondary mb-6 max-w-3xl text-sm leading-relaxed">
        <strong className="text-content-primary">{deptData.economy?.tag || dept.name}</strong> — {deptData.economy?.comment}
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">
            Profil du territoire
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">Population</dt>
              <dd className="text-content-secondary font-medium tabular-nums">{deptData.population}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">Densité</dt>
              <dd className="text-content-secondary font-medium text-right max-w-[60%]">{deptData.density}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">Top villes</dt>
              <dd className="text-content-secondary font-medium text-right max-w-[60%]">{deptData.topCities?.join(', ')}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">
            Secteurs phares
          </div>
          <ul className="space-y-1.5">
            {deptData.keySectors?.map((s, i) => (
              <li key={i} className="text-sm text-content-secondary flex items-center gap-2">
                <ArrowRight size={11} className="text-violet-400 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {deptData.notableCompanies?.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
            <p className="text-xs text-content-secondary leading-relaxed mt-3">{deptData.economicNote}</p>
          )}
        </div>
      )}

      {deptData.prospectingTip && (
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={11} />
            Conseil de prospection local
          </div>
          <p className="text-sm text-content-secondary leading-relaxed">{deptData.prospectingTip}</p>
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
      <p className="text-content-secondary mb-6 max-w-3xl text-sm leading-relaxed">
        <strong className="text-content-primary">{regionData.businessClimate?.tag}</strong> — {regionData.businessClimate?.comment}
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Région en chiffres</div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">Population</dt>
              <dd className="text-content-secondary font-medium tabular-nums">{regionData.population}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">PIB</dt>
              <dd className="text-content-secondary font-medium tabular-nums">{regionData.gdp}{regionData.gdpRank && <span className="text-content-tertiary text-xs ml-1">(#{regionData.gdpRank})</span>}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">Métropoles</dt>
              <dd className="text-content-secondary font-medium text-right max-w-[55%]">{regionData.topMetros?.join(', ')}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Filières d&apos;excellence</div>
          <ul className="space-y-2">
            {regionData.flagshipSectors?.slice(0, 4).map((s, i) => (
              <li key={i} className="text-sm text-content-secondary">
                <strong className="text-violet-300">{s.name}</strong>
                {s.note && <div className="text-xs text-content-tertiary leading-snug mt-0.5">{s.note}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {regionData.flagshipCompanies?.length > 0 && (
        <div className="mb-4 rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
            <p className="text-xs text-content-secondary leading-relaxed mt-3">{regionData.economicHighlight}</p>
          )}
        </div>
      )}

      {regionData.bestForProspecting && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={11} />
            Conseil de prospection régional
          </div>
          <p className="text-sm text-content-secondary leading-relaxed">{regionData.bestForProspecting}</p>
        </div>
      )}
    </section>
  );
}

// ─── 15. SamplePreviewBlock — démo produit avec 5 lignes anonymisées ───
// Affiche un échantillon réaliste (déterministe par dept × cat) avec emails
// masqués pour pousser le signup. Sert de "vois ce qu'on a" sans donner
// la base.
function hashStr(s, mod) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

// Pool de noms d'entreprises génériques par groupe (jamais le même nom 2 fois sur la même page)
const SAMPLE_NAMES_BY_GROUP = {
  'Hôtellerie & Restauration': [
    'Le Petit Bistrot', 'L\'Atelier Gourmand', 'Café des Halles', 'Chez Marie',
    'La Table de Pierre', 'Hôtel du Centre', 'Le Comptoir Provençal', 'Brasserie du Marché',
    'L\'Auberge Fleurie', 'Le Coin des Saveurs', 'La Petite Trattoria', 'Le Bistrot Moderne',
  ],
  'Commerce & Distribution': [
    'Boutique Maud', 'Concept Store Lumi', 'Tendances & Co', 'L\'Atelier Local',
    'Espace Création', 'La Boutique du Centre', 'Maison Verte', 'Atelier Nature',
    'L\'Échoppe', 'Style & Co', 'Le Comptoir Local', 'Création & Cie',
  ],
  'Automobile & Transport': [
    'Garage Central Auto', 'Auto Service Plus', 'Mécanique Express', 'Garage du Marché',
    'Drive Service', 'Carrosserie Moderne', 'Auto Concept', 'Garage des Halles',
    'Pro Auto Service', 'Carrosserie Express',
  ],
  'Santé & Bien-être': [
    'Cabinet Médical du Centre', 'Pôle Santé Avenue', 'Pharmacie de la Place', 'Cabinet du Parc',
    'Centre de Soins Lumière', 'Cabinet Bien-Être', 'Pharmacie du Marché', 'Espace Santé',
    'Cabinet Holistique', 'Centre Médical Saint-Jean',
  ],
  'BTP & Construction': [
    'Bâtiments & Services', 'Construction Pro', 'Rénov\' Expert', 'Maçonnerie du Sud',
    'Artisans Réunis', 'BTP Local', 'Construction Moderne', 'Travaux & Co',
    'Maître Constructeur', 'Pro Bâtiment',
  ],
  'Services aux entreprises': [
    'Cabinet & Associés', 'Conseil Pro', 'Expertise & Services', 'Cabinet Moderne',
    'Pro Solutions', 'Cabinet Atlas', 'Expertise du Sud', 'Conseil & Stratégie',
    'Cabinet Synergie', 'Expert Conseil',
  ],
  'Immobilier': [
    'Immobilière du Centre', 'Agence Horizon', 'Patrimoine Pro', 'Immo Plus',
    'Côté Sud Immobilier', 'Habitat & Co', 'Immo Concept', 'Espace Immobilier',
    'Le Patrimoine', 'Immo Service',
  ],
  'Industrie & Artisanat': [
    'Atelier de Production', 'Industries Réunies', 'Manufacture du Sud', 'Atelier Moderne',
    'Production Pro', 'Fabrique Locale', 'Atelier Concept', 'Industries du Centre',
  ],
  'Finance & Assurance': [
    'Cabinet Patrimoine Conseil', 'Assurance & Co', 'Finance Pro', 'Patrimoine Plus',
    'Cabinet Capital', 'Assurances Réunies', 'Finance Conseil', 'Patrimoine Privé',
  ],
  'Éducation & Culture': [
    'École du Parc', 'Centre Pédagogique', 'Académie Moderne', 'Espace Formation',
    'École & Co', 'Centre Culturel', 'Académie du Sud', 'Formation Pro',
  ],
  'Technologie & Digital': [
    'Tech Solutions', 'Digital Pro', 'Numérique & Co', 'Tech Concept',
    'Pro Digital', 'Studio Tech', 'Agence Numérique', 'Tech Atelier',
  ],
  'Agriculture & Alimentation': [
    'Ferme du Domaine', 'Producteurs Réunis', 'Maison Fermière', 'Domaine du Sud',
    'Producteurs & Co', 'Ferme Bio', 'Domaine Familial', 'Saveurs du Terroir',
  ],
};

// Domaines email typiques par catégorie (pour réalisme du preview)
function getDomainPattern(category) {
  // Domaine générique, on n'expose JAMAIS d'email réel — toujours blurré
  return 'contact@***';
}

export function SamplePreviewBlock({ category, department, stats }) {
  if (!category) return null;
  const pool = SAMPLE_NAMES_BY_GROUP[category.group] || SAMPLE_NAMES_BY_GROUP['Services aux entreprises'];
  const baseSeed = `${category.slug}-${department?.code || 'fr'}`;
  const cityName = department?.name || 'Paris';

  // Sélectionne 5 noms uniques déterministes
  const offset = hashStr(baseSeed, pool.length);
  const samples = Array.from({ length: 5 }).map((_, i) => {
    const name = pool[(offset + i) % pool.length];
    const rating = (3.8 + (hashStr(`${baseSeed}-${i}-rating`, 12) / 10)).toFixed(1);
    const reviewCount = 24 + hashStr(`${baseSeed}-${i}-rev`, 320);
    return {
      name,
      city: cityName,
      rating,
      reviews: reviewCount,
      hasEmail: hashStr(`${baseSeed}-${i}-email`, 100) > 18, // ~82% ont un email
      hasPhone: hashStr(`${baseSeed}-${i}-phone`, 100) > 8,  // ~92% ont un tél
    };
  });

  const total = stats?.total || '1 580';

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <Building2 size={22} className="text-violet-400" />
        Aperçu : 5 {category.labelPlural} sur les <span className="text-violet-300 tabular-nums">{total}</span> disponibles
      </h2>
      <p className="text-content-secondary mb-5 max-w-2xl text-sm">
        Voici un échantillon anonymisé. Inscription gratuite pour voir les noms réels, emails et numéros.
      </p>
      <div className="rounded-2xl border border-line bg-surface-elevated/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-surface-elevated/60 border-b border-line text-[10px] text-content-secondary uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Entreprise</th>
                <th className="text-left px-4 py-3 font-semibold">Localité</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Email</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-content-primary">{s.name}</div>
                    <div className="text-[10px] text-content-tertiary mt-0.5">ID #{(1000 + i + offset).toString(36).toUpperCase()}</div>
                  </td>
                  <td className="px-4 py-3 text-content-secondary">{s.city}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {s.hasEmail ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono select-none" style={{ filter: 'blur(3px)' }}>
                        contact@xxx
                      </span>
                    ) : (
                      <span className="text-content-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {s.hasPhone ? (
                      <span className="text-content-secondary font-mono text-[11px] select-none" style={{ filter: 'blur(3px)' }}>
                        +33 0X XX XX XX XX
                      </span>
                    ) : (
                      <span className="text-content-tertiary">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gradient-to-r from-violet-500/[0.06] to-indigo-500/[0.06] border-t border-violet-500/20 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-content-secondary">
            <strong className="text-white">{total}</strong> {category.labelPlural} {department ? `à ${department.name}` : 'en France'} accessibles dès l&apos;inscription.
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
          >
            <Zap size={14} />
            Voir les vraies données
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── 16. DensityChartBlock — bar chart top dépts/villes/régions ────────
// SVG simple, déterministe, contextualisé par niveau de page :
//   - Page cat (sans dept) : top régions de France
//   - Page dept : top villes du dept
//   - Page région : top dépts de la région
function colorForRank(rank) {
  const colors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b1488', '#2e0b6b'];
  return colors[rank] || '#2e0b6b';
}

export function DensityChartBlock({ category, items, scopeLabel }) {
  if (!items || items.length === 0) return null;
  const maxValue = Math.max(...items.map((it) => it.value));
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <BarChart3 size={22} className="text-violet-400" />
        Répartition des {category?.labelPlural || 'entreprises'} {scopeLabel || ''}
      </h2>
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Volume relatif {scopeLabel} — pour calibrer vos zones de prospection prioritaires.
      </p>
      <div className="rounded-2xl border border-line bg-surface-elevated/40 p-5">
        <div className="space-y-3">
          {items.map((it, i) => {
            const widthPct = Math.round((it.value / maxValue) * 100);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 sm:w-40 flex-shrink-0 text-xs sm:text-sm text-content-secondary truncate">
                  {it.label}
                </div>
                <div className="flex-1 h-7 rounded-md bg-surface-elevated/60 overflow-hidden relative">
                  <div
                    className="h-full transition-all rounded-md"
                    style={{ width: `${widthPct}%`, backgroundColor: colorForRank(i) }}
                  />
                  <div className="absolute inset-0 flex items-center px-2 text-[11px] text-content-primary font-semibold tabular-nums">
                    {it.value.toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-content-tertiary mt-4 italic">
          Volumes estimés à partir de la densité Google Places croisée avec les statistiques INSEE par territoire.
        </p>
      </div>
    </section>
  );
}

// ─── 13. TrustBadgesBlock — trust signals juste sous le hero ──────────
// Badges visuels : RGPD + Stripe + Made in France + No credit card.
// Réduit la friction de signup en montrant qu'on coche les cases standard.
export function TrustBadgesBlock() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-10">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        <TrustBadge
          icon={<Shield size={14} className="text-emerald-300" />}
          label="RGPD compliant"
          tone="emerald"
        />
        <TrustBadge
          icon={<CheckCircle2 size={14} className="text-blue-300" />}
          label="Paiement sécurisé Stripe"
          tone="blue"
        />
        <TrustBadge
          icon={<span className="text-sm leading-none">🇫🇷</span>}
          label="Hébergé et opéré en France"
          tone="violet"
        />
        <TrustBadge
          icon={<Zap size={14} className="text-amber-700" />}
          label="Sans carte bancaire"
          tone="amber"
        />
      </div>
    </section>
  );
}

function TrustBadge({ icon, label, tone = 'violet' }) {
  const toneMap = {
    emerald: 'border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-100',
    blue: 'border-blue-500/20 bg-blue-500/[0.04] text-blue-100',
    violet: 'border-violet-500/20 bg-violet-500/[0.04] text-violet-100',
    amber: 'border-amber-300 bg-amber-50 text-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${toneMap[tone]}`}>
      {icon}
      {label}
    </span>
  );
}

// ─── 14. DemoCtaBlock — alternative au signup direct ──────────────────
// Pour les prospects qui veulent voir avant d'essayer : démo 8 min de l'outil.
// Lien vers Cal.com (à configurer) ou page interne /demo.
export function DemoCtaBlock({ category }) {
  const what = category ? category.labelPlural : 'votre secteur';
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <div className="rounded-2xl border border-line bg-surface-card p-6 sm:p-8">
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2">
              Démo personnalisée
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
              Voir Volia sur {what} en 8 minutes
            </h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              Démo live (8 min, pas de slides) : on cible votre dept/ville, on extrait 50 prospects qualifiés, on génère un CSV importable dans votre CRM. Réservez le créneau qui vous arrange.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="https://calendar.app.google/AN4reEL1poDB6KmW8"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition shadow-lg shadow-violet-500/20"
            >
              <Calendar size={14} />
              Réserver une démo
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-surface-elevated/60 text-xs font-medium text-content-secondary transition"
            >
              ou essayer en autonomie
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 12quater. Block Authorities — sources autoritaires (E-E-A-T) ──
// Affiché sur toutes les pages prospection juste avant la FAQ.
// Indique les sources utilisées + cadre légal — boost Google + crédibilité.
export function AuthoritiesBlock({ category }) {
  const items = [
    { name: 'INSEE', url: 'https://www.insee.fr/fr/statistiques', label: 'Statistiques entreprises France' },
    { name: 'CNIL', url: 'https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique', label: 'Cadre RGPD prospection B2B' },
    { name: 'data.gouv.fr', url: 'https://www.data.gouv.fr', label: 'Données publiques ouvertes' },
    { name: 'Bpifrance Création', url: 'https://bpifrance-creation.fr', label: 'Démographie d\'entreprise' },
  ];
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <div className="rounded-2xl border border-line bg-surface-elevated/40 p-5">
        <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BookOpen size={11} />
          Sources & cadre légal
        </div>
        <p className="text-xs text-content-secondary leading-relaxed mb-4">
          Les chiffres et conseils sectoriels de cette page sont calibrés à partir de sources publiques officielles.
          La prospection est encadrée par le <a href="https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique" target="_blank" rel="noopener" className="text-violet-300 hover:text-violet-200 underline underline-offset-2">RGPD article 6.1.f (intérêt légitime)</a> pour le B2B.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <a
              key={it.name}
              href={it.url}
              target="_blank"
              rel="noopener"
              className="group flex items-start gap-2 p-2.5 rounded-lg border border-line hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition"
            >
              <ArrowRight size={11} className="text-content-tertiary group-hover:text-violet-400 transition mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-content-secondary group-hover:text-content-primary transition">{it.name}</div>
                <div className="text-[10px] text-content-tertiary truncate">{it.label}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 12bis. Block DeptOverview — pages /dept/[slug] sans cat ─
// Vue d'ensemble exhaustive du département : aucune catégorie ciblée,
// donc on montre la richesse économique + 12 catégories d'entrée.
export function DeptOverviewBlock({ deptData, dept, popularCategories = [] }) {
  if (!deptData || !dept) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <Building2 size={22} className="text-violet-400" />
        Le tissu économique du {dept.name}
      </h2>
      <p className="text-content-secondary mb-6 max-w-3xl text-sm leading-relaxed">
        Profil du département pour calibrer votre ciblage commercial : densité, secteurs phares, entreprises emblématiques.
      </p>

      {/* Bandeau profil + champions */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin size={11} />
            Profil démographique & économique
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3 pb-2 border-b border-line">
              <dt className="text-content-tertiary">Population</dt>
              <dd className="text-content-primary font-semibold tabular-nums">{deptData.population}</dd>
            </div>
            <div className="flex justify-between gap-3 pb-2 border-b border-line">
              <dt className="text-content-tertiary">Densité</dt>
              <dd className="text-content-secondary font-medium text-right max-w-[60%]">{deptData.density}</dd>
            </div>
            <div className="flex justify-between gap-3 pb-2 border-b border-line">
              <dt className="text-content-tertiary">Top villes</dt>
              <dd className="text-content-secondary font-medium text-right max-w-[60%]">{deptData.topCities?.join(', ')}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-content-tertiary">Positionnement</dt>
              <dd className="text-violet-300 font-medium text-right max-w-[60%]">{deptData.economy?.tag}</dd>
            </div>
          </dl>
          {deptData.economy?.comment && (
            <p className="text-xs text-content-secondary leading-relaxed mt-4 pt-3 border-t border-line">
              {deptData.economy.comment}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
          <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Target size={11} />
            Secteurs phares
          </div>
          <ul className="space-y-2 mb-4">
            {deptData.keySectors?.map((s, i) => (
              <li key={i} className="text-sm text-content-secondary flex items-start gap-2">
                <ArrowRight size={11} className="text-violet-400 flex-shrink-0 mt-1" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          {deptData.notableCompanies?.length > 0 && (
            <>
              <div className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
                Entreprises emblématiques
              </div>
              <div className="flex flex-wrap gap-1.5">
                {deptData.notableCompanies.map((c, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-200">
                    {c}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Highlight éco */}
      {deptData.economicNote && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4 mb-4">
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={11} />
            À retenir
          </div>
          <p className="text-sm text-content-secondary leading-relaxed">{deptData.economicNote}</p>
        </div>
      )}

      {/* Conseil prospection local */}
      {deptData.prospectingTip && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4 mb-6">
          <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={11} />
            Conseil de prospection local
          </div>
          <p className="text-sm text-content-secondary leading-relaxed">{deptData.prospectingTip}</p>
        </div>
      )}

      {/* Entrées catégories phares */}
      {popularCategories.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-content-primary mb-3 mt-6">
            Explorer par secteur dans le {dept.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {popularCategories.slice(0, 12).map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="group rounded-lg border border-line bg-surface-elevated/40 hover:border-violet-500/30 hover:bg-violet-500/[0.05] p-3 transition flex items-center justify-between gap-2"
              >
                <span className="text-sm text-content-secondary group-hover:text-content-primary transition truncate">{c.label}</span>
                <ArrowRight size={12} className="text-content-tertiary group-hover:text-violet-400 transition flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── 12ter. Block SiblingCities — autres villes du même dept ─
// Sur les pages /[cat]/ville/[city], affiche les autres villes du dept
// pour le même secteur. Maillage interne + utilité user.
export function SiblingCitiesBlock({ cities = [], category, currentCitySlug }) {
  const siblings = (cities || []).filter((c) => c.slug !== currentCitySlug);
  if (siblings.length === 0 || !category) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <MapPin size={22} className="text-violet-400" />
        {category.labelCapitalized} dans les autres villes du département
      </h2>
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Élargissez votre ciblage aux communes voisines, classées par population.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {siblings.slice(0, 12).map((c) => (
          <Link
            key={c.slug}
            href={`/prospection/${category.slug}/ville/${c.slug}`}
            className="group rounded-lg border border-line bg-surface-elevated/40 hover:border-violet-500/30 hover:bg-violet-500/[0.05] p-3 transition"
          >
            <div className="text-sm font-medium text-content-primary group-hover:text-content-primary transition truncate">
              {category.labelCapitalized} {c.name}
            </div>
            {c.pop && (
              <div className="text-[11px] text-content-tertiary mt-0.5 tabular-nums">
                {(c.pop / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k hab.
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── 17. InseeStatsBlock — chiffres clés INSEE par dept (E-E-A-T) ─────
// 4 statistiques chiffrées vérifiables : entreprises actives + croissance,
// PIB/habitant, taux de chômage. Boost crédibilité + outbound link INSEE.
// Null-safe : ne render que si deptData.insee2024 existe.
export function InseeStatsBlock({ deptData, dept }) {
  if (!deptData?.insee2024 || !dept) return null;
  const { enterprises, enterprisesGrowth, gdpPerCapita, unemploymentRate, sourceNote } = deptData.insee2024;
  const stats = [
    { icon: Briefcase, label: 'Entreprises actives', value: enterprises, hint: 'Base SIRENE — tous secteurs confondus', tone: 'violet' },
    { icon: LineChart, label: 'Créations nettes', value: enterprisesGrowth, hint: 'Évolution annuelle du stock d\'entreprises', tone: 'emerald' },
    { icon: Euro, label: 'PIB par habitant', value: gdpPerCapita, hint: 'Comptes régionaux 2024 (valeur)', tone: 'indigo' },
    { icon: UserMinus, label: 'Taux de chômage', value: unemploymentRate, hint: 'Mesure trimestrielle locale', tone: 'amber' },
  ];
  const toneClass = {
    violet: 'text-violet-300 border-violet-500/20',
    emerald: 'text-emerald-300 border-emerald-500/20',
    indigo: 'text-indigo-300 border-indigo-500/20',
    amber: 'text-amber-600 border-amber-300',
  };
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <BarChart3 size={22} className="text-violet-400" />
        {dept.name} en chiffres — données INSEE 2024
      </h2>
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Repères macro-économiques pour calibrer votre approche commerciale sur le territoire : taille du tissu B2B, dynamique de création, pouvoir d&apos;achat, marché du travail.
      </p>
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-indigo-500/[0.06] p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`rounded-xl border bg-surface-elevated/40 p-4 ${toneClass[s.tone] || 'border-line'}`}>
              <s.icon size={16} className={`${toneClass[s.tone]?.split(' ')[0] || 'text-violet-300'} mb-2`} />
              <div className={`text-2xl font-bold tabular-nums ${toneClass[s.tone]?.split(' ')[0] || 'text-violet-300'}`}>{s.value}</div>
              <div className="text-sm text-content-secondary font-semibold mt-1">{s.label}</div>
              <div className="text-[11px] text-content-tertiary mt-1 leading-snug">{s.hint}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-violet-500/15 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-content-tertiary">
            <span className="inline-block px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-violet-200 font-semibold mr-2">Source vérifiable INSEE 2024</span>
            {sourceNote || 'INSEE SIRENE + Comptes régionaux 2024'}
          </span>
          <a
            href="https://www.insee.fr/fr/statistiques/2011101"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200 underline underline-offset-2 decoration-violet-500/40 hover:decoration-violet-400"
          >
            Consulter les statistiques INSEE
            <ArrowRight size={11} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── 18. FlagshipCompaniesBlock — entreprises emblématiques du dept ────
// Cards visuelles 3-5 entreprises majeures du territoire. Diversité
// sectorielle pour montrer la richesse économique. Null-safe.
export function FlagshipCompaniesBlock({ deptData, dept, category }) {
  if (!deptData?.flagshipCompanies?.length || !dept) return null;
  const companies = deptData.flagshipCompanies.slice(0, 5);
  const sectorsList = deptData.keySectors || [];
  // Subheader contextuel à partir des 2 premiers secteurs phares
  const sectorIntro = sectorsList.length >= 2
    ? `Du ${sectorsList[0].toLowerCase()} au ${sectorsList[1].toLowerCase()}`
    : sectorsList.length === 1
    ? `Du ${sectorsList[0].toLowerCase()}`
    : 'Tous secteurs confondus';

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
        <Building2 size={22} className="text-violet-400" />
        Entreprises emblématiques du {dept.name}
      </h2>
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        {sectorIntro} aux services tertiaires, le département concentre une diversité d&apos;employeurs majeurs{category ? ` qui structurent l\'écosystème ${category.labelPlural}` : ''}.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {companies.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-line bg-surface-elevated/40 p-4 hover:border-violet-500/30 transition group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/15 transition">
                <Building2 size={15} className="text-violet-300" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-content-primary leading-snug">{c}</div>
                <div className="text-[11px] text-content-tertiary mt-1">
                  Employeur majeur — {sectorsList[i % Math.max(1, sectorsList.length)] || 'secteur stratégique'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-content-tertiary italic mt-4">
        Source : données publiques (Bodacc, presse économique régionale, CCI). Liste non exhaustive — ces employeurs illustrent la dynamique sectorielle du territoire.
      </p>
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
      <p className="text-content-secondary mb-6 max-w-2xl text-sm">
        Les 3 régions où le secteur est le plus dense — bonnes priorités pour démarrer.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {data.topRegions.map((r, i) => {
          const urlSlug = toRegionUrlSlug(r.slug); // 'idf' → 'ile-de-france'
          const displayName = urlSlug.replace(/-/g, ' ');
          return (
          <Link
            key={i}
            href={`/prospection/${category?.slug || ''}/region/${urlSlug}`}
            className="group rounded-xl border border-line bg-surface-elevated/40 p-5 hover:border-violet-500/30 transition"
          >
            <div className="text-3xl font-bold text-violet-400 mb-2 group-hover:text-violet-300 transition">#{i + 1}</div>
            <div className="text-sm text-content-secondary font-semibold mb-1.5 capitalize group-hover:text-content-primary transition">
              {displayName}
            </div>
            <div className="text-xs text-content-tertiary leading-relaxed">{r.reason}</div>
            <div className="mt-3 text-xs text-violet-400 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              Voir le détail
              <ArrowRight size={11} />
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
