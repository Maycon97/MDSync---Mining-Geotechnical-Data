import { PostHog } from 'posthog-node';

const VALID_AI_IDENTIFIER = /^[A-Za-z0-9_~.@()!'|:-]+$/;

function getClient(env) {
  if (!env.POSTHOG_KEY) {
    if (env.NODE_ENV !== 'production') {
      console.warn('POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_KEY is configured');
    }
    return null;
  }
  if (!env.POSTHOG_HOST) {
    if (env.NODE_ENV !== 'production') {
      console.warn('POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_HOST is configured');
    }
    return null;
  }

  return new PostHog(env.POSTHOG_KEY, {
    host: env.POSTHOG_HOST,
    privacyMode: false
  });
}

function normalizedContext(context) {
  if (!context || typeof context !== 'object') return null;
  const { distinctId, sessionId, traceId } = context;
  if (![distinctId, sessionId, traceId].every((value) => typeof value === 'string' && VALID_AI_IDENTIFIER.test(value))) {
    return null;
  }
  return { distinctId, sessionId, traceId };
}

export function captureAiGeneration(env, executionContext, details) {
  const context = normalizedContext(details.context);
  const client = context && getClient(env);
  if (!client || !executionContext?.waitUntil) return;

  executionContext.waitUntil((async () => {
    try {
      client.capture({
        distinctId: context.distinctId,
        event: '$ai_generation',
        properties: {
          $ai_session_id: context.sessionId,
          $ai_trace_id: context.traceId,
          $ai_span_id: crypto.randomUUID(),
          $ai_span_name: 'geotinho_gemini_generation',
          $ai_model: 'gemini-3.6-flash',
          $ai_provider: 'gemini',
          $ai_input: details.input,
          $ai_output_choices: details.output || [],
          $ai_input_tokens: details.usage?.promptTokenCount ?? null,
          $ai_output_tokens: details.usage?.candidatesTokenCount ?? null,
          $ai_latency: details.latency,
          $ai_http_status: details.httpStatus,
          $ai_request_url: details.requestUrl,
          $ai_is_error: Boolean(details.error),
          $ai_error: details.error,
          $ai_stop_reason: details.stopReason,
          $ai_max_tokens: 2048
        }
      });
      await client.shutdown(3000);
    } catch {}
  })());
}
