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
import { getLearningLoopSnapshot } from './learning-loop';
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

export type UnifiedSkillDepthKey = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'shadowing' | 'speaking';

export type UnifiedUnitContentDepth = {
  unitId: string;
  unitTitleVi: string;
  level: UnifiedCefrLevel;
  lessonCount: number;
  sourceCount: number;
  vocabularyItems: number;
  grammarNotes: number;
  readingInputs: number;
  listeningInputs: number;
  writingTasks: number;
  shadowingItems: number;
  speechPrompts: number;
  availableSkills: UnifiedSkillDepthKey[];
  missingSkills: UnifiedSkillDepthKey[];
  depthScore: number;
  depthLabelVi: string;
  recommendedDataActionVi: string;
};

export type UnifiedLessonDepthLayerKey = 'objective' | 'chunk' | 'pattern' | 'context' | 'audio' | 'output' | 'assessment' | 'review' | 'mistake' | 'multimodal';

export type UnifiedLessonDepthLayer = {
  key: UnifiedLessonDepthLayerKey;
  labelVi: string;
  score: number;
  itemCount: number;
  evidenceVi: string;
  actionVi: string;
  isStrong: boolean;
};

export type UnifiedLessonContentDepth = {
  lessonId: string;
  vocabularyItems: number;
  grammarItems: number;
  dialogueItems: number;
  listeningItems: number;
  writingItems: number;
  speakingItems: number;
  reviewItems: number;
  availableSkills: UnifiedSkillDepthKey[];
  missingSkills: UnifiedSkillDepthKey[];
  depthScore: number;
  depthLabelVi: string;
  recommendedStudyPathVi: string;
  recommendedDataActionVi: string;
  depthLayers: UnifiedLessonDepthLayer[];
  strongLayerCount: number;
  weakestLayer?: UnifiedLessonDepthLayer;
  strongestLayer?: UnifiedLessonDepthLayer;
  nextLayerActionVi: string;
};

export type UnifiedPracticeModeDepth = {
  mode: UnifiedPracticeMode;
  labelVi: string;
  itemCount: number;
  requiredSkill: UnifiedSkillDepthKey;
  readinessScore: number;
  readinessLabelVi: string;
  guidanceVi: string;
  isReady: boolean;
};

export type UnifiedPracticeContentDepth = {
  lessonId: string;
  selectedMode?: UnifiedPracticeMode;
  selectedModeDepth?: UnifiedPracticeModeDepth;
  recommendedMode?: UnifiedPracticeMode;
  recommendedModeDepth?: UnifiedPracticeModeDepth;
  modeDepths: UnifiedPracticeModeDepth[];
  readyModeCount: number;
  totalPracticeItems: number;
  readinessSummaryVi: string;
  recommendedFlowVi: string;
};

