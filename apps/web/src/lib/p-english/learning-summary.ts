import { getAllVocabularyItems, isVocabularyDueToday, VOCABULARY_REVIEW_STORAGE_KEY, type VocabularyReviewStatus } from './vocabulary-review';

export type RecommendedLearningAction = 'lesson' | 'vocabulary' | 'shadowing' | 'speed';

export type LearningSummary = {
  vocabularyDueCount: number;
  difficultWordCount: number;
  shadowingPracticedCount: number;
  shadowingDifficultCount: number;
  englishSpeedPracticedCount: number;
  hasEnglishSpeedProgress: boolean;
  recommendedAction: RecommendedLearningAction;
};

type VocabularyLearningSummary = Pick<LearningSummary, 'vocabularyDueCount' | 'difficultWordCount'>;

type ShadowingLearningSummary = Pick<LearningSummary, 'shadowingPracticedCount' | 'shadowingDifficultCount'>;

type EnglishSpeedLearningSummary = Pick<LearningSummary, 'englishSpeedPracticedCount' | 'hasEnglishSpeedProgress'>;

type ShadowingProgressEntryLike = {
  practicedLineIds?: unknown;
  difficultLineIds?: unknown;
};

type SpeechProgressLike = {
  attempts?: unknown;
  completed?: unknown;
};

export const SHADOWING_PROGRESS_STORAGE_KEY = 'penglish.shadowing.progress.v1';
export const ENGLISH_SPEED_PROGRESS_STORAGE_KEY = 'p-english:speech-progress';

const EMPTY_SUMMARY: LearningSummary = {
  vocabularyDueCount: 0,
  difficultWordCount: 0,
  shadowingPracticedCount: 0,
  shadowingDifficultCount: 0,
  englishSpeedPracticedCount: 0,
  hasEnglishSpeedProgress: false,
  recommendedAction: 'lesson',
};

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function safeParseObject(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function countStringArray(value: unknown) {
  if (!Array.isArray(value)) return 0;
  return new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)).size;
}

function normalizeStatus(value: unknown): VocabularyReviewStatus {
  if (value === 'known' || value === 'review' || value === 'difficult' || value === 'new') return value;
  return 'new';
}

export function getVocabularyLearningSummary(): VocabularyLearningSummary {
  const storage = getStorage();
  const stored = safeParseObject(storage?.getItem(VOCABULARY_REVIEW_STORAGE_KEY) ?? null);
  const items = getAllVocabularyItems();

  const vocabularyDueCount = items.filter((item) => isVocabularyDueToday(item)).length;
  const difficultWordIds = new Set<string>();

  items.forEach((item) => {
    if (item.status === 'difficult' || item.wrongCount > 0) difficultWordIds.add(item.wordId);
  });

  Object.entries(stored).forEach(([wordId, value]) => {
    const record = value && typeof value === 'object' ? value as { status?: unknown; wrongCount?: unknown } : {};
    if (normalizeStatus(record.status) === 'difficult' || Number(record.wrongCount ?? 0) > 0) difficultWordIds.add(wordId);
  });

  return {
    vocabularyDueCount,
    difficultWordCount: difficultWordIds.size,
  };
}

export function getShadowingLearningSummary(): ShadowingLearningSummary {
  const storage = getStorage();
  const stored = safeParseObject(storage?.getItem(SHADOWING_PROGRESS_STORAGE_KEY) ?? null);

  return Object.values(stored).reduce<ShadowingLearningSummary>((summary, rawEntry) => {
    const entry = rawEntry && typeof rawEntry === 'object' ? rawEntry as ShadowingProgressEntryLike : {};
    return {
      shadowingPracticedCount: summary.shadowingPracticedCount + countStringArray(entry.practicedLineIds),
      shadowingDifficultCount: summary.shadowingDifficultCount + countStringArray(entry.difficultLineIds),
    };
  }, { shadowingPracticedCount: 0, shadowingDifficultCount: 0 });
}

export function getEnglishSpeedLearningSummary(): EnglishSpeedLearningSummary {
  const storage = getStorage();
  const raw = storage?.getItem(ENGLISH_SPEED_PROGRESS_STORAGE_KEY) ?? null;
  const stored = safeParseObject(raw) as SpeechProgressLike;
  const attempts = Number(stored.attempts ?? 0);
  const completed = Number(stored.completed ?? 0);
  const practicedCount = Math.max(
    Number.isFinite(attempts) && attempts > 0 ? Math.floor(attempts) : 0,
    Number.isFinite(completed) && completed > 0 ? Math.floor(completed) : 0,
  );

  return {
    englishSpeedPracticedCount: practicedCount,
    hasEnglishSpeedProgress: Boolean(raw) && practicedCount > 0,
  };
}

export function getLearningSummary(): LearningSummary {
  const storage = getStorage();
  if (!storage) return EMPTY_SUMMARY;

  const vocabulary = getVocabularyLearningSummary();
  const shadowing = getShadowingLearningSummary();
  const englishSpeed = getEnglishSpeedLearningSummary();
  const recommendedAction: RecommendedLearningAction = vocabulary.vocabularyDueCount > 0
    ? 'vocabulary'
    : shadowing.shadowingDifficultCount > 0
      ? 'shadowing'
      : 'lesson';

  return {
    ...vocabulary,
    ...shadowing,
    ...englishSpeed,
    recommendedAction,
  };
}
