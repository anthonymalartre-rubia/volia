/**
 * Le cron `sentry-digest` (lundi 11h) n'a jamais produit une seule proposition
 * depuis sa mise en place, alors que quatorze autres actions autonomes
 * tournaient normalement. Deux causes, toutes deux muettes :
 *
 *  1. `SENTRY_ORG` absente de Vercel → repli codé en dur sur « volia », alors
 *     que le slug réel est « ezdrive » → 404 sur chaque appel.
 *  2. L'URL d'API était figée sur `https://sentry.io` alors que l'organisation
 *     vit en région européenne (`r=de` dans les requêtes du tunnel) → l'API US
 *     ne connaît pas ce projet.
 *
 * On déduit désormais la région du DSN lui-même : la config ne peut plus
 * diverger de la réalité. Et on refuse de deviner un slug : sans SENTRY_ORG,
 * on renvoie une erreur explicite plutôt qu'un 404 silencieux.
 */

import { resolveSentryApiBase } from '@/lib/sentry-api';

describe('resolveSentryApiBase', () => {
  it('déduit la région européenne du DSN', () => {
    expect(resolveSentryApiBase('https://abc123@o4511490152071168.ingest.de.sentry.io/4511490212888656'))
      .toBe('https://de.sentry.io/api/0');
  });

  it('déduit la région américaine explicite', () => {
    expect(resolveSentryApiBase('https://abc123@o123.ingest.us.sentry.io/456'))
      .toBe('https://us.sentry.io/api/0');
  });

  it('retombe sur l’instance par défaut quand le DSN ne porte pas de région', () => {
    expect(resolveSentryApiBase('https://abc123@o123.ingest.sentry.io/456'))
      .toBe('https://sentry.io/api/0');
  });

  it('retombe sur l’instance par défaut pour un DSN absent ou illisible', () => {
    expect(resolveSentryApiBase('')).toBe('https://sentry.io/api/0');
    expect(resolveSentryApiBase(null)).toBe('https://sentry.io/api/0');
    expect(resolveSentryApiBase('pas-une-url')).toBe('https://sentry.io/api/0');
  });

  it('n’accepte pas n’importe quoi comme région (garde anti-injection)', () => {
    expect(resolveSentryApiBase('https://k@o1.ingest.evil.com/2')).toBe('https://sentry.io/api/0');
    expect(resolveSentryApiBase('https://k@o1.ingest.a/b.sentry.io/2')).toBe('https://sentry.io/api/0');
  });
});
