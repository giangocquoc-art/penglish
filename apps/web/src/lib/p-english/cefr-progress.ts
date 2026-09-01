import type { UnifiedCefrLevel, UnifiedLearningUnit } from '../../data/learning/generatedUnifiedLearningPath';
import { getCompletedLessons } from './local-progress';
import { getLessonById, type EnglishLesson } from './lesson-content-data';
import { calculateLessonProgressSummary, getLessonProgress, readLessonProgress } from './lesson-progress';
import { getUnifiedDashboardSnapshot, getUnifiedLearningPath } from './unifiedLessonEngine';
import { getVocabularyStats, VOCABULARY_REVIEW_STORAGE_KEY, type VocabularyReviewStatus } from './vocabulary-review';

export type CefrProgressSummary = {
  currentLevel: UnifiedCefrLevel;
  completedUnits: number;
  totalUnits: number;
  vocabularyKnownCount: number;
  vocabularyReviewCount: number;
  shadowingPracticedLines: number;
  hasLessonProgress: boolean;
};

type ShadowingProgressEntryLike = {
  practicedLineIds?: unknown;
};

type VocabularyProgressEntryLike = {
  status?: unknown;
};

type RawVocabularyCounts = {
  known: number;
  review: number;
};

export const SHADOWING_PROGRESS_STORAGE_KEY = 'penglish.shadowing.progress.v1';

const DEFAULT_LEVEL: UnifiedCefrLevel = 'A1';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function safeParseObject(raw: string | null): Record<string, unknown> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function getLessonsForUnit(unit: UnifiedLearningUnit) {
  return unit.lessonIds.map((lessonId) => getLessonById(lessonId)).filter((lesson): lesson is EnglishLesson => Boolean(lesson));
}

function getUnitProgressPercentage(unit: UnifiedLearningUnit, completedLessonIds: Set<string>) {
  const lessons = getLessonsForUnit(unit);
  if (lessons.length === 0) return { percentage: 0, hasProgress: false };

  let hasProgress = false;
  const percentages = lessons.map((lesson) => {
    const progress = readLessonProgress(lesson.id);
    const completedByLocalState = completedLessonIds.has(lesson.id);
    if (progress || completedByLocalState) hasProgress = true;
    if (completedByLocalState) return 100;
    return calculateLessonProgressSummary(progress, lesson).overallPercentage;
  });

  return {
    percentage: Math.round(percentages.reduce((sum, item) => sum + item, 0) / lessons.length),
    hasProgress,
  };
}

function getCompletedUnitCount(units: UnifiedLearningUnit[]) {
  const lessonCompletionStore = getLessonProgress();
  const completedLessonIds = new Set([
    ...getCompletedLessons(),
    ...Object.values(lessonCompletionStore).filter((record) => record.status === 'completed').map((record) => record.lessonId),
  ]);
  let hasLessonProgress = completedLessonIds.size > 0 || Object.keys(lessonCompletionStore).length > 0;
  const completedUnits = units.filter((unit) => {
    const progress = getUnitProgressPercentage(unit, completedLessonIds);
    if (progress.hasProgress) hasLessonProgress = true;
    return progress.percentage >= 100;
  }).length;

  return { completedUnits, hasLessonProgress };
}

function normalizeVocabularyStatus(value: unknown): VocabularyReviewStatus | null {
  if (value === 'known' || value === 'review' || value === 'difficult' || value === 'new') return value;
  return null;
}

function getRawVocabularyCounts(): RawVocabularyCounts {
  const storage = getStorage();
  const stored = safeParseObject(storage?.getItem(VOCABULARY_REVIEW_STORAGE_KEY) ?? null);

  return Object.values(stored).reduce<RawVocabularyCounts>(
    (summary, rawEntry) => {
      const entry = rawEntry && typeof rawEntry === 'object' ? rawEntry as VocabularyProgressEntryLike : {};
      const status = normalizeVocabularyStatus(entry.status);
      return {
        known: summary.known + (status === 'known' ? 1 : 0),
        review: summary.review + (status === 'review' || status === 'difficult' ? 1 : 0),
      };
    },
    { known: 0, review: 0 },
  );
}

function countShadowingPracticedLines() {
  const storage = getStorage();
  const stored = safeParseObject(storage?.getItem(SHADOWING_PROGRESS_STORAGE_KEY) ?? null);
  const lineIds = new Set<string>();

  Object.values(stored).forEach((rawEntry) => {
    const entry = rawEntry && typeof rawEntry === 'object' ? rawEntry as ShadowingProgressEntryLike : {};
    if (!Array.isArray(entry.practicedLineIds)) return;

    entry.practicedLineIds.forEach((lineId) => {
      if (typeof lineId === 'string' && lineId.trim()) lineIds.add(lineId);
    });
  });

  return lineIds.size;
}

export function getCefrProgressSummary(): CefrProgressSummary {
  const units = getUnifiedLearningPath();
  const dashboard = getUnifiedDashboardSnapshot();
  const vocabularyStats = getVocabularyStats();
  const rawVocabularyCounts = getRawVocabularyCounts();
  const unitProgress = getCompletedUnitCount(units);

  return {
    currentLevel: unitProgress.hasLessonProgress ? dashboard.currentLevel : DEFAULT_LEVEL,
    completedUnits: unitProgress.completedUnits,
    totalUnits: units.length,
    vocabularyKnownCount: Math.max(vocabularyStats.known, rawVocabularyCounts.known),
    vocabularyReviewCount: Math.max(vocabularyStats.review + vocabularyStats.difficult, rawVocabularyCounts.review),
    shadowingPracticedLines: countShadowingPracticedLines(),
    hasLessonProgress: unitProgress.hasLessonProgress,
  };
}
