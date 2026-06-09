import {
  generatedUnifiedLearningPath,
  type UnifiedCefrLevel,
  type UnifiedLearningUnit,
  type UnifiedPracticeMode,
  type UnifiedSkillFocus,
} from '../../data/learning/generatedUnifiedLearningPath';
import { getAdaptedVocabularyItems, getVocabularyReviewGroups } from './vocabularyAdapter';
import { getGeneratedGrammarLessons } from './grammarLessonAdapter';
import { getGeneratedReadingLessons } from './readingAdapter';
import { getGeneratedShadowingCatalog } from './shadowingAdapter';
import { getSpeechPrompts } from './speechAdapter';
import { getCompletedLessons, getCurrentStreak } from './local-progress';
import { calculateLessonProgressSummary, readLessonProgress } from './lesson-progress';
import { getLessonById, type EnglishLesson } from './lesson-content-data';

export type UnifiedLessonEntry = {
  unit: UnifiedLearningUnit;
  primaryLesson?: EnglishLesson;
  lessons: EnglishLesson[];
  primaryRoute: string;
  practiceRoute: string;
  availablePracticeModes: UnifiedPracticeMode[];
  fallbackReason?: string;
};

export type UnifiedSkillCoverage = Record<UnifiedSkillFocus, number>;

export type UnifiedDashboardSnapshot = {
  totalUnits: number;
  availableUnits: number;
  completedUnits: number;
  totalLessons: number;
  completedLessons: number;
  pathPercentage: number;
  currentLevel: UnifiedCefrLevel;
  currentLevelLabel: string;
  nextUnit: UnifiedLearningUnit | null;
  nextLessonPath: string;
  nextLessonTitle: string;
  confidencePath: string;
  whaleCoachLine: string;
  currentStreak: number;
};

export type UnifiedProgressSummary = UnifiedDashboardSnapshot & {
  skillCoverage: UnifiedSkillCoverage;
  generatedSourceCounts: {
    vocabularyItems: number;
    vocabularyGroups: number;
    grammarLessons: number;
    readingLessons: number;
    shadowingItems: number;
    speechPrompts: number;
  };
};

const LEVEL_LABELS: Record<UnifiedCefrLevel, string> = {
  A1: 'Nền tảng',
  A2: 'Giao tiếp quen thuộc',
  B1: 'Tự tin tình huống thường gặp',
  B2: 'Độc lập hơn',
};

const DEFAULT_MODE_ROUTE: Record<UnifiedPracticeMode, string> = {
  flashcard: '/vocabularies',
  quiz: '/practice',
  listen: '/practice',
  reflex: '/practice',
  type: '/practice',
  match: '/practice',
  speed: '/english-speed',
  shadowing: '/shadowing',
  pronunciation: '/english-speed',
};

function safeArray<T>(factory: () => T[]): T[] {
  try {
    return factory();
  } catch {
    return [];
  }
}

function getLessonsForUnit(unit: UnifiedLearningUnit) {
  return unit.lessonIds.map((id) => getLessonById(id)).filter((lesson): lesson is EnglishLesson => Boolean(lesson));
}

function hasPracticeContent(lesson: EnglishLesson | undefined, mode: UnifiedPracticeMode) {
  if (mode === 'shadowing' || mode === 'pronunciation') return true;
  if (!lesson) return mode === 'flashcard' || mode === 'speed';
  if (mode === 'flashcard') return lesson.flashcards.length > 0 || lesson.vocabulary.length > 0;
  if (mode === 'quiz') return lesson.quizQuestions.length > 0 || lesson.fillBlankTasks.length > 0 || lesson.sentenceOrderingTasks.length > 0;
  if (mode === 'listen') return lesson.listeningPractice.length > 0;
  if (mode === 'reflex') return lesson.speakingReflexPrompts.length > 0;
  if (mode === 'type') return lesson.fillBlankTasks.length > 0 || lesson.sentenceOrderingTasks.length > 0;
  if (mode === 'match') return (lesson.matchPairs?.length ?? 0) > 0 || lesson.vocabulary.length > 1;
  if (mode === 'speed') return (lesson.englishSpeedPrompts?.length ?? 0) > 0 || lesson.vocabulary.length > 0 || lesson.quizQuestions.length > 0;
  return false;
}

function getPracticeRoute(unit: UnifiedLearningUnit, lesson: EnglishLesson | undefined, mode: UnifiedPracticeMode) {
  if (mode === 'shadowing') return '/shadowing';
  if (mode === 'pronunciation' || mode === 'speed') return '/english-speed';
  if (!lesson) return DEFAULT_MODE_ROUTE[mode] ?? unit.sourceModuleReference.runtimeRoute;
  return `/practice?lessonId=${lesson.id}&mode=${mode}`;
}

function getPrimaryRoute(unit: UnifiedLearningUnit, primaryLesson: EnglishLesson | undefined) {
  if (primaryLesson) return `/lessons/${primaryLesson.id}`;
  return unit.sourceModuleReference.runtimeRoute || DEFAULT_MODE_ROUTE[unit.primaryMode] || '/learning-path';
}

function getUnitProgress(unit: UnifiedLearningUnit) {
  const lessons = getLessonsForUnit(unit);
  if (lessons.length === 0) return { percentage: 0, completed: false, available: false };

  const completedLessonIds = getCompletedLessons();
  const percentages = lessons.map((lesson) => {
    const progress = readLessonProgress(lesson.id);
    const summary = calculateLessonProgressSummary(progress, lesson);
    if (completedLessonIds.includes(lesson.id)) return 100;
    return summary.overallPercentage;
  });
  const percentage = Math.round(percentages.reduce((sum, item) => sum + item, 0) / percentages.length);
  return { percentage, completed: percentage >= 100, available: true };
}