export type UnifiedContentDepthSnapshot = {
  averageDepthScore: number;
  deepUnitCount: number;
  thinUnitCount: number;
  totalUnits: number;
  totalLessons: number;
  totalSources: number;
  weakestUnits: UnifiedUnitContentDepth[];
  strongestUnits: UnifiedUnitContentDepth[];
  mostMissingSkills: Array<{ skill: UnifiedSkillDepthKey; count: number }>;
  nextDataActionVi: string;
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

function countSourceIds(unit: UnifiedLearningUnit, prefix: string) {
  return new Set([...unit.sourceIds, ...unit.sourceModuleReference.ids].filter((id) => id.startsWith(prefix))).size;
}

function getDepthLabel(depthScore: number) {
  if (depthScore >= 86) return 'Nội dung phong phú · đủ nhiều kỹ năng';
  if (depthScore >= 68) return 'Nội dung tốt · còn thiếu 1-2 kỹ năng';
  if (depthScore >= 46) return 'Nội dung nền · cần thêm bước nối';
  return 'Nội dung còn mỏng · cần bổ sung';
}

function getRecommendedDataAction(missingSkills: UnifiedSkillDepthKey[]) {
  if (missingSkills.includes('writing')) return 'Thêm câu gõ hoặc bài viết ngắn để người học dùng được mẫu câu.';
  if (missingSkills.includes('speaking')) return 'Thêm câu luyện nói để người học nói ngay sau bài.';
  if (missingSkills.includes('shadowing')) return 'Thêm bài nói đuổi cùng chủ đề để luyện nhịp câu.';
  if (missingSkills.includes('listening')) return 'Thêm câu nghe hoặc hội thoại cho bài này.';
  if (missingSkills.includes('grammar')) return 'Bổ sung mẫu ngữ pháp trọng tâm để bài rõ hơn.';
  return 'Nội dung đã khá đầy đủ; ưu tiên kiểm tra trải nghiệm học.';
}

function getRecommendedLessonStudyPath(availableSkills: UnifiedSkillDepthKey[], missingSkills: UnifiedSkillDepthKey[]) {
  const path = ['Đọc mục tiêu'];
  if (availableSkills.includes('vocabulary')) path.push('học cụm từ vựng');
  if (availableSkills.includes('grammar')) path.push('nắm mẫu câu');
  if (availableSkills.includes('reading')) path.push('đọc ngữ cảnh');
  if (availableSkills.includes('listening')) path.push('nghe/hội thoại');
  if (availableSkills.includes('speaking')) path.push('nói phản xạ');
  if (availableSkills.includes('writing')) path.push('viết/gõ lại câu');
  if (missingSkills.length > 0) path.push(`bù ${missingSkills[0]}`);
  return path.join(' → ');
}

function getPracticeReadinessLabel(readinessScore: number) {
  if (readinessScore >= 86) return 'Rất sẵn sàng';
  if (readinessScore >= 68) return 'Sẵn sàng tốt';
  if (readinessScore >= 42) return 'Đủ để luyện nhanh';
  return 'Chưa đủ nội dung luyện';
}

function getPracticeModeLabelVi(mode: UnifiedPracticeMode) {
  if (mode === 'flashcard') return 'Thẻ từ';
  if (mode === 'quiz') return 'Thử sức nhẹ';
  if (mode === 'listen') return 'Luyện nghe';
  if (mode === 'reflex') return 'Phản xạ nói';
  if (mode === 'type') return 'Gõ câu';
  if (mode === 'match') return 'Ghép cặp';
  if (mode === 'speed') return 'Tốc độ/phát âm';
  if (mode === 'shadowing') return 'Nói đuổi';
  return 'Phát âm';
}

function getPracticeModeSkill(mode: UnifiedPracticeMode): UnifiedSkillDepthKey {
  if (mode === 'flashcard' || mode === 'match') return 'vocabulary';
  if (mode === 'listen') return 'listening';
  if (mode === 'reflex' || mode === 'speed' || mode === 'pronunciation') return 'speaking';
  if (mode === 'type') return 'writing';
  if (mode === 'shadowing') return 'shadowing';
  return 'grammar';
}

function getPracticeModeItemCount(lesson: EnglishLesson, mode: UnifiedPracticeMode) {
  if (mode === 'flashcard') return lesson.flashcards.length + lesson.vocabulary.length;
  if (mode === 'quiz') return lesson.quizQuestions.length + lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length;
  if (mode === 'listen') return lesson.listeningPractice.length + lesson.miniDialogues.reduce((sum, dialogue) => sum + dialogue.lines.length, 0);
  if (mode === 'reflex') return lesson.speakingReflexPrompts.length;
  if (mode === 'type') return lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length + (lesson.finalMiniChallenge ? 1 : 0);
  if (mode === 'match') return (lesson.matchPairs?.length ?? 0) + Math.min(lesson.vocabulary.length, 8);
  if (mode === 'speed' || mode === 'pronunciation') return (lesson.englishSpeedPrompts?.length ?? 0) + lesson.vocabulary.length + lesson.pronunciationNotes.length;
  if (mode === 'shadowing') return lesson.shadowingScript ? lesson.shadowingScript.lines.length : 0;
  return 0;
}

function getPracticeModeGuidance(mode: UnifiedPracticeMode, itemCount: number, isReady: boolean) {
  if (!isReady) return `Phần ${getPracticeModeLabelVi(mode)} chưa đủ nội dung. Bạn có thể chuyển sang phần luyện đang sẵn sàng trước.`;
  if (mode === 'flashcard') return `Có ${itemCount} thẻ/từ để làm nóng trước khi kiểm tra nhanh.`;
  if (mode === 'quiz') return `Có ${itemCount} câu kiểm tra để đo hiểu bài và phát hiện điểm yếu.`;
  if (mode === 'listen') return `Có ${itemCount} câu nghe/hội thoại để luyện nhận diện trong ngữ cảnh.`;
  if (mode === 'reflex') return `Có ${itemCount} câu phản xạ để tập nói nhanh hơn.`;
  if (mode === 'type') return `Có ${itemCount} câu gõ giúp bạn nhớ chắc mẫu câu.`;
  if (mode === 'match') return `Có ${itemCount} cặp ghép để củng cố nghĩa và cụm từ.`;
  if (mode === 'shadowing') return `Có ${itemCount} câu nói đuổi để luyện nhịp câu.`;
  return `Có ${itemCount} câu luyện để rèn tốc độ, phát âm và phản xạ miệng.`;
}

function toLayerScore(itemCount: number, target: number, bonus = 0) {
  return Math.min(100, Math.round((Math.min(itemCount, target) / target) * 82 + bonus));
}

function createLessonDepthLayers(lesson: EnglishLesson): UnifiedLessonDepthLayer[] {
  const objectiveCount = lesson.learningObjectives.length;
  const chunkCount = lesson.vocabulary.length + lesson.flashcards.length;
  const patternCount = lesson.sentencePatterns.length + lesson.grammarNotes.length;
  const contextCount = lesson.miniDialogues.length + (lesson.realLifeSituations?.length ?? 0);
  const audioCount = lesson.listeningPractice.length + lesson.miniDialogues.reduce((sum, dialogue) => sum + dialogue.lines.length, 0) + lesson.pronunciationNotes.length;
  const outputCount = lesson.speakingReflexPrompts.length + lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length + (lesson.finalMiniChallenge ? 1 : 0);
  const assessmentCount = lesson.quizQuestions.length + (lesson.matchPairs?.length ?? 0);
  const reviewCount = lesson.completionCriteria.totalQuizQuestions + lesson.completionCriteria.totalReflexPrompts + lesson.completionCriteria.flashcardsReviewed;
  const mistakeCount = (lesson.commonMistakes?.length ?? 0);
  const multimodalCount = (lesson.shadowingScript ? 1 : 0) + (lesson.englishSpeedPrompts?.length ?? 0) + (lesson.gameMissions?.length ?? 0) + lesson.pronunciationNotes.length;
  const layers: UnifiedLessonDepthLayer[] = [
    { key: 'objective', labelVi: 'Mục tiêu', itemCount: objectiveCount, score: toLayerScore(objectiveCount, 4, lesson.learningObjectives.some((objective) => /can|able|tự|nói|viết|nghe|hỏi/i.test(objective)) ? 8 : 0), evidenceVi: `${objectiveCount} mục tiêu học`, actionVi: 'Viết mục tiêu rõ theo đầu ra nói/viết/nghe.', isStrong: false },
    { key: 'chunk', labelVi: 'Cụm từ', itemCount: chunkCount, score: toLayerScore(chunkCount, 14), evidenceVi: `${chunkCount} từ/cụm`, actionVi: 'Thêm cụm từ có ví dụ và phát âm để khởi động bài.', isStrong: false },
    { key: 'pattern', labelVi: 'Mẫu câu', itemCount: patternCount, score: toLayerScore(patternCount, 5), evidenceVi: `${patternCount} mẫu/ngữ pháp`, actionVi: 'Bổ sung mẫu thay thế được để người học tự tạo câu.', isStrong: false },
    { key: 'context', labelVi: 'Ngữ cảnh', itemCount: contextCount, score: toLayerScore(contextCount, 4), evidenceVi: `${contextCount} hội thoại/tình huống`, actionVi: 'Thêm tình huống thật để nối từ vựng với hành động.', isStrong: false },
    { key: 'audio', labelVi: 'Âm thanh', itemCount: audioCount, score: toLayerScore(audioCount, 8), evidenceVi: `${audioCount} câu nghe/phát âm`, actionVi: 'Thêm câu nghe hoặc ghi chú phát âm cho nhịp nói.', isStrong: false },
    { key: 'output', labelVi: 'Luyện nói/viết', itemCount: outputCount, score: toLayerScore(outputCount, 8, lesson.finalMiniChallenge ? 8 : 0), evidenceVi: `${outputCount} câu nói/viết`, actionVi: 'Thêm câu nói hoặc câu gõ để người học dùng được kiến thức.', isStrong: false },
    { key: 'assessment', labelVi: 'Kiểm tra', itemCount: assessmentCount, score: toLayerScore(assessmentCount, 8), evidenceVi: `${assessmentCount} câu kiểm tra/ghép cặp`, actionVi: 'Thêm câu kiểm tra để phát hiện điểm yếu.', isStrong: false },
    { key: 'review', labelVi: 'Ôn lại', itemCount: reviewCount, score: toLayerScore(reviewCount, 12, lesson.reviewRules.newWordReviewAfterMinutes > 0 ? 8 : 0), evidenceVi: `${reviewCount} tiêu chí ôn`, actionVi: 'Gắn tiêu chí hoàn thành và lịch ôn rõ hơn.', isStrong: false },
    { key: 'mistake', labelVi: 'Lỗi hay sai', itemCount: mistakeCount, score: toLayerScore(mistakeCount, 3), evidenceVi: `${mistakeCount} lỗi/ghi chú tránh sai`, actionVi: 'Thêm lỗi thường gặp để Poo sửa chủ động.', isStrong: false },
    { key: 'multimodal', labelVi: 'Nhiều phần luyện', itemCount: multimodalCount, score: toLayerScore(multimodalCount, 4), evidenceVi: `${multimodalCount} bài nói đuổi/tốc độ/trò luyện`, actionVi: 'Nối bài nói đuổi, tốc độ hoặc trò luyện để bài sâu hơn.', isStrong: false },
  ];
  return layers.map((layer) => ({ ...layer, isStrong: layer.score >= 68 }));
}

function getNextLayerAction(layers: UnifiedLessonDepthLayer[]) {
  const weakest = layers.slice().sort((a, b) => a.score - b.score)[0];
  return weakest ? `Ưu tiên phần ${weakest.labelVi}: ${weakest.actionVi}` : 'Các phần đã khá đầy đủ; ưu tiên kiểm tra trải nghiệm học.';
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
    fallbackReason: primaryLesson ? undefined : 'Bài này mở qua trang luyện tập chung.',
  };
}

