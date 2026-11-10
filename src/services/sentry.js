import * as Sentry from '@sentry/react';

const SENTRY_DSN = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SENTRY_DSN) ||
  (typeof process !== 'undefined' && process.env?.VITE_SENTRY_DSN) ||
  '';

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.info('[Sentry] DSN não configurado em VITE_SENTRY_DSN. Sentry em modo inativo.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Tracing / Performance
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/maycon97\.github\.io/],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || 'production',
  });

  console.info('[Sentry] Inicializado com sucesso para organização mdsync-united.');
};

/**
 * Dispara um erro de teste para validar a conexão end-to-end com o dashboard do Sentry
 */
export const triggerSentryTestError = () => {
  try {
    throw new Error('MDSync Geotecnia: Erro de teste para verificação do Sentry (org: mdsync-united)');
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        origin: 'sentry-onboarding',
        org: 'mdsync-united',
        system: 'mdsync-geotecnia'
      }
    });
    console.log('[Sentry] Erro de teste disparado para o Sentry!');
  }
};
