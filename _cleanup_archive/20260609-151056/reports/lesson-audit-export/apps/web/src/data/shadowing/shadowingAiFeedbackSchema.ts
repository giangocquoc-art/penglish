export type ShadowingAiFeedbackSource = 'gemini' | 'local-disabled' | 'local-fallback' | 'mock';

export type ShadowingAiChangedWord = {
  expected: string;
  heard: string;
  tipVi: string;
};

export type ShadowingAiFeedback = {
  source: ShadowingAiFeedbackSource;
  summaryVi: string;
  matchedWords: string[];
  missingWords: string[];
  extraWords: string[];
  changedWords: ShadowingAiChangedWord[];
  rhythmTips: string[];
  pronunciationTips: string[];
  nextDrills: string[];
};

export const shadowingAiFeedbackJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['source', 'summaryVi', 'matchedWords', 'missingWords', 'extraWords', 'changedWords', 'rhythmTips', 'pronunciationTips', 'nextDrills'],
  properties: {
    source: { type: 'string', enum: ['gemini', 'local-disabled', 'local-fallback', 'mock'] },
    summaryVi: { type: 'string', minLength: 1 },
    matchedWords: { type: 'array', items: { type: 'string' } },
    missingWords: { type: 'array', items: { type: 'string' } },
    extraWords: { type: 'array', items: { type: 'string' } },
    changedWords: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['expected', 'heard', 'tipVi'],
        properties: {
          expected: { type: 'string' },
          heard: { type: 'string' },
          tipVi: { type: 'string' },
        },
      },
    },
    rhythmTips: { type: 'array', items: { type: 'string' } },
    pronunciationTips: { type: 'array', items: { type: 'string' } },
    nextDrills: { type: 'array', items: { type: 'string' } },
  },
} as const;

const FEEDBACK_SOURCES: ShadowingAiFeedbackSource[] = ['gemini', 'local-disabled', 'local-fallback', 'mock'];

function asStringArray(value: unknown, maxItems = 8): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim()).slice(0, maxItems) : [];
}

export function normalizeShadowingAiFeedback(value: unknown, fallbackSource: ShadowingAiFeedbackSource = 'local-fallback'): ShadowingAiFeedback {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const source = typeof raw.source === 'string' && FEEDBACK_SOURCES.includes(raw.source as ShadowingAiFeedbackSource) ? (raw.source as ShadowingAiFeedbackSource) : fallbackSource;
  const changedWords = Array.isArray(raw.changedWords)
    ? raw.changedWords
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map((item) => ({
          expected: typeof item.expected === 'string' ? item.expected.trim() : '',
          heard: typeof item.heard === 'string' ? item.heard.trim() : '',
          tipVi: typeof item.tipVi === 'string' ? item.tipVi.trim() : 'Luyện lại cụm này thật chậm.',
        }))
        .filter((item) => item.expected || item.heard || item.tipVi)
        .slice(0, 6)
    : [];

  return {
    source,
    summaryVi: typeof raw.summaryVi === 'string' && raw.summaryVi.trim() ? raw.summaryVi.trim() : 'Cá voi Coach đã tạo phản hồi ngắn để bạn luyện lại từng cụm.',
    matchedWords: asStringArray(raw.matchedWords, 20),
    missingWords: asStringArray(raw.missingWords, 12),
    extraWords: asStringArray(raw.extraWords, 12),
    changedWords,
    rhythmTips: asStringArray(raw.rhythmTips, 4),
    pronunciationTips: asStringArray(raw.pronunciationTips, 4),
    nextDrills: asStringArray(raw.nextDrills, 3),
  };
}