export function getUnifiedUnitContentDepth(unitId: string): UnifiedUnitContentDepth | null {
  const unit = getUnifiedUnitById(unitId);
  if (!unit) return null;

  const lessons = getLessonsForUnit(unit);
  const vocabularyItems = lessons.reduce((sum, lesson) => sum + lesson.vocabulary.length, 0);
  const grammarNotes = lessons.reduce((sum, lesson) => sum + lesson.grammarNotes.length + lesson.sentencePatterns.length, 0) + countSourceIds(unit, 'grammar-');
  const readingInputs = lessons.reduce((sum, lesson) => sum + (lesson.realLifeSituations?.length ?? 0), 0) + countSourceIds(unit, 'reading-');
  const listeningInputs = lessons.reduce((sum, lesson) => sum + lesson.listeningPractice.length + lesson.miniDialogues.length, 0);
  const writingTasks = lessons.reduce((sum, lesson) => sum + lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length + (lesson.finalMiniChallenge ? 1 : 0), 0);
  const shadowingItems = lessons.reduce((sum, lesson) => sum + (lesson.shadowingScript ? 1 : 0), 0) + countSourceIds(unit, 'shadow-');
  const speechPrompts = lessons.reduce((sum, lesson) => sum + (lesson.englishSpeedPrompts?.length ?? 0) + lesson.speakingReflexPrompts.length, 0) + countSourceIds(unit, 'speech-') + unit.sourceIds.filter((id) => /^(a1|a2|b1|b2)-/.test(id)).length;
  const availableSkills: UnifiedSkillDepthKey[] = [
    vocabularyItems > 0 ? 'vocabulary' : null,
    grammarNotes > 0 ? 'grammar' : null,
    readingInputs > 0 ? 'reading' : null,
    listeningInputs > 0 ? 'listening' : null,
    writingTasks > 0 ? 'writing' : null,
    shadowingItems > 0 ? 'shadowing' : null,
    speechPrompts > 0 ? 'speaking' : null,
  ].filter((skill): skill is UnifiedSkillDepthKey => Boolean(skill));
  const expectedSkills: UnifiedSkillDepthKey[] = unit.level === 'A1' || unit.level === 'A2'
    ? ['vocabulary', 'grammar', 'reading', 'listening', 'shadowing', 'speaking']
    : ['vocabulary', 'grammar', 'reading', 'writing', 'shadowing', 'speaking'];
  const missingSkills = expectedSkills.filter((skill) => !availableSkills.includes(skill));
  const depthScore = Math.min(100, Math.round((availableSkills.length / 7) * 70 + Math.min(unit.lessonIds.length, 8) * 3 + Math.min(unit.sourceIds.length, 12)));

  return {
    unitId: unit.id,
    unitTitleVi: unit.titleVi,
    level: unit.level,
    lessonCount: lessons.length,
    sourceCount: unit.sourceIds.length,
    vocabularyItems,
    grammarNotes,
    readingInputs,
    listeningInputs,
    writingTasks,
    shadowingItems,
    speechPrompts,
    availableSkills,
    missingSkills,
    depthScore,
    depthLabelVi: getDepthLabel(depthScore),
    recommendedDataActionVi: getRecommendedDataAction(missingSkills),
  };
}

