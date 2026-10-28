export type AiErrorCode = 'quota' | 'overloaded' | 'config' | 'timeout' | 'unknown';

interface AiErrorInfo {
  code: AiErrorCode;
  status: number;
  message: string;
}

const ERRORS: Record<AiErrorCode, AiErrorInfo> = {
  quota: {
    code: 'quota',
    status: 503,
    message:
      "Ask Suan's AI has reached its usage limit for now. Please try again later, or reach Suan directly through the Contact page.",
  },
  overloaded: {
    code: 'overloaded',
    status: 503,
    message: 'The AI service is very busy right now. Please try again in a minute.',
  },
  config: {
    code: 'config',
    status: 500,
    message: "Ask Suan's AI isn't set up correctly at the moment. Please let Suan know through the Contact page.",
  },
  timeout: {
    code: 'timeout',
    status: 504,
    message: 'The AI service took too long to respond. Please try again.',
  },
  unknown: {
    code: 'unknown',
    status: 500,
    message: 'Something went wrong. Please try again.',
  },
};

/** Map an upstream (Gemini) error to a visitor-friendly error. */
export function classifyAiError(err: unknown): AiErrorInfo {
  const e = err as { status?: number; code?: number; name?: string; message?: string } | undefined;
  const status = e?.status ?? e?.code;
  const text = `${e?.name ?? ''} ${e?.message ?? ''}`;

  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text)) return ERRORS.quota;
  if (status === 503 || /UNAVAILABLE|overloaded|high demand/i.test(text)) return ERRORS.overloaded;
  if (status === 401 || status === 403 || /API_KEY|API key|PERMISSION_DENIED|not set/i.test(text)) return ERRORS.config;
  if (status === 504 || /timeout|timed out|AbortError|DEADLINE_EXCEEDED|fetch failed|ECONNRESET/i.test(text)) {
    return ERRORS.timeout;
  }
  return ERRORS.unknown;
}