function getCurrentLevelFromPercentage(pathPercentage: number): UnifiedCefrLevel {
  if (pathPercentage >= 82) return 'B2';
  if (pathPercentage >= 58) return 'B1';
  if (pathPercentage >= 30) return 'A2';
  return 'A1';
}

export function getUnifiedLearningPath() {
  return generatedUnifiedLearningPath;
}

export function getUnifiedUnitsByLevel(level: UnifiedCefrLevel) {
  return generatedUnifiedLearningPath.filter((unit) => unit.level === level);
}

export function getUnifiedUnitById(id: string) {
  return generatedUnifiedLearningPath.find((unit) => unit.id === id) ?? null;
}

export function getUnifiedNextUnit(currentUnitId: string) {
  const currentIndex = generatedUnifiedLearningPath.findIndex((unit) => unit.id === currentUnitId);
  if (currentIndex < 0) return generatedUnifiedLearningPath[0] ?? null;
  return generatedUnifiedLearningPath[currentIndex + 1] ?? null;
}

export function getUnifiedRecommendedUnits() {
  return generatedUnifiedLearningPath.filter((unit) => !getUnitProgress(unit).completed).slice(0, 3);
}

export function getUnifiedLessonEntry(unitId: string): UnifiedLessonEntry | null {
  const unit = getUnifiedUnitById(unitId);
  if (!unit) return null;

  const lessons = getLessonsForUnit(unit);
  const primaryLesson = lessons[0];
  const availablePracticeModes = unit.recommendedPracticeModes.filter((mode) => hasPracticeContent(primaryLesson, mode));
  const firstMode = availablePracticeModes[0] ?? unit.primaryMode;

  return {
    unit,
    lessons,
    primaryLesson,
    primaryRoute: getPrimaryRoute(unit, primaryLesson),
    practiceRoute: getPracticeRoute(unit, primaryLesson, firstMode),
    availablePracticeModes,
    fallbackReason: primaryLesson ? undefined : 'Unit này đang trỏ đến hub luyện tập thay vì lesson route.',
  };
}

export function getUnifiedSkillCoverage(): UnifiedSkillCoverage {
  return generatedUnifiedLearningPath.reduce<UnifiedSkillCoverage>(
    (coverage, unit) => ({ ...coverage, [unit.skillFocus]: coverage[unit.skillFocus] + 1 }),
    { 'Từ vựng': 0, 'Ngữ pháp': 0, Đọc: 0, Shadowing: 0, 'Phát âm': 0, 'Ôn tập': 0 },
  );
}

export function getUnifiedDashboardSnapshot(): UnifiedDashboardSnapshot {
  const unitStates = generatedUnifiedLearningPath.map((unit) => ({ unit, ...getUnitProgress(unit) }));
  const availableStates = unitStates.filter((item) => item.available);
  const completedStates = availableStates.filter((item) => item.completed);
  const totalProgress = availableStates.reduce((sum, item) => sum + item.percentage, 0);
  const pathPercentage = availableStates.length > 0 ? Math.round(totalProgress / availableStates.length) : 0;
  const nextState = availableStates.find((item) => !item.completed) ?? availableStates[0] ?? unitStates[0] ?? null;
  const nextUnit = nextState?.unit ?? null;
  const nextEntry = nextUnit ? getUnifiedLessonEntry(nextUnit.id) : null;
  const currentLevel = getCurrentLevelFromPercentage(pathPercentage);

  return {
    totalUnits: generatedUnifiedLearningPath.length,
    availableUnits: availableStates.length,
    completedUnits: completedStates.length,
    totalLessons: generatedUnifiedLearningPath.reduce((sum, unit) => sum + Math.max(1, unit.lessonIds.length), 0),
    completedLessons: completedStates.reduce((sum, item) => sum + Math.max(1, item.unit.lessonIds.length), 0),
    pathPercentage,
    currentLevel,
    currentLevelLabel: LEVEL_LABELS[currentLevel],
    nextUnit,
    nextLessonPath: nextEntry?.primaryRoute ?? '/learning-path',
    nextLessonTitle: nextUnit?.titleVi ?? 'Ôn lại lộ trình đang mở',
    confidencePath: nextUnit?.confidenceGoal ?? 'Giữ nhịp học đều và ôn lại phần yếu.',
    whaleCoachLine: nextUnit?.whaleCoachLine ?? 'Cá voi nhắc bạn: mỗi ngày một bước nhỏ vẫn là tiến bộ.',
    currentStreak: getCurrentStreak(),
  };
}

export function getUnifiedProgressSummary(): UnifiedProgressSummary {
  return {
    ...getUnifiedDashboardSnapshot(),
    skillCoverage: getUnifiedSkillCoverage(),
    generatedSourceCounts: {
      vocabularyItems: safeArray(() => getAdaptedVocabularyItems()).length,
      vocabularyGroups: safeArray(() => getVocabularyReviewGroups()).length,
      grammarLessons: safeArray(() => getGeneratedGrammarLessons()).length,
      readingLessons: safeArray(() => getGeneratedReadingLessons()).length,
      shadowingItems: safeArray(() => getGeneratedShadowingCatalog()).length,
      speechPrompts: safeArray(() => getSpeechPrompts()).length,
    },
  };
}