export function getUnifiedLessonContentDepth(lessonId: string): UnifiedLessonContentDepth | null {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;

  const vocabularyItems = lesson.vocabulary.length + lesson.flashcards.length;
  const grammarItems = lesson.grammarNotes.length + lesson.sentencePatterns.length;
  const dialogueItems = lesson.miniDialogues.reduce((sum, dialogue) => sum + dialogue.lines.length, 0);
  const listeningItems = lesson.listeningPractice.length + dialogueItems;
  const writingItems = lesson.fillBlankTasks.length + lesson.sentenceOrderingTasks.length + (lesson.finalMiniChallenge ? 1 : 0);
  const speakingItems = lesson.speakingReflexPrompts.length + (lesson.englishSpeedPrompts?.length ?? 0) + (lesson.shadowingScript ? 1 : 0);
  const reviewItems = lesson.quizQuestions.length + (lesson.matchPairs?.length ?? 0) + lesson.completionCriteria.totalQuizQuestions;
  const availableSkills: UnifiedSkillDepthKey[] = [
    vocabularyItems > 0 ? 'vocabulary' : null,
    grammarItems > 0 ? 'grammar' : null,
    (lesson.realLifeSituations?.length ?? 0) > 0 ? 'reading' : null,
    listeningItems > 0 ? 'listening' : null,
    writingItems > 0 ? 'writing' : null,
    lesson.shadowingScript ? 'shadowing' : null,
    speakingItems > 0 ? 'speaking' : null,
  ].filter((skill): skill is UnifiedSkillDepthKey => Boolean(skill));
  const expectedSkills: UnifiedSkillDepthKey[] = ['vocabulary', 'grammar', 'listening', 'writing', 'speaking'];
  const missingSkills = expectedSkills.filter((skill) => !availableSkills.includes(skill));
  const depthScore = Math.min(100, Math.round((availableSkills.length / 7) * 64 + Math.min(lesson.learningObjectives.length, 5) * 3 + Math.min(reviewItems, 10) * 2 + Math.min(vocabularyItems, 16)));

  const depthLayers = createLessonDepthLayers(lesson);
  const sortedLayers = depthLayers.slice().sort((a, b) => a.score - b.score);
  const strongestLayer = depthLayers.slice().sort((a, b) => b.score - a.score)[0];

  return {
    lessonId: lesson.id,
    vocabularyItems,
    grammarItems,
    dialogueItems,
    listeningItems,
    writingItems,
    speakingItems,
    reviewItems,
    availableSkills,
    missingSkills,
    depthScore,
    depthLabelVi: getDepthLabel(depthScore),
    recommendedStudyPathVi: getRecommendedLessonStudyPath(availableSkills, missingSkills),
    recommendedDataActionVi: getRecommendedDataAction(missingSkills),
    depthLayers,
    strongLayerCount: depthLayers.filter((layer) => layer.isStrong).length,
    weakestLayer: sortedLayers[0],
    strongestLayer,
    nextLayerActionVi: getNextLayerAction(depthLayers),
  };
}

