// Helpers fuseau horaire — les utilisateurs Volia sont français, mais les
// serveurs (Vercel/Supabase) tournent en UTC. "Aujourd'hui" doit donc être
// calculé sur Europe/Paris, pas sur le jour UTC (décalage 1-2h selon saison).

/**
 * Décalage actuel Paris vs UTC en millisecondes (gère été/hiver).
 */
function parisOffsetMs(now = new Date()) {
  // toLocaleString('sv-SE') donne un format ISO-like parsable localement.
  const parisWallClock = new Date(now.toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }));
  const utcWallClock = new Date(now.toLocaleString('sv-SE', { timeZone: 'UTC' }));
  return parisWallClock.getTime() - utcWallClock.getTime();
}

/**
 * Fin de la journée courante à Paris (23:59:59.999 heure de Paris),
 * exprimée en Date UTC — utilisable directement dans les requêtes.
 */
export function endOfTodayParis(now = new Date()) {
  const offset = parisOffsetMs(now);
  const paris = new Date(now.getTime() + offset);
  paris.setUTCHours(23, 59, 59, 999);
  return new Date(paris.getTime() - offset);
}

/**
 * Début de la journée courante à Paris (00:00:00 heure de Paris), en UTC.
 */
export function startOfTodayParis(now = new Date()) {
  const offset = parisOffsetMs(now);
  const paris = new Date(now.getTime() + offset);
  paris.setUTCHours(0, 0, 0, 0);
  return new Date(paris.getTime() - offset);
}
