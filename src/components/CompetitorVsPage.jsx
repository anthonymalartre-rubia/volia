import Link from 'next/link';
import { Check, X, Zap, ArrowRight, TrendingDown, Award, Shield, Globe, AlertTriangle, LogOut } from 'lucide-react';
import { TestimonialsBlock, ResourceTeaserBlock } from '@/components/MarketingBlocks';
import { LogoIcon } from '@/components/ui';

/**
 * Reusable component for /vs/[competitor] and /alternative/[competitor].
 * Le prop `intent` adapte le hero et ajoute des sections selon le mot-clé cible :
 *  - 'vs'          (défaut)  : intent comparaison neutre ("vs", "ou", "lequel choisir")
 *  - 'alternative' : intent switcher ("alternative à", "remplacer", "équivalent à")
 */
export default function CompetitorVsPage({ competitor, intent = 'vs' }) {
  const isAlternative = intent === 'alternative';
  const savingsPct = Math.max(0, Math.round((competitor.pricing - 19) / competitor.pricing * 100));
  // Comparison criteria — fixed list of features
  const comparison = [
    { feature: 'Prix mensuel', volia: '49€', competitor: `${competitor.pricing}${competitor.pricingUnit}`, voliaWins: true },
    { feature: 'Recherches illimitées', volia: true, competitor: false, voliaWins: true },
    { feature: 'Pas de crédits cachés', volia: true, competitor: false, voliaWins: true },
    { feature: 'Couverture PME françaises', volia: '85%', competitor: '30%', voliaWins: true },
    { feature: 'Google Places intégré', volia: true, competitor: false, voliaWins: true },
    { feature: 'Scraping intelligent', volia: true, competitor: competitor.slug === 'snov', voliaWins: competitor.slug !== 'snov' },
    { feature: 'Recherche par catégorie & département', volia: true, competitor: false, voliaWins: true },
    { feature: 'Découverte automatique de domaine', volia: true, competitor: false, voliaWins: true },
    { feature: 'Scoring de confiance IA', volia: true, competitor: competitor.slug === 'apollo', voliaWins: competitor.slug !== 'apollo' },
    { feature: 'Vérification SMTP (MillionVerifier)', volia: true, competitor: true, voliaWins: null },
    { feature: 'Export CSV illimité', volia: true, competitor: competitor.slug === 'snov', voliaWins: competitor.slug !== 'snov' },
    { feature: 'Interface 100% en français', volia: true, competitor: false, voliaWins: true },
    { feature: 'Conforme RGPD (opt-out auto)', volia: true, competitor: false, voliaWins: true },
    { feature: 'Support client français', volia: true, competitor: false, voliaWins: true },
  ];

  return (
    <div className="min-h-screen bg-surface-base text-content-primary overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface-base/70 backdrop-blur-2xl border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <LogoIcon size="sm" className="mr-1.5" />
            <span className="text-lg font-bold tracking-tight">Volia</span>
            <span className="text-violet-400 text-xs font-semibold">.fr</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-content-secondary hover:text-content-primary transition">Se connecter</Link>
            <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition">
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        {/* Hero — différencié selon intent */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            {isAlternative ? <LogOut size={12} /> : <Award size={12} />}
            {isAlternative ? `Alternative à ${competitor.name}` : 'Comparatif 2026'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
            {isAlternative
              ? `${competitor.name} c'est cher. Volia c'est moins cher.`
              : `Volia vs ${competitor.name} : lequel choisir ?`}
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-3xl mx-auto mb-8">
            {isAlternative ? (
              <>
                Tu utilises {competitor.name} et tu trouves que <strong className="text-content-primary">ça coûte cher pour trop peu d&apos;emails français</strong> ?
                Volia : 19€/mois ({savingsPct}% moins cher), cascade waterfall qui trouve 70-85% des emails FR (vs 30-40% chez {competitor.name}), RGPD natif.
                Tu te poses encore la question ?
              </>
            ) : (
              <>
                {competitor.description} <strong className="text-content-primary">Volia, c&apos;est l&apos;alternative française</strong> :
                19€/mois (le moins cher du marché FR), scraping intelligent + Google Places, et 2× plus d&apos;emails PME françaises.
              </>
            )}
          </p>

          {/* Quick verdict */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/30 text-sm">
            <TrendingDown size={16} className="text-green-400" />
            <span className="text-content-secondary">
              <strong className="text-green-400">Tu économises jusqu&apos;à {savingsPct}%</strong> en {isAlternative ? `switchant de ${competitor.name} vers` : 'passant à'} Volia
            </span>
          </div>
        </section>

        {/* Section "Pourquoi switcher" — uniquement sur intent alternative */}
        {isAlternative && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
              <AlertTriangle size={22} className="text-amber-600" />
              Pourquoi tout le monde quitte {competitor.name} en 2026
            </h2>
            <p className="text-sm text-content-secondary mb-6 max-w-2xl">
              Les 4 raisons qu&apos;on entend tous les jours en démo. Honnêtement.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <SwitchReason
                num="1"
                title={`Couverture FR à 30-40% chez ${competitor.name}`}
                desc={`${competitor.name} est conçu pour le marché US. Sur les TPE/PME françaises, leur taux de couverture email plafonne à 30-40%. Volia monte à 70-85% sur le même périmètre. C'est un fait, pas un argument.`}
              />
              <SwitchReason
                num="2"
                title={`${savingsPct}% moins cher. Tu fais le calcul.`}
                desc={`${competitor.name} = ${competitor.pricing}${competitor.pricingUnit}. Volia = 19€/mois (Solo), 49€ (Pro), 99€ (Business). Tous les plans, tous les pays inclus. Pas de "contact sales".`}
              />
              <SwitchReason
                num="3"
                title="RGPD natif, pas RGPD bricolé"
                desc={`${competitor.name} a rajouté le RGPD après coup, parce qu'il fallait bien. Volia filtre auto les emails personnels, opt-out 1 clic, webhook STOP intégré. Construit RGPD dès le jour 1.`}
              />
              <SwitchReason
                num="4"
                title="Zéro crédit caché"
                desc={`Sur ${competitor.name}, tu paies par crédit consommé. Et ils s'épuisent vite. Tu reçois un mail "upgrade" à J+10. Sur Volia : 1 quota mensuel clair, pas de surcharge surprise. Ce que tu vois, c'est ce que tu paies.`}
              />
            </div>
          </section>
        )}

        {/* Comparison table */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Le comparatif honnête, ligne par ligne
          </h2>
          <div className="rounded-2xl border border-line bg-surface-elevated/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-surface-elevated/40">
                    <th className="text-left p-4 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Critère</th>
                    <th className="text-center p-4 text-sm font-bold text-violet-400">Volia</th>
                    <th className="text-center p-4 text-sm font-bold text-content-secondary">{competitor.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="p-4 text-sm text-content-secondary">{row.feature}</td>
                      <td className="p-4 text-center text-sm">
                        {row.volia === true ? (
                          <Check size={18} className="text-green-400 mx-auto" />
                        ) : row.volia === false ? (
                          <X size={18} className="text-red-400 mx-auto" />
                        ) : (
                          <span className={`font-semibold ${row.voliaWins ? 'text-green-400' : 'text-content-secondary'}`}>
                            {row.volia}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center text-sm">
                        {row.competitor === true ? (
                          <Check size={18} className="text-content-tertiary mx-auto" />
                        ) : row.competitor === false ? (
                          <X size={18} className="text-red-400 mx-auto" />
                        ) : (
                          <span className="text-content-secondary">{row.competitor}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Strengths/Weaknesses competitor */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">
            {competitor.name} : ce qui marche, ce qui coince
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-green-500/20 bg-green-500/[0.03] p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Check size={18} /> Ce qui marche
              </h3>
              <ul className="space-y-2">
                {competitor.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-content-secondary flex items-start gap-2">
                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <X size={18} /> Ce qui coince
              </h3>
              <ul className="space-y-2">
                {competitor.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-content-secondary flex items-start gap-2">
                    <X size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why Volia is better */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">
            Pourquoi Volia plutôt que {competitor.name} ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-line bg-surface-elevated/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <TrendingDown size={18} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Jusqu&apos;à {Math.max(0, Math.round((competitor.pricing - 19) / competitor.pricing * 100))}% moins cher
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Volia = 19€/mois (Solo, 1 000 prospects + 400 enrichissements). {competitor.name} = {competitor.pricing}{competitor.pricingUnit} avec des crédits qui s&apos;épuisent. Tu fais le calcul.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface-elevated/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Globe size={18} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Meilleur sur la France</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                {competitor.name} est fait pour les USA. Nous, on combine scraping de sites FR + Google Places + recherche Google pour 85% de couverture. C&apos;est notre métier, pas un bonus.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface-elevated/40 p-6">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Shield size={18} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">RGPD natif</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Opt-out automatique, filtre des emails personnels, page publique d&apos;opposition. Construit RGPD dès le jour 1. {competitor.name} est un outil US — la config RGPD, c&apos;est ton problème.
              </p>
            </div>
          </div>
        </section>

        {/* When to use which */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">
            Lequel choisir, selon ton profil
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
              <h3 className="font-semibold text-violet-400 mb-2">Choisis Volia si :</h3>
              <ul className="space-y-1 text-sm text-content-secondary">
                <li>• Tu prospectes en France (PME, commerces locaux, artisans)</li>
                <li>• Tu veux un prix fixe sans crédits cachés ni surprise en fin de mois</li>
                <li>• T&apos;as besoin de chercher par catégorie + département</li>
                <li>• Tu veux une interface française et un support qui répond en français</li>
                <li>• Tu veux un export CSV sans limite, compatible avec n&apos;importe quel CRM</li>
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-500/20 bg-zinc-500/[0.04] p-5">
              <h3 className="font-semibold text-content-secondary mb-2">Choisis {competitor.name} si :</h3>
              <ul className="space-y-1 text-sm text-content-secondary">
                <li>• {competitor.bestFor}</li>
                <li>• Tu prospectes majoritairement aux USA/UK</li>
                <li>• T&apos;as besoin d&apos;intégrations Salesforce/HubSpot avancées et un budget en proportion</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Lead magnet : guide de migration depuis le concurrent */}
        <ResourceTeaserBlock
          title={`Guide migration : passer de ${competitor.name} à Volia, sans perdre tes campagnes`}
          subtitle="20 templates cold email + checklist warmup domaine. Tu reprends tes envois en 24h sans perte de délivrabilité. PDF 30 pages, gratuit."
          resourceSlug="templates-cold-email-b2b-fr"
          cta="Je récupère le guide"
        />

        {/* Témoignages de migration (réutilise le pool, focus B2B) */}
        <TestimonialsBlock
          limit={3}
          title={`Ils ont quitté ${competitor.name} pour Volia. Voilà pourquoi.`}
          subtitle="Commerciaux et fondateurs B2B qui ont fait le switch. Témoignages bruts, pas filtrés."
        />

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              Teste Volia. Compare. Tu décides.
            </h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              Plan Starter gratuit à vie. Pas de carte bancaire. Tu compares toi-même les résultats avec {competitor.name}.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              <Zap size={16} />
              Je démarre
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-content-tertiary">© 2026 Volia.fr</div>
          <div className="flex gap-4 text-xs text-content-tertiary">
            <Link href="/cgu" className="hover:text-content-secondary transition">CGU</Link>
            <Link href="/confidentialite" className="hover:text-content-secondary transition">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-content-secondary transition">RGPD</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SwitchReason({ num, title, desc }) {
  return (
    <div className="rounded-xl border border-line bg-surface-elevated/40 p-5">
      <div className="text-3xl font-bold text-amber-600 mb-2">{num}.</div>
      <h3 className="text-base font-semibold text-content-primary mb-2 leading-tight">{title}</h3>
      <p className="text-sm text-content-secondary leading-relaxed">{desc}</p>
    </div>
  );
}