export function getUnifiedPracticeContentDepth(lessonId: string, selectedMode?: UnifiedPracticeMode | 'typing'): UnifiedPracticeContentDepth | null {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;

  const modes: UnifiedPracticeMode[] = ['flashcard', 'quiz', 'listen', 'reflex', 'type', 'match', 'speed'];
  const normalizedSelectedMode = selectedMode === 'typing' ? 'type' : selectedMode;
  const modeDepths = modes.map((mode) => {
    const itemCount = getPracticeModeItemCount(lesson, mode);
    const readinessScore = Math.min(100, Math.round(Math.min(itemCount, 12) * 7 + (hasPracticeContent(lesson, mode) ? 16 : 0)));
    const isReady = itemCount > 0 && readinessScore >= 42;
    return {
      mode,
      labelVi: getPracticeModeLabelVi(mode),
      itemCount,
      requiredSkill: getPracticeModeSkill(mode),
      readinessScore,
      readinessLabelVi: getPracticeReadinessLabel(readinessScore),
      guidanceVi: getPracticeModeGuidance(mode, itemCount, isReady),
      isReady,
    };
  });
  const readyModeDepths = modeDepths.filter((modeDepth) => modeDepth.isReady);
  const selectedModeDepth = normalizedSelectedMode ? modeDepths.find((modeDepth) => modeDepth.mode === normalizedSelectedMode) : undefined;
  const recommendedModeDepth = readyModeDepths.sort((a, b) => b.readinessScore - a.readinessScore || b.itemCount - a.itemCount)[0] ?? modeDepths[0];
  const recommendedFlow = readyModeDepths
    .slice()
    .sort((a, b) => {
      const order: UnifiedPracticeMode[] = ['flashcard', 'listen', 'quiz', 'reflex', 'type', 'match', 'speed'];
      return order.indexOf(a.mode) - order.indexOf(b.mode);
    })
    .slice(0, 4)
    .map((modeDepth) => modeDepth.labelVi);

  return {
    lessonId: lesson.id,
    selectedMode: normalizedSelectedMode,
    selectedModeDepth,
    recommendedMode: recommendedModeDepth?.mode,
    recommendedModeDepth,
    modeDepths,
    readyModeCount: readyModeDepths.length,
    totalPracticeItems: modeDepths.reduce((sum, modeDepth) => sum + modeDepth.itemCount, 0),
    readinessSummaryVi: `${readyModeDepths.length}/${modeDepths.length} phần luyện đã sẵn sàng · ${modeDepths.reduce((sum, modeDepth) => sum + modeDepth.itemCount, 0)} câu/thẻ luyện`,
    recommendedFlowVi: recommendedFlow.length > 0 ? recommendedFlow.join(' → ') : 'Đọc bài học trước, sau đó ôn thẻ từ hoặc làm kiểm tra nhanh.',
  };
}

