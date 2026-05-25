import Link from 'next/link';
import { Search, MapPin, ArrowRight, Globe, Palmtree } from 'lucide-react';
import { getAllCategories, getAllDepartments, getAllRegions } from '@/lib/slugs';
import { B2B_GROUPS } from '@/lib/constants';
import { LogoIcon } from '@/components/ui';

export const metadata = {
  title: 'Prospection B2B France — 150 secteurs × 101 départements',
  description: 'Trouvez les emails B2B de toutes les entreprises françaises par secteur d\'activité et département. Restaurants, hôtels, avocats, garages, commerces — 15 000+ pages de prospection disponibles.',
  alternates: {
    canonical: 'https://volia.fr/prospection',
    languages: {
      'fr-FR': 'https://volia.fr/prospection',
      'fr-BE': 'https://volia.fr/prospection-be',
      'fr-CH': 'https://volia.fr/prospection-ch',
      'x-default': 'https://volia.fr/prospection',
    },
  },
  openGraph: {
    title: 'Prospection B2B France — Toutes catégories et départements',
    description: 'Trouvez les emails B2B de n\'importe quelle entreprise française. 150 secteurs × 101 départements.',
    url: 'https://volia.fr/prospection',
  },
};

export default function ProspectionIndexPage() {
  const categories = getAllCategories();
  const departments = getAllDepartments();
  const regions = getAllRegions();
  const groupedCategories = B2B_GROUPS;

  // Regroupe les départements par région (métropole + Outre-mer séparés)
  const metropolitanRegions = regions.filter((r) => r.key !== 'om');
  const overseasRegion = regions.find((r) => r.key === 'om');

  // Helper : retourne les départements (objets complets) d'une région
  const deptsInRegion = (region) =>
    departments.filter((d) => region.depts.includes(d.code));

  return (
    <div className="dark min-h-screen bg-surface-base text-content-primary overflow-hidden">
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
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <Search size={12} />
            Prospection B2B France
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Trouvez les emails B2B de toutes les entreprises françaises
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-3xl">
            Volia couvre <strong className="text-content-primary">150 secteurs d&apos;activité</strong> dans les <strong className="text-content-primary">101 départements français</strong>. Explorez par catégorie ou par département pour trouver les emails professionnels de vos prospects.
          </p>
        </section>

        {/* Categories grouped */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Explorer par secteur d&apos;activité</h2>
          <div className="space-y-8">
            {Object.entries(groupedCategories).map(([group, cats]) => {
              const groupCats = categories.filter((c) => c.group === group);
              if (groupCats.length === 0) return null;
              return (
                <div key={group}>
                  <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                    {group}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {groupCats.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/prospection/${cat.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-line bg-surface-elevated/40 hover:bg-violet-500/10 hover:border-violet-500/30 text-sm text-content-secondary hover:text-content-primary transition"
                      >
                        <ArrowRight size={12} className="text-violet-400 flex-shrink-0" />
                        <span className="truncate">{cat.labelCapitalized}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Regions hub (raccourci par région — utile pour les recherches type "PACA", "Île-de-France") */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-3">
            <Globe size={24} className="text-violet-400" />
            Explorer par région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {/* On utilise restaurant comme catégorie par défaut car c'est la plus
                recherchée — l'utilisateur peut changer ensuite */}
            {regions.map((r) => (
              <Link
                key={r.slug}
                href={`/prospection/restaurant/region/${r.slug}`}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${
                  r.key === 'om'
                    ? 'border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/15 text-amber-200 hover:text-content-primary'
                    : 'border-line bg-surface-elevated/40 hover:bg-violet-500/10 hover:border-violet-500/30 text-content-secondary hover:text-content-primary'
                }`}
              >
                {r.key === 'om' ? (
                  <Palmtree size={12} className="text-amber-400 flex-shrink-0" />
                ) : (
                  <MapPin size={12} className="text-violet-400 flex-shrink-0" />
                )}
                <span className="truncate">{r.name}</span>
                <span className="ml-auto text-xs text-content-tertiary flex-shrink-0">{r.depts.length}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Departments grouped by region — meilleure UX que la liste plate de 101 */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Explorer par département</h2>

          <div className="space-y-8">
            {/* Métropole : 13 régions */}
            {metropolitanRegions.map((region) => {
              const regionDepts = deptsInRegion(region);
              if (regionDepts.length === 0) return null;
              return (
                <div key={region.slug}>
                  <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={12} />
                    {region.name}
                    <span className="text-content-tertiary font-normal normal-case tracking-normal text-xs">
                      · {regionDepts.length} départements
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {regionDepts.map((dept) => (
                      <Link
                        key={dept.slug}
                        href={`/prospection/dept/${dept.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-line bg-surface-elevated/40 hover:bg-violet-500/10 hover:border-violet-500/30 text-sm text-content-secondary hover:text-content-primary transition"
                      >
                        <span className="text-xs font-mono text-violet-400 flex-shrink-0">{dept.code}</span>
                        <span className="truncate">{dept.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Outre-mer : section dédiée et visuellement distincte */}
            {overseasRegion && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5">
                <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Palmtree size={14} />
                  Outre-mer (DROM)
                  <span className="text-content-tertiary font-normal normal-case tracking-normal text-xs">
                    · {deptsInRegion(overseasRegion).length} territoires
                  </span>
                </h3>
                <p className="text-xs text-content-secondary mb-4 leading-relaxed">
                  Guadeloupe, Martinique, Guyane, La Réunion, Mayotte —
                  marchés B2B souvent ignorés mais avec une concurrence plus faible.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {deptsInRegion(overseasRegion).map((dept) => (
                    <Link
                      key={dept.slug}
                      href={`/prospection/dept/${dept.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] hover:bg-amber-500/15 hover:border-amber-500/40 text-sm text-amber-200 hover:text-content-primary transition"
                    >
                      <span className="text-xs font-mono text-amber-400 flex-shrink-0">{dept.code}</span>
                      <span className="truncate">{dept.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Prêt à prospecter ?</h2>
            <p className="text-content-secondary mb-6">Accédez aux entreprises et leurs emails B2B en quelques clics. Gratuit pour commencer · à partir de 19 €/mois.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              Démarrer gratuitement
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
          </div>
        </div>
      </footer>
    </div>
  );
}
