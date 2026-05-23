// Décor de fond pour le dashboard (post-login).
// Plus subtil que AuthBackgroundDecor : on est sur une app productive,
// pas une landing marketing. L'utilisateur passe des heures ici, donc
// pas de gradient agressif qui fatigue l'œil.
//
// Stratégie :
// - 2 blobs gradient indigo/violet TRÈS subtils en dark mode (default)
// - Masqués en light mode (classe .light sur <html>) via [.light_&]:opacity-0
// - Grid pattern à 1.5% d'opacité en dark (texture discrète)
// - Fixed positioning + -z-10 + pointer-events-none : ne bloque jamais
//   l'interaction, ne scrolle pas avec le contenu
//
// L'objectif : ajouter cette "âme premium" qui distingue la landing
// du dashboard plat. Sans être distrayant.
//
// Note : le projet utilise la classe `.light` sur <html> (dark = défaut),
// donc on utilise `[.light_&]:opacity-0` pour masquer en light mode
// (pas `dark:opacity-100` qui ne fonctionnerait pas avec cette config).

export default function DashboardBackgroundDecor() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blobs gradient — visibles en dark (défaut), masqués en light */}
      <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[140px] opacity-100 [.light_&]:opacity-0 transition-opacity" />
      <div className="absolute bottom-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[160px] opacity-100 [.light_&]:opacity-0 transition-opacity" />

      {/* Grid pattern très subtile — visible en dark uniquement */}
      <div
        className="absolute inset-0 opacity-[0.015] [.light_&]:opacity-0 transition-opacity"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}