export function getUnifiedContentDepthSnapshot(): UnifiedContentDepthSnapshot {
  const unitDepths = generatedUnifiedLearningPath
    .map((unit) => getUnifiedUnitContentDepth(unit.id))
    .filter((depth): depth is UnifiedUnitContentDepth => Boolean(depth));
  const totalDepthScore = unitDepths.reduce((sum, depth) => sum + depth.depthScore, 0);
  const missingSkillCounts = unitDepths.reduce<Record<UnifiedSkillDepthKey, number>>(
    (counts, depth) => {
      depth.missingSkills.forEach((skill) => {
        counts[skill] += 1;
      });
      return counts;
    },
    { vocabulary: 0, grammar: 0, reading: 0, listening: 0, writing: 0, shadowing: 0, speaking: 0 },
  );
  const weakestUnits = [...unitDepths].sort((a, b) => a.depthScore - b.depthScore).slice(0, 3);
  const strongestUnits = [...unitDepths].sort((a, b) => b.depthScore - a.depthScore).slice(0, 3);
  const mostMissingSkills = Object.entries(missingSkillCounts)
    .map(([skill, count]) => ({ skill: skill as UnifiedSkillDepthKey, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const nextDataActionVi = weakestUnits[0]?.recommendedDataActionVi ?? 'Lộ trình đã khá đầy đủ; ưu tiên kiểm tra trải nghiệm và cá nhân hóa phần Hôm nay học gì?.';

  return {
    averageDepthScore: unitDepths.length > 0 ? Math.round(totalDepthScore / unitDepths.length) : 0,
    deepUnitCount: unitDepths.filter((depth) => depth.depthScore >= 68).length,
    thinUnitCount: unitDepths.filter((depth) => depth.depthScore < 46).length,
    totalUnits: unitDepths.length,
    totalLessons: unitDepths.reduce((sum, depth) => sum + depth.lessonCount, 0),
    totalSources: unitDepths.reduce((sum, depth) => sum + depth.sourceCount, 0),
    weakestUnits,
    strongestUnits,
    mostMissingSkills,
    nextDataActionVi,
  };
}

export function getUnifiedSkillCoverage(): UnifiedSkillCoverage {
  return generatedUnifiedLearningPath.reduce<UnifiedSkillCoverage>(
    (coverage, unit) => ({ ...coverage, [unit.skillFocus]: coverage[unit.skillFocus] + 1 }),
    { 'Từ vựng': 0, 'Ngữ pháp': 0, Nghe: 0, Đọc: 0, Shadowing: 0, 'Phát âm': 0, 'Ôn tập': 0 },
  );
}

export function getUnifiedDashboardSnapshot(): UnifiedDashboardSnapshot {
  const learningLoop = getLearningLoopSnapshot();
  const unitStates = generatedUnifiedLearningPath.map((unit) => ({ unit, ...getUnitProgress(unit) }));
  const availableStates = unitStates.filter((item) => item.available);
  const completedStates = availableStates.filter((item) => item.completed);
  const totalProgress = availableStates.reduce((sum, item) => sum + item.percentage, 0);
  const localPathPercentage = availableStates.length > 0 ? Math.round(totalProgress / availableStates.length) : 0;
  const loopBoost = Math.min(8, Math.floor(Object.keys(learningLoop.completed).length / 2) + Math.floor(learningLoop.xp / 120));
  const pathPercentage = Math.min(100, Math.max(localPathPercentage, localPathPercentage + loopBoost));
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
    whaleCoachLine: learningLoop.dueReviewCount > 0
      ? `Poo đã gom ${learningLoop.dueReviewCount} mục cần ôn thật từ câu khó và từ yếu. Ôn ngắn trước khi học bài mới nhé.`
      : nextUnit?.whaleCoachLine ?? 'Cá voi nhắc bạn: mỗi ngày một bước nhỏ vẫn là tiến bộ.',
    currentStreak: Math.max(getCurrentStreak(), learningLoop.streak),
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
